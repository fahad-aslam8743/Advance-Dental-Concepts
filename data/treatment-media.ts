import type { Service } from "@/data/services";

export type ComparisonScenario = {
  title: string;
  concern: string;
  careConcept: string;
};

export const comparisonScenarios: Record<string, [ComparisonScenario, ComparisonScenario]> = {
  "teeth-whitening": [
    { title: "Surface staining", concern: "Illustration of common surface staining", careConcept: "Illustration of a lighter natural tooth shade" },
    { title: "Uneven tooth shade", concern: "Illustration of uneven natural tooth colour", careConcept: "Illustration of a more even shade concept" }
  ],
  "clear-aligners": [
    { title: "Crowding and overlap", concern: "Illustration of overlapping teeth", careConcept: "Illustration of a more aligned tooth position" },
    { title: "Spacing concerns", concern: "Illustration of gaps between teeth", careConcept: "Illustration of a more even tooth arrangement" }
  ],
  "dental-implants": [
    { title: "Single missing tooth", concern: "Illustration of a missing tooth space", careConcept: "Illustration of an implant-supported crown concept" },
    { title: "Restoring a tooth gap", concern: "Illustration of a visible tooth gap", careConcept: "Illustration of a restored tooth space concept" }
  ],
  "root-canal-treatment": [
    { title: "Pulp inflammation", concern: "Illustration of inflammation inside a tooth", careConcept: "Illustration of a cleaned and sealed canal" },
    { title: "Deep tooth damage", concern: "Illustration of deep decay approaching the pulp", careConcept: "Illustration of a treated tooth with a protective restoration" }
  ],
  "veneers": [
    { title: "Chips and shape concerns", concern: "Illustration of small chips and uneven tooth edges", careConcept: "Illustration of a veneer design concept" },
    { title: "Shade and proportion", concern: "Illustration of uneven shade and tooth proportions", careConcept: "Illustration of a balanced veneer design concept" }
  ],
  "crowns-bridges": [
    { title: "Weakened tooth", concern: "Illustration of a structurally weakened tooth", careConcept: "Illustration of a protective crown concept" },
    { title: "Missing tooth unit", concern: "Illustration of a missing tooth in a row", careConcept: "Illustration of a fixed bridge concept" }
  ],
  "dental-fillings": [
    { title: "Cavity in a tooth", concern: "Illustration of a cavity in the chewing surface", careConcept: "Illustration of a tooth-coloured filling concept" },
    { title: "Small tooth fracture", concern: "Illustration of a chipped tooth edge", careConcept: "Illustration of a restored tooth contour" }
  ],
  "scaling-polishing": [
    { title: "Plaque and calculus", concern: "Illustration of deposits near the gumline", careConcept: "Illustration of a professionally cleaned tooth surface" },
    { title: "Surface staining", concern: "Illustration of surface stain and deposits", careConcept: "Illustration of a cleaner tooth surface after hygiene care" }
  ],
  "wisdom-tooth-extraction": [
    { title: "Impacted wisdom tooth", concern: "Illustration of a wisdom tooth angled beneath the gum", careConcept: "Illustration of the area after indicated removal and healing" },
    { title: "Partially erupted tooth", concern: "Illustration of a partially erupted back tooth", careConcept: "Illustration of a managed extraction site concept" }
  ],
  "dental-checkup": [
    { title: "A concern to examine", concern: "Illustration of a tooth and gum concern to assess", careConcept: "Illustration of a documented examination and care plan" },
    { title: "Early detection", concern: "Illustration of an early dental concern", careConcept: "Illustration of a monitored or treated concern concept" }
  ],
  "minor-oral-surgery": [
    { title: "A tissue change to assess", concern: "Illustration of a small oral tissue change requiring assessment", careConcept: "Illustration of a reviewed and managed site concept" },
    { title: "Root-end concern", concern: "Illustration of inflammation near a tooth root tip", careConcept: "Illustration of a root-end treatment concept" }
  ],
  "smile-makeover": [
    { title: "Smile balance", concern: "Illustration of uneven shade and tooth proportions", careConcept: "Illustration of a balanced smile-design concept" },
    { title: "Several aesthetic concerns", concern: "Illustration of spacing, edge and shade concerns", careConcept: "Illustration of a coordinated smile-design concept" }
  ],
  "general-dentistry": [
    { title: "Common dental concern", concern: "Illustration of a tooth with a common dental concern", careConcept: "Illustration of a conservative restorative care concept" },
    { title: "Gumline and tooth health", concern: "Illustration of plaque and gumline irritation", careConcept: "Illustration of a preventive care concept" }
  ],
  "oral-surgery": [
    { title: "A surgical concern to assess", concern: "Illustration of a tooth or jaw concern requiring assessment", careConcept: "Illustration of a managed surgical site concept" },
    { title: "Impaction or root concern", concern: "Illustration of an impacted tooth or root-area concern", careConcept: "Illustration of a post-treatment anatomical concept" }
  ]
};

const gallerySets: Record<string, string[]> = {
  "teeth-whitening": ["teeth-whitening", "scaling-polishing", "veneers", "smile-makeover", "dental-checkup"],
  "clear-aligners": ["clear-aligners", "smile-makeover", "veneers", "dental-checkup", "general-dentistry"],
  "dental-implants": ["dental-implants", "crowns-bridges", "oral-surgery", "dental-checkup", "general-dentistry"],
  "root-canal-treatment": ["root-canal-treatment", "dental-fillings", "crowns-bridges", "dental-checkup", "general-dentistry"],
  "veneers": ["veneers", "teeth-whitening", "smile-makeover", "clear-aligners", "crowns-bridges"],
  "crowns-bridges": ["crowns-bridges", "dental-implants", "root-canal-treatment", "dental-fillings", "general-dentistry"],
  "dental-fillings": ["dental-fillings", "root-canal-treatment", "crowns-bridges", "dental-checkup", "general-dentistry"],
  "scaling-polishing": ["scaling-polishing", "teeth-whitening", "dental-checkup", "general-dentistry", "smile-makeover"],
  "wisdom-tooth-extraction": ["wisdom-tooth-extraction", "oral-surgery", "minor-oral-surgery", "dental-checkup", "general-dentistry"],
  "dental-checkup": ["dental-checkup", "general-dentistry", "scaling-polishing", "dental-fillings", "dental-implants"],
  "minor-oral-surgery": ["minor-oral-surgery", "wisdom-tooth-extraction", "oral-surgery", "dental-implants", "dental-checkup"],
  "smile-makeover": ["smile-makeover", "veneers", "teeth-whitening", "clear-aligners", "crowns-bridges"],
  "general-dentistry": ["general-dentistry", "dental-checkup", "dental-fillings", "scaling-polishing", "root-canal-treatment"],
  "oral-surgery": ["oral-surgery", "minor-oral-surgery", "wisdom-tooth-extraction", "dental-implants", "dental-checkup"]
};

function svgToDataUrl(svg: string) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function dentalIllustration(slug: string, side: "before" | "after", pairNumber: 1 | 2, serviceName: string) {
  const before = side === "before";
  const issueIndex = pairNumber === 1 ? 3 : 5;
  const gapIndex = slug === "dental-implants" ? (pairNumber === 1 ? 3 : 5) : -1;
  const toothXs = [178, 258, 338, 418, 498, 578, 658, 738];
  const crowded = slug === "clear-aligners" && before;
  const positions = toothXs.map((x, i) => x + (crowded ? ([0, 9, -13, 12, -10, 8, -5, 0][i]) : 0));
  const teeth = positions.map((x, i) => {
    if (i === gapIndex && (before || slug !== "dental-implants")) return "";
    const isProblem = before && (i === issueIndex || (slug === "teeth-whitening" || slug === "scaling-polishing") || (slug === "veneers" && i === 4));
    const fill = isProblem
      ? (slug === "teeth-whitening" ? "#d8bd79" : slug === "scaling-polishing" ? "#d2b56e" : "#f1d8ad")
      : "#fffdf7";
    const transform = crowded && i % 2 === 0 ? `rotate(${i % 4 === 0 ? -7 : 6} ${x + 27} 286)` : "";
    const chip = before && (slug === "veneers" || slug === "dental-fillings") && i === issueIndex
      ? `<path d="M${x + 31} 215 l18 0 -9 16z" fill="#dfece8"/>` : "";
    const cavity = before && (slug === "dental-fillings" || slug === "general-dentistry" || slug === "root-canal-treatment") && i === issueIndex
      ? `<ellipse cx="${x + 27}" cy="276" rx="12" ry="9" fill="#725b50"/>` : "";
    const crown = !before && (slug === "crowns-bridges" || slug === "dental-implants") && i === issueIndex
      ? `<path d="M${x + 5} 220 Q${x + 27} 201 ${x + 49} 220 L${x + 47} 266 Q${x + 27} 282 ${x + 7} 266z" fill="#ffffff" stroke="#83aaa1" stroke-width="3"/><path d="M${x + 8} 230 Q${x + 27} 214 ${x + 46} 230" fill="none" stroke="#c4ded7" stroke-width="4"/>` : "";
    const pulp = before && slug === "root-canal-treatment" && i === issueIndex
      ? `<ellipse cx="${x + 27}" cy="282" rx="9" ry="19" fill="#d87970" opacity=".9"/>` : "";
    return `<g transform="${transform}"><path d="M${x + 4} 222 Q${x + 3} 190 ${x + 27} 190 Q${x + 51} 190 ${x + 50} 222 L${x + 46} 300 Q${x + 42} 334 ${x + 27} 352 Q${x + 12} 334 ${x + 8} 300z" fill="${fill}" stroke="#b9b5a8" stroke-width="3"/><path d="M${x + 12} 211 Q${x + 27} 199 ${x + 42} 211" fill="none" stroke="#ffffff" stroke-width="5" opacity=".8"/>${chip}${cavity}${pulp}${crown}</g>`;
  }).join("");
  const lesion = before && ["minor-oral-surgery", "oral-surgery"].includes(slug)
    ? `<ellipse cx="454" cy="382" rx="36" ry="17" fill="#cf7c79" opacity=".75"/><ellipse cx="454" cy="382" rx="18" ry="7" fill="#a54d51" opacity=".75"/>`
    : "";
  const plaque = before && ["scaling-polishing", "general-dentistry"].includes(slug)
    ? `<path d="M140 204 Q450 168 820 204 L814 220 Q450 190 146 220z" fill="#c7a453" opacity=".88"/>`
    : "";
  const root = slug === "dental-implants" && !before
    ? `<path d="M${positions[gapIndex] + 20} 348 l14 0 5 42 -24 0z" fill="#9da8ae" stroke="#7d8c94" stroke-width="3"/>`
    : "";
  const missing = before && slug === "dental-implants"
    ? `<rect x="${positions[gapIndex] - 2}" y="210" width="58" height="145" rx="14" fill="#f0f7f4" opacity=".92" stroke="#c4d9d3" stroke-dasharray="7 7"/>`
    : "";
  const aligner = slug === "clear-aligners"
    ? `<path d="M150 201 Q450 163 836 201 L830 232 Q450 194 156 232z" fill="#8bc4bb" fill-opacity=".23" stroke="#6baca1" stroke-width="5"/>`
    : "";
  const surgical = ["wisdom-tooth-extraction", "minor-oral-surgery", "oral-surgery"].includes(slug)
    ? `<path d="M735 362 Q785 344 834 362" fill="none" stroke="#d28a84" stroke-width="13" stroke-linecap="round" opacity=".7"/>`
    : "";
  const tag = before ? "CONDITION" : "CARE CONCEPT";
  return svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 560">
    <defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f5faf8"/><stop offset="1" stop-color="#e7f1ee"/></linearGradient><linearGradient id="gum" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#e9b1a9"/><stop offset="1" stop-color="#cc827d"/></linearGradient></defs>
    <rect width="1000" height="560" rx="34" fill="url(#bg)"/>
    <circle cx="850" cy="86" r="115" fill="#d4e8e2" opacity=".52"/><circle cx="140" cy="460" r="130" fill="#d8eae5" opacity=".45"/>
    <text x="72" y="75" fill="#52746c" font-family="Arial,sans-serif" font-size="18" letter-spacing="4">DENTAL EDUCATION VISUAL</text>
    <text x="72" y="120" fill="#1c4541" font-family="Arial,sans-serif" font-size="27" font-weight="700">${serviceName.replace(/&/g, "&amp;")}</text>
    <rect x="72" y="164" width="856" height="270" rx="30" fill="#fff" opacity=".75"/>
    <path d="M132 217 Q450 154 868 217 L850 282 Q450 235 150 282z" fill="url(#gum)"/>
    <path d="M132 217 Q450 154 868 217" fill="none" stroke="#ad6865" stroke-width="5" opacity=".6"/>
    ${missing}${teeth}${plaque}${lesion}${root}${aligner}${surgical}
    <rect x="72" y="462" width="856" height="52" rx="16" fill="#1c4541"/>
    <text x="500" y="496" fill="#ffffff" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" letter-spacing="3">${tag} · NOT A PATIENT PHOTO</text>
  </svg>`);
}

export function buildSeedTreatmentMedia(services: Service[]) {
  const bySlug = new Map(services.map(service => [service.slug, service]));
  const rows: { treatment_slug: string; kind: "image"; url: string; pathname: string; alt_text: string; placement: "gallery" | "comparison_before" | "comparison_after"; pair_number: number | null; sort_order: number; is_illustrative: boolean; patient_consent_verified: boolean }[] = [];
  for (const service of services) {
    const gallerySlugs = gallerySets[service.slug] || [service.slug];
    for (const [index, imageSlug] of gallerySlugs.entries()) {
      const imageService = bySlug.get(imageSlug);
      if (!imageService) continue;
      rows.push({
        treatment_slug: service.slug,
        kind: "image",
        url: imageService.image,
        pathname: `seed/gallery/${service.slug}/${index + 1}`,
        alt_text: `Illustrative stock photograph for ${service.name}. This is not a documented patient result.`,
        placement: "gallery",
        pair_number: null,
        sort_order: index + 1,
        is_illustrative: false,
        patient_consent_verified: false
      });
    }
    for (const pairNumber of [1, 2] as const) {
      for (const side of ["before", "after"] as const) {
        rows.push({
          treatment_slug: service.slug,
          kind: "image",
          url: dentalIllustration(service.slug, side, pairNumber, service.name),
          pathname: `seed/comparison/${service.slug}/${pairNumber}/${side}`,
          alt_text: side === "before"
            ? `Educational condition illustration for ${service.name}; not an actual patient photograph.`
            : `Educational care-concept illustration for ${service.name}; not a predicted or actual patient result.`,
          placement: side === "before" ? "comparison_before" : "comparison_after",
          pair_number: pairNumber,
          sort_order: pairNumber,
          is_illustrative: true,
          patient_consent_verified: false
        });
      }
    }
  }
  return rows;
}
