import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hashPassword } from "@/lib/admin-auth";
import { ensureSchema, query } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const password = String(body.password || "");
    if (password.length < 10 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Use at least 10 characters with letters and numbers." }, { status: 400 });
    }
    await ensureSchema();
    await query("UPDATE admin_users SET password_hash = $1, must_change_password = FALSE, updated_at = NOW() WHERE email = $2", [hashPassword(password), session.email]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password update error", error);
    return NextResponse.json({ error: "Could not update password." }, { status: 500 });
  }
}
