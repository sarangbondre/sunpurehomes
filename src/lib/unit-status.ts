/**
 * Zod-free so client components can import it.
 *
 * scene-schema.ts builds its enum from this constant, so the schema and the
 * UI cannot drift, but importing the statuses into a client component does
 * not drag zod into the browser bundle. That import alone put the project
 * page ~90 KB over the §9.4 budget.
 */
export const UNIT_STATUSES = ["available", "held", "sold"] as const;

export type UnitStatus = (typeof UNIT_STATUSES)[number];
