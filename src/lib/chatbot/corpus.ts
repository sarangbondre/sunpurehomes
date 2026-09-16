import {
  STATUS_LABELS,
  TYPE_LABELS_ONE,
  formatArea,
  getAllProjects,
  isPublishable,
} from "@/lib/content";
import type { Project } from "@/lib/schema";
import { isFullySold } from "@/lib/scenes";

/**
 * What Arka is allowed to know about each project.
 *
 * Built once at module load from the same read path as every page
 * (lib/content.ts), then trimmed. Two kinds of thing are taken out.
 *
 * Noise: gallery paths, 3D scene data, film and tour URLs, amenity
 * coordinates. None of it answers a buyer's question and all of it costs
 * tokens on every turn.
 *
 * Facts the content itself says are unsafe: see WITHHELD below. Every project
 * carries `contentWarnings` — internal notes recording disputed figures and
 * client defects, quoted verbatim. Those notes never enter the prompt; a model
 * that can read them can repeat them. Instead each disputed fact is removed
 * from the record by hand, so Arka cannot misstate a number it was never told.
 *
 * The rendered text is deterministic — same content, same bytes — so if a
 * provider caches the prefix, the cache holds.
 */

type Withheld = {
  /** Drop scale.unitCount. */
  unitCount?: true;
  /** Drop configurations[].count — needed when the counts sum to the total. */
  configurationCounts?: true;
  /** Drop connectivity entries in these categories. */
  connectivity?: readonly Project["connectivity"][number]["category"][];
  /** Replace the address with these lines. */
  address?: readonly string[];
  /**
   * Remove a phrase from the description. The description is page prose and
   * restates figures in words, so withholding a field is not enough on its
   * own. If the phrase is not found the module throws: content that changed
   * underneath a redaction must fail the build, not quietly un-redact.
   */
  description?: { find: string; replace: string };
};

/*
  Each entry cites the contentWarning it answers. When a warning is resolved
  with the client, delete its entry here — the fact then flows through again.
*/
const WITHHELD: Readonly<Record<string, Withheld>> = {
  // "The Happiness II brochure states Blessed reached occupancy of 20 units;
  // this page says 21 apartments ... confirm the total."
  blessed: {
    unitCount: true,
    description: { find: "Its twenty-one homes are", replace: "Its homes are" },
  },

  // "scale.unitCount is 32, which predates the brochure ... Confirm the real
  // total."
  curve: { unitCount: true },

  // "The approved drawing is titled '1st Phase (40%) Site Release'. The 279
  // sites are the full layout; confirm how many are released for sale today."
  // The per-size counts sum to exactly 279, so they go too.
  "rare-earth": {
    unitCount: true,
    configurationCounts: true,
    description: {
      find: "Two hundred and seventy-nine plots sit across",
      replace: "Its plots sit across",
    },
  },

  // "The two hospital columns ... the pairing of distance to hospital name is
  // inferred from reading order. Verify the five health figures."
  //
  // Not from a warning: the summary calls every villa "2,543 sq ft", but the
  // configuration table in the same record puts them at 2,167–3,520 sq ft
  // built-up. Given two sizes a small model picks one at random, so the
  // summary's figure goes and the table answers. Raised with the client.
  "happiness-2": {
    connectivity: ["health"],
    description: {
      find: "thirty-two 3 BHK villas of 2,543 sq ft",
      replace: "thirty-two 3 BHK villas",
    },
  },

  // "The brochure gives the address as Survey no 129/2 ... Mysore 570003. The
  // site says Survey No. 129 and 570016. Confirm the survey subdivision and
  // the PIN." Both are dropped; the locality lines are not in dispute.
  //
  // Fadal's 43 plots is NOT withheld: its warnings record that the final MUDA
  // approval says 43 and that "the approval wins". It is stated, attributed.
  fadal: {
    address: [
      "Fadal Enclave by Sunpure Homes",
      "Shyadanahalli",
      "Chamundeshwari Badavane, beside Railway Layout",
      "Mysuru, Karnataka",
    ],
  },
};

/**
 * Plain-language notes a buyer may be told, derived from the warnings. Unlike
 * the warnings themselves these say nothing about the client's own defects.
 */
const NOTES: Readonly<Record<string, readonly string[]>> = {
  blessed: [
    "The total number of apartments is being confirmed; ask the sales team.",
    "Distances to nearby places are not published yet.",
  ],
  curve: [
    "The configurations listed are not the full unit schedule; the sales team has the complete list.",
    "The total number of apartments is being confirmed; ask the sales team.",
    "The nearby places listed are the brochure's landmarks, not a full list of schools, hospitals and workplaces.",
  ],
  fadal: [
    "The plot count and extent are from the final MUDA-approved layout. An older brochure says 3 acres and 44 plots; the approval is the one that applies.",
    "Eleven plots are irregular and have no single stated size.",
    "Travel times, not distances, are given for nearby places.",
  ],
  h4: [
    "Also referred to as Happiness IV.",
    "There are villa types with and without a lift. The configuration list does not separate them; the sales team has the plan-by-plan schedule.",
    "Specifications may change on upgrade or availability.",
  ],
  "happiness-1": [
    "Distances to nearby places are not published yet.",
  ],
  "happiness-2": [
    "Of the 34 homes, 32 are villas and are described here. The other two are apartments with no published details; ask the sales team.",
    "Hospital distances are being verified and are not listed.",
  ],
  meraki: ["Distances to nearby places are not published yet."],
  "rare-earth": [
    "The layout is approved and released in phases. How many plots are available today is a question for the sales team.",
    "Some plots are irregular and have no single stated size.",
    "Distances to nearby places are the brochure's own figures.",
  ],
  v4: ["Distances to nearby places are not published yet."],
};

/**
 * Other names a visitor might use. Names are matched on word boundaries, so
 * "happiness i" does not match "happiness ii" or "happiness is".
 */
const ALIASES: Readonly<Record<string, readonly string[]>> = {
  h4: ["h4", "h 4", "happiness iv", "happiness-iv", "happiness 4"],
  "happiness-1": ["happiness 1", "happiness i", "happiness one", "happiness-1"],
  "happiness-2": ["happiness 2", "happiness ii", "happiness two", "happiness-2"],
  "rare-earth": ["rare earth", "rareearth", "rare-earth"],
  fadal: ["fadal", "fadal enclave"],
  v4: ["v4", "v 4"],
};

/** Common to every card rendering below. */
const AREA_BASIS: Record<string, string> = {
  plot: "plot area",
  "super-built-up": "super built-up",
  "built-up": "built-up",
  carpet: "carpet",
};

export type ProjectBrief = {
  slug: string;
  name: string;
  /** Lower-case names to match on, including `name`. */
  aliases: readonly string[];
  /** One line for the portfolio index. */
  indexLine: string;
  /** The full record, as prompt text. */
  text: string;
};

function configurationLine(
  c: Project["configurations"][number],
  withheld: Withheld,
): string {
  const parts = [c.label];
  const area = formatArea(c.areaSqft);
  if (area) {
    parts.push(
      c.areaBasis ? `${area} ${AREA_BASIS[c.areaBasis] ?? c.areaBasis}` : area,
    );
  }
  const carpet = formatArea(c.carpetAreaSqft);
  if (carpet) parts.push(`carpet ${carpet}`);
  if (c.facing) parts.push(`facing ${c.facing}`);
  if (c.count && !withheld.configurationCounts) parts.push(`${c.count} of these`);
  return `- ${parts.join("; ")}`;
}

function connectivityLine(c: Project["connectivity"][number]): string {
  const how = [
    c.distanceKm !== undefined ? `${c.distanceKm} km` : null,
    c.travelMinutes !== undefined ? `${c.travelMinutes} min` : null,
  ]
    .filter(Boolean)
    .join(", ");
  return `- ${c.name} (${c.category}): ${how}`;
}

function scaleLine(p: Project, withheld: Withheld): string | null {
  const parts: string[] = [];
  if (p.scale.acres !== undefined) parts.push(`${p.scale.acres} acres`);
  if (p.scale.unitCount !== undefined && !withheld.unitCount) {
    parts.push(`${p.scale.unitCount} ${p.scale.unitNoun}`);
  }
  return parts.length ? parts.join(", ") : null;
}

function redactedDescription(p: Project, withheld: Withheld): string {
  const rule = withheld.description;
  if (!rule) return p.description;
  if (!p.description.includes(rule.find)) {
    throw new Error(
      `Arka corpus: the redaction for "${p.slug}" no longer matches its description. ` +
        "Update WITHHELD in src/lib/chatbot/corpus.ts before this ships.",
    );
  }
  return p.description.replace(rule.find, rule.replace);
}

function render(p: Project): ProjectBrief {
  const withheld = WITHHELD[p.slug] ?? {};
  const soldOut = isFullySold(p.slug);
  const kind = TYPE_LABELS_ONE[p.type].toLowerCase();
  const status = STATUS_LABELS[p.status].toLowerCase();

  const lines: string[] = [
    `## ${p.name}`,
    `Type: ${kind}. Status: ${status}.${soldOut ? " FULLY SOLD — no homes are available." : ""}`,
    `Locality: ${p.location.label}`,
    `Address: ${(withheld.address ?? p.location.addressLines).join(", ")}`,
  ];

  const scale = scaleLine(p, withheld);
  if (scale) lines.push(`Size: ${scale}`);

  lines.push(`Summary: ${redactedDescription(p, withheld)}`);

  if (p.configurations.length) {
    lines.push("Configurations:");
    for (const c of p.configurations) lines.push(configurationLine(c, withheld));
  }

  // isPublishable is the site's own rule: a number, and a verified one.
  if (isPublishable(p) && p.compliance.reraNumber) {
    const extra = p.compliance.reraAdditionalNumbers ?? [];
    lines.push(
      `RERA registration: ${[p.compliance.reraNumber, ...extra].join(", ")}`,
    );
  } else {
    lines.push("RERA registration: not published — ask the sales team.");
  }

  if (p.amenities.length) {
    lines.push(`Amenities: ${p.amenities.map((a) => a.name).join("; ")}`);
  }

  for (const group of p.specifications) {
    lines.push(`Specification — ${group.group}: ${group.items.join("; ")}`);
  }

  const places = p.connectivity.filter(
    (c) => !withheld.connectivity?.includes(c.category),
  );
  if (places.length) {
    lines.push("Nearby:");
    for (const c of places) lines.push(connectivityLine(c));
  }

  for (const note of NOTES[p.slug] ?? []) lines.push(`Note: ${note}`);

  return {
    slug: p.slug,
    name: p.name,
    aliases: [p.name.toLowerCase(), ...(ALIASES[p.slug] ?? [])],
    indexLine: `- ${p.name}: ${kind}, ${status}${soldOut ? ", fully sold" : ""}, ${p.location.label}`,
    text: lines.join("\n"),
  };
}

const BRIEFS: readonly ProjectBrief[] = getAllProjects().map(render);
const BY_SLUG = new Map(BRIEFS.map((b) => [b.slug, b]));

export function allBriefs(): readonly ProjectBrief[] {
  return BRIEFS;
}

export function getBrief(slug: string): ProjectBrief | undefined {
  return BY_SLUG.get(slug);
}

/** The one-line-per-project index, always present in the prompt. */
export const PORTFOLIO_INDEX = [
  // "Published", because the About page says the practice works across
  // India. These are the projects on this site, and they are all in Mysuru.
  `The ${BRIEFS.length} projects published on this site, all in Mysuru:`,
  ...BRIEFS.map((b) => b.indexLine),
].join("\n");
