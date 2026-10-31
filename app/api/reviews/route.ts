import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { ensureSchema, query } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    if (String(body.website || "").trim()) return NextResponse.json({ ok: true });
    const displayName = String(body.displayName || "").trim().slice(0, 80);
    const reviewText = String(body.reviewText || "").trim().slice(0, 1500);
    const rating = Number(body.rating);
    if (!body.consent || !displayName || reviewText.length < 15 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Please complete all fields and provide a review of at least 15 characters." }, { status: 400 });
    }
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = createHash("sha256").update((process.env.AUTH_SECRET || "adc") + ip).digest("hex");
    const recent = await query<{count:number}>("SELECT COUNT(*)::int AS count FROM reviews WHERE ip_hash=$1 AND created_at > NOW() - INTERVAL '1 hour'", [ipHash]);
    if ((recent[0]?.count || 0) >= 3) return NextResponse.json({ error: "You have submitted several reviews recently. Please try again later." }, { status: 429 });
    await query("INSERT INTO reviews (display_name, rating, treatment_slug, review_text, status, source, ip_hash) VALUES ($1,$2,$3,$4,'pending','public',$5)", [displayName,rating,"clinic-wide",reviewText,ipHash]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Public review submission error", error);
    return NextResponse.json({ error: "Review submission is temporarily unavailable. Please try again later." }, { status: 500 });
  }
}
