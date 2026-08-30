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
