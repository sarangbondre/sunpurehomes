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

/** Reads once at module load, on the server, like the rest of the content. */
export function getMaterialPartners(): readonly MaterialPartner[] {
  return site.materialPartners.map((name) => {
    const slug = brandSlug(name);
    const found = EXTENSIONS.find((ext) =>
      existsSync(join(process.cwd(), "public", BRAND_DIR, `${slug}.${ext}`)),
    );
    return found
      ? { name, logoSrc: `/${BRAND_DIR}/${slug}.${found}`.replaceAll("\\", "/") }
      : { name };
  });
}
