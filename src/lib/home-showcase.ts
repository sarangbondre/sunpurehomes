/**
 * The single image behind the landing hero.
 *
 * This is Curve — a real Sunpure development — at the client's direction.
 * The frame in use is whatever HERO names below; the grading note that used
 * to stand here described curve-golden-sunrise.avif, whose flat overcast sky
 * was recoloured through a dawn gradient with a sun placed behind the
 * treeline. That frame has not been on this page since 7 October, so the
 * description has gone with it. The file is still in public/images/home if
 * it is ever asked for again.
 *
 * Which frame is on this page has changed seven times, and every one of them
 * is still in public/images/home, because it keeps changing back: the
 * client's own hero-sunrise.jpg, supplied 15 September and asked for again
 * on the morning of 7 October; curve-sunrise.jpg; curve-golden-sunrise.avif,
 * live from 2 October until that morning; curve-daylight.avif;
 * curve-overcast.avif, live from 7 October to 3 November; and the corner
 * view named below. Nothing is deleted.
 *
 * This list is worth keeping accurate — it had drifted and named
 * curve-daylight.avif as current while HERO pointed at curve-overcast.avif.
 * The one thing that tells you which is live is HERO.file.
 *
 * IT IS STILL A RENDER, not a photograph, and Curve is not built. If any of
 * these is ever captioned or presented as a photograph of a finished
 * building, that changes. See
 * docs/adr/0001-non-project-imagery-on-the-landing-page.md.
 */
const HERO = {
  /*
    Curve from its corner under a broken sky, supplied by the client on
    3 November 2026 and installed as the bytes they sent — webp, not
    re-encoded to avif, because the file is already lossy and a second pass
    would only throw away more of the detail this change is meant to improve.
    Nothing here reads the extension; assets.test.ts checks the path exists.

    IT IS SMALLER THAN WHAT IT REPLACED: 1080x960 against curve-overcast's
    2400x1350. It is the better encode of the two per pixel (0.78 bits
    against 0.42) and looks cleaner at its own size, but there are fewer
    pixels to go round, so it is enlarged further to fill the slot — 1.88x
    at 1440x900 on a 2x screen where the old frame was 1.33x, and 2.49x at
    1920x1080. The client asked for this frame knowing the resolution
    question is still open; a larger export of THIS view is what finally
    settles it. See the request sent on 3 November.

    A THIRD ANGLE, distinct from both files still beside it:
    curve-daylight.avif is the entrance corner with hills to the right,
    curve-overcast.avif is frontal with the building filling the frame.
    This one takes the opposite corner, sets the building against a tall
    cloudscape with blue breaking through, and puts the wet road and its
    reflection across the bottom third.

    Its shape is what changes the page: 1.125:1 against the old 1.78:1. The
    lg column is 1.12:1, so the picture now very nearly fits it rather than
    overflowing it, and almost nothing is cropped on a wide screen.
    hero.tsx records what that did to the crop.
  */
  file: "curve-cloudbreak.webp",
  alt: "Curve seen from its corner: a five-storey apartment building whose white balconies curve around each floor, palms at its foot, a tall sky of broken cloud above it and the wet road mirroring it in front.",
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
