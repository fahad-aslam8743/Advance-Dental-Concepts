import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

const COOKIE = "adc_admin_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not configured");
  return value;
}

export function hashPassword(password: string) {
  const { randomBytes, scryptSync } = require("node:crypto") as typeof import("node:crypto");
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return salt.toString("base64url") + "." + derived.toString("base64url");
}

export function verifyPassword(password: string, stored: string) {
  try {
    const [saltText, hashText] = stored.split(".");
    const { scryptSync } = require("node:crypto") as typeof import("node:crypto");
    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(hashText, "base64url");
    const actual = scryptSync(password, salt, expected.length, { N: 16384, r: 8, p: 1 });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 12 * 60 * 60 * 1000 })).toString("base64url");
  return payload + "." + signature(payload);
}

export function verifySession(token: string | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const expected = signature(parts[0]);
  const a = Buffer.from(parts[1]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (!data.email || !data.exp || data.exp < Date.now()) return null;
    return { email: String(data.email) };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  return verifySession(token);
}

export async function isAdmin() {
  const session = await getAdminSession();
  if (!session) return false;
  const rows = await query<{email:string}>("SELECT email FROM admin_users WHERE email = $1 LIMIT 1", [session.email]);
  return rows.length > 0;
}

export const sessionCookieName = COOKIE;
