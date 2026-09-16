import Link from "next/link";
import { ClearIcon } from "@/components/brand/icons";
import { SelectNav } from "@/components/projects/select-nav";
import {
  STATUS_LABELS,
  TYPE_LABELS,
  type Filters,
  type Sort,
} from "@/lib/content";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/schema";

/**
 * The filter panel, to the client's reference design: type and status as
 * pills, location as a dropdown, and Clear All.
 *
 * Pills are links, not scripted controls. Each is an anchor to the same route
 * with one facet toggled, so the result set and the URL always agree, results
 * are shareable, and it all works with JavaScript switched off. The live site
 * ships these controls as href="#" (§2, defect 2) — they do nothing at all.
 */

type FacetCounts = {
  types: Map<string, number>;
  statuses: Map<string, number>;
  locations: Map<string, number>;
};

export function listingHref(base: Filters & { sort?: Sort }, patch: Partial<Filters>): string {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  if (next.type) params.set("type", next.type);
  if (next.status) params.set("status", next.status);
  if (next.location) params.set("location", next.location);
  if (next.sort && next.sort !== "featured") params.set("sort", next.sort);
  const qs = params.toString();
  return qs ? `/projects?${qs}` : "/projects";
}

function Pill({
  active,
  to,
  count,
  label,
}: {
  active: boolean;
  to: string;
  count: number;
  label: string;
}) {
  const base =
    "u-mono inline-flex min-w-[6.5rem] items-center justify-center rounded-full border px-5 py-2.5";

  // A facet with nothing behind it stays visible — the taxonomy is part of
  // the information — but it is not a link, so it cannot lead to a dead end.
  if (count === 0) {
    return (
      <span
        className={`${base} cursor-default border-line text-muted/70`}
        title="No projects in this category yet"
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={to}
      aria-pressed={active}
      // The count is not shown, but a screen reader hears it.
      aria-label={`${label}, ${count} ${count === 1 ? "project" : "projects"}`}
      className={[
        base,
        "transition-colors duration-hover ease-hover",
        active
          ? "border-laterite bg-laterite text-paper"
          : "border-line bg-paper text-ink hover:border-ink",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={legend} className="min-w-0">
      <p className="u-mono text-ink-soft">{legend}</p>
      <div className="mt-3 flex flex-wrap gap-2.5">{children}</div>
    </div>
  );
}

export function FilterBar({
  filters,
  facets,
  sort,
}: {
  filters: Filters;
  facets: FacetCounts;
  sort: Sort;
}) {
  const hasAny = Boolean(filters.type || filters.status || filters.location);
  const current = { ...filters, sort };

  return (
    <section
      aria-label="Filter projects"
      className="flex flex-col gap-6 rounded-md border border-line bg-paper px-5 py-6 shadow-[0_1px_2px_rgba(28,26,24,0.04),0_8px_24px_rgba(28,26,24,0.05)] sm:px-7 lg:flex-row lg:items-start lg:gap-0"
    >
      <Group legend="Type">
        {PROJECT_TYPES.map((t) => (
          <Pill
            key={t}
            active={filters.type === t}
            count={facets.types.get(t) ?? 0}
            to={listingHref(current, { type: filters.type === t ? undefined : t })}
            label={TYPE_LABELS[t]}
          />
        ))}
      </Group>

      <span aria-hidden className="hidden h-12 w-px self-center bg-line lg:mx-7 lg:mt-5 lg:block" />

      <Group legend="Status">
        {PROJECT_STATUSES.map((s) => (
          <Pill
            key={s}
            active={filters.status === s}
            count={facets.statuses.get(s) ?? 0}
            to={listingHref(current, { status: filters.status === s ? undefined : s })}
            label={STATUS_LABELS[s]}
          />
        ))}
      </Group>

      <span aria-hidden className="hidden h-12 w-px self-center bg-line lg:mx-7 lg:mt-5 lg:block" />

      <div className="flex min-w-0 flex-col gap-3 lg:w-56">
        <SelectNav
          name="location"
          label="Location"
          value={filters.location ?? ""}
          options={[
            { value: "", label: "All Locations" },
            ...[...facets.locations.keys()].map((loc) => ({ value: loc, label: loc })),
          ]}
          keep={{ type: filters.type, status: filters.status, sort: sort === "featured" ? undefined : sort }}
          labelClassName="u-mono text-ink-soft"
        />
      </div>

      {/* Level with the controls, below the labels the other groups carry. */}
      <div className="lg:ml-auto lg:mt-7 lg:pl-7">
        {hasAny ? (
          <Link
            href={listingHref({ sort }, {})}
            className="inline-flex items-center gap-2 py-2.5 text-[0.9rem] text-accent-ink hover:underline hover:underline-offset-4"
          >
            <ClearIcon className="size-4" />
            Clear All
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 py-2.5 text-[0.9rem] text-muted" aria-hidden>
            <ClearIcon className="size-4" />
            Clear All
          </span>
        )}
      </div>
    </section>
  );
}
