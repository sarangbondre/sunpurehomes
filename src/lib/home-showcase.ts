import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * The single photograph on the landing hero.
 *
 * The client sent six images on 10 September and on 12 September asked for
 * one, with the rest off the home page. The other five files are removed
 * from public/ rather than left unreferenced, where they would still be
 * deployed; they are in git history and the client holds the originals, so
 * restoring one is `git checkout`.
 *
 * NOT the photograph in the 12 September reference mockup — the hillside
 * villa with the infinity pool and the mountains. That is a seventh image
 * and it arrived inside the mockup screenshot, so no file exists for it.
 * This is the closest of the six that were sent as files: the travertine
 * villa at sunset. To swap it, drop the real one in under this name.
 *
 * It is NOT a photograph of a Sunpure development. Nothing on the page
 * attributes it to one — no caption, no project name, no link — and the alt
 * text describes only what is in the frame. See
 * docs/adr/0001-non-project-imagery-on-the-landing-page.md.
 *
 * KNOWN LIMITATION: the source is 735px wide, so it is soft on a desktop
 * hero. Next clamps at the source width rather than upscaling, so this costs
 * no bandwidth, but a larger landscape original would be a straight
 * improvement.
 */
const HERO = {
  file: "01-travertine-villa-sunset.jpeg",
  alt: "A two-storey villa in pale travertine at sunset, its full-height glazing reflecting the low sun, with a carved stone relief panel, a timber-lined upper terrace, clipped hedging and ornamental grasses beside a still reflecting pool.",
} as const;

const SHOWCASE_DIR = join("images", "home", "showcase");

export type HeroImage = { src: string; alt: string };

/**
 * Reads once at module load, on the server, like the project content. Absent
 * means the caller falls back, so a missing or renamed file cannot leave the
 * landing page with an empty panel.
 */
export function getHeroImage(): HeroImage | undefined {
  const onDisk = join(process.cwd(), "public", SHOWCASE_DIR, HERO.file);
  if (!existsSync(onDisk)) return undefined;
  return {
    src: `/${SHOWCASE_DIR}/${HERO.file}`.replaceAll("\\", "/"),
    alt: HERO.alt,
  };
}
