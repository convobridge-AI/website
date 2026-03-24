import {
  getBearerToken,
  getSupabaseAdmin,
  getUserByApiKey,
  normalizeAmountInr,
  sendJson,
} from "../_shared.js";

async function createRazorpayOrder({ amountPaise, receipt }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const err = new Error("Razorpay not configured");
    err.statusCode = 503;
    throw err;
  }

  const basic = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
  });

  const body = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(body?.error?.description || body?.error || r.statusText);
    err.statusCode = r.status;
    throw err;
  }

  return { order: body, keyId };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { success: false, error: "Method not allowed" });
  }

  try {
    const apiKey = getBearerToken(req);
    if (!apiKey) return sendJson(res, 401, { success: false, error: "Missing API key" });

    const supabaseAdmin = getSupabaseAdmin();

    const systemKey = process.env.API_SECRET_KEY;
    const isSystem = !!systemKey && apiKey === systemKey;
    const user = isSystem ? null : await getUserByApiKey({ supabaseAdmin, apiKey });
    if (!isSystem && !user) return sendJson(res, 401, { success: false, error: "Invalid API key" });

    const { wallet = "outbound", company_id, amount } = req.body || {};
    const normalizedAmount = normalizeAmountInr(amount);
    if (!normalizedAmount) {
      return sendJson(res, 400, {
        success: false,
        error: "Invalid amount. Min ₹1.00, max ₹100000.00",
      });
    }

    const resolvedCompanyId = isSystem ? company_id : user.company_id;
    if (!resolvedCompanyId) {
      return sendJson(res, 400, { success: false, error: "Missing company_id" });
    }

    const amountPaise = Math.round(normalizedAmount * 100);
    const receiptPrefix = wallet === "inbound" ? "inbound" : "outbound";
    const receipt = `${receiptPrefix}_${resolvedCompanyId}_${Date.now()}`;

    const { order, keyId } = await createRazorpayOrder({ amountPaise, receipt });

    // Outbound: create a pending record for later webhook confirmation.
    if (receiptPrefix === "outbound") {
      const { error } = await supabaseAdmin.from("outbound_topups").insert({
        company_id: resolvedCompanyId,
        amount: normalizedAmount,
        method: "razorpay",
        razorpay_order_id: order.id,
        status: "pending",
      });
      if (error) throw error;
    }

    return sendJson(res, 200, {
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (e) {
    return sendJson(res, e.statusCode || 500, { success: false, error: e.message || "Server error" });
  }
}
