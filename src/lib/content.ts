import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  projectSchema,
  type Project,
  type ProjectStatus,
  type ProjectType,
} from "@/lib/schema";

/**
 * The only path by which project content is read (BRIEF.md §5).
 *
 * Components must not import JSON, and must not reach into `content/`
 * themselves. Everything goes through the accessors below, so replacing the
 * file layer with a headless CMS later is a change to this module alone.
 *
 * Reads happen once, at module load, on the server. Pages are static.
 */

const CONTENT_DIR = join(process.cwd(), "content", "projects");

function loadProjects(): Project[] {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json"));

  const projects = files.map((file) => {
    const raw: unknown = JSON.parse(readFileSync(join(CONTENT_DIR, file), "utf8"));
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

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  ongoing: "Ongoing",
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
  const n = (v: number) => v.toLocaleString("en-IN");
  return Array.isArray(area)
    ? `${n(area[0])}–${n(area[1])} sq ft`
    : `${n(area)} sq ft`;
}

/** The card image. Gallery order puts the hero first where one exists. */
export function getCoverImage(project: Project) {
  return project.gallery[0];
}
