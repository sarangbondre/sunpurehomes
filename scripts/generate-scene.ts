/**
 * Seeds content/scenes/*.json with plausible, INDICATIVE site geometry
 * (BRIEF.md §15). Run with `npm run scenes:generate`.
 *
 * This exists so the plan views can be built and tested before surveyed
 * drawings arrive. Everything it emits is stamped provenance:"generated",
 * which puts a visible notice on every page that renders it.
 *
 * When real drawings arrive: produce the same JSON shape from the survey,
 * set provenance to "surveyed", and delete nothing else. No component
 * changes. That is the whole point of the file.
 *
 * Output is deterministic — no randomness — so the JSON diffs cleanly.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { sceneSchema, availabilitySchema, type Scene } from "../src/lib/scene-schema";

const SQFT_PER_SQM = 10.7639;
const r2 = (n: number) => Math.round(n * 100) / 100;

type Band = { plots: number; widthM: number; depthM: number };

/**
 * Lays plots out in back-to-back rows separated by roads, which is how these
 * developments are actually planned: a perimeter road, a spine, and blocks of
 * two rows sharing a rear boundary.
 */
function layout(opts: {
  slug: string;
  site: { width: number; depth: number };
  setback: number;
  roadWidth: number;
  spineWidth: number;
  rows: Band[];
  /** Index into a row at which a cross road interrupts the plots. */
  crossRoadAfter?: number;
  amenities: string[];
  startNumber: number;
}): Scene {
  const { slug, site, setback, roadWidth, spineWidth, rows, crossRoadAfter } = opts;

  const units: Scene["units"] = [];
  const roads: Scene["roads"] = [];
  const openSpaces: Scene["openSpaces"] = [];

  // Perimeter road, just inside the boundary.
  const p = setback / 2;
  roads.push({
    id: "perimeter",
    name: "Perimeter road",
    widthM: roadWidth,
    centreline: [
      [p, p],
      [site.width - p, p],
      [site.width - p, site.depth - p],
      [p, site.depth - p],
      [p, p],
    ],
  });

  let number = opts.startNumber;
  let y = setback;

  // Rows are grouped in pairs sharing a rear boundary; a road runs between pairs.
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const isRearRow = i % 2 === 1;
    const facing: Scene["units"][number]["facing"] = isRearRow ? "North" : "South";

    let x = (site.width - (row.plots * row.widthM + (crossRoadAfter ? spineWidth : 0))) / 2;

    // The access road serving this pair of rows.
    if (!isRearRow) {
      const roadY = y - roadWidth / 2;
      roads.push({
        id: `access-${i}`,
        widthM: roadWidth,
        centreline: [
          [setback, r2(roadY)],
          [r2(site.width - setback), r2(roadY)],
        ],
      });
    }

    for (let j = 0; j < row.plots; j++) {
      if (crossRoadAfter && j === crossRoadAfter) {
        roads.push({
          id: `cross-${i}-${j}`,
          widthM: spineWidth,
          centreline: [
            [r2(x + spineWidth / 2), r2(y)],
            [r2(x + spineWidth / 2), r2(y + row.depthM)],
          ],
        });
        x += spineWidth;
      }

      const x0 = r2(x);
      const y0 = r2(y);
      const x1 = r2(x + row.widthM);
      const y1 = r2(y + row.depthM);

      units.push({
        id: String(number),
        ring: [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ],
        centroid: [r2((x0 + x1) / 2), r2((y0 + y1) / 2)],
        areaSqft: Math.round(row.widthM * row.depthM * SQFT_PER_SQM),
        widthM: row.widthM,
        depthM: row.depthM,
        facing,
        roadWidthM: roadWidth,
      });

      number++;
      x += row.widthM;
    }

    y += row.depthM;
    if (isRearRow) y += roadWidth; // road after each back-to-back pair
  }

  // Planting. One tree to each plot frontage — a published Fadal amenity —
  // plus an avenue along each access road. Deterministic, like everything else.
  const planting: Scene["planting"] = [];
  for (const unit of units) {
    const front = unit.facing === "North" ? -1 : 1;
    planting.push({
      point: [unit.centroid[0], r2(unit.centroid[1] + front * (rows[0].depthM / 2 - 1.2))],
      kind: "tree",
      matureRadiusM: 3.2,
    });
  }
  for (const road of roads) {
    if (!road.id.startsWith("access")) continue;
    const start = road.centreline[0];
    const end = road.centreline[road.centreline.length - 1];
    for (let x = start[0] + 14; x < end[0]; x += 22) {
      planting.push({ point: [r2(x), r2(start[1])], kind: "shrub", matureRadiusM: 1.6 });
    }
  }

  // Whatever is left at the top of the site is amenity land.
  const amenityDepth = r2(site.depth - setback - y);
  if (amenityDepth > 6) {
    openSpaces.push({
      id: "amenity-park",
      name: "Amenity park",
      ring: [
        [setback, r2(y)],
        [r2(site.width - setback), r2(y)],
        [r2(site.width - setback), r2(site.depth - setback)],
        [setback, r2(site.depth - setback)],
      ],
    });
  }

  // Amenities spread evenly along the park band.
  const amenityPoints = opts.amenities.map((name, i) => {
    const t = (i + 1) / (opts.amenities.length + 1);
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      point: [
        r2(setback + t * (site.width - 2 * setback)),
        r2(y + Math.max(amenityDepth, 8) / 2),
      ] as [number, number],
    };
  });

  return {
    slug,
    kind: "plot-layout",
    provenance: "generated",
    extent: { width: site.width, depth: site.depth },
    boundary: [
      [0, 0],
      [site.width, 0],
      [site.width, site.depth],
      [0, site.depth],
    ],
    roads,
    openSpaces,
    units,
    amenityPoints,
    planting,
  };
}

/* ------------------------------------------------------------ Rare Earth */
// 279 plots across 18 acres (72,843 m²). 340 × 214 m = 72,760 m².
// Nine rows of 31, split by a central cross road.
const rareEarth = layout({
  slug: "rare-earth",
  site: { width: 340, depth: 214 },
  setback: 10,
  roadWidth: 9,
  spineWidth: 12,
  crossRoadAfter: 15,
  startNumber: 101,
  rows: Array.from({ length: 9 }, () => ({ plots: 31, widthM: 9, depthM: 15 })),
  amenities: [
    "Multi-purpose court",
    "Yoga deck",
    "Amphitheatre",
    "Fitness zones",
    "Kids play area",
    "Walk park",
    "Reflexology path",
    "Reading zones",
  ],
});

/* ----------------------------------------------------------------- Fadal */
// 43 plots across 3 acres (12,141 m²). 142 × 86 m = 12,212 m².
// Published plot sizes run 1,164–2,498 sq ft, so rows vary in depth.
const fadal = layout({
  slug: "fadal",
  site: { width: 142, depth: 86 },
  setback: 6,
  roadWidth: 9,
  spineWidth: 9,
  startNumber: 1,
  rows: [
    { plots: 11, widthM: 9, depthM: 12 },   // 1,163 sq ft
    { plots: 11, widthM: 9, depthM: 14 },   // 1,357 sq ft
    { plots: 11, widthM: 10.5, depthM: 15 }, // 1,695 sq ft
    { plots: 10, widthM: 12, depthM: 19.3 }, // 2,494 sq ft
  ],
  amenities: [
    "Landscaped garden",
    "Green walkways",
    "Sewage treatment plant",
  ],
});

/* --------------------------------------------------------------- emit */
mkdirSync(join(process.cwd(), "content", "scenes"), { recursive: true });
mkdirSync(join(process.cwd(), "content", "availability"), { recursive: true });

/**
 * Placeholder availability. Deterministic, and NOT commercial truth — the
 * file is stamped provenance:"placeholder" so the plan says so plainly.
 * The sales team replaces this wholesale and flips provenance to "sales".
 */
function seedAvailability(scene: Scene) {
  const units: Record<string, "available" | "held" | "sold"> = {};
  scene.units.forEach((u, i) => {
    const bucket = (i * 7) % 10;
    units[u.id] = bucket < 6 ? "available" : bucket < 8 ? "held" : "sold";
  });
  return { slug: scene.slug, provenance: "placeholder" as const, units };
}

for (const scene of [rareEarth, fadal]) {
  const parsedScene = sceneSchema.parse(scene);
  writeFileSync(
    join("content", "scenes", `${scene.slug}.json`),
    JSON.stringify(parsedScene, null, 1) + "\n",
  );

  const availability = availabilitySchema.parse(seedAvailability(scene));
  writeFileSync(
    join("content", "availability", `${scene.slug}.json`),
    JSON.stringify(availability, null, 1) + "\n",
  );

  const areas = scene.units.map((u) => u.areaSqft);
  const acres = (scene.extent.width * scene.extent.depth) / 4046.86;
  console.log(
    `${scene.slug.padEnd(12)} ${scene.units.length} plots · ` +
      `${Math.min(...areas).toLocaleString("en-IN")}–${Math.max(...areas).toLocaleString("en-IN")} sq ft · ` +
      `${acres.toFixed(1)} acres · ${scene.roads.length} roads`,
  );
}
