import { Hero, type HeroMedia } from "@/components/home/hero";

/**
 * The banner the client supplied for this page, 2560 × 1500. It is an aerial
 * of the Vijayanagar cluster with six developments labelled on it, which is
 * why it earns the hero: it shows the portfolio rather than one building.
 */
const heroMedia: HeroMedia = {
  kind: "image",
  src: "/images/home/masterplan-aerial.jpg",
  alt: "An aerial view of the Sunpure Homes cluster in Vijayanagar, with Curve, Happiness I, Happiness II, Happiness IV, V4 and Blessed labelled across the site.",
};

export default function HomePage() {
  return (
    <main>
      <Hero media={heroMedia} />
    </main>
  );
}
