"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  CAPABILITY_MESSAGES,
  detectCapability,
  type Capability,
} from "@/lib/webgl";
import type { Availability, Scene } from "@/lib/scene-schema";
import type { UnitStatus } from "@/lib/unit-status";
import { withArticle } from "@/lib/nouns";

/**
 * §9.3 — one Canvas per route, lazy-loaded, ssr:false, and it must never
 * block first paint. The import below only resolves once a capable device
 * has asked for the 3D view, so a phone that cannot run it never downloads
 * three.js at all.
 */
const SiteScene = dynamic(() => import("@/components/scene/site-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-4/3 w-full items-center justify-center rounded-sm bg-paper-2">
      <p className="u-mono text-muted">Loading the model…</p>
    </div>
  ),
});

export function SceneView({
  scene,
  availability,
  selectedId,
  onSelect,
  filter,
  visibleFloor,
  unitNounSingular,
  onUnsupported,
}: {
  scene: Scene;
  availability?: Availability;
  selectedId: string | null;
  onSelect: (unitId: string | null) => void;
  filter: UnitStatus | "all";
  visibleFloor?: number | null;
  unitNounSingular: string;
  onUnsupported: () => void;
}) {
  const [capability, setCapability] = useState<Capability | null>(null);
  const [hour, setHour] = useState(13);
  const [matureCanopy, setMatureCanopy] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const result = detectCapability();
    setCapability(result);
    if (!result.ok) onUnsupported();

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const listen = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", listen);
    return () => query.removeEventListener("change", listen);
  }, [onUnsupported]);

  if (capability === null) {
    return (
      <div className="flex aspect-4/3 w-full items-center justify-center rounded-sm bg-paper-2">
        <p className="u-mono text-muted">Checking this device…</p>
      </div>
    );
  }

  if (!capability.ok) {
    return (
      <div className="rounded-sm border border-line bg-paper-2 p-6">
        <p className="text-ink-soft">
          {CAPABILITY_MESSAGES[capability.reason]} The plan below carries the
          same information and the same actions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-4/3 w-full overflow-hidden rounded-sm bg-paper-2 sm:aspect-16/9">
        <SiteScene
          scene={scene}
          availability={availability}
          selectedId={selectedId}
          onSelect={onSelect}
          filter={filter}
          visibleFloor={visibleFloor}
          hour={hour}
          matureCanopy={matureCanopy}
          reducedMotion={reducedMotion}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {/* Sun path — drives a real directional light and cast shadows (§9.2). */}
        <label className="flex items-center gap-3">
          <span className="u-mono text-muted">Sun</span>
          <input
            type="range"
            min={6}
            max={18}
            step={0.5}
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="h-1 w-44 cursor-pointer appearance-none rounded-full bg-line accent-canopy"
            aria-label="Time of day"
          />
          <span className="u-mono w-14 text-ink">
            {String(Math.floor(hour)).padStart(2, "0")}:
            {hour % 1 ? "30" : "00"}
          </span>
        </label>

        {scene.planting.length > 0 && (
          <button
            type="button"
            onClick={() => setMatureCanopy((v) => !v)}
            aria-pressed={matureCanopy}
            className={[
              "u-mono rounded-full border px-4 py-2 transition-colors duration-hover ease-hover",
              matureCanopy
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper text-ink hover:border-ink",
            ].join(" ")}
          >
            {matureCanopy ? "Planting at year five" : "Planting at handover"}
          </button>
        )}
      </div>

      <p className="u-mono text-muted">
        Drag to orbit · scroll to zoom · click {withArticle(unitNounSingular.toLowerCase())} to select it
      </p>
    </div>
  );
}
