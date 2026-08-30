"use client";

import type { Scene, SceneUnit } from "@/lib/scene-schema";
import { STATUS_LABELS, UNKNOWN_LABEL } from "@/lib/scene-display";
import type { UnitStatus } from "@/lib/unit-status";
import { isShortlisted, SHORTLIST_LIMIT, useShortlist } from "@/lib/shortlist";
import { whatsappHref } from "@/lib/links";
import { formatIndianNumber } from "@/lib/format";

function nearestAmenity(scene: Scene, unit: SceneUnit) {
  let best: { name: string; metres: number } | undefined;
  for (const a of scene.amenityPoints) {
    const dx = a.point[0] - unit.centroid[0];
    const dy = a.point[1] - unit.centroid[1];
    const metres = Math.round(Math.hypot(dx, dy));
    if (!best || metres < best.metres) best = { name: a.name, metres };
  }
  return best;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3">
      <dt className="u-mono text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

export function UnitDrawer({
  scene,
  unit,
  status,
  projectName,
  projectSlug,
  unitNounSingular,
  onClose,
}: {
  scene: Scene;
  unit: SceneUnit;
  status: UnitStatus | undefined;
  projectName: string;
  projectSlug: string;
  unitNounSingular: string;
  onClose: () => void;
}) {
  const entries = useShortlist((s) => s.entries);
  const toggle = useShortlist((s) => s.toggle);

  const entry = { slug: projectSlug, unitId: unit.id, projectName };
  const shortlisted = isShortlisted(entries, entry);
  const full = entries.length >= SHORTLIST_LIMIT && !shortlisted;
  const amenity = nearestAmenity(scene, unit);

  return (
    <aside
      aria-label={`${unitNounSingular} ${unit.id} details`}
      className="rounded-sm border border-line bg-paper p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="u-mono text-canopy">{unitNounSingular}</p>
          <p className="font-display text-5xl leading-none">{unit.id}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="u-mono text-muted underline underline-offset-4 hover:text-ink"
        >
          Close
        </button>
      </div>

      <dl className="mt-6">
        <Row label="Status" value={status ? STATUS_LABELS[status] : UNKNOWN_LABEL} />
        <Row
          label="Dimensions"
          value={`${unit.widthM} × ${unit.depthM} m`}
        />
        <Row
          label="Area"
          value={`${formatIndianNumber(unit.areaSqft)} sq ft`}
        />
        <Row label="Facing" value={unit.facing} />
        {unit.roadWidthM !== undefined && (
          <Row label="Road width" value={`${unit.roadWidthM} m`} />
        )}
        {amenity && (
          <Row
            label="Nearest amenity"
            value={`${amenity.name}, ${amenity.metres} m`}
          />
        )}
        {/* Sunlight window needs a real sun-path model and real orientation.
            It arrives with the sun path in Phase 4 rather than being guessed. */}
      </dl>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => toggle(entry)}
          disabled={full}
          className={[
            "u-mono rounded-full px-5 py-3 transition-colors duration-hover ease-hover",
            shortlisted
              ? "bg-canopy text-paper"
              : "border border-line text-ink hover:border-ink",
            full ? "cursor-not-allowed opacity-50" : "",
          ].join(" ")}
        >
          {shortlisted
            ? "Shortlisted"
            : full
              ? `Shortlist full (${SHORTLIST_LIMIT})`
              : "Add to shortlist"}
        </button>

        <a
          href={whatsappHref(
            `Hello Sunpure Homes — I'd like to know more about ${projectName}, ${unitNounSingular.toLowerCase()} ${unit.id} (${formatIndianNumber(unit.areaSqft)} sq ft, ${unit.facing} facing).`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="u-mono rounded-full bg-ink px-5 py-3 text-center text-paper transition-colors duration-hover ease-hover hover:bg-canopy"
        >
          Ask about {unitNounSingular.toLowerCase()} {unit.id}
        </a>
      </div>
    </aside>
  );
}
