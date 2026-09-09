import { Hero, type HeroMedia } from "@/components/home/hero";

/**
 * The client's own drone footage of the Vijayanagar site, shot 3 July 2026.
 * Fifteen seconds cut from a thirty-five second orbit, re-encoded for the
 * web: 1920 × 1080, H.264, 25 fps, 4.5 Mbit/s, 8.1 MB — the reference site
 * the client sent runs a 9.8 MB clip at the same resolution.
 *
 * The poster is the clip's own first frame, so the still and the first
 * moving frame are the same picture and the fade between them is invisible.
 *
 * The labelled masterplan banner that was here is a better fit for a section
 * of its own: its project labels get swallowed by the scrim behind a
 * headline, and it is a drawing to be read rather than a backdrop.
 */
const heroMedia: HeroMedia = {
  kind: "video",
  src: "/video/hero-vijayanagar.mp4",
  poster: "/images/home/hero-vijayanagar.jpg",
  alt: "An aerial view over the Sunpure Homes site at Vijayanagar 4th Stage: a landscaped park of palms and clipped hedges inside a crenellated boundary wall, with the villa row and apartment block beyond it and Mysuru spreading to the horizon.",
};

export default function HomePage() {
  return (
    <main>
      <Hero media={heroMedia} />
    </main>
  );
}
