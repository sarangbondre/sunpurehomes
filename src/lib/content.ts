import { PROJECT_FILES } from "@/lib/content-files";
import {
  projectSchema,
  type Project,
  type ProjectStatus,
  type ProjectType,
} from "@/lib/schema";
import { formatIndianNumber } from "@/lib/format";

/**
 * The only path by which project content is read (BRIEF.md §5).
 *
 * Components must not import JSON, and must not reach into `content/`
 * themselves. Everything goes through the accessors below, so replacing the
 * file layer with a headless CMS later is a change to this module alone.
 *
 * Parsing happens once, at module load, on the server. Pages are static.
 *
 * The JSON arrives from lib/content-files.ts, which imports it rather than
 * reading the directory: Cloudflare Workers, which Webflow Cloud runs this
 * on, have no filesystem.
 */

function loadProjects(): Project[] {
  const entries = Object.entries(PROJECT_FILES);

  const projects = entries.map(([slug, raw]) => {
    const file = `${slug}.json`;
    const parsed = projectSchema.safeParse(raw);

    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `    ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid project content in ${file}:\n${issues}`);
    }

    const project = parsed.data;
    if (project.slug !== file.replace(/\.json$/, "")) {
      throw new Error(
        `Slug mismatch: ${file} declares slug "${project.slug}". ` +
          `The filename is the route, so the two must agree.`,
      );
    }
    return project;
  });

  assertIntegrity(projects);
  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Build-time gates from §4 and §14. These throw rather than warn: shipping is
 * the failure mode this rebuild exists to prevent.
 */
function assertIntegrity(projects: Project[]): void {
  const errors: string[] = [];

  // One RERA registration cannot cover two projects.
  const byRera = new Map<string, string[]>();
  for (const p of projects) {
    const n = p.compliance.reraNumber;
    if (!n) continue;
    byRera.set(n, [...(byRera.get(n) ?? []), p.slug]);
  }
  for (const [number, slugs] of byRera) {
    if (slugs.length > 1) {
      errors.push(
        `RERA number ${number} is claimed by ${slugs.length} projects ` +
          `(${slugs.join(", ")}). At most one may use it.`,
      );
    }
  }

  // A project may not carry another project's name in its own copy.
  const names = projects.map((p) => ({ slug: p.slug, name: p.name }));
  for (const p of projects) {
    const prose = `${p.tagline} ${p.description}`;
    for (const other of names) {
      if (other.slug === p.slug) continue;
      const mention = new RegExp(`\\b${other.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      if (mention.test(prose)) {
        errors.push(
          `${p.slug} mentions "${other.name}" in its own copy — ` +
            `check for a content leak between projects.`,
        );
      }
    }
  }

  if (errors.length) {
    throw new Error(`Content integrity check failed:\n  - ${errors.join("\n  - ")}`);
  }
}

const projects = loadProjects();

export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/**
 * A project without a RERA number renders "Registration details on request"
 * and stays out of the sitemap (§4). It remains fully browsable — it is just
 * not offered up to search engines as a registered development.
 */
export function isPublishable(project: Project): boolean {
  return (
    Boolean(project.compliance.reraNumber) &&
    project.compliance.reraProvenance === "verified"
  );
}

/** True while a project is showing a stand-in registration number. */
export function hasPlaceholderRera(project: Project): boolean {
  return project.compliance.reraProvenance === "placeholder";
}

/* ---------------------------------------------------------------- filters */

export type Filters = {
  type?: ProjectType;
  status?: ProjectStatus;
  location?: string;
};

export function filterProjects(all: Project[], filters: Filters): Project[] {
  return all.filter(
    (p) =>
      (!filters.type || p.type === filters.type) &&
      (!filters.status || p.status === filters.status) &&
      (!filters.location || p.location.label === filters.location),
  );
}

/* ------------------------------------------------------------------ sort */

export const SORTS = ["featured", "name", "type"] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABELS: Record<Sort, string> = {
  featured: "Featured",
  name: "Name (A–Z)",
  type: "Type",
};

/*
  "Featured" means what a buyer can act on first: projects under way, then
  upcoming, then completed, and anything fully sold last.

  Within a group the client's three lead, in this order, and the rest follow
  by name (2 October 2026). All three are under way, so they are the top of
  the listing as it opens — but the rule is written as "first within their
  group" rather than "first on the page", so that a project finishing does
  not jump the completed section above the ongoing one.

  A slug here that no longer exists is simply never matched, which the test
  in content.test.ts checks so the list cannot rot quietly.
*/
const FEATURED_FIRST: readonly string[] = ["curve", "h4", "rare-earth"];
const STATUS_RANK: Record<ProjectStatus, number> = {
  ongoing: 0,
  upcoming: 1,
  completed: 2,
};
const TYPE_RANK: Record<ProjectType, number> = { villa: 0, apartment: 1, plot: 2 };

export function sortProjects(
  list: readonly Project[],
  sort: Sort,
  /** Passed in so this module stays free of the availability read path. */
  isSoldOut: (slug: string) => boolean,
): Project[] {
  const byName = (a: Project, b: Project) => a.name.localeCompare(b.name, "en");
  const sorted = [...list];
  if (sort === "name") return sorted.sort(byName);
  if (sort === "type") {
    return sorted.sort((a, b) => TYPE_RANK[a.type] - TYPE_RANK[b.type] || byName(a, b));
  }
  const rank = (p: Project) => (isSoldOut(p.slug) ? 3 : STATUS_RANK[p.status]);
  const pick = (p: Project) => {
    const i = FEATURED_FIRST.indexOf(p.slug);
    return i === -1 ? FEATURED_FIRST.length : i;
  };
  return sorted.sort(
    (a, b) => rank(a) - rank(b) || pick(a) - pick(b) || byName(a, b),
  );
}

/**
 * The listing in two groups, at the client's instruction of 29 September
 * 2026: what is being built now, then what is finished. A group with nothing
 * in it is not returned, so the page never shows an empty heading — which is
 * why "Coming soon" appears only once a project is marked upcoming.
 */
export function groupByStatus(list: readonly Project[]): { label: string; projects: Project[] }[] {
  const order: { status: ProjectStatus; label: string }[] = [
    { status: "ongoing", label: STATUS_LABELS.ongoing },
    { status: "upcoming", label: "Coming soon" },
    { status: "completed", label: STATUS_LABELS.completed },
  ];
  return order
    .map(({ status, label }) => ({ label, projects: list.filter((p) => p.status === status) }))
    .filter((group) => group.projects.length > 0);
}

/** Facets are derived from the content, so a tenth project needs no code change. */
export function getFacets(all: Project[] = projects) {
  const count = <T extends string>(values: T[]) => {
    const map = new Map<T, number>();
    for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
    return map;
  };
  return {
    types: count(all.map((p) => p.type)),
    statuses: count(all.map((p) => p.status)),
    locations: count(all.map((p) => p.location.label)),
  };
}

/* ------------------------------------------------------- display helpers */

export const TYPE_LABELS: Record<ProjectType, string> = {
  villa: "Villas",
  apartment: "Apartments",
  plot: "Plots",
};

/** Singular, for a single project's own metadata line. */
export const TYPE_LABELS_ONE: Record<ProjectType, string> = {
  villa: "Villa",
  apartment: "Apartment",
  plot: "Plotted development",
};

/**
 * "Under construction" rather than "Ongoing" since 29 September 2026, at the
 * client's instruction — it is the phrase a buyer uses. The status values in
 * the content files are unchanged.
 */
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  ongoing: "Under construction",
  completed: "Completed",
  upcoming: "Upcoming",
};

/**
 * §8: colour carries meaning and is consistent everywhere —
 * laterite = villas, stone = apartments, canopy = plots. Always paired with
 * a text label; never colour alone.
 */
export const TYPE_SWATCH: Record<ProjectType, string> = {
  villa: "bg-laterite",
  apartment: "bg-stone",
  plot: "bg-canopy",
};

export function formatArea(area: number | [number, number] | undefined): string | null {
  if (area === undefined) return null;
  const n = formatIndianNumber;
  return Array.isArray(area)
    ? `${n(area[0])}–${n(area[1])} sq ft`
    : `${n(area)} sq ft`;
}

/** The card image. Gallery order puts the hero first where one exists. */
export function getCoverImage(project: Project) {
  return project.gallery[0];
}
