/**
 * Which drawing an amenity gets, read from its published name.
 *
 * The project files carry names only — seventy-odd of them, in each
 * developer's own wording ("Gym", "Gymnasium", "Fitness zones") — so the
 * match is by keyword, not by exact name. Order matters: the first rule that
 * matches wins, so the specific rules ("Stormwater drainage" is rain, not
 * pipes) sit above the general ones ("garden", "green").
 *
 * amenity-icon.test.ts fails if a published amenity matches nothing, so a new
 * name gets a drawing chosen for it rather than a silent generic one.
 */

export const AMENITY_ICONS = [
  "ev",
  "lift",
  "gas",
  "hot-water",
  "power",
  "water",
  "pool",
  "rain",
  "utilities",
  "camera",
  "shield",
  "lamp",
  "road",
  "parking",
  "walk",
  "footprints",
  "ball",
  "play",
  "fitness",
  "yoga",
  "amphitheatre",
  "games",
  "book",
  "bench",
  "pavilion",
  "hall",
  "arch",
  "sun",
  "home",
  "leaf",
  "tree",
] as const;

export type AmenityIcon = (typeof AMENITY_ICONS)[number];

const RULES: readonly [RegExp, AmenityIcon][] = [
  [/\bev\b|charging/, "ev"],
  [/\blift\b/, "lift"],
  [/\bgas\b/, "gas"],
  [/heat pump|hot water/, "hot-water"],
  [/power backup|generator/, "power"],
  [/\bro\b|softener/, "water"],
  [/swimming|\bpool\b/, "pool"],
  [/rainwater|stormwater/, "rain"],
  [/sewage|drainage|cabling|utilities/, "utilities"],
  [/cctv|video door/, "camera"],
  [/security/, "shield"],
  [/street lighting/, "lamp"],
  [/\broads?\b/, "road"],
  [/parking/, "parking"],
  [/jogging|walking|walkway|walk park|\btrack\b/, "walk"],
  [/reflexology/, "footprints"],
  [/basketball|football|cricket|multi-purpose court/, "ball"],
  [/\bplay\b|children|\bkids\b/, "play"],
  [/\bgym|fitness/, "fitness"],
  [/yoga/, "yoga"],
  [/amphitheatre/, "amphitheatre"],
  [/indoor games/, "games"],
  [/reading/, "book"],
  [/senior citizen|sit-out/, "bench"],
  [/pavilion|retreat/, "pavilion"],
  [/community hall|civic|lounge/, "hall"],
  [/archway|entrance/, "arch"],
  [/naturally lit|ventilated/, "sun"],
  [/outdoor space|terrace/, "home"],
  [/sustainable/, "leaf"],
  [/garden|\bparks?\b|green|plants?\b|\btree|landscap/, "tree"],
];

/** The drawing for an amenity name, or undefined when no rule knows it. */
export function amenityIcon(name: string): AmenityIcon | undefined {
  const key = name.toLowerCase();
  return RULES.find(([pattern]) => pattern.test(key))?.[1];
}
