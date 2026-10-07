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
 * On 15 September this image was supplied by the client and used here. On
 * 16 September they asked for the page back as it was, so the Curve render
 * returned and this one sat unused in public/images/home. On 7 October they
 * asked for it back, which is why it was kept.
 *
 * The Curve renders it replaces are all still beside it — curve-golden-
 * sunrise.avif was live until today, and curve-daylight.avif and
 * curve-sunrise.jpg before that.
 *
 * IT IS STILL A RENDER, not a photograph, and Curve is not built. Regrading
 * a render's sky is ordinary practice and makes no claim a render does not
 * already make — but if this image is ever captioned or presented as a
 * photograph of a finished building, that changes. See
 * docs/adr/0001-non-project-imagery-on-the-landing-page.md.
 */
const HERO = {
  /*
    The client's own file, supplied 15 September and asked for again on
    7 October. Re-encoded from their JPEG to AVIF at q80 — 213KB, inside the
    300KB the slot allows — at its native size and no larger, because
    upscaling a render only makes a bigger soft file.

    IT IS 1254 SQUARE, where the Curve render it replaces was 2400x1350.
    Two things follow and the client has been told both. It is under 1x on
    any desktop and well under on a 2x screen, so it is softer than anything
    else on the site. And a square in a wide frame is cropped top and bottom,
    while in a phone's tall frame it is cropped hard left and right — which
    takes the sunrise, at 13% across, off the phone entirely. A 2400px export
    of the same image would fix the first; nothing but a different crop fixes
    the second.

    The sun is low and to the LEFT here, behind the treeline, with the
    building to the right of it — the same arrangement as the render it
    replaces, which is why the landing page's crop and the contrast figures
    in hero.tsx still hold. They were re-measured on 7 October against this
    picture rather than assumed.
  */
  file: "hero-sunrise.avif",
  alt: "An apartment building at sunrise: white balconies curving around each floor, a low gold sun breaking through the trees to its left, palms along the frontage and a lawn in front.",
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
