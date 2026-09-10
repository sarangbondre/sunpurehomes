import { Hero, type HeroMedia } from "@/components/home/hero";
import { getAllProjects, getCoverImage } from "@/lib/content";

/**
 * The hero crossfades through the cover image of each development.
 *
 * THESE ARE PLACEHOLDERS FOR THE SIX IMAGES THE CLIENT SUPPLIED on
 * 10 September 2026, which could not be saved to the repository — they were
 * pasted into chat rather than shared as files. To swap them in: drop the
 * files into `public/images/home/showcase/` and replace the body of
 * `heroSlides` with one entry per image.
 *
 * Two things to settle before those six ship. They are not photographs of
 * Sunpure developments — travertine villas, marble pool surrounds, desert
 * palms — and none corresponds to the built work in Mysuru. On a RERA
 * registered sales site, imagery that reads as "our homes" but is not
 * carries a real misleading-advertising exposure, and it is a decision for
 * the client, not for this file. Whatever ships needs alt text that
 * describes what is actually shown.
 *
 * Until then the slides are the real developments, with the alt text already
 * written for each project's gallery, so nothing on the page claims anything
 * untrue.
 */
const heroSlides = getAllProjects()
  .filter((project) => project.status === "ongoing")
  .map((project) => getCoverImage(project))
  .filter((image) => image !== undefined)
  .map((image) => ({ src: image.src, alt: image.alt }));

const heroMedia: HeroMedia = { kind: "gallery", slides: heroSlides };

export default function HomePage() {
  return (
    <main>
      <Hero media={heroMedia} />
    </main>
  );
}
