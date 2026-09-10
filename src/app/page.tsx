import { Hero, type HeroMedia } from "@/components/home/hero";
import { getAllProjects, getCoverImage } from "@/lib/content";
import { getSuppliedShowcase } from "@/lib/home-showcase";

/**
 * The hero crossfades through the six images the client supplied, once those
 * files are in `public/images/home/showcase/` — see src/lib/home-showcase.ts
 * for the names, and docs/adr/0001 for why images that are not Sunpure
 * developments are on this page at all.
 *
 * Until they are, it falls back to the ongoing developments' own cover
 * renders, with the alt text already written for each gallery. The fallback
 * exists so the handover cannot leave the landing page empty.
 */
const supplied = getSuppliedShowcase();

const fallback = getAllProjects()
  .filter((project) => project.status === "ongoing")
  .map((project) => getCoverImage(project))
  .filter((image) => image !== undefined)
  .map((image) => ({ src: image.src, alt: image.alt }));

const heroMedia: HeroMedia = {
  kind: "gallery",
  slides: supplied.length > 0 ? supplied : fallback,
};

export default function HomePage() {
  return (
    <main>
      <Hero media={heroMedia} />
    </main>
  );
}
