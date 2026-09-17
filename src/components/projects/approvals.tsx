import Image from "next/image";
import { LineIcon } from "@/components/brand/amenity-icons";
import { ASSURANCE_ROW, CLOSING } from "@/components/projects/detail/copy";
import { Aside, ClosingLine, NoteRow } from "@/components/projects/detail/section-head";
import { getProjectMaterials } from "@/lib/partners";
import type { Project } from "@/lib/schema";

/**
 * §11 question 4 — "Is it safe", to the client's reference design: the
 * registration in a card, then the brands the homes are built with.
 *
 * A project with no RERA number says so plainly. It never renders a
 * placeholder: the live site prints the literal string "NUMBER GOES HERE"
 * here (§2, defect 12), which is worse than saying nothing.
 *
 * The reference sets the State of Karnataka's emblem beside the number, and
 * the client asked for it on 17 September 2026. It is not used: the State
 * Emblem of India (Prohibition of Improper Use) Act, 2005 bars it from
 * commercial use, and on a sales page it reads as a government endorsement.
 * In its place is a seal drawn for this site, saying what is true —
 * registered under RERA — and linking to the register, where a buyer can
 * check it.
 */
export function Approvals({ project }: { project: Project }) {
  const {
    reraNumber,
    reraAdditionalNumbers,
    reraProvenance,
    reraAuthorityUrl,
    planSanction,
    khataConversion,
    approvedBanks,
  } = project.compliance;
  const unverified = Boolean(reraNumber) && reraProvenance !== "verified";
  const hasDetails =
    planSanction !== undefined || khataConversion !== undefined || Boolean(approvedBanks?.length);

  return (
    <div className="space-y-14">
      <div className="grid gap-8 rounded-lg border border-line bg-paper px-6 py-8 shadow-[0_1px_2px_rgba(28,26,24,0.04),0_10px_30px_rgba(28,26,24,0.05)] sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:gap-12">
        <div className="flex items-start gap-6">
          <span className="hidden size-20 shrink-0 items-center justify-center rounded-full bg-paper-2 text-laterite sm:flex">
            <LineIcon kind="certificate" className="size-10" />
          </span>
          <div className="min-w-0">
            <h3 className="u-mono tracking-[0.22em] text-muted">RERA registration</h3>
            {reraNumber ? (
              <>
                <p className="mt-3 break-all font-display text-[clamp(1.6rem,3.4vw,2.4rem)] leading-tight text-ink">
                  {reraNumber}
                </p>

                {/* Further registrations on the same project, an extension for
                    instance. Shown because a buyer checking the register will
                    otherwise find a number the page does not mention. */}
                {reraAdditionalNumbers?.length ? (
                  <ul className="mt-2 space-y-1">
                    {reraAdditionalNumbers.map((extra) => (
                      <li key={extra} className="break-all font-mono text-sm text-ink-soft">
                        {extra}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {/*
                  A registration number is a statutory disclosure. While it is a
                  stand-in, the page says so in as many words — an unlabelled
                  fake registration is a worse failure than the live site's
                  "NUMBER GOES HERE", because it looks true.
                */}
                {unverified && (
                  <p className="mt-4 rounded-sm border border-laterite/40 bg-laterite/8 px-4 py-3 text-sm leading-relaxed text-ink">
                    <strong className="font-semibold">Not yet verified.</strong>{" "}
                    This number is a placeholder pending confirmation against the
                    Karnataka RERA register. Do not rely on it.
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 font-display text-2xl text-ink-soft">
                Registration details on request.
              </p>
            )}

            <a
              className="mt-5 inline-flex items-center gap-2 text-lg text-ink underline decoration-ink/30 underline-offset-4 transition-colors duration-hover ease-hover hover:text-laterite hover:decoration-laterite"
              href={reraAuthorityUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {reraNumber && !unverified
                ? "Verify at rera.karnataka.gov.in"
                : "Search the Karnataka RERA register"}
              <LineIcon kind="external" className="size-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-8 border-line sm:flex-row sm:items-center lg:border-l lg:pl-12">
        {hasDetails && (
          <dl className="space-y-4 lg:min-w-[14rem]">
            {planSanction !== undefined && (
              <Detail term="Plan sanction" value={planSanction ? "Sanctioned" : "Not yet sanctioned"} />
            )}
            {khataConversion !== undefined && (
              <Detail term="Khata" value={khataConversion ? "Converted" : "Conversion pending"} />
            )}
            {approvedBanks?.length ? (
              <Detail term="Approved by" value={approvedBanks.join(", ")} />
            ) : null}
          </dl>
        )}
          {reraNumber && !unverified && <RegisteredSeal href={reraAuthorityUrl} />}
        </div>
      </div>

      <BuiltWith materials={project.materials} />

      <ClosingLine lines={CLOSING.approvals}>
        <div className="sm:min-w-[26rem]">
          <NoteRow
            items={ASSURANCE_ROW.map((a) => ({
              icon: <LineIcon kind={a.icon} className="size-8" />,
              title: a.title,
            }))}
          />
        </div>
      </ClosingLine>
    </div>
  );
}

function Detail({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="u-mono tracking-[0.2em] text-muted">{term}</dt>
      <dd className="mt-1 text-lg text-ink">{value}</dd>
    </div>
  );
}

/**
 * A seal drawn for this site — not the State's emblem, not the authority's
 * mark — that links to the Karnataka RERA register.
 */
function RegisteredSeal({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Registered under RERA, Karnataka — check on the RERA register"
      className="group flex shrink-0 flex-col items-center gap-3 text-ink transition-colors duration-hover ease-hover hover:text-laterite"
    >
      <svg aria-hidden viewBox="0 0 120 120" className="size-28">
        <defs>
          <path id="seal-ring" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0" />
        </defs>
        <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="1" />
        <text className="fill-current font-mono" fontSize="9" letterSpacing="2.2">
          <textPath href="#seal-ring">REGISTERED UNDER RERA · KARNATAKA ·</textPath>
        </text>
        <path
          d="M47 60.5l8.5 8.5L74 50.5"
          fill="none"
          stroke="var(--color-laterite)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="u-mono text-center leading-[1.8] tracking-[0.26em]">
        RERA
        <br />
        registered
      </span>
    </a>
  );
}

/**
 * The brands a project is built with, as cards: the mark where its file is
 * in public/images/brands (see lib/partners.ts), otherwise the name, and
 * what each supplies beneath it.
 *
 * The group and edible-oil lineage were removed from every page at the
 * client's instruction. The material partners carry the trust signal on
 * their own.
 */
function BuiltWith({ materials }: { materials: Project["materials"] }) {
  const brands = getProjectMaterials(materials);
  return (
    <div>
      <div className="flex items-end justify-between gap-8">
        <h3 className="u-mono flex items-center gap-4 text-[0.8rem] tracking-[0.22em] text-ink-soft">
          Built with
          <span aria-hidden className="h-px w-16 bg-ink/25 sm:w-24" />
        </h3>
        <Aside lines={CLOSING.approvalsAside} className="hidden sm:block" />
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {brands.map((brand) => (
          <li
            key={brand.name}
            className="flex min-h-32 flex-col items-center justify-center gap-4 rounded-lg border border-line bg-paper px-4 py-6 text-center"
          >
            {brand.logoSrc ? (
              <Image
                src={brand.logoSrc}
                alt={brand.name}
                width={200}
                height={60}
                className="h-11 w-auto max-w-[80%] object-contain"
              />
            ) : (
              <span className="font-display text-2xl leading-tight text-ink">{brand.name}</span>
            )}
            {brand.use && (
              <span className="u-mono text-[0.68rem] leading-relaxed tracking-[0.2em] text-muted">
                {brand.use}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
