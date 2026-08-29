import { z } from "zod";
import { UNIT_STATUSES, type UnitStatus } from "@/lib/unit-status";

/**
 * Site geometry — BRIEF.md §15.
 *
 * "Build the scene generators to consume content/scenes/[slug].json (plot
 *  coordinates, unit footprints, road centrelines). Seed that JSON with
 *  plausible generated geometry now; swapping in surveyed data later must be
 *  a data change, not a rebuild. This is the single most important
 *  architectural decision in the project."
 *
 * So: nothing downstream — not the SVG plan in Phase 2, not the 3D scenes in
 * Phase 4 — may compute geometry. They read it from here.
 *
 * Coordinates are metres in a local, right-handed plane with its origin at
 * the south-west corner of the site: x east, y north. Surveyed data can be
 * projected into the same frame without touching a component.
 */

const point = z.tuple([z.number(), z.number()]);
const ring = z.array(point).min(3);

export const scenePorvenance = z.enum(["generated", "surveyed"]);

export const sceneSchema = z
  .object({
    slug: z.string(),
    kind: z.enum(["plot-layout", "villa-cluster", "apartment-block"]),

    /**
     * "generated" means the geometry is indicative and was produced by
     * scripts/generate-scene.ts — it is NOT a survey. Every view that renders
     * a generated scene must say so on the page. Set to "surveyed" only when
     * real drawings replace it, and the notice disappears on its own.
     */
    provenance: scenePorvenance,

    /** Metres. Used to size the viewBox and to scale the 3D ground plane. */
    extent: z.object({ width: z.number(), depth: z.number() }),

    boundary: ring,

    roads: z.array(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        centreline: z.array(point).min(2),
        widthM: z.number().positive(),
      }),
    ),

    /** Green space, parks, amenity land — drawn under the units. */
    openSpaces: z
      .array(z.object({ id: z.string(), name: z.string().optional(), ring }))
      .default([]),

    units: z.array(
      z.object({
        /** Stable and human-facing: this is what ?unit= carries. */
        id: z.string(),
        ring,
        /** Centroid, precomputed so labels and camera targets need no maths. */
        centroid: point,
        areaSqft: z.number().positive(),
        widthM: z.number().positive(),
        depthM: z.number().positive(),
        facing: z.enum(["North", "South", "East", "West"]),
        /** Width of the road this unit fronts. */
        roadWidthM: z.number().positive().optional(),
      }),
    ),

    amenityPoints: z
      .array(z.object({ id: z.string(), name: z.string(), point }))
      .default([]),
  })
  .strict();

export type Scene = z.infer<typeof sceneSchema>;
export type SceneUnit = Scene["units"][number];

/* ------------------------------------------------------------ availability */

export const unitStatusSchema = z.enum(UNIT_STATUSES);
export { UNIT_STATUSES };
export type { UnitStatus };

/**
 * The file the sales team owns (§7). It is deliberately the simplest shape
 * that can work — a flat map of unit id to status — so it can be edited by
 * hand, or written by whatever tool they end up using, without a developer.
 *
 * A unit absent from `units` renders as "Status on request" rather than
 * guessing. `provenance: "placeholder"` puts a notice on the page.
 */
export const availabilitySchema = z
  .object({
    slug: z.string(),
    provenance: z.enum(["placeholder", "sales"]),
    updated: z.string().optional(),
    units: z.record(z.string(), unitStatusSchema),
  })
  .strict();

export type Availability = z.infer<typeof availabilitySchema>;
