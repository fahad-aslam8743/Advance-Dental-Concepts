import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureSchema, query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema();
  const status = request.nextUrl.searchParams.get("status") || "pending";
  const rows = status === "all"
    ? await query("SELECT id, display_name, rating, treatment_slug, review_text, status, source, created_at FROM reviews ORDER BY created_at DESC LIMIT 1000")
    : await query("SELECT id, display_name, rating, treatment_slug, review_text, status, source, created_at FROM reviews WHERE status = $1 ORDER BY created_at DESC LIMIT 200", [status]);
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureSchema();
    const body = await request.json();
    const displayName = String(body.displayName || "").trim().slice(0, 80);
    const reviewText = String(body.reviewText || "").trim().slice(0, 1500);
    const rating = Number(body.rating);
    if (!displayName || reviewText.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Enter a name, a review of at least 10 characters, a 1–5 rating." }, { status: 400 });
    }
    if (body.verified !== true) {
      return NextResponse.json({ error: "Confirm that this is a genuine patient review and that you have permission to publish it." }, { status: 400 });
    }
    // Manual entries join the pending queue. They are never auto-published by this endpoint.
    const rows = await query("INSERT INTO reviews (display_name, rating, treatment_slug, review_text, status, source) VALUES ($1,$2,$3,$4,'pending','manual') RETURNING id", [displayName, rating, "clinic-wide", reviewText]);
    return NextResponse.json({ ok: true, id: rows[0]?.id, status: "pending" });
  } catch (error) {
    console.error("Manual review error", error);
    return NextResponse.json({ error: "Could not add review." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureSchema();
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid review." }, { status: 400 });
    if (body.action === "approve" || body.action === "reject") {
      await query("UPDATE reviews SET status = $1, updated_at = NOW() WHERE id = $2", [body.action === "approve" ? "approved" : "rejected", id]);
    } else if (body.action === "edit") {
      const name = String(body.displayName || "").trim().slice(0, 80);
      const text = String(body.reviewText || "").trim().slice(0, 1500);
      const rating = Number(body.rating);
      if (!name || text.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Review details are invalid." }, { status: 400 });
      await query("UPDATE reviews SET display_name=$1, rating=$2, review_text=$3, updated_at=NOW() WHERE id=$4", [name,rating,text,id]);
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Review update error", error);
    return NextResponse.json({ error: "Could not update review." }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureSchema();
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid review." }, { status: 400 });
    const rows = await query("DELETE FROM reviews WHERE id = $1 RETURNING id", [id]);
    if (!rows.length) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Review delete error", error);
    return NextResponse.json({ error: "Could not delete review." }, { status: 500 });
  }
}
