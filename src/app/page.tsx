import { Hero } from "@/components/home/hero";
import { getAllProjects, getCoverImage } from "@/lib/content";
import { getSuppliedShowcase } from "@/lib/home-showcase";

/**
 * The hero panel crossfades through the six images the client supplied —
 * see src/lib/home-showcase.ts for the filenames and the two known
 * limitations, and docs/adr/0001 for why images that are not Sunpure
 * developments are on this page at all.
 *
 * The fallback to the developments' own cover renders stays. It costs
 * nothing and means a missing or renamed file cannot leave the landing page
 * with an empty panel.
 */
const supplied = getSuppliedShowcase();

const fallback = getAllProjects()
  .filter((project) => project.status === "ongoing")
  .map((project) => getCoverImage(project))
  .filter((image) => image !== undefined)
  .map((image) => ({ src: image.src, alt: image.alt }));

export default function HomePage() {
  return (
    <main>
      <Hero slides={supplied.length > 0 ? supplied : fallback} />
    </main>
  );
}
