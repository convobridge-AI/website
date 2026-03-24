import crypto from "crypto";
import {
  getSupabaseAdmin,
  readRawBody,
  sendJson,
  timingSafeEqualHex,
} from "../_shared.js";

async function fetchRazorpayOrder(orderId) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay not configured");

  const basic = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const r = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    method: "GET",
    headers: { Authorization: `Basic ${basic}` },
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body?.error?.description || body?.error || r.statusText);
  return body;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { success: false, error: "Method not allowed" });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return sendJson(res, 503, { success: false, error: "Webhook not configured" });
  }

  try {
    let rawBody = await readRawBody(req);
    if (!rawBody || rawBody.length === 0) {
      // Some runtimes may pre-buffer the body.
      if (Buffer.isBuffer(req.body)) {
        rawBody = req.body;
      } else if (typeof req.body === "string") {
        rawBody = Buffer.from(req.body, "utf8");
      }
    }
    if (!rawBody || rawBody.length === 0) {
      return sendJson(res, 400, { success: false, error: "Empty webhook body" });
    }
    const receivedSig = (req.headers["x-razorpay-signature"] || "").toString().trim();
    const expectedBuf = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest();
    if (!timingSafeEqualHex(receivedSig, expectedBuf)) {
      return sendJson(res, 400, { success: false, error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    if (event?.event !== "payment.captured") {
      return sendJson(res, 200, { received: true });
    }

    const payment = event?.payload?.payment?.entity;
    if (!payment?.order_id || !payment?.id) {
      return sendJson(res, 200, { received: true });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // First try OUTBOUND flow (pending record exists).
    const { data: pendingOutbound } = await supabaseAdmin
      .from("outbound_topups")
      .select("id,company_id,amount,status,razorpay_order_id")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (pendingOutbound?.status === "pending") {
      const expectedPaise = Math.round(Number(pendingOutbound.amount) * 100);
      if (payment.currency !== "INR" || payment.amount !== expectedPaise) {
        return sendJson(res, 200, { received: true });
      }

      // Mark paid (idempotent) then credit.
      const { data: confirmed, error: confirmError } = await supabaseAdmin
        .from("outbound_topups")
        .update({
          status: "paid",
          razorpay_payment_id: payment.id,
          razorpay_signature: receivedSig,
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", payment.order_id)
        .eq("status", "pending")
        .select("company_id,amount")
        .maybeSingle();

      if (confirmError) throw confirmError;
      if (!confirmed) return sendJson(res, 200, { received: true });

      const { error: companyErr } = await supabaseAdmin
        .from("companies")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", confirmed.company_id);

      // Use SQL increment via RPC-less approach: fetch + update (simple); better is RPC.
      if (companyErr) throw companyErr;

      // Increment using PostgREST arithmetic if supported
      await supabaseAdmin.rpc("increment_outbound_balance", {
        p_company_id: confirmed.company_id,
        p_amount: Number(confirmed.amount),
      }).catch(async () => {
        // Fallback: manual read+write if RPC not present
        const { data: c } = await supabaseAdmin
          .from("companies")
          .select("outbound_balance")
          .eq("id", confirmed.company_id)
          .maybeSingle();
        const next = (Number(c?.outbound_balance || 0) + Number(confirmed.amount));
        const { error } = await supabaseAdmin
          .from("companies")
          .update({ outbound_balance: next, updated_at: new Date().toISOString() })
          .eq("id", confirmed.company_id);
        if (error) throw error;
      });

      return sendJson(res, 200, { received: true });
    }

    // INBOUND flow: no pending record; determine company via Razorpay order receipt.
    if (payment.currency !== "INR") return sendJson(res, 200, { received: true });

    // Idempotency: if we've already recorded this payment id as a topup, ignore.
    const { data: existingTopup } = await supabaseAdmin
      .from("topups")
      .select("id")
      .eq("method", "razorpay")
      .eq("reference", payment.id)
      .maybeSingle();
    if (existingTopup?.id) return sendJson(res, 200, { received: true });

    const order = await fetchRazorpayOrder(payment.order_id);
    const receipt = (order?.receipt || "").toString();
    const match = receipt.match(/^inbound_(\d+)_/);
    if (!match) return sendJson(res, 200, { received: true });
    const companyId = Number(match[1]);
    if (!companyId) return sendJson(res, 200, { received: true });

    const amountInr = payment.amount / 100;
    if (!Number.isFinite(amountInr) || amountInr <= 0) return sendJson(res, 200, { received: true });

    // Record ledger entry then credit company.
    const { error: insertErr } = await supabaseAdmin.from("topups").insert({
      company_id: companyId,
      amount: amountInr,
      method: "razorpay",
      reference: payment.id,
      created_at: new Date().toISOString(),
    });
    if (insertErr) throw insertErr;

    await supabaseAdmin.rpc("increment_credit_balance", {
      p_company_id: companyId,
      p_amount: amountInr,
    }).catch(async () => {
      const { data: c } = await supabaseAdmin
        .from("companies")
        .select("credit_balance")
        .eq("id", companyId)
        .maybeSingle();
      const next = (Number(c?.credit_balance || 0) + amountInr);
      const { error } = await supabaseAdmin
        .from("companies")
        .update({ credit_balance: next, updated_at: new Date().toISOString() })
        .eq("id", companyId);
      if (error) throw error;
    });

    return sendJson(res, 200, { received: true });
  } catch (e) {
    return sendJson(res, 500, { success: false, error: e.message || "Webhook error" });
  }
}
