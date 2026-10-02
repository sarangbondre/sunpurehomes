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
  /*
    The client's own export, supplied on 2 October at 2400x1350 and 292KB —
    the size the hero slot asks for, inside the 300KB it is allowed. It
    replaced a pale daylight grading of the same render the same day; that
    file is still beside it, unused, as the older sunrise is.

    The sun is low and well to the LEFT here, behind the treeline, with the
    building to the right of it. The landing page's crop and the contrast
    figures in hero.tsx are both measured against that arrangement.
  */
  file: "curve-golden-sunrise.avif",
  alt: "Curve at sunrise: a five-storey apartment building whose white balconies curve around each corner, palms at its foot and a low gold sun behind the trees to its left, the whole reflected in the wet forecourt.",
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
