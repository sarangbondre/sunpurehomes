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
  tagline: "Thoughtfully Built. Deeply Lived.",

  city: "Mysuru",
  region: "Karnataka",

  /** The one legacy figure. Change it here or nowhere. */
  legacyYears: 40,

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
    "Astral Pipes",
    "V-Guard",
    "Schneider Electric",
    "Fujitec",
  ],

  contact: {
    email: "sales@sunpurehomes.com",
    /** Also the WhatsApp number. E.164 for tel: and wa.me links. */
    phoneE164: "+919606907153",
    phoneDisplay: "+91 96069 07153",
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
  "Hero image is the Mysore Palace photo carried over from the live site, at the client's direction. It is a public landmark rather than a Sunpure property — confirm the usage rights for the photograph before launch.",
];
