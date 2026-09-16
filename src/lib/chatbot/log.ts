/**
 * One structured line per event, for Vercel's log drain.
 *
 * Deliberately narrow: ids, counts, outcomes and timings. Never a name, a
 * phone number, an email address or a visitor's message — this module takes
 * no free-text field, so a call site cannot pass one by accident.
 */

type Level = "info" | "warn" | "error";
type Field = string | number | boolean | null | undefined | readonly string[];

export function log(
  level: Level,
  event: string,
  fields: Readonly<Record<string, Field>> = {},
): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: "arka",
    event,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
