import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export function getBearerToken(req) {
  const auth = req.headers?.authorization || "";
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export function timingSafeEqualHex(receivedHex, expectedBuf) {
  const received = Buffer.from((receivedHex || "").trim(), "hex");
  if (!receivedHex || received.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(received, expectedBuf);
}

export async function getUserByApiKey({ supabaseAdmin, apiKey }) {
  const { data, error } = await supabaseAdmin
    .from("app_users")
    .select("id,email,company_id,is_active")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export function normalizeAmountInr(amount) {
  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) return null;
  const fixed = Math.round(amountNum * 100) / 100;
  if (fixed < 1) return null;
  if (fixed > 100000) return null;
  return fixed;
}
