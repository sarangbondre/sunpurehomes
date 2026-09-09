import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  availabilitySchema,
  sceneSchema,
  type Availability,
  type Scene,
} from "@/lib/scene-schema";

/**
 * The only read path for site geometry and availability, matching the rule
 * for project content in lib/content.ts. Components receive plain data.
 */

const SCENES = join(process.cwd(), "content", "scenes");
const AVAILABILITY = join(process.cwd(), "content", "availability");

function read<T>(path: string, parse: (raw: unknown) => T): T | undefined {
  if (!existsSync(path)) return undefined;
  return parse(JSON.parse(readFileSync(path, "utf8")));
}

export function getScene(slug: string): Scene | undefined {
  return read(join(SCENES, `${slug}.json`), (raw) => sceneSchema.parse(raw));
}

export function getAvailability(slug: string): Availability | undefined {
  return read(join(AVAILABILITY, `${slug}.json`), (raw) =>
    availabilitySchema.parse(raw),
  );
}

export function hasPlan(slug: string): boolean {
  return existsSync(join(SCENES, `${slug}.json`));
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
