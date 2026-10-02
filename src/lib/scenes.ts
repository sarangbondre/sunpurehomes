import { AVAILABILITY_FILES, SCENE_FILES } from "@/lib/content-files";
import {
  availabilitySchema,
  sceneSchema,
  type Availability,
  type Scene,
} from "@/lib/scene-schema";

/**
 * The only read path for site geometry and availability, matching the rule
 * for project content in lib/content.ts. Components receive plain data.
 *
 * The JSON is imported, not read from disk — see lib/content-files.ts for
 * why. A project with no file of a kind is simply absent from the map, which
 * is how V4, which has no scene, says so.
 */

export function getScene(slug: string): Scene | undefined {
  const raw = SCENE_FILES[slug];
  return raw === undefined ? undefined : sceneSchema.parse(raw);
}

export function getAvailability(slug: string): Availability | undefined {
  const raw = AVAILABILITY_FILES[slug];
  return raw === undefined ? undefined : availabilitySchema.parse(raw);
}

export function hasPlan(slug: string): boolean {
  return SCENE_FILES[slug] !== undefined;
}

/**
 * A project counts as fully sold when it has availability on record and every
 * unit in it is marked sold.
 *
 * Driven from content/availability/[slug].json so the sales team turns it on
 * by editing the file they already own — no developer, no deploy (§7).
 * Placeholder availability is ignored: a demonstration file must never make a
 * live project look sold out.
 */
export function isFullySold(slug: string): boolean {
  const availability = getAvailability(slug);
  if (!availability || availability.provenance !== "sales") return false;

  const statuses = Object.values(availability.units);
  return statuses.length > 0 && statuses.every((s) => s === "sold");
}
