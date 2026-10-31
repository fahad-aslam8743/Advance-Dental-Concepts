"use client";

import { useEffect } from "react";

export function RevealEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("motion-enabled");

    const targets = document.querySelectorAll([
      ".section-heading", ".service-card", ".doctor-about-photo",
      ".doctor-about-copy", ".clinic-approach-heading", ".approach-card",
      ".clinic-approach-foot", ".guide-top", ".guide-card",
      ".pricing-inner > *", ".faq-layout > *", ".contact-grid > *",
      ".patient-section-heading", ".shared-review-card",
      ".treatment-hero-content", ".treatment-intro-grid > *",
      ".option-card", ".content-block", ".treatment-faq-grid > *",
      ".related-card"
    ].join(","));

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -48px 0px" });

    targets.forEach((target, index) => {
      target.classList.add("reveal-item");
      if (target.matches(".service-card, .approach-card, .guide-card, .option-card, .related-card, .shared-review-card")) {
        const siblings = Array.from(target.parentElement?.children ?? []);
        target.style.setProperty("--reveal-delay", `${(siblings.indexOf(target) % 4) * 85}ms`);
      } else {
        target.style.setProperty("--reveal-delay", "0ms");
      }
      observer.observe(target);
    });

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-enabled");
    };
  }, []);

  return null;
}
