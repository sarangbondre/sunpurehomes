import type { Availability, Scene } from "@/lib/scene-schema";
import type { UnitStatus } from "@/lib/unit-status";

/**
 * Display constants for units. Kept apart from lib/scenes.ts, which reads
 * the filesystem and therefore cannot be imported by a client component.
 */

export const STATUS_LABELS: Record<UnitStatus, string> = {
  available: "Available",
  held: "Held",
  sold: "Sold",
};

/**
 * §8: canopy = available, laterite = held, stone = sold, ink = the user's
 * selection. Always paired with a text label — never colour alone.
 */
export const STATUS_FILL: Record<UnitStatus, string> = {
  available: "var(--color-canopy)",
  held: "var(--color-laterite)",
  sold: "var(--color-stone)",
};

/** A unit with no recorded status is not guessed at. */
export const UNKNOWN_FILL = "var(--color-paper-2)";
export const UNKNOWN_LABEL = "Status on request";

export function statusOf(
  availability: Availability | undefined,
  unitId: string,
): UnitStatus | undefined {
  return availability?.units[unitId];
}

export function countByStatus(scene: Scene, availability?: Availability) {
  const counts = { available: 0, held: 0, sold: 0, unknown: 0 };
  for (const unit of scene.units) {
    const status = statusOf(availability, unit.id);
    if (status) counts[status]++;
    else counts.unknown++;
  }
  return counts;
}
