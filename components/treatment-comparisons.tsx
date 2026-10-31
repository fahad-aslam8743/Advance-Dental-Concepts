"use client";

import { useState } from "react";
import type { ComparisonScenario } from "@/data/treatment-media";

export type TreatmentComparison = ComparisonScenario & {
  pairNumber: number;
  beforeUrl: string;
  afterUrl: string;
};

function ComparisonCard({ comparison }: { comparison: TreatmentComparison }) {
  const [position, setPosition] = useState(52);
  const id = "compare-" + comparison.pairNumber + "-" + comparison.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <article className="clinical-compare-card treatment-media-comparison">
      <div className="clinical-compare-card-heading">
        <span>CLINIC CASE · CONSENT CONFIRMED · 0{comparison.pairNumber}</span>
        <h3>{comparison.title}</h3>
      </div>
      <div className="clinical-compare-stage">
        <img className="clinical-compare-after" src={comparison.afterUrl} alt={"After treatment: " + comparison.title} loading="lazy" />
        <div className="clinical-compare-before-layer" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <img src={comparison.beforeUrl} alt={"Before treatment: " + comparison.title} loading="lazy" />
        </div>
        <div className="clinical-compare-divider" style={{ left: `${position}%` }} aria-hidden="true"><span>↔</span></div>
        <div className="clinical-compare-labels"><span>BEFORE</span><span>AFTER</span></div>
      </div>
      <div className="clinical-compare-control">
        <label htmlFor={id}>Drag to compare</label>
        <input id={id} type="range" min="5" max="95" value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-label={"Compare before and after: " + comparison.title} />
      </div>
      <p className="clinical-compare-caption">Clinic case shared with publication consent. Individual treatment outcomes vary.</p>
    </article>
  );
}

export default function TreatmentComparisons({ comparisons }: { comparisons: TreatmentComparison[]; treatmentName?: string }) {
  if (!comparisons.length) return null;
  return <>{comparisons.map((comparison) => <ComparisonCard key={comparison.pairNumber} comparison={comparison} />)}</>;
}
