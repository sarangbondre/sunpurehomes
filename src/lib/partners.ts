import { site } from "@/lib/site";

/**
 * The material partners, each with its mark if the file is there.
 *
 * The client asked for every brand to appear with its logo beside its name.
 * The marks are the brands' own assets: put a file into public/images/brands
 * named for the brand — asian-paints.svg, koala.svg, astral-pipes.svg and so
 * on — and add its line to BRAND_MARKS below, and it appears.
 *
 * A name with no file renders as it does today, as the name alone. That is
 * deliberate: a missing asset should cost the reader nothing, and a partner
 * list that half-renders is worse than one that reads plainly.
 *
 * Which marks exist is a list here rather than a look at the filesystem:
 * Cloudflare Workers, which Webflow Cloud runs this on, have none. The test
 * in partners.test.ts reads public/images/brands and fails if the two
 * disagree, so a file added without a line here — or a line without a file —
 * does not ship.
 */

const BRAND_DIR = "images/brands";

/** The marks on disk, by slug, with the extension each one is saved as. */
export const BRAND_MARKS: Readonly<Record<string, "svg" | "png">> = {
  acc: "svg",
  "asian-paints": "svg",
  fujitec: "svg",
  jaquar: "png",
  kohler: "svg",
  "saint-gobain": "svg",
  "schneider-electric": "svg",
  somany: "png",
  supreme: "svg",
  ultratech: "svg",
  "v-guard": "svg",
};

export type MaterialPartner = { name: string; logoSrc?: string };

/** "Saint-Gobain" -> "saint-gobain". Ampersands and dots are dropped. */
export function brandSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The brand's mark in public/images/brands, if one is there. */
export function brandLogo(name: string): string | undefined {
  const slug = brandSlug(name);
  const extension = BRAND_MARKS[slug];
  return extension ? `/${BRAND_DIR}/${slug}.${extension}` : undefined;
}

/**
 * What each site-wide partner is known for, shown under its mark. Koala has
 * no line: nothing on file says what it supplies.
 */
const SITE_USES: Readonly<Record<string, string>> = {
  "Asian Paints": "Paints & coatings",
  "Saint-Gobain": "Glass & building solutions",
  Somany: "Tiles & surfaces",
  Jaquar: "Bathroom fittings",
  "Astral Pipes": "Pipes & plumbing",
  "V-Guard": "Electricals",
  "Schneider Electric": "Switchgear",
  Fujitec: "Lifts",
};

export type ProjectMaterial = { name: string; logoSrc?: string };
/** Brands grouped by what they supply; the last group may have no label. */
export type MaterialGroup = { use?: string; brands: readonly ProjectMaterial[] };

/**
 * The brands on a project page, grouped by what each supplies — cement,
 * doors, bathroom fittings, plumbing — at the client's instruction of
 * 23 September 2026.
 *
 * The project's own list is used where the client gave one, otherwise the
 * site-wide partners. Groups keep the order the uses first appear in, and a
 * brand with no use recorded (Koala) falls into a final, unlabelled group
 * rather than being given a category it might not belong to.
 */
export function getMaterialGroups(
  materials: readonly { brand: string; use: string }[] | undefined,
): readonly MaterialGroup[] {
  const pairs: { brand: string; use?: string }[] = materials?.length
    ? [...materials]
    : site.materialPartners.map((brand) => ({ brand, use: SITE_USES[brand] }));

  const byUse = new Map<string, string[]>();
  const unlabelled: string[] = [];
  for (const { brand, use } of pairs) {
    if (!use) {
      if (!unlabelled.includes(brand)) unlabelled.push(brand);
      continue;
    }
    const brands = byUse.get(use) ?? [];
    if (!brands.includes(brand)) brands.push(brand);
    byUse.set(use, brands);
  }

  const withMarks = (names: readonly string[]): ProjectMaterial[] =>
    names.map((name) => {
      const logoSrc = brandLogo(name);
      return logoSrc ? { name, logoSrc } : { name };
    });

  return [
    ...[...byUse].map(([use, names]) => ({ use, brands: withMarks(names) })),
    ...(unlabelled.length > 0 ? [{ brands: withMarks(unlabelled) }] : []),
  ];
}
