"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlotPlan, type StatusFilter } from "@/components/plan/plot-plan";
import { UnitDrawer } from "@/components/plan/unit-drawer";
import { ShortlistTray } from "@/components/plan/shortlist-tray";
import type { Availability, Scene } from "@/lib/scene-schema";
import { UNIT_STATUSES } from "@/lib/unit-status";
import {
  STATUS_FILL,
  STATUS_LABELS,
  UNKNOWN_FILL,
  UNKNOWN_LABEL,
} from "@/lib/scene-display";
import { useShortlist } from "@/lib/shortlist";

/**
 * Orchestrates the plan: filters, selection, the drawer, the shortlist, and
 * the URL. Selection lives in the query string so /projects/rare-earth/plan
 * ?unit=114 restores the exact view — §9.2 requires it to be deep-linkable,
 * and §15 makes sharing a first-class feature rather than a nice-to-have.
 */
export function PlanExplorer({
  scene,
  availability,
  projectName,
  projectSlug,
  unitNoun,
  unitNounSingular,
}: {
  scene: Scene;
  availability?: Availability;
  projectName: string;
  projectSlug: string;
  unitNoun: string;
  unitNounSingular: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const hydrate = useShortlist((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const [filter, setFilter] = useState<StatusFilter>("all");

  const byId = useMemo(
    () => new Map(scene.units.map((u) => [u.id, u])),
    [scene.units],
  );

  const requested = params.get("unit");
  const selectedId = requested && byId.has(requested) ? requested : null;
  const selected = selectedId ? byId.get(selectedId) : undefined;

  const select = useCallback(
    (unitId: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (unitId) next.set("unit", unitId);
      else next.delete("unit");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: scene.units.length };
    for (const s of UNIT_STATUSES) c[s] = 0;
    c.unknown = 0;
    for (const u of scene.units) {
      const s = availability?.units[u.id];
      if (s) c[s]++;
      else c.unknown++;
    }
    return c;
  }, [scene.units, availability]);

  const filters: StatusFilter[] = ["all", ...UNIT_STATUSES];

  return (
    <div className="space-y-6">
      {/* Provenance notices. Both disappear on their own once the underlying
          files carry real data — nothing here needs editing. */}
      {scene.provenance === "generated" && (
        <p className="rounded-sm border border-laterite/40 bg-laterite/8 px-5 py-4 text-sm leading-relaxed text-ink">
          <strong className="font-semibold">Indicative layout.</strong>{" "}
          {unitNounSingular} positions, sizes and orientations on this plan are
          generated to match the published totals — {scene.units.length}{" "}
          {unitNoun} on{" "}
          {((scene.extent.width * scene.extent.depth) / 4046.86).toFixed(1)}{" "}
          acres — and are not a surveyed drawing. Confirm any{" "}
          {unitNounSingular.toLowerCase()} with the sales team before relying
          on it.
        </p>
      )}
      {availability?.provenance === "placeholder" && (
        <p className="rounded-sm border border-line bg-paper-2 px-5 py-4 text-sm leading-relaxed text-ink-soft">
          Availability shown is placeholder data for demonstration. Live status
          comes from the sales team.
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="u-mono w-20 shrink-0 text-muted">Show</h3>
        {filters.map((f) => {
          const active = filter === f;
          const count = counts[f] ?? 0;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={active}
              className={[
                "u-mono inline-flex items-center gap-2 rounded-full border px-4 py-2",
                "transition-colors duration-hover ease-hover",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink hover:border-ink",
              ].join(" ")}
            >
              {f === "all" ? `All ${unitNoun}` : STATUS_LABELS[f]}
              <span className={active ? "text-paper/60" : "text-muted"}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend — colour is never the only carrier of meaning (§8). */}
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {UNIT_STATUSES.map((s) => (
          <li key={s} className="u-mono flex items-center gap-2 text-ink-soft">
            <span
              aria-hidden
              className="size-3 rounded-full"
              style={{ background: STATUS_FILL[s] }}
            />
            {STATUS_LABELS[s]}
          </li>
        ))}
        {counts.unknown > 0 && (
          <li className="u-mono flex items-center gap-2 text-ink-soft">
            <span
              aria-hidden
              className="size-3 rounded-full border border-line"
              style={{ background: UNKNOWN_FILL }}
            />
            {UNKNOWN_LABEL}
          </li>
        )}
      </ul>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div>
          <PlotPlan
            scene={scene}
            availability={availability}
            selectedId={selectedId}
            onSelect={select}
            filter={filter}
            unitNoun={unitNoun}
          />

          {/*
            The screen-reader and no-pointer path to the same data and the
            same actions. §9 requires the 2D equivalent to carry identical
            capability, and that includes assistive technology.
          */}
          <details className="mt-4 rounded-sm border border-line">
            <summary className="u-mono cursor-pointer px-5 py-4 text-ink">
              All {scene.units.length} {unitNoun} as a list
            </summary>
            <ul className="max-h-96 overflow-y-auto border-t border-line p-3">
              {scene.units.map((u) => {
                const status = availability?.units[u.id];
                return (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => select(u.id)}
                      aria-current={u.id === selectedId ? "true" : undefined}
                      className={[
                        "flex w-full items-baseline justify-between gap-4 rounded-sm px-3 py-2 text-left",
                        u.id === selectedId ? "bg-ink text-paper" : "hover:bg-paper-2",
                      ].join(" ")}
                    >
                      <span>
                        {unitNounSingular} {u.id}
                      </span>
                      <span className="u-mono">
                        {u.areaSqft.toLocaleString("en-IN")} sq ft ·{" "}
                        {status ? STATUS_LABELS[status] : UNKNOWN_LABEL}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </details>
        </div>

        <div className="space-y-6">
          {selected ? (
            <UnitDrawer
              scene={scene}
              unit={selected}
              status={availability?.units[selected.id]}
              projectName={projectName}
              projectSlug={projectSlug}
              unitNounSingular={unitNounSingular}
              onClose={() => select(null)}
            />
          ) : (
            <p className="rounded-sm border border-dashed border-line p-6 text-ink-soft">
              Select a {unitNounSingular.toLowerCase()} on the plan to see its
              dimensions, orientation and status.
            </p>
          )}

          <ShortlistTray
            projectSlug={projectSlug}
            projectName={projectName}
            unitNounSingular={unitNounSingular}
          />
        </div>
      </div>

      {/* Announces the selected unit for assistive technology. */}
      <p aria-live="polite" className="sr-only">
        {selected
          ? `${unitNounSingular} ${selected.id} selected. ${selected.areaSqft} square feet, ${selected.facing} facing, ${
              availability?.units[selected.id]
                ? STATUS_LABELS[availability.units[selected.id]]
                : UNKNOWN_LABEL
            }.`
          : `No ${unitNounSingular.toLowerCase()} selected.`}
      </p>
    </div>
  );
}
