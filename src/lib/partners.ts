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
  ashirvad: "png",
  "astral-pipes": "png",
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
 * What each site-wide partner is known for, shown under its mark.
 */
const SITE_USES: Readonly<Record<string, string>> = {
  "Asian Paints": "Paints & coatings",
  "Saint-Gobain": "Glass & building solutions",
  Somany: "Tiles & surfaces",
  Jaquar: "Bathroom fittings",
  "Astral Pipes": "Pipes & plumbing",
  Kohler: "Bathroom fittings",
  "V-Guard": "Electricals",
  "Schneider Electric": "Switchgear",
  Fujitec: "Lifts",
};

/**
 * Site-wide trade names that a project already covers under another name.
 * Read only by getAllMaterialGroups, and only when the project's name for the
 * trade is actually on the page.
 */
const SAME_TRADE: Readonly<Record<string, string>> = {
  "Pipes & plumbing": "Plumbing",
  "Glass & building solutions": "UPVC windows, glass & balcony railings",
  "Tiles & surfaces": "Tiles",
  Electricals: "Electrical wires",
  Switchgear: "Switches",
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
 * brand with no use recorded falls into a final, unlabelled group
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

/**
 * Every brand named anywhere on the site, grouped by what it supplies — the
 * About page's "What goes in", at the client's instruction of 7 October.
 *
 * It had been showing site.materialPartners, a hand-kept list of nine. The
 * projects between them name sixteen, so the page an owner reads to find out
 * what we build with was the shortest list in the repo. This takes the union.
 *
 * TWO SOURCES, DELIBERATELY IN THAT ORDER.
 *
 * A project's own materials come first, because they are the sourced ones —
 * the client gave them per project — and because their wording is the
 * specific one: Curve records Saint-Gobain under "UPVC windows, glass &
 * balcony railings" where the site-wide list calls it "Glass & building
 * solutions". The project's label wins, and the brand appears once.
 *
 * Then the site-wide partners, for the brands no project names at all: Asian
 * Paints, Astral Pipes and Fujitec are only in that list, and dropping them
 * to be tidy would be deleting three real suppliers.
 *
 * ONE PROJECT IN NINE HAS A MATERIALS LIST. Curve does; the other eight fall
 * back to the site-wide nine on their own pages, which means those pages
 * claim brands nobody has recorded for them. That is a content gap, not a
 * code one, and it is why this union is sixteen rather than the forty-odd it
 * would be if every project had its own. It is worth asking the client for
 * the other eight.
 *
 * Specifications are NOT read for brand names. They carry them in prose —
 * "Tectonics or equivalent", "Jaquar, Kohler or similar" — and pulling names
 * out of a sentence means deciding that "or equivalent" is a brand and that
 * "Saint Gobain" and "Saint-Gobain" are the same company. That is invention,
 * and this file is the wrong place for it. If the client wants those brands
 * counted, they belong in each project's materials where they can be checked.
 */
export function getAllMaterialGroups(
  projects: readonly { materials?: readonly { brand: string; use: string }[] }[],
): readonly MaterialGroup[] {
  const useFor = new Map<string, string>();
  const order: string[] = [];

  const claim = (brand: string, use: string) => {
    if (useFor.has(brand)) return;
    useFor.set(brand, use);
    order.push(brand);
  };

  for (const project of projects) {
    for (const { brand, use } of project.materials ?? []) claim(brand, use);
  }
  /*
    The site-wide list calls some trades by a different name from the projects
    — "Pipes & plumbing" against Curve's "Plumbing" — and the two labels side
    by side read as two trades rather than one. Where a site-wide brand's
    trade is already on the page under another name, it joins that card.

    A declared pair, not a matcher. "Pipes & plumbing" and "Plumbing" are the
    same trade because someone decided so and wrote it here; nothing guesses
    it from the words, and nothing folds "Tiles" into "Tiles & surfaces" by
    accident. Collisions only arise for the three brands no project names, so
    this list is short and will stay short.
  */
  for (const brand of site.materialPartners) {
    const use = SITE_USES[brand];
    if (!use) continue;
    const merged = SAME_TRADE[use];
    claim(brand, merged && [...useFor.values()].includes(merged) ? merged : use);
  }

  /*
    Grouped by use, and the groups keep the order their first brand appeared
    in — so the structural trades a project lists first (blocks, cement,
    steel) lead, and the site-wide-only ones fall in behind them.
  */
  const byUse = new Map<string, string[]>();
  for (const brand of order) {
    const use = useFor.get(brand)!;
    byUse.set(use, [...(byUse.get(use) ?? []), brand]);
  }

  return [...byUse].map(([use, names]) => ({
    use,
    brands: names.map((name) => {
      const logoSrc = brandLogo(name);
      return logoSrc ? { name, logoSrc } : { name };
    }),
  }));
}
