import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureSchema, query, treatmentSlugs } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const placements = ["gallery", "comparison_before", "comparison_after"] as const;

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema();
  return NextResponse.json(await query(
    "SELECT id, treatment_slug, kind, url, alt_text, placement, pair_number, sort_order, is_illustrative, patient_consent_verified, created_at FROM treatment_media WHERE placement IN ('gallery','comparison_before','comparison_after') ORDER BY treatment_slug, placement, pair_number, sort_order ASC, created_at DESC"
  ));
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureSchema();
    const body = await request.json();
    const id = Number(body.id);
    const altText = String(body.altText || "").trim().slice(0, 200);
    const placement = String(body.placement || "gallery");
    const pairNumber = body.pairNumber == null || body.pairNumber === "" ? null : Number(body.pairNumber);
    const sortOrder = Number.isInteger(Number(body.sortOrder)) ? Number(body.sortOrder) : 100;
    if (!Number.isInteger(id) || id < 1 || !placements.includes(placement as typeof placements[number])) {
      return NextResponse.json({ error: "Choose a valid media item and display location." }, { status: 400 });
    }
    if (placement !== "gallery" && (!Number.isInteger(pairNumber) || ![1,2].includes(pairNumber as number))) return NextResponse.json({ error: "Choose comparison pair 1 or 2." }, { status: 400 });
    const current = await query<{kind:string;treatment_slug:string;placement:string}>("SELECT kind, treatment_slug, placement FROM treatment_media WHERE id=$1", [id]);
    if (!current[0]) return NextResponse.json({ error: "Media item not found." }, { status: 404 });
    if (!treatmentSlugs.includes(current[0].treatment_slug)) return NextResponse.json({ error: "The media item is not linked to a valid treatment." }, { status: 400 });
    if (current[0].placement !== "gallery" && !["comparison_before","comparison_after"].includes(current[0].placement)) return NextResponse.json({ error: "Unsupported media placement." }, { status: 400 });
    if (current[0].kind === "video" && placement !== "gallery") {
      return NextResponse.json({ error: "Videos can only be placed in the treatment gallery." }, { status: 400 });
    }
    await query(
      "UPDATE treatment_media SET alt_text=$1, placement=$2, pair_number=$3, sort_order=$4 WHERE id=$5",
      [altText, placement, placement === "gallery" ? null : pairNumber, Math.max(0, Math.min(sortOrder, 9999)), id]
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Media update error", error);
    return NextResponse.json({ error: "Could not update media details." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureSchema();
    const id = Number((await request.json()).id);
    const rows = await query<{url:string;placement:string}>("SELECT url, placement FROM treatment_media WHERE id=$1", [id]);
    if (!rows[0]) return NextResponse.json({ error: "Media item not found." }, { status: 404 });
    
    // Starter gallery assets and educational SVGs are external/data URLs, not Vercel Blob objects.
    if (rows[0].url.includes(".blob.vercel-storage.com/")) await del(rows[0].url);
    await query("DELETE FROM treatment_media WHERE id=$1", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Media delete error", error);
    return NextResponse.json({ error: "Could not delete media." }, { status: 500 });
  }
}
