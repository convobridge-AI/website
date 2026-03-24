import { getBearerToken, sendJson } from "../_shared.js";

export async function proxyCampaign({ req, res, type }) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { success: false, error: "Method not allowed" });
  }

  const apiKey = getBearerToken(req);
  if (!apiKey) return sendJson(res, 401, { success: false, error: "Missing API key" });

  const upstreamBase = process.env.ASTERISK_API_BASE_URL || "https://api.convobridge.in:3000";
  const upstreamUrl = `${upstreamBase.replace(/\/$/, "")}/api/campaign/${type}`;

  try {
    const body = req.body || {};
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    return res.end(text);
  } catch (e) {
    return sendJson(res, 502, { success: false, error: e.message || "Upstream error" });
  }
}
