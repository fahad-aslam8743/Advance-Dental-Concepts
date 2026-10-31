import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = String(body.sessionId || "").trim();
    const path = String(body.path || "").trim();
    if (!/^[a-zA-Z0-9-]{16,80}$/.test(sessionId) || !path.startsWith("/") || path.startsWith("//") || path.length > 300) {
      return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
    }
    if (path === "/admin" || path.startsWith("/admin/") || path.startsWith("/api/")) {
      return new NextResponse(null, { status: 204 });
    }
    await ensureSchema();
    await query(
      "INSERT INTO site_visits (session_id, path) SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM site_visits WHERE session_id=$1 AND path=$2 AND visited_at > NOW() - INTERVAL '10 seconds')",
      [sessionId, path]
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Page view tracking failed", error);
    return new NextResponse(null, { status: 204 });
  }
}