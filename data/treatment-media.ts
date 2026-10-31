import type { Service } from "@/data/services";

export type ComparisonScenario = {
  title: string;
  concern: string;
  careConcept: string;
};

export const comparisonScenarios: Record<string, [ComparisonScenario, ComparisonScenario]> = {
  "teeth-whitening": [{ title: "Whitening case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Whitening case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "clear-aligners": [{ title: "Alignment case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Alignment case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "dental-implants": [{ title: "Implant case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Implant case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "root-canal-treatment": [{ title: "Root canal case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Root canal case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "veneers": [{ title: "Veneer case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Veneer case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "crowns-bridges": [{ title: "Restoration case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Restoration case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "dental-fillings": [{ title: "Filling case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Filling case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "scaling-polishing": [{ title: "Cleaning case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Cleaning case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "wisdom-tooth-extraction": [{ title: "Wisdom tooth case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Wisdom tooth case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "dental-checkup": [{ title: "Dental check-up case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Dental check-up case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "minor-oral-surgery": [{ title: "Oral care case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Oral care case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "smile-makeover": [{ title: "Smile design case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Smile design case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "general-dentistry": [{ title: "General dentistry case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "General dentistry case 02", concern: "Before treatment", careConcept: "After treatment" }],
  "oral-surgery": [{ title: "Oral surgery case 01", concern: "Before treatment", careConcept: "After treatment" }, { title: "Oral surgery case 02", concern: "Before treatment", careConcept: "After treatment" }]
};

export type GalleryPhoto = { id: number; caption: string };

const gallerySets: Record<string, [GalleryPhoto, GalleryPhoto, GalleryPhoto, GalleryPhoto]> = {
  "teeth-whitening": [
    { id: 3779706, caption: "Professional teeth cleaning close-up" },
    { id: 3845984, caption: "Dental hygiene treatment with clinical equipment" },
    { id: 6627590, caption: "Close-up dental polishing detail" },
    { id: 6529106, caption: "Close-up dental light procedure" }
  ],
  "clear-aligners": [
    { id: 11887613, caption: "Clear aligner tray shown in hand" },
    { id: 13085186, caption: "Dental technician finishing a clear aligner" },
    { id: 6528861, caption: "Close-up orthodontic treatment" },
    { id: 7584486, caption: "Close-up of teeth with orthodontic braces" }
  ],
  "dental-implants": [
    { id: 13207320, caption: "Dental implant kit and components" },
    { id: 4687905, caption: "Dental implant model for treatment planning" },
    { id: 7788504, caption: "Dental prosthetic fabrication" },
    { id: 7788493, caption: "Dental technician crafting a tooth restoration" }
  ],
  "root-canal-treatment": [
    { id: 4687412, caption: "Microscope-assisted endodontic procedure" },
    { id: 8176834, caption: "Root canal treatment under magnification" },
    { id: 5355837, caption: "Close-up restorative dental procedure" },
    { id: 6812568, caption: "Close-up of a patient's mouth during treatment" }
  ],
  "veneers": [
    { id: 6627599, caption: "Dental veneer shade guide" },
    { id: 6627572, caption: "Veneer application close-up" },
    { id: 6627571, caption: "Close-up of veneer treatment" },
    { id: 6812502, caption: "Dental veneer samples on display" }
  ],
  "crowns-bridges": [
    { id: 33748047, caption: "Ceramic dental restoration detail" },
    { id: 6812494, caption: "Tooth shade selection for restorations" },
    { id: 7789704, caption: "Dental photography for restoration planning" },
    { id: 6627483, caption: "Close-up dental examination and tools" }
  ],
  "dental-fillings": [
    { id: 4971541, caption: "Dental filling procedure close-up" },
    { id: 16842747, caption: "Close-up dental procedure with instruments" },
    { id: 6627524, caption: "Restorative dental care in progress" },
    { id: 5355839, caption: "Light-assisted dental restoration" }
  ],
  "scaling-polishing": [
    { id: 6528858, caption: "Close-up professional dental procedure" },
    { id: 6528855, caption: "Dentist examining teeth" },
    { id: 6627531, caption: "Dental instruments used during oral care" },
    { id: 6502620, caption: "Close-up dental check-up and cleaning" }
  ],
  "wisdom-tooth-extraction": [
    { id: 7584489, caption: "Dental surgery in a clinical setting" },
    { id: 7584482, caption: "Patient undergoing dental surgery" },
    { id: 15688027, caption: "Dental team performing a procedure" },
    { id: 16559199, caption: "Dentists working on a patient" }
  ],
  "dental-checkup": [
    { id: 14458277, caption: "Dentist examining teeth with a mouth mirror" },
    { id: 5622240, caption: "Routine dental examination" },
    { id: 6502748, caption: "Close-up dental check-up" },
    { id: 6502749, caption: "Dental instruments used during examination" }
  ],
  "minor-oral-surgery": [
    { id: 10820349, caption: "Preparing sterile dental instruments" },
    { id: 4269947, caption: "Close-up dental examination with gloves" },
    { id: 6812531, caption: "Close-up patient procedure in a dental clinic" },
    { id: 6627409, caption: "Patient positioned for dental treatment" }
  ],
  "smile-makeover": [
    { id: 9774680, caption: "Orthodontic smile alignment close-up" },
    { id: 5524023, caption: "Close-up view of orthodontic treatment" },
    { id: 19476290, caption: "Dental assessment for smile care" },
    { id: 6502740, caption: "Cosmetic dental examination" }
  ],
  "general-dentistry": [
    { id: 19976592, caption: "General dental examination" },
    { id: 19976605, caption: "Dental care in a modern clinic" },
    { id: 19976589, caption: "Dentists providing general care" },
    { id: 19976584, caption: "Patient receiving dental treatment" }
  ],
  "oral-surgery": [
    { id: 18523995, caption: "Dental professionals treating a patient" },
    { id: 18199893, caption: "Dentist in surgical attire attending a patient" },
    { id: 20301626, caption: "Oral examination with dental instruments" },
    { id: 6502629, caption: "Patient in a dental chair for treatment" }
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
    is_illustrative: false;
    patient_consent_verified: false;
  }[] = [];

  for (const service of services) {
    const photos = gallerySets[service.slug];
    if (!photos) continue;

    // Keep the treatment's own unique hero photo, followed by four separately selected Pexels photos.
    rows.push({
      treatment_slug: service.slug,
      kind: "image",
      url: service.image,
      pathname: "seed/treatment-gallery-v2/" + service.slug + "/1",
      alt_text: service.name + " treatment overview photograph",
      placement: "gallery",
      pair_number: null,
      sort_order: 1,
      is_illustrative: false,
      patient_consent_verified: false
    });

    photos.forEach((photo, index) => {
      const url = "https://images.pexels.com/photos/" + photo.id + "/pexels-photo-" + photo.id + ".jpeg?auto=compress&cs=tinysrgb&w=1600";
      rows.push({
        treatment_slug: service.slug,
        kind: "image",
        url,
        pathname: "seed/treatment-gallery-v2/" + service.slug + "/" + (index + 2),
        alt_text: photo.caption,
        placement: "gallery",
        pair_number: null,
        sort_order: index + 2,
        is_illustrative: false,
        patient_consent_verified: false
      });
    });
  }

  return rows;
}
