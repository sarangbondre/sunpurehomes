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

export type ProjectMaterial = { name: string; use?: string; logoSrc?: string };

/**
 * The brands on a project page: the project's own list where the client gave
 * one (a brand named twice has its uses joined), otherwise the site-wide
 * partners.
 */
export function getProjectMaterials(
  materials: readonly { brand: string; use: string }[] | undefined,
): readonly ProjectMaterial[] {
  if (!materials?.length) {
    return getMaterialPartners().map((p) => ({ ...p, use: SITE_USES[p.name] }));
  }
  const byBrand = new Map<string, string[]>();
  for (const m of materials) byBrand.set(m.brand, [...(byBrand.get(m.brand) ?? []), m.use]);
  return [...byBrand].map(([name, uses]) => ({
    name,
    use: uses.join(" · "),
    logoSrc: brandLogo(name),
  }));
}
