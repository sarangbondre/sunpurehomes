"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Availability, Scene, SceneUnit } from "@/lib/scene-schema";
import { UNIT_STATUSES, type UnitStatus } from "@/lib/unit-status";
import {
  STATUS_FILL,
  STATUS_LABELS,
  UNKNOWN_FILL,
  UNKNOWN_LABEL,
} from "@/lib/scene-display";

/**
 * The interactive plot plan (BRIEF.md §12, Phase 2).
 *
 * This is the permanent 2D equivalent of the Phase 4 scene, not a stopgap:
 * §9 requires every 3D view to have a 2D counterpart carrying identical data
 * and identical actions, so this is what a buyer on a low-end Android — or
 * anyone with WebGL off — actually uses to choose a plot.
 *
 * Geometry comes entirely from content/scenes/[slug].json. Nothing here
 * computes a coordinate, which is what lets surveyed drawings replace the
 * generated layout as a data change (§15).
 *
 * Keyboard: the plan is a single tab stop with a roving tabindex. Arrow keys
 * move to the nearest plot in that direction, computed from centroids, so it
 * keeps working for any layout including a real survey.
 */

const ring = (r: readonly (readonly [number, number])[]) =>
  r.map(([x, y]) => `${x},${y}`).join(" ");

export type StatusFilter = UnitStatus | "all";

export function PlotPlan({
  scene,
  availability,
  selectedId,
  onSelect,
  filter,
  unitNoun,
  visibleFloor,
}: {
  scene: Scene;
  availability?: Availability;
  selectedId: string | null;
  onSelect: (unitId: string | null) => void;
  filter: StatusFilter;
  unitNoun: string;
  /**
   * Apartment storeys share a plan footprint, so the 2D plan can only show
   * one at a time. Null for plots and villas, which are laid side by side.
   */
  visibleFloor?: number | null;
}) {
  const { width, depth } = scene.extent;
  const [focusId, setFocusId] = useState<string>(
    selectedId ?? scene.units[0]?.id ?? "",
  );
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (selectedId) setFocusId(selectedId);
  }, [selectedId]);

  const statusFor = useCallback(
    (id: string): UnitStatus | undefined => availability?.units[id],
    [availability],
  );

  const matches = useCallback(
    (unit: SceneUnit) => filter === "all" || statusFor(unit.id) === filter,
    [filter, statusFor],
  );

  const onThisFloor = useCallback(
    (unit: SceneUnit) =>
      visibleFloor === null || visibleFloor === undefined || unit.floor === visibleFloor,
    [visibleFloor],
  );

  const drawn = useMemo(
    () => scene.units.filter(onThisFloor),
    [scene.units, onThisFloor],
  );

  const byId = useMemo(
    () => new Map(scene.units.map((u) => [u.id, u])),
    [scene.units],
  );

  /**
   * Nearest unit in a direction, by centroid. Distance is weighted so that
   * movement stays in the intended axis rather than drifting diagonally.
   */
  const step = useCallback(
    (from: SceneUnit, dx: number, dy: number): SceneUnit | undefined => {
      let best: SceneUnit | undefined;
      let bestScore = Infinity;
      for (const unit of drawn) {
        if (unit.id === from.id) continue;
        const ox = unit.centroid[0] - from.centroid[0];
        const oy = unit.centroid[1] - from.centroid[1];
        const along = ox * dx + oy * dy;
        if (along <= 0) continue; // wrong direction
        const across = Math.abs(ox * dy - oy * dx);
        const score = along + across * 4;
        if (score < bestScore) {
          bestScore = score;
          best = unit;
        }
      }
      return best;
    },
    [drawn],
  );

  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const current = byId.get(focusId);
    if (!current) return;

    const moves: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowUp: [0, 1],
      ArrowDown: [0, -1],
    };

    if (e.key in moves) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      const next = step(current, dx, dy);
      if (next) setFocusId(next.id);
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(focusId === selectedId ? null : focusId);
      return;
    }

    if (e.key === "Escape" && selectedId) {
      e.preventDefault();
      onSelect(null);
    }
  };

  return (
    <svg
      ref={svgRef}
      // y is north-up in the data and down in SVG, so the whole plan is
      // flipped once here rather than negated in every coordinate.
      viewBox={`0 0 ${width} ${depth}`}
      className="h-auto w-full touch-manipulation rounded-sm bg-paper-2"
      role="group"
      aria-label={`Interactive plan — ${scene.units.length} ${unitNoun}. Use the arrow keys to move between ${unitNoun}, Enter to open details.`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) return;
      }}
    >
      <g transform={`translate(0, ${depth}) scale(1, -1)`}>
        <polygon
          points={ring(scene.boundary)}
          fill="var(--color-paper)"
          stroke="var(--color-line)"
          strokeWidth={0.6}
        />

        {scene.openSpaces.map((space) => (
          <polygon
            key={space.id}
            points={ring(space.ring)}
            fill="var(--color-mist)"
            opacity={0.5}
          />
        ))}

        {scene.roads.map((road) => (
          <polyline
            key={road.id}
            points={ring(road.centreline)}
            fill="none"
            stroke="var(--color-stone)"
            strokeWidth={road.widthM}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.55}
          />
        ))}

        {drawn.map((unit) => {
          const status = statusFor(unit.id);
          const dim = !matches(unit);
          const isSelected = unit.id === selectedId;
          const isFocused = unit.id === focusId;

          return (
            <polygon
              key={unit.id}
              points={ring(unit.ring)}
              // Filters dim rather than hide, so the layout never looks
              // half-built and a plot's position stays legible (§9.1).
              fill={
                isSelected
                  ? "var(--color-ink)"
                  : status
                    ? STATUS_FILL[status]
                    : UNKNOWN_FILL
              }
              fillOpacity={dim ? 0.16 : 1}
              stroke={
                isSelected || isFocused ? "var(--color-ink)" : "var(--color-paper)"
              }
              strokeWidth={isSelected || isFocused ? 1.4 : 0.4}
              className="cursor-pointer transition-[fill-opacity] duration-hover ease-hover"
              onClick={() => {
                setFocusId(unit.id);
                onSelect(unit.id === selectedId ? null : unit.id);
              }}
              aria-hidden
            />
          );
        })}

        {scene.amenityPoints.map((a) => (
          <circle
            key={a.id}
            cx={a.point[0]}
            cy={a.point[1]}
            r={2.4}
            fill="var(--color-canopy)"
            stroke="var(--color-paper)"
            strokeWidth={0.8}
          />
        ))}
      </g>
    </svg>
  );
}

export const ALL_FILTERS: StatusFilter[] = ["all", ...UNIT_STATUSES];
export { STATUS_LABELS, UNKNOWN_LABEL };
