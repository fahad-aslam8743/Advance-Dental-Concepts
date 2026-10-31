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
    const [reviews, media, trend, treatments, visits, topPages, visitTrend] = await Promise.all([
      query("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'pending')::int AS pending, COUNT(*) FILTER (WHERE status = 'approved')::int AS approved, COALESCE(ROUND(AVG(rating) FILTER (WHERE status = 'approved'), 1), 0) AS average_rating FROM reviews"),
      query("SELECT COUNT(*)::int AS total FROM treatment_media"),
      query("SELECT to_char(days.day, 'Dy') AS day, to_char(days.day, 'YYYY-MM-DD') AS date, COUNT(r.id)::int AS count FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS days(day) LEFT JOIN reviews r ON DATE(r.created_at) = DATE(days.day) GROUP BY days.day ORDER BY days.day"),
      query("SELECT treatment_slug, COUNT(*)::int AS count FROM reviews WHERE status = 'approved' GROUP BY treatment_slug ORDER BY count DESC LIMIT 5"),
      query("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE)::int AS today, COUNT(DISTINCT session_id) FILTER (WHERE visited_at >= NOW() - INTERVAL '24 hours')::int AS active_sessions FROM site_visits"),
      query("SELECT path, COUNT(*)::int AS views FROM site_visits WHERE visited_at >= NOW() - INTERVAL '30 days' GROUP BY path ORDER BY views DESC LIMIT 6"),
      query("SELECT to_char(days.day, 'Dy') AS day, to_char(days.day, 'YYYY-MM-DD') AS date, COUNT(v.id)::int AS count FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS days(day) LEFT JOIN site_visits v ON DATE(v.visited_at) = DATE(days.day) GROUP BY days.day ORDER BY days.day")
    ]);
    return NextResponse.json({ reviews: reviews[0], media: media[0], trend, topTreatments: treatments, visits: visits[0], topPages, visitTrend });
  } catch (error) {
    console.error("Dashboard error", error);
    return NextResponse.json({ error: "Could not load dashboard data." }, { status: 500 });
  }
}
