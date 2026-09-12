import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Amenities",
  description: `What comes with a ${site.name} home — every amenity across the nine developments, and which ones carry it.`,
};

/**
 * Amenities are a property of each development, not of the company, so this
 * page is assembled from the nine project files rather than written. Every
 * row names the projects that actually carry it — no amenity appears here
 * that is not already published on a project page.
 *
 * Names are grouped case-insensitively but displayed as the first spelling
 * encountered, so "CCTV surveillance" and "CCTV and 24-hour security" stay
 * separate: they are different claims and merging them would invent one.
 */
function collectAmenities() {
  const byName = new Map<string, { name: string; slugs: string[] }>();

  for (const project of getAllProjects()) {
    for (const amenity of project.amenities) {
      const key = amenity.name.toLowerCase();
      const entry = byName.get(key) ?? { name: amenity.name, slugs: [] };
      entry.slugs.push(project.slug);
      byName.set(key, entry);
    }
  }

  return [...byName.values()].sort(
    (a, b) => b.slugs.length - a.slugs.length || a.name.localeCompare(b.name),
  );
}

export default function AmenitiesPage() {
  const projects = getAllProjects();
  const nameBySlug = new Map(projects.map((p) => [p.slug, p.name]));
  const amenities = collectAmenities();

  return (
    <main className="mx-auto max-w-[86rem] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
      <header className="max-w-[52rem]">
        <p className="u-mono text-canopy">
          {amenities.length} amenities · {projects.length} developments
        </p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)]">
          What comes <em className="italic">with the home.</em>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">
          Every amenity published across the {site.name} developments, and
          which ones carry it. Amenities vary by project — the list on each
          project page is the one that applies to it.
        </p>
      </header>

      <ul className="mt-14 border-t border-line">
        {amenities.map((amenity) => (
          <li
            key={amenity.name}
            className="grid gap-x-8 gap-y-3 border-b border-line py-6 sm:grid-cols-[1fr_auto] sm:items-baseline"
          >
            <span className="font-display text-2xl">{amenity.name}</span>
            <span className="flex flex-wrap gap-x-2 gap-y-1 sm:justify-end">
              {amenity.slugs.map((slug, i) => (
                <span key={slug} className="u-mono text-muted">
                  <Link
                    href={`/projects/${slug}`}
                    className="transition-colors duration-hover ease-hover hover:text-ink"
                  >
                    {nameBySlug.get(slug)}
                  </Link>
                  {i < amenity.slugs.length - 1 && <span aria-hidden> ·</span>}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
