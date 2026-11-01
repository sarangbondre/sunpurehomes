import type { AmenityIcon } from "@/lib/amenity-icon";
import type { ExtraIcon } from "@/components/brand/amenity-icons";

/**
 * The voice lines of the project page, from the client's reference design
 * (17 September 2026), in one place so they read as one hand.
 *
 * These are lines of tone, shared by every project. Anything that states a
 * fact about a particular project — its headline, its homes line — lives in
 * that project's content file instead.
 */

type Icon = AmenityIcon | ExtraIcon;

export const LEDES = {
  amenities: "Thoughtfully designed spaces for a more balanced life.",
  configurations: "Spacious homes, thoughtfully planned for modern living.",
  specifications:
    "Thoughtfully chosen materials and systems for lasting quality and peace of mind.",
  approvals: "Transparent processes. Trusted standards. A better tomorrow.",
  gallery: "Spaces that inspire. Details that endure.",
  connectivity: "Where the everyday is close at hand.",
} as const;

/** The small vertical lines beside a section's title. */
export const ASIDES = {
  status: ["Built", "for", "lasting", "value"],
  specifications: ["Details", "that make", "a difference"],
  approvals: ["Trust", "builds", "homes"],
  gallery: ["More", "than", "homes"],
  visit: ["Visit", "Experience", "Belong"],
} as const;

export const TRUST_ROW: readonly { icon: Icon; title: string; line: string }[] = [
  { icon: "shield", title: "Transparent process", line: "Clear and honest information" },
  { icon: "headset", title: "Dedicated support", line: "From enquiry to handover" },
  { icon: "leaf", title: "A better tomorrow", line: "Homes built for lasting value" },
];

export const ASSURANCE_ROW: readonly { icon: Icon; title: string }[] = [
  { icon: "shield", title: "Quality assured" },
  { icon: "leaf", title: "Trusted partners" },
  { icon: "people", title: "A safer tomorrow" },
];

export const CLOSING = {
  configurations: ["More than homes.", "A higher way of living."],
  amenities: ["Every detail for", "a better tomorrow."],
  specifications: ["Built with care.", "For a better tomorrow."],
  specificationsAside: ["Quality", "in every detail"],
  approvals: ["Built with integrity.", "For generations ahead."],
  approvalsAside: ["World-class brands.", "A home you can trust."],
  gallery: ["A closer look", "at a finer life."],
  visitImage: ["Homes are better", "seen in person."],
  strip: "A brighter tomorrow begins here.",
} as const;

/** The three notes under "Come and look". The place line is filled in per project. */
export function visitRow(place: string): readonly { icon: Icon; title: string; line: string }[] {
  return [
    { icon: "car", title: "Easy access", line: "Well connected location" },
    { icon: "pin", title: "Prime neighbourhood", line: place },
    { icon: "leaf", title: "Experience the difference", line: "See the quality. Feel the space." },
  ];
}

/** Each specification group's drawing, line and picture caption. */
export function groupCopy(group: string): { icon: Icon; line: string; caption: string } {
  const g = group.toLowerCase();
  if (/structure/.test(g))
    return { icon: "hall", line: "Strength to build a life on.", caption: "Built to last" };
  if (/floor/.test(g))
    return { icon: "tiles", line: "Surfaces chosen for everyday living.", caption: "Finished with care" };
  if (/door|window/.test(g))
    return { icon: "door", line: "Craft at every threshold.", caption: "Made to welcome" };
  if (/electric/.test(g))
    return { icon: "power", line: "Reliable power for a seamless life.", caption: "Uninterrupted living" };
  if (/plumb|sanitary|water/.test(g))
    return { icon: "water", line: "Clean water, healthier tomorrows.", caption: "Pure today, greener tomorrow" };
  return { icon: "gear", line: "Modern essentials for a future-ready life.", caption: "A safer, brighter tomorrow" };
}

/**
 * A drawing and a short line for the specification items that have one.
 * Items with no match are listed plainly — a line is never invented for an
 * item this table does not know.
 */
const ITEM_RULES: readonly [RegExp, Icon, string][] = [
  [/underground electric/, "plug", "Cleaner spaces, safer living"],
  [/power backup|kva backup|kw backup|generator/, "power", "Uninterrupted comfort"],
  [/\bro\b/, "water", "Pure water for a healthier you"],
  [/stormwater/, "rain", "Sustainable by design"],
  [/rainwater/, "rain", "Every drop put to use"],
  [/ev charging/, "ev", "Ready for what's next"],
  [/\bcctv\b/, "camera", "Security you can trust"],
];

export function itemCopy(item: string): { icon: Icon; line: string } | undefined {
  const key = item.toLowerCase();
  const hit = ITEM_RULES.find(([pattern]) => pattern.test(key));
  return hit && { icon: hit[1], line: hit[2] };
}

const CAPTIONS = {
  exterior: [
    "A statement in design",
    "Modern architecture. Timeless appeal.",
    "Designed for a brighter tomorrow",
    "Light on every level",
    "Made to come home to",
    "Quiet by design",
    "Every angle considered",
  ],
  interior: [
    "Thoughtful living spaces",
    "Refined in every detail",
    "Rooms that breathe",
    "Made for everyday grace",
    "Warmth in every corner",
    "Space to gather",
    "Calm, by design",
  ],
} as const;

const COUNT_WORDS = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
] as const;

/**
 * "On every floor, two homes face south, two west, two north and two east."
 *
 * The client asked on 1 November 2026 for the aspect to be said as a count
 * per direction rather than listed flat by flat, because what a buyer wants
 * to know is that each side of the building is served, not which numbers sit
 * where. The flat numbers are still in the content file and still drive the
 * plan explorer, where picking a specific home is the point.
 *
 * Composed from the facings rather than written out and stored, so the
 * sentence cannot come to disagree with the data it describes. The count is
 * how many flat numbers an entry names — "1 & 2" is two homes — which is
 * what the field means: flats are numbered per floor, so the pattern repeats
 * up the building, and that is why the sentence can say "on every floor".
 *
 * An entry naming no number is dropped rather than guessed at. If that
 * leaves nothing there is no sentence, and the caller shows nothing at all
 * rather than an empty frame.
 */
export function facingSentence(
  facings: readonly { flats: string; facing: string }[],
): string | undefined {
  const parts = facings
    .map((f) => ({
      count: (f.flats.match(/\d+/g) ?? []).length,
      facing: f.facing.toLowerCase(),
    }))
    .filter((part) => part.count > 0);

  if (parts.length === 0) return undefined;

  const say = ({ count, facing }: { count: number; facing: string }, lead: boolean) => {
    const word = COUNT_WORDS[count] ?? String(count);
    if (!lead) return `${word} ${facing}`;
    return `${word} ${count === 1 ? "home faces" : "homes face"} ${facing}`;
  };

  const clauses = parts.map((part, i) => say(part, i === 0));
  const joined =
    clauses.length === 1
      ? clauses[0]
      : `${clauses.slice(0, -1).join(", ")} and ${clauses[clauses.length - 1]}`;

  return `On every floor, ${joined}.`;
}

/** A caption for the nth picture of a kind, so no two neighbours repeat. */
export function galleryCaption(view: "exterior" | "interior", nth: number): string {
  const list = CAPTIONS[view];
  return list[nth % list.length];
}
