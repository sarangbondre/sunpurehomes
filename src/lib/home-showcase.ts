import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * The single image behind the landing hero.
 *
 * This is Curve — a real Sunpure development — at the client's direction.
 * The source render is the one in Curve's own gallery, graded to a sunrise:
 * the sky was flat overcast, so it is recoloured through a dawn gradient
 * while keeping each cloud's own luminance, a sun is placed behind the
 * treeline, and the whole frame is warmed so the building agrees with the
 * light. The render also carried a share-icon artifact baked into its
 * top-right corner, left over from the video frame it was captured from;
 * that is patched out rather than left to appear at full size.
 *
 * On 15 September a different image was supplied and used here. On 16
 * September the client asked for this page back as it was, so this render
 * returns. The supplied image is still in public/images/home as
 * hero-sunrise.jpg, unused, against the client changing their mind again.
 *
 * IT IS STILL A RENDER, not a photograph, and Curve is not built. Regrading
 * a render's sky is ordinary practice and makes no claim a render does not
 * already make — but if this image is ever captioned or presented as a
 * photograph of a finished building, that changes. See
 * docs/adr/0001-non-project-imagery-on-the-landing-page.md.
 */
const HERO = {
  file: "curve-sunrise.jpg",
  alt: "Curve at sunrise: a five-storey apartment building whose white balconies curve around each corner, the sun rising through trees to its left and warming the façade.",
} as const;

const HOME_DIR = join("images", "home");

export type HeroImage = { src: string; alt: string };

/**
 * Reads once at module load, on the server, like the project content. Absent
 * means the caller falls back, so a missing or renamed file cannot leave the
 * landing page with an empty panel.
 */
export function getHeroImage(): HeroImage | undefined {
  const onDisk = join(process.cwd(), "public", HOME_DIR, HERO.file);
  if (!existsSync(onDisk)) return undefined;
  return {
    src: `/${HOME_DIR}/${HERO.file}`.replaceAll("\\", "/"),
    alt: HERO.alt,
  };
}
