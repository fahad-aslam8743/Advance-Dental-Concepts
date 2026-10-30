import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureSchema, query, treatmentSlugs } from "@/lib/db";

export const runtime = "nodejs";

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
        if (!treatmentSlugs.includes(String(payload.treatmentSlug || ""))) throw new Error("Choose a valid treatment.");
        const kind = payload.kind === "video" ? "video" : "image";
        return {
          allowedContentTypes: kind === "video" ? ["video/mp4", "video/webm", "video/quicktime"] : ["image/jpeg", "image/png", "image/webp", "image/avif"],
          maximumSizeInBytes: kind === "video" ? 100 * 1024 * 1024 : 15 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ treatmentSlug: payload.treatmentSlug, kind, altText: String(payload.altText || "").slice(0, 200) })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = JSON.parse(tokenPayload || "{}");
        await ensureSchema();
        await query("INSERT INTO treatment_media (treatment_slug, kind, url, pathname, alt_text) VALUES ($1,$2,$3,$4,$5)", [payload.treatmentSlug, payload.kind, blob.url, blob.pathname, payload.altText || ""]);
      }
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Blob upload error", error);
    return NextResponse.json({ error: "Upload could not be completed." }, { status: 400 });
  }
}
