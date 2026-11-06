import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureSchema, query, treatmentSlugs } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const url = String(body.url || "");
    const pathname = String(body.pathname || "");
    const treatmentSlug = String(body.treatmentSlug || "");
    const kind = String(body.kind || "");
    const placement = String(body.placement || "gallery");
    const pairNumber = body.pairNumber == null ? null : Number(body.pairNumber);
    const patientConsentVerified = body.patientConsentVerified === true;
    const altText = String(body.altText || "").slice(0, 200);

    let parsedUrl: URL;
    try { parsedUrl = new URL(url); } catch { return NextResponse.json({ error: "The uploaded file URL is invalid." }, { status: 400 }); }
    if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname.endsWith(".blob.vercel-storage.com") || !pathname) {
      return NextResponse.json({ error: "The uploaded file could not be verified as a Vercel Blob asset." }, { status: 400 });
    }
    if (!treatmentSlugs.includes(treatmentSlug) || !["image", "video"].includes(kind) || !["gallery", "comparison"].includes(placement)) {
      return NextResponse.json({ error: "Choose a valid treatment and media type." }, { status: 400 });
    }
    if (placement === "comparison" && (kind !== "image" || ![1, 2].includes(Number(pairNumber)) || !patientConsentVerified)) {
      return NextResponse.json({ error: "A comparison image requires slot 1 or 2 and confirmed written patient consent." }, { status: 400 });
    }
    if (placement === "gallery" && pairNumber !== null) {
      return NextResponse.json({ error: "Gallery media cannot have a comparison slot." }, { status: 400 });
    }

    await ensureSchema();

    // If the same upload callback or request is retried, do not create duplicate rows.
    const existing = await query<{id:number}>("SELECT id FROM treatment_media WHERE url=$1 LIMIT 1", [url]);
    if (existing[0]) return NextResponse.json({ ok: true, id: existing[0].id, alreadyRegistered: true });

    let replaced: {id:number;url:string}[] = [];
    if (placement === "comparison") {
      replaced = await query<{id:number;url:string}>(
        "SELECT id,url FROM treatment_media WHERE treatment_slug=$1 AND pair_number=$2 AND placement IN ('comparison','comparison_before','comparison_after')",
        [treatmentSlug, pairNumber]
      );
    }

    const inserted = await query<{id:number}>(
      "INSERT INTO treatment_media (treatment_slug,kind,url,pathname,alt_text,placement,pair_number,sort_order,is_illustrative,patient_consent_verified) VALUES ($1,$2,$3,$4,$5,$6,$7,100,FALSE,$8) RETURNING id",
      [treatmentSlug, kind, url, pathname, altText, placement, placement === "gallery" ? null : pairNumber, patientConsentVerified]
    );

    if (placement === "comparison" && replaced.length) {
      await query("DELETE FROM treatment_media WHERE treatment_slug=$1 AND pair_number=$2 AND placement IN ('comparison','comparison_before','comparison_after') AND id<>$3", [treatmentSlug, pairNumber, inserted[0].id]);
      for (const item of replaced) {
        if (item.url !== url && item.url.includes(".blob.vercel-storage.com/")) {
          try { await del(item.url); } catch (error) { console.warn("Could not remove replaced comparison blob", error); }
        }
      }
    }

    return NextResponse.json({ ok: true, id: inserted[0].id });
  } catch (error) {
    console.error("Media registration error", error);
    return NextResponse.json({ error: "The file uploaded, but it could not be saved to the treatment media library. Please retry." }, { status: 500 });
  }
}
