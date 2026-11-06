import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureSchema, query, treatmentSlugs } from "@/lib/db";

export const runtime = "nodejs";

const allowedPlacements = ["gallery", "comparison"] as const;

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
        if (placement !== "gallery" && (pairNumber !== 1 && pairNumber !== 2 || kind !== "image")) throw new Error("Combined mockups must be assigned to slot 1 or 2.");
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
          // Treatment media is registered synchronously by the authenticated admin
          // after upload() returns. This callback intentionally does not write a
          // second database row, avoiding races and duplicate/missing UI records.
          console.info("Treatment media upload completed", { pathname: blob.pathname });
        }
      }
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Blob upload error", error);
    return NextResponse.json({ error: "Upload could not be completed." }, { status: 400 });
  }
}
