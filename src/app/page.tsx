import { Hero, type HeroMedia } from "@/components/home/hero";

/**
 * Carried over from the live site at the client's direction (2026-08-29).
 * It is Mysore Palace — a public landmark, not a Sunpure property — so the
 * alt text says exactly that rather than implying it is one of the projects.
 * Swap `heroMedia` for project footage when it exists; nothing else changes.
 */
const heroMedia: HeroMedia = {
  kind: "image",
  src: "/images/hero-mysore-palace.avif",
  alt: "Mysore Palace at dusk, its domed towers lit against a clouded sky.",
};

export default function HomePage() {
  return (
    <main>
      <Hero media={heroMedia} />
    </main>
  );
}
