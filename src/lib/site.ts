/**
 * Single source of truth for the facts that must be identical site-wide.
 *
 * BRIEF.md §14 requires one canonical LinkedIn URL, one tagline and one
 * legacy year figure across the whole site. The live site fails all three,
 * so nothing here may be duplicated into a component.
 */

export const site = {
  name: "Sunpure Homes",

  /**
   * The canonical origin, for the sitemap, robots.txt and anywhere else an
   * absolute URL is needed. The apex answers 200 and www. redirects to it, so
   * this is the form search engines should be given. It is deliberately not
   * the Vercel or Webflow preview host: both serve the same pages, and the
   * sitemap must point at one of them or they compete for the same results.
   */
  url: "https://sunpurehomes.com",

  /** The only tagline. Three others on the live site are retired. */
  tagline: "Thoughtfully Built, Deeply Lived.",

  city: "Mysuru",
  region: "Karnataka",

  /** The one legacy figure. Change it here or nowhere. */
  legacyYears: 40,

  /*
    Retained, not rendered. The client asked for every reference to the group
    and to Sunpure Oil to come off the site, so nothing reads these today.
    They stay because the facts are verified and §6 still plans a /legacy
    route; delete them if that route is dropped.
  */
  group: {
    name: "Masoom Group",
    legalName: "M.K. Agrotech Pvt. Ltd.",
    consumerBrand: "Sunpure Oil",
  },

  /**
   * §4. Shown in the approvals module on every project page — §3 goal 5 is
   * that trust is made visible per project, not buried on an About page.
   */
  materialPartners: [
    "Asian Paints",
    "Saint-Gobain",
    "Somany",
    "Jaquar",
    "Kohler",
    "Astral Pipes",
    "V-Guard",
    "Schneider Electric",
    "Fujitec",
  ],

  contact: {
    email: "help@sunpurehomes.com",
    /**
     * Also the WhatsApp number — the client confirmed on 7 October that the
     * two are the same, so one value drives tel:, wa.me and every printed
     * occurrence. E.164 for the links.
     *
     * Changed from +91 99169 00511 that day. The new number is the one the
     * Rare Earth brochure already carries, which closes part of the open
     * question below rather than adding to it.
     */
    phoneE164: "+918105817070",
    phoneDisplay: "+91 81058 17070",
  },

  social: {
    instagram: "https://www.instagram.com/sunpurehomes/",
    facebook: "https://www.facebook.com/sunpurehomesmysore",
    youtube: "https://www.youtube.com/@sunpurehomesmysore",
    /**
     * Canonical, confirmed by the client 2026-08-29. The live site shows a
     * second URL (/company/sunpure-homes-mysore/) in one of its two footers
     * (BRIEF.md §2, defect 8) — that one is retired. Use this everywhere.
     */
    linkedin: "https://www.linkedin.com/company/sunpure-homes",
  },
} as const;

/**
 * Unresolved content questions, surfaced for the client rather than
 * papered over with invented values (BRIEF.md §15).
 */
export const openQuestions: readonly string[] = [
  "The brochures on the Drive carry four different sales numbers between them: +91 99722 75566 (Fadal, Meraki, Happiness II), +91 77900 88900 (Curve, Meraki), +91 81058 17070 (Rare Earth) and +91 90147 81478 (Fadal). The site published +91 99169 00511 from 15 September 2026 until 7 October, when the client replaced it with +91 81058 17070 — the Rare Earth number, and the first time the published number has matched any brochure. Three brochure numbers are still unaccounted for. Confirm whether any project needs its own number as well, and whether the brochures should be reprinted to agree with the site.",
  "The privacy policy at /privacy is interim text written from what the site does. It names no legal entity, no grievance officer and no retention period, because none is confirmed. Send the client's approved policy, or those three facts.",
  "Happiness 2's description says its villas are 2,543 sq ft, but the brochure's floor-by-floor figures put them at 2,167–3,520 sq ft built-up. Arka answers from the floor-by-floor figures and does not repeat the 2,543. Confirm which the page should say.",
  "The About page now says Sunpure Homes build beyond Mysuru, at the client's instruction on 15 September 2026. All nine developments on this site are in Mysuru, so nothing names the other places. Send the cities, and they can be said plainly instead of in the abstract.",
  "The Happiness II brochure names the developer as MK Infra Holding, MB Road, Srirangapatna 571438. This file records the group's legal name as M.K. Agrotech Pvt. Ltd., the oil business. Confirm which entity is the promoter on the RERA registrations before any legal-entity name is published.",
  "Every project page shows bathrooms equal to bedrooms (a 3 BHK shows 3 bathrooms), at the client's instruction of 17 September 2026. No project file records bathroom counts. Send them per configuration and they will replace the rule.",
  "Meraki's areas were labelled super built-up in its brochure and are now shown as built-up, at the client's instruction of 17 September 2026. Confirm the figures are built-up against the approved plans.",
  "Curve's data sheet gives a total super built-up area of 55,000 sq ft, marked 'to confirm with Shahab'. It is not published until confirmed.",
  "Brand marks were taken from Wikipedia and Wikimedia Commons on 17 September 2026; Astral Pipes came from the client on 3 October. None is on file for Ashirvad, Qcon RKB, SK Super Steel or Techtonics, which show as names. Send their logo files, and confirm the marks used are the current ones.",
];
