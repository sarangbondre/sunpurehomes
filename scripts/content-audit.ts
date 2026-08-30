/**
 * Content audit — `npm run content:audit`
 *
 * Loading `lib/content.ts` runs every schema and integrity check, so this
 * exits non-zero on invalid content. It then prints what is missing but not
 * yet fatal: the questions the client has to answer before launch.
 */
import {
  getAllProjects,
  isPublishable,
} from "../src/lib/content";

const projects = getAllProjects();
const missingRera = projects.filter((p) => !p.compliance.reraNumber);
const placeholderRera = projects.filter(
  (p) => p.compliance.reraNumber && p.compliance.reraProvenance !== "verified",
);
const publishable = projects.filter(isPublishable);
const missingCoords = projects.filter((p) => !p.location.coordinates);
const missingAddress = projects.filter((p) => p.location.addressLines.length === 0);
const noSpecs = projects.filter((p) => p.specifications.length === 0);
const noConnectivity = projects.filter((p) => p.connectivity.length === 0);
const warned = projects.filter((p) => (p.contentWarnings ?? []).length > 0);
const warnings = warned.flatMap((p) => p.contentWarnings ?? []);

const line = (s = "") => console.log(s);
const rule = () => line("─".repeat(74));

line();
line(`CONTENT AUDIT — ${projects.length} projects, schema and integrity checks passed`);
rule();
line(`RERA verified               ${publishable.length}/${projects.length}   ${publishable.map((p) => p.slug).join(", ") || "—"}`);
line(`RERA placeholder            ${placeholderRera.length}/${projects.length}   ${placeholderRera.map((p) => p.slug).join(", ") || "—"}`);
line(`  └─ shown with a "Not yet verified" notice and kept out of the sitemap.`);
line(`RERA absent                 ${missingRera.length}/${projects.length}   ${missingRera.map((p) => p.slug).join(", ") || "—"}`);
line(`Coordinates missing         ${missingCoords.length}/${projects.length}   required before Phase 3 (the city scene)`);
line(`Address withheld            ${missingAddress.length}/${projects.length}   ${missingAddress.map((p) => p.slug).join(", ") || "—"}`);
line(`Specifications empty        ${noSpecs.length}/${projects.length}   ${noSpecs.map((p) => p.slug).join(", ") || "—"}`);
line(`Connectivity empty          ${noConnectivity.length}/${projects.length}   ${noConnectivity.map((p) => p.slug).join(", ") || "—"}`);
rule();
line(`${warnings.length} content questions for the client, across ${warned.length} projects:`);
line();
for (const p of warned) {
  line(`  ${p.name} (${p.slug})`);
  for (const w of p.contentWarnings ?? []) {
    line(`    · ${w}`);
  }
  line();
}
rule();
line("contentWarnings are internal and are never rendered on the site.");
line();
