import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { del } from "@vercel/blob";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureSchema, query, treatmentSlugs } from "@/lib/db";

export const runtime = "nodejs";

const allowedPlacements = ["gallery", "comparison_before", "comparison_after"] as const;

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const currentSession = await getAdminSession();
        if (!currentSession) throw new Error("Unauthorized");
        const payload = JSON.parse(clientPayload || "{}");
        const isLogo = payload.kind === "logo";
        const isHero = payload.kind === "hero";
        if (!isLogo && !isHero && !treatmentSlugs.includes(String(payload.treatmentSlug || ""))) throw new Error("Choose a valid treatment.");
        const kind = isLogo ? "logo" : isHero ? "hero" : payload.kind === "video" ? "video" : "image";
        const requestedPlacement = String(payload.placement || "gallery");
        if (!allowedPlacements.includes(requestedPlacement as typeof allowedPlacements[number])) throw new Error("Choose a valid media placement.");
        const placement = requestedPlacement;
        const pairNumber = Number(payload.pairNumber);
        if (placement !== "gallery" && (pairNumber !== 1 && pairNumber !== 2 || kind !== "image")) throw new Error("Comparison images must be assigned to pair 1 or pair 2.");
        if (placement !== "gallery" && payload.patientConsentVerified !== true) {
          throw new Error("Before/after patient images require confirmed written patient consent. Use the educational illustrations until consent is confirmed.");
        }
        return {
          allowedContentTypes: kind === "video" ? ["video/mp4", "video/webm", "video/quicktime"] : ["image/jpeg", "image/png", "image/webp", "image/avif"],
          maximumSizeInBytes: kind === "video" ? 100 * 1024 * 1024 : (isLogo || isHero) ? 5 * 1024 * 1024 : 15 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            treatmentSlug: payload.treatmentSlug,
            kind,
            altText: String(payload.altText || "").slice(0, 200),
            placement,
            pairNumber: placement === "gallery" ? null : pairNumber,
            patientConsentVerified: placement !== "gallery" && payload.patientConsentVerified === true
          })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = JSON.parse(tokenPayload || "{}");
        await ensureSchema();
        if (payload.kind === "logo" || payload.kind === "hero") {
          const settingKey = payload.kind === "logo" ? "logoUrl" : "heroImageUrl";
          await query("UPDATE site_settings SET data = jsonb_set(data, ARRAY[$1]::text[], to_jsonb($2::text), TRUE), updated_at = NOW() WHERE id = 'main'", [settingKey, blob.url]);
        } else {
          const placement = payload.placement || "gallery";
          const pairNumber = payload.pairNumber ?? null;
          if (placement !== "gallery") {
            const previous = await query<{id:number;url:string}>(
              "SELECT id, url FROM treatment_media WHERE treatment_slug=$1 AND placement=$2 AND pair_number=$3",
              [payload.treatmentSlug, placement, pairNumber]
            );
            for (const item of previous) {
              if (item.url.includes(".blob.vercel-storage.com/")) {
                try { await del(item.url); } catch (error) { console.warn("Could not remove replaced media blob", error); }
              }
            }
            await query("DELETE FROM treatment_media WHERE treatment_slug=$1 AND placement=$2 AND pair_number=$3", [payload.treatmentSlug, placement, pairNumber]);
          }
          await query(
            "INSERT INTO treatment_media (treatment_slug, kind, url, pathname, alt_text, placement, pair_number, sort_order, is_illustrative, patient_consent_verified) VALUES ($1,$2,$3,$4,$5,$6,$7,100,FALSE,$8)",
            [payload.treatmentSlug, payload.kind, blob.url, blob.pathname, payload.altText || "", placement, pairNumber, Boolean(payload.patientConsentVerified)]
          );
        }
      }
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Blob upload error", error);
    return NextResponse.json({ error: "Upload could not be completed." }, { status: 400 });
  }
}
