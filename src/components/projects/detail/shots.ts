import type { Project } from "@/lib/schema";

type Shot = Project["gallery"][number];

/**
 * Pictures for the page's image panels, exteriors first, skipping any the
 * page has already used. Wraps round when a project has fewer pictures than
 * panels, so a panel is never empty; returns nothing only when the project
 * has no pictures at all.
 */
export function pickShots(
  gallery: readonly Shot[],
  count: number,
  skip: readonly string[] = [],
): Shot[] {
  const ordered = [
    ...gallery.filter((s) => s.view === "exterior"),
    ...gallery.filter((s) => s.view === "interior"),
  ];
  const fresh = ordered.filter((s) => !skip.includes(s.src));
  const pool = fresh.length > 0 ? fresh : ordered;
  if (pool.length === 0) return [];
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
}
