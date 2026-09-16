import type { Metadata } from "next";
import Link from "next/link";
import { FilterBar, listingHref } from "@/components/projects/filter-bar";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectsHero } from "@/components/projects/projects-hero";
import { SelectNav } from "@/components/projects/select-nav";
import {
  SORTS,
  SORT_LABELS,
  filterProjects,
  getAllProjects,
  getFacets,
  sortProjects,
  type Filters,
  type Sort,
} from "@/lib/content";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/schema";
import { isFullySold } from "@/lib/scenes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  description: `Villas, apartments and plotted developments by ${site.name} across ${site.city}.`,
};

/** Unknown or malformed query values are dropped rather than 404ing. */
function parseQuery(
  params: Record<string, string | string[] | undefined>,
  locations: Iterable<string>,
): Filters & { sort: Sort } {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const type = one(params.type);
  const status = one(params.status);
  const location = one(params.location);
  const sort = one(params.sort);
  const known = new Set(locations);

  return {
    type: PROJECT_TYPES.find((t) => t === type),
    status: PROJECT_STATUSES.find((s) => s === status),
    location: location && known.has(location) ? location : undefined,
    sort: SORTS.find((s) => s === sort) ?? "featured",
  };
}

/**
 * The listing, to the client's reference design: a full-bleed opening, a
 * filter panel, the count with a sort, and the projects as pictures.
 */
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const all = getAllProjects();
  const facets = getFacets(all);
  const { sort, ...filters } = parseQuery(await searchParams, facets.locations.keys());
  const results = sortProjects(filterProjects(all, filters), sort, isFullySold);

  return (
    <main>
      <ProjectsHero />

      <div className="mx-auto max-w-[86rem] px-6 pb-16 sm:px-10 lg:px-16">
        <div className="mt-10 sm:mt-12">
          <FilterBar filters={filters} facets={facets} sort={sort} />
        </div>

        <div className="mt-14 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          {/* Announced when a filter changes, so the result is not silent. */}
          <h2 className="font-display text-[clamp(2rem,3.4vw,2.75rem)] leading-none" aria-live="polite">
            {results.length} {results.length === 1 ? "Project" : "Projects"}
          </h2>
          <div className="flex items-center gap-3">
            <SelectNav
              name="sort"
              label="Sort by"
              value={sort}
              options={SORTS.map((s) => ({ value: s, label: SORT_LABELS[s] }))}
              keep={{ type: filters.type, status: filters.status, location: filters.location }}
              labelClassName="shrink-0 text-[0.9rem] text-ink-soft"
              selectClassName="min-w-[9.5rem]"
            />
          </div>
        </div>

        {results.length > 0 ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((project, i) => (
              <li key={project.slug}>
                {/* The first row is above the fold once the filters are passed. */}
                <ProjectCard
                  project={project}
                  soldOut={isFullySold(project.slug)}
                  priority={i < 3}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 border-y border-line py-16">
            <p className="max-w-[36ch] font-display text-3xl text-ink-soft">
              No projects match these filters.
            </p>
            <Link
              href={listingHref({ sort }, {})}
              className="u-mono mt-6 inline-block text-accent-ink underline underline-offset-4"
            >
              Clear all filters
            </Link>
          </div>
        )}

        <p className="u-mono mt-20 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-8 text-ink-soft">
          <span>People</span>
          <span>Places</span>
          <span>A brighter tomorrow</span>
          <span aria-hidden className="hidden h-px w-16 bg-ink-soft/50 sm:block" />
          <span className="sm:ml-auto">{site.name}</span>
        </p>
      </div>
    </main>
  );
}
