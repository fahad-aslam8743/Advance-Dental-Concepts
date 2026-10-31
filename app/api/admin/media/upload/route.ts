import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
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
        if (!isLogo && !treatmentSlugs.includes(String(payload.treatmentSlug || ""))) throw new Error("Choose a valid treatment.");
        const kind = isLogo ? "logo" : payload.kind === "video" ? "video" : "image";
        const placement = kind === "image" && allowedPlacements.includes(String(payload.placement || "gallery") as typeof allowedPlacements[number])
          ? String(payload.placement || "gallery")
          : "gallery";
        const pairNumber = Number(payload.pairNumber);
        if (placement !== "gallery" && pairNumber !== 1 && pairNumber !== 2) throw new Error("Comparison media must be assigned to pair 1 or pair 2.");
        return {
          allowedContentTypes: kind === "video" ? ["video/mp4", "video/webm", "video/quicktime"] : ["image/jpeg", "image/png", "image/webp", "image/avif"],
          maximumSizeInBytes: kind === "video" ? 100 * 1024 * 1024 : isLogo ? 5 * 1024 * 1024 : 15 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            treatmentSlug: payload.treatmentSlug,
            kind,
            altText: String(payload.altText || "").slice(0, 200),
            placement,
            pairNumber: placement === "gallery" ? null : pairNumber
          })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = JSON.parse(tokenPayload || "{}");
        await ensureSchema();
        if (payload.kind === "logo") {
          await query("UPDATE site_settings SET data = jsonb_set(data, '{logoUrl}', to_jsonb($1::text), TRUE), updated_at = NOW() WHERE id = 'main'", [blob.url]);
        } else {
          await query(
            "INSERT INTO treatment_media (treatment_slug, kind, url, pathname, alt_text, placement, pair_number, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,100)",
            [payload.treatmentSlug, payload.kind, blob.url, blob.pathname, payload.altText || "", payload.placement || "gallery", payload.pairNumber ?? null]
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
