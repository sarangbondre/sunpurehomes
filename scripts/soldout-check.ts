/** Exercises the sold-out rule against the availability files on disk. */
import { getAvailability, isFullySold } from "../src/lib/scenes";
import { getProjectSlugs } from "../src/lib/content";

for (const slug of getProjectSlugs()) {
  const a = getAvailability(slug);
  if (!a) continue;
  const statuses = Object.values(a.units);
  const sold = statuses.filter((s) => s === "sold").length;
  console.log(
    `  ${slug.padEnd(13)} provenance=${a.provenance.padEnd(11)} ` +
      `sold ${String(sold).padStart(3)}/${String(statuses.length).padStart(3)}  ` +
      `hidesUnitDetail=${isFullySold(slug)}`,
  );
}
