import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * The six images the client supplied on 10 September 2026 for the landing
 * page, and confirmed on 11 September should ship as they are.
 *
 * They are NOT photographs of Sunpure developments — see docs/adr/0001.
 * Nothing here labels them as such: no caption, no project name, and the alt
 * text below describes only what is visible in each frame.
 *
 * The files could not be committed by me. They were pasted into chat rather
 * than shared as files, so the bytes never reached disk. Drop them into
 * `public/images/home/showcase/` under the names below — in the order they
 * were sent — and they appear with no code change. Any that are missing are
 * skipped, and if none are present the hero falls back to the developments'
 * own cover renders, so the page is never broken mid-handover.
 */
const SHOWCASE_DIR = join("images", "home", "showcase");

type Slide = { src: string; alt: string };

const SUPPLIED: readonly Slide[] = [
  {
    src: "01-travertine-villa-sunset.jpg",
    alt: "A two-storey villa in pale travertine at sunset, its full-height glazing reflecting the low sun, with a carved stone relief panel, a timber-lined upper terrace, clipped hedging and ornamental grasses beside a still reflecting pool.",
  },
  {
    src: "02-stone-villa-pool.jpg",
    alt: "A stone-clad villa under a clear sky, its upper volumes cantilevered over timber-panelled recesses, beside a lap pool set in marble paving with spherical stone forms and low white loungers.",
  },
  {
    src: "03-pavilion-palms.jpg",
    alt: "A single-storey pavilion in pale brick with tall timber screens folded open to a living room, framed by date palms and mirrored in a long still pool.",
  },
  {
    src: "04-villa-dusk.jpg",
    alt: "A villa at dusk with deep stone soffits and warm downlights, its sliding glass drawn back to open a double-height living room onto a mirror-still pool.",
  },
  {
    src: "05-courtyard-stair.jpg",
    alt: "An interior courtyard where a timber stair rises past a double-height glazed wall, beside a garden of boulders, gravel and tropical planting.",
  },
  {
    src: "06-cantilever-terrace.jpg",
    alt: "A contemporary villa at dusk, its upper floor cantilevered over an open terrace with a long fireplace, an outdoor kitchen and a green-lit pool below.",
  },
];

/**
 * Reads once at module load, on the server, like the project content. Pages
 * are static, so a file dropped in after the build needs a rebuild — which
 * is the same contract as every image already on the site.
 */
export function getSuppliedShowcase(): Slide[] {
  const publicDir = join(process.cwd(), "public");
  return SUPPLIED.filter((slide) =>
    existsSync(join(publicDir, SHOWCASE_DIR, slide.src)),
  ).map((slide) => ({
    src: `/${SHOWCASE_DIR}/${slide.src}`.replaceAll("\\", "/"),
    alt: slide.alt,
  }));
}
