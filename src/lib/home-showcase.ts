import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * The single photograph on the landing hero.
 *
 * It is CROPPED OUT OF THE CLIENT'S REFERENCE MOCKUP. The photograph has
 * never existed here as a file — it arrived three times inside a screenshot
 * of the designed page, and on 14 September that screenshot itself was
 * dropped into this folder. Rendering it would have put a second copy of the
 * header, headline and caption inside the page, so the picture was cut out
 * of it: x 900-1440, y 95-900, which clears the nav row above, the WhatsApp
 * pill to the right and the corner caption below.
 *
 * KNOWN LIMITATION, and the reason to replace this: the crop is 540 x 805.
 * The column it fills is about 518 CSS px wide and full height, so it is
 * adequate at 1x and soft on any retina screen, which is most phones. It is
 * also all that was recoverable — the mockup is only 1600 x 900 to begin
 * with. The original photograph at any size would be a straight improvement;
 * drop it in under this same name.
 *
 * It is NOT a photograph of a Sunpure development. Nothing on the page
 * attributes it to one — no caption, no project name, no link — and the alt
 * text describes only what is in the frame. See
 * docs/adr/0001-non-project-imagery-on-the-landing-page.md.
 */
const HERO = {
  file: "01-hillside-villa-sunset.jpeg",
  alt: "A villa on a wooded hillside at sunset, its deep stone roof cantilevered over a terrace of pale paving, with a low linen sofa and olive trees along the roof edge, an infinity pool in the foreground and a valley falling away behind.",
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
