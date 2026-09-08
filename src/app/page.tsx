import { Hero, type HeroMedia } from "@/components/home/hero";

/**
 * The reference the client supplied shows a residential property, not a
 * landmark, so the hero now carries a Sunpure villa rather than the Mysore
 * Palace photograph chosen earlier. Both are one line to change.
 */
const heroMedia: HeroMedia = {
  kind: "image",
  src: "/images/projects/rare-earth/hero.avif",
  alt: "The Rare Earth entrance gateway — a tiled canopy on timber beams, carried on stone piers hung with creepers.",
};

export default function HomePage() {
  return (
    <main>
      <Hero media={heroMedia} />
    </main>
  );
}
