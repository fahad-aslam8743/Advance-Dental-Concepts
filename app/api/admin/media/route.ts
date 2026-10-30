import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureSchema, query, treatmentSlugs } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema();
  return NextResponse.json(await query("SELECT id, treatment_slug, kind, url, alt_text, created_at FROM treatment_media ORDER BY created_at DESC"));
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureSchema();
    const id = Number((await request.json()).id);
    const rows = await query<{url:string}>("SELECT url FROM treatment_media WHERE id=$1", [id]);
    if (!rows[0]) return NextResponse.json({ error: "Media item not found." }, { status: 404 });
    await del(rows[0].url);
    await query("DELETE FROM treatment_media WHERE id=$1", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Media delete error", error);
    return NextResponse.json({ error: "Could not delete media." }, { status: 500 });
  }
}
