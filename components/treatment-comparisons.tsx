"use client";

import { useState } from "react";
import type { ComparisonScenario } from "@/data/treatment-media";

export type TreatmentComparison = ComparisonScenario & {
  pairNumber: number;
  beforeUrl: string;
  afterUrl: string;
  sourceType: "illustration" | "consented-patient-case";
};

function ComparisonCard({ comparison }: { comparison: TreatmentComparison }) {
  const [position, setPosition] = useState(52);
  return (
    <article className="clinical-compare-card">
      <div className="clinical-compare-card-heading">
        <span>{comparison.sourceType === "consented-patient-case" ? "CLINIC PATIENT CASE · CONSENT CONFIRMED" : "EDUCATIONAL ILLUSTRATION"} · 0{comparison.pairNumber}</span>
        <h3>{comparison.title}</h3>
      </div>
      <div className="clinical-compare-stage">
        <img className="clinical-compare-after" src={comparison.afterUrl} alt={comparison.careConcept} loading="lazy" />
        <div className="clinical-compare-before-layer" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <img src={comparison.beforeUrl} alt={comparison.concern} loading="lazy" />
        </div>
        <div className="clinical-compare-divider" style={{ left: `${position}%` }} aria-hidden="true">
          <span>↔</span>
        </div>
        <div className="clinical-compare-labels">
          <span>CONDITION</span>
          <span>CARE CONCEPT</span>
        </div>
      </div>
      <div className="clinical-compare-control">
        <label htmlFor={`compare-${comparison.pairNumber}-${comparison.title.replace(/[^a-z0-9]/gi, "-")}`}>Drag to compare</label>
        <input
          id={`compare-${comparison.pairNumber}-${comparison.title.replace(/[^a-z0-9]/gi, "-")}`}
          type="range"
          min="5"
          max="95"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label={`Compare condition and care concept: ${comparison.title}`}
        />
      </div>
      <p className="clinical-compare-caption">{comparison.concern}. {comparison.careConcept}.</p>
    </article>
  );
}

export default function TreatmentComparisons({ comparisons, treatmentName }: { comparisons: TreatmentComparison[]; treatmentName: string }) {
  if (!comparisons.length) return null;
  return (
    <section className="clinical-comparisons" aria-label={`${treatmentName} educational comparisons`}>
      <div className="clinical-comparisons-heading">
        <span>UNDERSTAND THE TREATMENT</span>
        <h2>See the care concept.</h2>
        <p>Slide each comparison to explore an educational illustration of a concern and a possible care concept for {treatmentName.toLowerCase()}.</p>
      </div>
      <div className="clinical-comparisons-grid">
        {comparisons.map((comparison) => <ComparisonCard key={comparison.pairNumber} comparison={comparison} />)}
      </div>
      <p className="clinical-comparisons-disclaimer">Illustrations are educational concepts, not predicted results. Patient photographs are shown only when the clinic records written consent for publication. Individual suitability and outcomes vary; a dentist must assess each patient and discuss realistic options.</p>
    </section>
  );
}
