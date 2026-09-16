/**
 * Single source of truth for the facts that must be identical site-wide.
 *
 * BRIEF.md §14 requires one canonical LinkedIn URL, one tagline and one
 * legacy year figure across the whole site. The live site fails all three,
 * so nothing here may be duplicated into a component.
 */

export const site = {
  name: "Sunpure Homes",

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
    "Koala",
    "Astral Pipes",
    "V-Guard",
    "Schneider Electric",
    "Fujitec",
  ],

  contact: {
    email: "sales@sunpurehomes.com",
    /** Also the WhatsApp number. E.164 for tel: and wa.me links. */
    phoneE164: "+919916900511",
    phoneDisplay: "+91 99169 00511",
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
  "The brochures on the Drive carry four different sales numbers between them: +91 99722 75566 (Fadal, Meraki, Happiness II), +91 77900 88900 (Curve, Meraki), +91 81058 17070 (Rare Earth) and +91 90147 81478 (Fadal). The site publishes +91 99169 00511, given by the client on 15 September 2026, which appears in none of them. Confirm whether any project needs its own number as well.",
  "Happiness 2's description says its villas are 2,543 sq ft, but the brochure's floor-by-floor figures put them at 2,167–3,520 sq ft built-up. Arka answers from the floor-by-floor figures and does not repeat the 2,543. Confirm which the page should say.",
  "The About page now says Sunpure Homes build beyond Mysuru, at the client's instruction on 15 September 2026. All nine developments on this site are in Mysuru, so nothing names the other places. Send the cities, and they can be said plainly instead of in the abstract.",
  "The Happiness II brochure names the developer as MK Infra Holding, MB Road, Srirangapatna 571438. This file records the group's legal name as M.K. Agrotech Pvt. Ltd., the oil business. Confirm which entity is the promoter on the RERA registrations before any legal-entity name is published.",
];
