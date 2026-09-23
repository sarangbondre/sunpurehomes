import { existsSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/lib/site";

/**
 * The material partners, each with its mark if the file is there.
 *
 * The client asked for every brand to appear with its logo beside its name.
 * The marks are the brands' own assets, so they are not in this repository
 * until someone puts them there: drop a file into public/images/brands named
 * for the brand — asian-paints.svg, saint-gobain.svg, somany.svg,
 * jaquar.svg, koala.svg, astral-pipes.svg, v-guard.svg,
 * schneider-electric.svg, fujitec.svg — and it appears. SVG is preferred;
 * PNG is read as a fallback.
 *
 * A name with no file renders as it does today, as the name alone. That is
 * deliberate: a missing asset should cost the reader nothing, and a partner
 * list that half-renders is worse than one that reads plainly.
 */

const BRAND_DIR = join("images", "brands");
const EXTENSIONS = ["svg", "png"] as const;

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
  const found = EXTENSIONS.find((ext) =>
    existsSync(join(process.cwd(), "public", BRAND_DIR, `${slug}.${ext}`)),
  );
  return found ? `/${BRAND_DIR}/${slug}.${found}`.replaceAll("\\", "/") : undefined;
}

/** Reads once at module load, on the server, like the rest of the content. */
export function getMaterialPartners(): readonly MaterialPartner[] {
  return site.materialPartners.map((name) => {
    const logoSrc = brandLogo(name);
    return logoSrc ? { name, logoSrc } : { name };
  });
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
