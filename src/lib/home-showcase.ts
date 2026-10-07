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
 * Which frame is on this page has changed six times. Every one of them is
 * still in public/images/home, because it keeps changing back: the client's
 * own hero-sunrise.jpg, supplied 15 September and asked for again on the
 * morning of 7 October; curve-sunrise.jpg; curve-golden-sunrise.avif, live
 * from 2 October until that morning; and curve-daylight.avif, which is what
 * is here now. Nothing is deleted.
 *
 * IT IS STILL A RENDER, not a photograph, and Curve is not built. Regrading
 * a render's sky is ordinary practice and makes no claim a render does not
 * already make — but if this image is ever captioned or presented as a
 * photograph of a finished building, that changes. See
 * docs/adr/0001-non-project-imagery-on-the-landing-page.md.
 */
const HERO = {
  /*
    Curve under overcast light, supplied by the client on 7 October already
    at 2400x1350 and 171KB — the size this slot asks for and well inside the
    300KB it allows, so it is installed as they exported it and not re-encoded.

    A DIFFERENT ANGLE from curve-daylight.avif, which is still beside it: that
    one is the corner, with the balconies wrapping and hills to the right;
    this one is more frontal, the building filling the frame with palms along
    its foot and the wet road beneath.

    No sun in it, and the sky is uniform across the top. The type stands on
    the left on the opaque radial, so the desktop figures are governed by the
    ground rather than the picture; the phone is the one that had to be
    measured, and hero.tsx records what the ground had to be for it.
  */
  file: "curve-overcast.avif",
  alt: "Curve under an overcast sky: a five-storey apartment building whose white balconies curve around each floor, palms along its frontage and the wet road in front of it.",
} as const;

const HOME_DIR = "images/home";

export type HeroImage = { src: string; alt: string };

/**
 * The file is named here rather than looked for on disk — Cloudflare
 * Workers, which Webflow Cloud runs this on, have no filesystem. The test in
 * home-showcase.test.ts fails if the file is missing from public/, which is
 * the check this used to make at runtime, moved to where it belongs.
 */
export function getHeroImage(): HeroImage {
  return { src: `/${HOME_DIR}/${HERO.file}`, alt: HERO.alt };
}
