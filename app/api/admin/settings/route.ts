import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureSchema, query, getSiteSettings } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getSiteSettings());
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureSchema();
    const body = await request.json();
    const allowed = ["clinicName", "phone", "addressLine", "city", "openingHours", "logoUrl", "googleReviewsUrl", "mapUrl"];
    const current = await getSiteSettings();
    const next: Record<string,string> = { ...current };
    for (const key of allowed) {
      if (typeof body[key] === "string") next[key] = body[key].trim().slice(0, 500);
    }
    if (!next.clinicName || !next.phone || !next.addressLine || !next.city) {
      return NextResponse.json({ error: "Clinic name, phone and address fields are required." }, { status: 400 });
    }
    await query("UPDATE site_settings SET data = $1::jsonb, updated_at = NOW() WHERE id = 'main'", [JSON.stringify(next)]);
    return NextResponse.json({ ok: true, settings: next });
  } catch (error) {
    console.error("Settings save error", error);
    return NextResponse.json({ error: "Could not save clinic settings." }, { status: 500 });
  }
}
