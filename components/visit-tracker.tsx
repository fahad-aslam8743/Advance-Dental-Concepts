"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) return;
    try {
      let sessionId = window.sessionStorage.getItem("adc_analytics_session");
      if (!sessionId) {
        sessionId = window.crypto?.randomUUID?.() || ("adc-" + Math.random().toString(36).slice(2) + Date.now().toString(36));
        window.sessionStorage.setItem("adc_analytics_session", sessionId);
      }
      fetch("/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, path: pathname })
      }).catch(() => {});
    } catch {
      // Analytics must never interfere with the patient website.
    }
  }, [pathname]);
  return null;
}