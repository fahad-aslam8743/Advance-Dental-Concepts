import { NextRequest, NextResponse } from "next/server";
import { createSession, sessionCookieName, verifyPassword } from "@/lib/admin-auth";
import { ensureSchema, query } from "@/lib/db";
import { createHash } from "node:crypto";

export const runtime = "nodejs";

function ipHash(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update((process.env.AUTH_SECRET || "adc") + ip).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (email !== String(process.env.ADMIN_EMAIL || "").toLowerCase() || !password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const hash = ipHash(request);
    const attempts = await query<{count:number}>("SELECT COUNT(*)::int AS count FROM admin_login_attempts WHERE ip_hash = $1 AND attempted_at > NOW() - INTERVAL '15 minutes'", [hash]);
    if ((attempts[0]?.count || 0) >= 8) return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes." }, { status: 429 });
    const rows = await query<{email:string,password_hash:string,must_change_password:boolean}>("SELECT email, password_hash, must_change_password FROM admin_users WHERE email = $1 LIMIT 1", [email]);
    if (!rows[0] || !verifyPassword(password, rows[0].password_hash)) {
      await query("INSERT INTO admin_login_attempts (ip_hash) VALUES ($1)", [hash]);
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    await query("DELETE FROM admin_login_attempts WHERE ip_hash = $1", [hash]);
    const response = NextResponse.json({ ok: true, email, mustChangePassword: rows[0].must_change_password });
    response.cookies.set(sessionCookieName, createSession(email), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
      path: "/", maxAge: 60 * 60 * 12
    });
    return response;
  } catch (error) {
    console.error("Admin login error", error);
    return NextResponse.json({ error: "Login service is temporarily unavailable." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
