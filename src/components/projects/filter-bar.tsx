import Link from "next/link";
import {
  STATUS_LABELS,
  TYPE_LABELS,
  type Filters,
} from "@/lib/content";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/schema";

/**
 * Filters as links, not scripted controls.
 *
 * Each chip is an anchor to the same route with one facet toggled, so the
 * result set and the URL always agree, results are shareable, and the whole
 * thing works with JavaScript switched off. The live site ships these five
 * controls as href="#" (§2, defect 2) — they do nothing at all.
 */

type FacetCounts = {
  types: Map<string, number>;
  statuses: Map<string, number>;
  locations: Map<string, number>;
};

function href(base: Filters, patch: Partial<Filters>): string {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  if (next.type) params.set("type", next.type);
  if (next.status) params.set("status", next.status);
  if (next.location) params.set("location", next.location);
  const qs = params.toString();
  return qs ? `/projects?${qs}` : "/projects";
}

function Chip({
  active,
  to,
  children,
  count,
}: {
  active: boolean;
  to: string;
  children: React.ReactNode;
  count: number;
}) {
  const base =
    "u-mono inline-flex items-center gap-2 rounded-full border px-4 py-2";

  // A facet with nothing behind it stays visible — the taxonomy is part of
  // the information — but it is not a link, so it cannot lead to a dead end.
  if (count === 0) {
    return (
      <span
        className={`${base} border-line bg-paper text-muted`}
        title="No projects in this category"
      >
        {children}
        <span>{count}</span>
      </span>
    );
  }

  return (
    <Link
      href={to}
      aria-pressed={active}
      className={[
        base,
        "transition-colors duration-hover ease-hover",
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-paper text-ink hover:border-ink",
      ].join(" ")}
    >
      {children}
      <span className={active ? "text-paper/60" : "text-muted"}>{count}</span>
    </Link>
  );
}

function Group({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="u-mono w-20 shrink-0 text-muted">{legend}</h2>
      {children}
    </div>
  );
}

export function FilterBar({
  filters,
  facets,
  resultCount,
}: {
  filters: Filters;
  facets: FacetCounts;
  resultCount: number;
}) {
  const hasAny = Boolean(filters.type || filters.status || filters.location);

  return (
    <section aria-label="Filter projects" className="space-y-4">
      <Group legend="Type">
        {PROJECT_TYPES.map((t) => (
          <Chip
            key={t}
            active={filters.type === t}
            count={facets.types.get(t) ?? 0}
            to={href(filters, { type: filters.type === t ? undefined : t })}
          >
            {TYPE_LABELS[t]}
          </Chip>
        ))}
      </Group>

      <Group legend="Status">
        {PROJECT_STATUSES.map((s) => (
          <Chip
            key={s}
            active={filters.status === s}
            count={facets.statuses.get(s) ?? 0}
            to={href(filters, { status: filters.status === s ? undefined : s })}
          >
            {STATUS_LABELS[s]}
          </Chip>
        ))}
      </Group>

      <Group legend="Location">
        {[...facets.locations.entries()].map(([loc, count]) => (
          <Chip
            key={loc}
            active={filters.location === loc}
            count={count}
            to={href(filters, {
              location: filters.location === loc ? undefined : loc,
            })}
          >
            {loc}
          </Chip>
        ))}
      </Group>

      <p className="u-mono flex items-center gap-4 pt-2 text-muted">
        <span>
          {resultCount} {resultCount === 1 ? "project" : "projects"}
        </span>
        {hasAny && (
          <Link href="/projects" className="text-ink underline underline-offset-4">
            Reset
          </Link>
        )}
      </p>
    </section>
  );
}
