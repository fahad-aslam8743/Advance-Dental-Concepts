"use client";

import { useState } from "react";
import { services } from "@/data/services";

export function ReviewSubmissionForm({ initialTreatment = "" }: { initialTreatment?: string }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [treatment, setTreatment] = useState(initialTreatment);
  const [review, setReview] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name, rating, treatmentSlug: treatment, reviewText: review, consent, website })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit your review.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit your review.");
    } finally { setBusy(false); }
  }

  if (done) return <div className="review-thanks" role="status"><span>THANK YOU</span><h3>Your feedback has been received.</h3><p>Your review is now in the clinic's moderation queue. It will appear publicly only after the team reviews and approves it.</p></div>;

  return <form className="public-review-form" onSubmit={submit}>
    <div className="review-form-grid">
      <label>Your display name<input required maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Ayesha" /></label>
      <label>Treatment or service<select required value={treatment} onChange={e=>setTreatment(e.target.value)}><option value="">Choose a treatment</option>{services.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
      <label>Your rating<select value={rating} onChange={e=>setRating(e.target.value)}><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select></label>
      <label className="review-wide">Your review<textarea required minLength={15} maxLength={1500} rows={5} value={review} onChange={e=>setReview(e.target.value)} placeholder="Tell us about your experience..." /></label>
    </div>
    <label className="review-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required /> I confirm this is my genuine experience and agree that the clinic may publish this review using my display name after approval.</label>
    <input className="review-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e=>setWebsite(e.target.value)} />
    {error && <p className="review-error">{error}</p>}
    <button className="button button-dark" disabled={busy || !consent}>{busy ? "Submitting..." : "Submit review"}</button>
    <p className="review-privacy-note">Reviews are checked by the clinic before they appear on the website. Please do not include private medical details.</p>
  </form>;
}
