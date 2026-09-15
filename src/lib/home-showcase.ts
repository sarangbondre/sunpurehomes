import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * The single image behind the landing hero.
 *
 * Supplied by the client on 15 September 2026, replacing the regraded Curve
 * render that was here. It is a render, not a photograph, and it is not
 * attributed to any development: no caption, no project name, no link, and
 * alt text that describes only what is in the frame. That is the standing
 * rule for imagery on this page —
 * docs/adr/0001-non-project-imagery-on-the-landing-page.md.
 *
 * It is square, which is why one file serves every viewport. A landscape
 * window crops it vertically and a portrait one horizontally, and the sun
 * survives both: see the object-position pair in components/home/hero.tsx.
 */
const HERO = {
  file: "hero-sunrise.jpg",
  alt: "A curved white apartment building at sunrise, balconies stacked in long horizontal bands, the sun low through trees to its left and a lawn in front.",
} as const;

const HOME_DIR = join("images", "home");

export type HeroImage = { src: string; alt: string };

/**
 * Reads once at module load, on the server, like the project content. Absent
 * means the caller falls back, so a missing or renamed file cannot leave the
 * landing page with an empty background.
 */
export function getHeroImage(): HeroImage | undefined {
  const onDisk = join(process.cwd(), "public", HOME_DIR, HERO.file);
  if (!existsSync(onDisk)) return undefined;
  return {
    src: `/${HOME_DIR}/${HERO.file}`.replaceAll("\\", "/"),
    alt: HERO.alt,
  };
}
