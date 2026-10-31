import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, query, treatmentSlugs } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporary production diagnostic: counts only public gallery media rows.
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") || "";
  if (!treatmentSlugs.includes(slug)) {
    return NextResponse.json({ error: "Invalid treatment slug." }, { status: 400 });
  }
  await ensureSchema();
  const rows = await query<{
    id: number;
    treatment_slug: string;
    kind: string;
    placement: string;
    pair_number: number | null;
    sort_order: number;
    pathname: string;
  }>(
    "SELECT id, treatment_slug, kind, placement, pair_number, sort_order, pathname FROM treatment_media WHERE treatment_slug = $1 ORDER BY placement, sort_order, id",
    [slug]
  );
  return NextResponse.json({
    slug,
    total: rows.length,
    gallery: rows.filter((row) => row.placement === "gallery" && row.kind === "image").length,
    before: rows.filter((row) => row.placement === "comparison_before").length,
    after: rows.filter((row) => row.placement === "comparison_after").length,
    rows
  });
}
