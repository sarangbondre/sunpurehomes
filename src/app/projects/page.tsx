import type { Metadata } from "next";
import { FilterBar } from "@/components/projects/filter-bar";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilm } from "@/components/projects/project-film";
import {
  filterProjects,
  getAllProjects,
  getFacets,
  type Filters,
} from "@/lib/content";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/schema";
import { site } from "@/lib/site";

/**
 * The 3 July 2026 drone flight over Vijayanagar 4th Stage, where six of the
 * nine developments sit. It lives here rather than on any one project page
 * because it shows the campus — the shared park, the entrance, the cluster —
 * and no single project owns that. Per-project films need per-project
 * footage; see the note on `film` in the schema.
 */
const campusFilm = {
  src: "/video/hero-vijayanagar.mp4",
  poster: "/images/home/hero-vijayanagar.jpg",
  alt: "An aerial view over Vijayanagar 4th Stage: a landscaped park of palms and clipped hedges inside a crenellated boundary wall, with the villa row and apartment block beyond it and Mysuru spreading to the horizon.",
  captured: "2026-07-03",
} as const;

export const metadata: Metadata = {
  title: "Projects",
  description: `Villas, apartments and plotted developments by ${site.name} across ${site.city}.`,
};

/** Unknown or malformed query values are dropped rather than 404ing. */
function parseFilters(
  params: Record<string, string | string[] | undefined>,
  locations: Iterable<string>,
): Filters {
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const type = one(params.type);
  const status = one(params.status);
  const location = one(params.location);
  const known = new Set(locations);

  return {
    type: PROJECT_TYPES.find((t) => t === type),
    status: PROJECT_STATUSES.find((s) => s === status),
    location: location && known.has(location) ? location : undefined,
  };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const all = getAllProjects();
  const facets = getFacets(all);
  const filters = parseFilters(await searchParams, facets.locations.keys());
  const results = filterProjects(all, filters);

  return (
    <main className="mx-auto max-w-[86rem] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
      <header className="max-w-[52rem]">
        <p className="u-mono text-canopy">
          {all.length} projects · {site.city}
        </p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)]">
          Villas, apartments <em className="italic">and land.</em>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">
          Every {site.name} development, filterable by what you are looking for
          and where you want to be.
        </p>
      </header>

      <div className="mt-14">
        <ProjectFilm film={campusFilm} label="Vijayanagar 4th Stage" />
      </div>

      <div className="mt-14 border-y border-line py-8">
        <FilterBar
          filters={filters}
          facets={facets}
          resultCount={results.length}
        />
      </div>

      {results.length > 0 ? (
        <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((project, i) => (
            <li key={project.slug}>
              {/* The first row is above the fold on every breakpoint. */}
              <ProjectCard project={project} priority={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-20 max-w-[40ch] font-display text-3xl text-ink-soft">
          No projects match these filters.
        </p>
      )}
    </main>
  );
}
