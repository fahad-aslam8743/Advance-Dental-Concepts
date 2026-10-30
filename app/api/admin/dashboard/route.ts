import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureSchema, query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureSchema();
    const [reviews, media, trend, treatments] = await Promise.all([
      query("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'pending')::int AS pending, COUNT(*) FILTER (WHERE status = 'approved')::int AS approved, COALESCE(ROUND(AVG(rating) FILTER (WHERE status = 'approved'), 1), 0) AS average_rating FROM reviews"),
      query("SELECT COUNT(*)::int AS total FROM treatment_media"),
      query("SELECT to_char(day, 'Dy') AS day, to_char(day, 'YYYY-MM-DD') AS date, COUNT(r.id)::int AS count FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS day LEFT JOIN reviews r ON DATE(r.created_at) = DATE(day) GROUP BY day ORDER BY day"),
      query("SELECT treatment_slug, COUNT(*)::int AS count FROM reviews WHERE status = 'approved' GROUP BY treatment_slug ORDER BY count DESC LIMIT 5")
    ]);
    return NextResponse.json({ reviews: reviews[0], media: media[0], trend, topTreatments: treatments });
  } catch (error) {
    console.error("Dashboard error", error);
    return NextResponse.json({ error: "Could not load dashboard data." }, { status: 500 });
  }
}
