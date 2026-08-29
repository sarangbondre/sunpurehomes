import type { Project } from "@/lib/schema";
import { site } from "@/lib/site";

/**
 * §11 question 4 — "Is it safe".
 *
 * A project with no RERA number says so plainly. It never renders a
 * placeholder: the live site prints the literal string "NUMBER GOES HERE"
 * here (§2, defect 12), which is worse than saying nothing.
 */
export function Approvals({ project }: { project: Project }) {
  const { reraNumber, reraAuthorityUrl, planSanction, khataConversion, approvedBanks } =
    project.compliance;

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <h3 className="u-mono text-muted">RERA registration</h3>
        {reraNumber ? (
          <>
            <p className="mt-3 break-all font-mono text-lg text-ink">
              {reraNumber}
            </p>
            <a
              className="u-mono mt-4 inline-block text-canopy underline underline-offset-4"
              href={reraAuthorityUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Verify at rera.karnataka.gov.in
            </a>
          </>
        ) : (
          <>
            <p className="mt-3 text-lg text-ink-soft">
              Registration details on request.
            </p>
            <a
              className="u-mono mt-4 inline-block text-canopy underline underline-offset-4"
              href={reraAuthorityUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Search the Karnataka RERA register
            </a>
          </>
        )}

        {(planSanction !== undefined ||
          khataConversion !== undefined ||
          approvedBanks?.length) && (
          <dl className="mt-8 space-y-3">
            {planSanction !== undefined && (
              <div className="flex gap-3">
                <dt className="u-mono w-40 shrink-0 text-muted">Plan sanction</dt>
                <dd>{planSanction ? "Sanctioned" : "Not yet sanctioned"}</dd>
              </div>
            )}
            {khataConversion !== undefined && (
              <div className="flex gap-3">
                <dt className="u-mono w-40 shrink-0 text-muted">Khata</dt>
                <dd>{khataConversion ? "Converted" : "Conversion pending"}</dd>
              </div>
            )}
            {approvedBanks?.length ? (
              <div className="flex gap-3">
                <dt className="u-mono w-40 shrink-0 text-muted">Approved by</dt>
                <dd>{approvedBanks.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
        )}
      </div>

      <div>
        <h3 className="u-mono text-muted">Built with</h3>
        <ul className="mt-4 flex flex-wrap gap-2">
          {site.materialPartners.map((partner) => (
            <li
              key={partner}
              className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft"
            >
              {partner}
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-ink-soft">
          {site.name} is a residential venture of the {site.group.name},{" "}
          {site.group.legalName} — the family behind {site.group.consumerBrand},
          refining in {site.city} for more than {site.legacyYears} years.
        </p>
      </div>
    </div>
  );
}
