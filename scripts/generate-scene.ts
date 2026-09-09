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
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
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


/* ------------------------------------------------------- villa clusters */

/**
 * Villas on their own plots along access roads, with setbacks. The villa
 * footprint sits inside the plot; the plot is what the buyer selects.
 */
function villaCluster(opts: {
  slug: string;
  count: number;
  plot: { widthM: number; depthM: number };
  built: { widthM: number; depthM: number; heightM: number };
  perRow: number;
  roadWidth: number;
  setback: number;
  startNumber: number;
  amenities: string[];
}): Scene {
  const { slug, count, plot, built, perRow, roadWidth, setback } = opts;

  const rows = Math.ceil(count / perRow);
  const siteWidth = r2(perRow * plot.widthM + 2 * setback);
  const siteDepth = r2(
    rows * plot.depthM + Math.ceil(rows / 2) * roadWidth + 2 * setback + 22,
  );

  const units: Scene["units"] = [];
  const roads: Scene["roads"] = [];
  const planting: Scene["planting"] = [];

  let number = opts.startNumber;
  let y = setback;

  for (let row = 0; row < rows; row++) {
    const rearRow = row % 2 === 1;
    const facing: Scene["units"][number]["facing"] = rearRow ? "North" : "South";

    if (!rearRow) {
      roads.push({
        id: `access-${row}`,
        widthM: roadWidth,
        centreline: [
          [setback, r2(y - roadWidth / 2)],
          [r2(siteWidth - setback), r2(y - roadWidth / 2)],
        ],
      });
    }

    for (let i = 0; i < perRow && number < opts.startNumber + count; i++) {
      const x = setback + i * plot.widthM;
      const x0 = r2(x);
      const y0 = r2(y);
      const x1 = r2(x + plot.widthM);
      const y1 = r2(y + plot.depthM);

      units.push({
        id: String(number),
        ring: [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ],
        centroid: [r2((x0 + x1) / 2), r2((y0 + y1) / 2)],
        areaSqft: Math.round(built.widthM * built.depthM * 2 * SQFT_PER_SQM),
        widthM: built.widthM,
        depthM: built.depthM,
        heightM: built.heightM,
        facing,
        roadWidthM: roadWidth,
      });

      // A tree in each front setback.
      planting.push({
        point: [
          r2(x + plot.widthM / 2),
          r2(rearRow ? y1 - 1.6 : y0 + 1.6),
        ],
        kind: "tree",
        matureRadiusM: 2.8,
      });
      number++;
    }

    y += plot.depthM;
    if (rearRow) y += roadWidth;
  }

  const openSpaces: Scene["openSpaces"] = [
    {
      id: "commons",
      name: "Landscaped commons",
      ring: [
        [setback, r2(y)],
        [r2(siteWidth - setback), r2(y)],
        [r2(siteWidth - setback), r2(siteDepth - setback)],
        [setback, r2(siteDepth - setback)],
      ],
    },
  ];

  const amenityPoints = opts.amenities.map((name, i) => {
    const t = (i + 1) / (opts.amenities.length + 1);
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      point: [r2(setback + t * (siteWidth - 2 * setback)), r2(y + 9)] as [number, number],
    };
  });

  return {
    slug,
    kind: "villa-cluster",
    provenance: "generated",
    extent: { width: siteWidth, depth: siteDepth },
    boundary: [
      [0, 0],
      [siteWidth, 0],
      [siteWidth, siteDepth],
      [0, siteDepth],
    ],
    roads,
    openSpaces,
    units,
    amenityPoints,
    planting,
  };
}

/* ------------------------------------------------------ apartment blocks */

/**
 * A stacked block. Units on different storeys share a plan footprint, so the
 * scene carries `levels` and each unit carries its `floor`; the 2D plan shows
 * one storey at a time and the 3D stacks them.
 */
function apartmentBlock(opts: {
  slug: string;
  count: number;
  perFloor: number;
  unit: { widthM: number; depthM: number };
  levelHeightM: number;
  amenities: string[];
}): Scene {
  const { slug, count, perFloor, unit, levelHeightM } = opts;
  const levels = Math.ceil(count / perFloor);

  const cols = perFloor <= 2 ? perFloor : Math.ceil(perFloor / 2);
  const rowsPerFloor = Math.ceil(perFloor / cols);
  const coreM = 5;

  const blockWidth = r2(cols * unit.widthM + coreM);
  const blockDepth = r2(rowsPerFloor * unit.depthM + coreM);
  const margin = 26;
  const siteWidth = r2(blockWidth + margin * 2);
  const siteDepth = r2(blockDepth + margin * 2);

  const originX = margin;
  const originY = margin;

  const FACINGS: Scene["units"][number]["facing"][] = [
    "North",
    "East",
    "South",
    "West",
  ];

  const units: Scene["units"] = [];
  let made = 0;

  for (let level = 0; level < levels; level++) {
    for (let i = 0; i < perFloor && made < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = originX + col * unit.widthM + (col >= 1 ? coreM : 0);
      const y = originY + row * unit.depthM + (row >= 1 ? coreM : 0);

      const x0 = r2(x);
      const y0 = r2(y);
      const x1 = r2(x + unit.widthM);
      const y1 = r2(y + unit.depthM);

      units.push({
        id: `${level + 1}0${i + 1}`,
        ring: [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ],
        centroid: [r2((x0 + x1) / 2), r2((y0 + y1) / 2)],
        areaSqft: Math.round(unit.widthM * unit.depthM * SQFT_PER_SQM),
        widthM: unit.widthM,
        depthM: unit.depthM,
        facing: FACINGS[i % FACINGS.length],
        floor: level,
      });
      made++;
    }
  }

  const amenityPoints = opts.amenities.map((name, i) => {
    const angle = (i / Math.max(opts.amenities.length, 1)) * Math.PI * 2;
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      point: [
        r2(siteWidth / 2 + Math.cos(angle) * (blockWidth / 2 + 13)),
        r2(siteDepth / 2 + Math.sin(angle) * (blockDepth / 2 + 13)),
      ] as [number, number],
    };
  });

  // A ring of planting around the podium.
  const planting: Scene["planting"] = [];
  const trees = 20;
  for (let i = 0; i < trees; i++) {
    const angle = (i / trees) * Math.PI * 2;
    planting.push({
      point: [
        r2(siteWidth / 2 + Math.cos(angle) * (blockWidth / 2 + 9)),
        r2(siteDepth / 2 + Math.sin(angle) * (blockDepth / 2 + 9)),
      ],
      kind: i % 3 === 0 ? "tree" : "shrub",
      matureRadiusM: i % 3 === 0 ? 3 : 1.5,
    });
  }

  return {
    slug,
    kind: "apartment-block",
    provenance: "generated",
    extent: { width: siteWidth, depth: siteDepth },
    levels,
    levelHeightM,
    boundary: [
      [0, 0],
      [siteWidth, 0],
      [siteWidth, siteDepth],
      [0, siteDepth],
    ],
    roads: [
      {
        id: "approach",
        name: "Approach",
        widthM: 7,
        centreline: [
          [r2(siteWidth / 2), 0],
          [r2(siteWidth / 2), r2(originY - 4)],
        ],
      },
    ],
    openSpaces: [
      {
        id: "podium",
        name: "Podium landscape",
        ring: [
          [r2(originX - 11), r2(originY - 11)],
          [r2(originX + blockWidth + 11), r2(originY - 11)],
          [r2(originX + blockWidth + 11), r2(originY + blockDepth + 11)],
          [r2(originX - 11), r2(originY + blockDepth + 11)],
        ],
      },
    ],
    units,
    amenityPoints,
    planting,
  };
}

/* ------------------------------------------------------------ Rare Earth */
/*
  Dimensions from the approved MUDA layout, "1st Phase (40%) Site Release",
  Authority Resolution 14 of 08-08-2024, Kadakola village.

    net extent   18A-07G, 73,551.61 sq m
    residential  40,298.07 sq m (54.79%)
    roads        21,661.29 sq m (29.45%), nine metres wide
    park          7,488.48 sq m (10.18%)

  Site analysis, 279 sites:
    102 at 9.0 × 12.0m,  53 at 9.0 × 15.0m,  31 at 12.0 × 18.0m,
     10 at 9.0 × 13.44m, 83 irregular

  Positions are still generated — the drawing gives the schedule, not
  surveyed coordinates — but every dimension and count below is the
  approved one, so the plan reads at the right size and the right mix.
*/
const rareEarth = layout({
  slug: "rare-earth",
  site: { width: 372, depth: 198 },
  setback: 10,
  roadWidth: 9,
  spineWidth: 12,
  crossRoadAfter: 15,
  startNumber: 101,
  rows: [
    // 12.0 × 18.0m — the largest class, 31 sites
    { plots: 31, widthM: 12, depthM: 18 },
    // 9.0 × 15.0m — 53 sites
    ...Array.from({ length: 2 }, () => ({ plots: 26, widthM: 9, depthM: 15 })),
    { plots: 1, widthM: 9, depthM: 15 },
    // 9.0 × 13.44m — 10 sites
    { plots: 10, widthM: 9, depthM: 13.44 },
    // 9.0 × 12.0m — 102 sites, the commonest
    ...Array.from({ length: 3 }, () => ({ plots: 34, widthM: 9, depthM: 12 })),
    // the 83 irregular sites, carried at their nominal nine-metre frontage
    ...Array.from({ length: 2 }, () => ({ plots: 30, widthM: 9, depthM: 14 })),
    { plots: 23, widthM: 9, depthM: 14 },
  ],
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
/*
  Dimensions from the approved MUDA layout, Sy. No. 129/1 and 129/2,
  Shyadanahalli village, Authority Resolution 97 of 07-03-2020.

    net extent   02A-35.8G, 11,735.90 sq m
    residential   6,400.44 sq m (54.60%)
    roads         3,558.06 sq m (30.36%), nine metres wide
    park          1,175.45 sq m (10.03%)

  Site analysis, 44 sites — not the 43 previously published:
    16 at 9.0 × 12.0m, 14 at 9.0 × 15.0m, 6 at 9.0 × 13.02m, 8 irregular
*/
const fadal = layout({
  slug: "fadal",
  site: { width: 150, depth: 82 },
  setback: 6,
  roadWidth: 9,
  spineWidth: 9,
  startNumber: 1,
  rows: [
    { plots: 16, widthM: 9, depthM: 12 },    // 1,163 sq ft
    { plots: 14, widthM: 9, depthM: 15 },    // 1,453 sq ft
    { plots: 6, widthM: 9, depthM: 13.02 },  // 1,261 sq ft
    { plots: 8, widthM: 9, depthM: 14 },     // the eight irregular sites
  ],
  amenities: [
    "Landscaped garden",
    "Green walkways",
    "Sewage treatment plant",
  ],
});


/* ---------------------------------------------------------- Happiness 2 */
// 32 villas of 2,543 sq ft across four acres (16,187 m²).
const happiness2 = villaCluster({
  slug: "happiness-2",
  count: 32,
  perRow: 8,
  plot: { widthM: 13, depthM: 19 },
  built: { widthM: 9.5, depthM: 12.4, heightM: 7.4 },
  roadWidth: 9,
  setback: 8,
  startNumber: 1,
  amenities: ["Garden and play area", "Indoor green courts", "Parking"],
});

/* ---------------------------------------------------------- Happiness 1 */
/*
  Twenty-six villas, confirmed by the client. This project had no scene
  before: its unit count was the one figure nobody could state, because the
  live site claimed 34 — a number copied from Happiness 2.
*/
const happiness1 = villaCluster({
  slug: "happiness-1",
  count: 26,
  perRow: 7,
  plot: { widthM: 12.5, depthM: 18 },
  built: { widthM: 9, depthM: 11.8, heightM: 7.2 },
  roadWidth: 9,
  setback: 8,
  startNumber: 1,
  amenities: ["Yoga space", "Gym", "Indoor kids play area", "Senior citizen area"],
});

/* ------------------------------------------------------------------- H4 */
// 51 villas. No acreage or unit area is published, so the site is sized from
// the plots themselves and the page states no acreage for this project.
const h4 = villaCluster({
  slug: "h4",
  count: 51,
  perRow: 9,
  plot: { widthM: 11.5, depthM: 17 },
  built: { widthM: 8.4, depthM: 11.2, heightM: 7.8 },
  roadWidth: 9,
  setback: 8,
  startNumber: 1,
  amenities: ["Landscaped green environment", "Rainwater harvesting"],
});

/* ------------------------------------------------------------------- V4 */
// 24 apartments of 1,678–1,870 sq ft. 1,772 sq ft = 164.6 m² ≈ 13.4 × 12.3 m.
const v4 = apartmentBlock({
  slug: "v4",
  count: 24,
  perFloor: 4,
  unit: { widthM: 13.4, depthM: 12.3 },
  levelHeightM: 3.2,
  amenities: ["Yoga space", "Gym", "Indoor kids play area", "Senior citizen area"],
});

/* ---------------------------------------------------------------- Curve */
const curve = apartmentBlock({
  slug: "curve",
  count: 32,
  perFloor: 4,
  unit: { widthM: 13, depthM: 12 },
  levelHeightM: 3.2,
  amenities: ["Gymnasium", "Yoga pavilion", "Terrace pavilion", "Amphitheatre", "Kids play area"],
});

/* -------------------------------------------------------------- Blessed */
const blessed = apartmentBlock({
  slug: "blessed",
  count: 21,
  perFloor: 3,
  unit: { widthM: 12.2, depthM: 11.4 },
  levelHeightM: 3.1,
  amenities: ["Gymnasium", "Community hall", "Jogging track", "Children's play area"],
});

/* --------------------------------------------------------------- Meraki */
const meraki = apartmentBlock({
  slug: "meraki",
  count: 9,
  perFloor: 3,
  unit: { widthM: 13, depthM: 12 },
  levelHeightM: 3.2,
  amenities: ["Landscaped surroundings", "Parking", "Sit-out spaces"],
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

for (const scene of [rareEarth, fadal, happiness1, happiness2, h4, v4, curve, blessed, meraki]) {
  const parsedScene = sceneSchema.parse(scene);
  writeFileSync(
    join("content", "scenes", `${scene.slug}.json`),
    JSON.stringify(parsedScene, null, 1) + "\n",
  );

  /*
    Never overwrite availability the sales team owns.

    This script seeds a placeholder file so a new scene has something to
    render. Re-running it used to clobber whatever was there, which silently
    reverted V4 from sold out back to demonstration data. Anything marked
    provenance "sales" is left exactly as it is.
  */
  const availabilityPath = join("content", "availability", `${scene.slug}.json`);
  let keep = false;
  if (existsSync(availabilityPath)) {
    const current = availabilitySchema.safeParse(
      JSON.parse(readFileSync(availabilityPath, "utf8")),
    );
    keep = current.success && current.data.provenance === "sales";
  }

  if (keep) {
    console.log(`${scene.slug.padEnd(12)} availability kept — owned by sales`);
  } else {
    const availability = availabilitySchema.parse(seedAvailability(scene));
    writeFileSync(
      availabilityPath,
      JSON.stringify(availability, null, 1) + "\n",
    );
  }

  const areas = scene.units.map((u) => u.areaSqft);
  const acres = (scene.extent.width * scene.extent.depth) / 4046.86;
  console.log(
    `${scene.slug.padEnd(12)} ${String(scene.units.length).padStart(3)} units · ` +
      `${scene.kind.padEnd(15)} · ` +
      `${Math.min(...areas).toLocaleString("en-IN")}–${Math.max(...areas).toLocaleString("en-IN")} sq ft · ` +
      `${acres.toFixed(1)} acres${scene.levels ? ` · ${scene.levels} floors` : ""}`,
  );
}
