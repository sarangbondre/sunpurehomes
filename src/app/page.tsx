import { Hero } from "@/components/home/hero";
import { getAllProjects, getCoverImage } from "@/lib/content";
import { getHeroImage } from "@/lib/home-showcase";

/**
 * The hero photograph — see src/lib/home-showcase.ts for which image, why it
 * is that one, and docs/adr/0001 for why an image that is not a Sunpure
 * development is on this page at all.
 *
 * The fallback to a development's own cover render costs nothing and means a
 * missing or renamed file cannot leave the landing page with an empty panel.
 */
const supplied = getHeroImage();

const fallback = (() => {
  const cover = getAllProjects()
    .filter((project) => project.status === "ongoing")
    .map((project) => getCoverImage(project))
    .find((image) => image !== undefined);
  return cover ? { src: cover.src, alt: cover.alt } : undefined;
})();

export default function HomePage() {
  const image = supplied ?? fallback;

  return <main>{image && <Hero image={image} />}</main>;
}
