import type { Service } from "@/data/services";

export type ComparisonScenario = { title: string; concern: string; careConcept: string };

export const comparisonScenarios: Record<string, [ComparisonScenario, ComparisonScenario]> = {
  "teeth-whitening": [{ title: "teeth-whitening case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "teeth-whitening case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "clear-aligners": [{ title: "clear-aligners case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "clear-aligners case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "dental-implants": [{ title: "dental-implants case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "dental-implants case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "root-canal-treatment": [{ title: "root-canal-treatment case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "root-canal-treatment case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "veneers": [{ title: "veneers case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "veneers case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "crowns-bridges": [{ title: "crowns-bridges case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "crowns-bridges case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "dental-fillings": [{ title: "dental-fillings case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "dental-fillings case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "scaling-polishing": [{ title: "scaling-polishing case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "scaling-polishing case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "wisdom-tooth-extraction": [{ title: "wisdom-tooth-extraction case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "wisdom-tooth-extraction case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "dental-checkup": [{ title: "dental-checkup case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "dental-checkup case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "minor-oral-surgery": [{ title: "minor-oral-surgery case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "minor-oral-surgery case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "smile-makeover": [{ title: "smile-makeover case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "smile-makeover case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "general-dentistry": [{ title: "general-dentistry case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "general-dentistry case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "oral-surgery": [{ title: "oral-surgery case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "oral-surgery case 02", concern: "Before treatment", careConcept: "After treatment" }]
};

// Educational before-and-after examples are generated as fixed illustrations.

export function buildEducationalComparisonMedia(treatmentSlug: string) {
  const slugIndex=Math.max(0,Object.keys(comparisonScenarios).indexOf(treatmentSlug));
  return [1,2].flatMap(pairNumber=>(["before","after"] as const).map(phase=>({
    id:-(slugIndex*10+pairNumber*2+(phase==="before"?1:2)),
    treatment_slug:treatmentSlug,
    kind:"image" as const,
    url:"/api/illustrations/"+treatmentSlug+"/"+phase+"?pair="+pairNumber,
    alt_text:treatmentSlug.replace(/-/g," ")+" educational "+phase+" illustration, example "+pairNumber,
    placement:(phase==="before"?"comparison_before":"comparison_after") as "comparison_before"|"comparison_after",
    pair_number:pairNumber,
    sort_order:pairNumber,
    is_illustrative:true,
    patient_consent_verified:false,
    created_at:"1970-01-01T00:00:00.000Z"
  })));
}

export type GalleryPhoto = { id: number; caption: string };

const gallerySets: Record<string, [GalleryPhoto, GalleryPhoto, GalleryPhoto, GalleryPhoto, GalleryPhoto]> = {
  "teeth-whitening": [
    { id: 3779706, caption: "Professional teeth cleaning close-up" },
    { id: 3845984, caption: "Dental hygiene treatment with clinical equipment" },
    { id: 6627590, caption: "Close-up dental polishing detail" },
    { id: 6529106, caption: "Close-up dental light procedure" },
    { id: 5355829, caption: "Dentist using a dental curing light" }
  ],
  "clear-aligners": [
    { id: 11887613, caption: "Clear aligner tray shown in hand" },
    { id: 13085186, caption: "Dental technician finishing a clear aligner" },
    { id: 6528861, caption: "Close-up orthodontic treatment" },
    { id: 7584486, caption: "Close-up of teeth with orthodontic braces" },
    { id: 6529121, caption: "Orthodontic bracket treatment close-up" }
  ],
  "dental-implants": [
    { id: 13207320, caption: "Dental implant kit and components" },
    { id: 4687905, caption: "Dental implant model for treatment planning" },
    { id: 7788504, caption: "Dental prosthetic fabrication" },
    { id: 7788493, caption: "Dental technician crafting a tooth restoration" },
    { id: 32852533, caption: "Dental clinic procedure close-up" }
  ],
  "root-canal-treatment": [
    { id: 4687412, caption: "Microscope-assisted endodontic procedure" },
    { id: 8176834, caption: "Root canal treatment under magnification" },
    { id: 5355837, caption: "Close-up restorative dental procedure" },
    { id: 6812568, caption: "Close-up of a patient's mouth during treatment" },
    { id: 5355835, caption: "Light-assisted dental treatment close-up" }
  ],
  "veneers": [
    { id: 6627599, caption: "Dental veneer shade guide" },
    { id: 6627572, caption: "Veneer application close-up" },
    { id: 6627571, caption: "Close-up of veneer treatment" },
    { id: 6812502, caption: "Dental veneer samples on display" },
    { id: 6502745, caption: "Close-up dental examination before cosmetic care" }
  ],
  "crowns-bridges": [
    { id: 33748047, caption: "Ceramic dental restoration detail" },
    { id: 6812494, caption: "Tooth shade selection for restorations" },
    { id: 7789704, caption: "Dental photography for restoration planning" },
    { id: 6627483, caption: "Close-up dental examination and tools" },
    { id: 5355704, caption: "Dental radiograph for restoration planning" }
  ],
  "dental-fillings": [
    { id: 4971541, caption: "Dental filling procedure close-up" },
    { id: 16842747, caption: "Close-up dental procedure with instruments" },
    { id: 6627524, caption: "Restorative dental care in progress" },
    { id: 5355839, caption: "Light-assisted dental restoration" },
    { id: 6627576, caption: "Close-up of dental tools in a patient's mouth" }
  ],
  "scaling-polishing": [
    { id: 6528858, caption: "Close-up professional dental procedure" },
    { id: 6528855, caption: "Dentist examining teeth" },
    { id: 6627531, caption: "Dental instruments used during oral care" },
    { id: 6502620, caption: "Close-up dental check-up and cleaning" },
    { id: 4270374, caption: "Close-up of preventive dental care" }
  ],
  "wisdom-tooth-extraction": [
    { id: 7584489, caption: "Dental surgery in a clinical setting" },
    { id: 7584482, caption: "Patient undergoing dental surgery" },
    { id: 15688027, caption: "Dental team performing a procedure" },
    { id: 16559199, caption: "Dentists working on a patient" },
    { id: 4269690, caption: "Open-mouth dental examination close-up" }
  ],
  "dental-checkup": [
    { id: 14458277, caption: "Dentist examining teeth with a mouth mirror" },
    { id: 5622240, caption: "Routine dental examination" },
    { id: 6502748, caption: "Close-up dental check-up" },
    { id: 6502749, caption: "Dental instruments used during examination" },
    { id: 5622033, caption: "Patient receiving a dental examination" }
  ],
  "minor-oral-surgery": [
    { id: 10820349, caption: "Preparing sterile dental instruments" },
    { id: 4269947, caption: "Close-up dental examination with gloves" },
    { id: 6812531, caption: "Close-up patient procedure in a dental clinic" },
    { id: 6627409, caption: "Patient positioned for dental treatment" },
    { id: 5622254, caption: "Dental radiograph for treatment planning" }
  ],
  "smile-makeover": [
    { id: 9774680, caption: "Orthodontic smile alignment close-up" },
    { id: 5524023, caption: "Close-up view of orthodontic treatment" },
    { id: 19476290, caption: "Dental assessment for smile care" },
    { id: 6502740, caption: "Cosmetic dental examination" },
    { id: 5355843, caption: "Dentist using a curing light during cosmetic care" }
  ],
  "general-dentistry": [
    { id: 19976592, caption: "General dental examination" },
    { id: 19976605, caption: "Dental care in a modern clinic" },
    { id: 19976589, caption: "Dentists providing general care" },
    { id: 19976584, caption: "Patient receiving dental treatment" },
    { id: 5355695, caption: "Dental radiograph used in routine assessment" }
  ],
  "oral-surgery": [
    { id: 18523995, caption: "Dental professionals treating a patient" },
    { id: 18199893, caption: "Dentist in surgical attire attending a patient" },
    { id: 20301626, caption: "Oral examination with dental instruments" },
    { id: 6502629, caption: "Patient in a dental chair for treatment" },
    { id: 5622261, caption: "Dental radiograph for surgical assessment" }
  ]

};

export function buildSeedTreatmentMedia(services: Service[]) {
  const rows: {
    treatment_slug: string;
    kind: "image";
    url: string;
    pathname: string;
    alt_text: string;
    placement: "gallery";
    pair_number: null;
    sort_order: number;
    is_illustrative: true;
    patient_consent_verified: false;
  }[] = [];

  for (const service of services) {
    const photos = gallerySets[service.slug];
    if (!photos) continue;

    photos.forEach((photo, index) => {
      const url = "https://images.pexels.com/photos/" + photo.id + "/pexels-photo-" + photo.id + ".jpeg?auto=compress&cs=tinysrgb&w=1600";
      rows.push({
        treatment_slug: service.slug,
        kind: "image",
        url,
        pathname: "seed/treatment-gallery-v5/" + service.slug + "/" + (index + 1),
        alt_text: "",
        placement: "gallery",
        pair_number: null,
        sort_order: index + 1,
        is_illustrative: true,
        patient_consent_verified: false
      });
    });
  }

  return rows;
}
