import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Approvals } from "@/components/projects/approvals";
import { PlanExplorer } from "@/components/plan/plan-explorer";
import { Gallery } from "@/components/projects/gallery";
import { StatusChip } from "@/components/projects/status-chip";
import { DataPoint, Section } from "@/components/ui/section";
import {
  TYPE_LABELS_ONE,
  formatArea,
  getProject,
  getProjectSlugs,
} from "@/lib/content";
import { mailtoHref, projectEnquiryMessage, telHref, whatsappHref } from "@/lib/links";
import { formatIndianNumber } from "@/lib/format";
import { singularNoun } from "@/lib/nouns";
import { getAvailability, getScene } from "@/lib/scenes";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.description,
  };
}

const CATEGORY_LABELS = {
  work: "Work",
  education: "Education",
  retail: "Retail",
  health: "Health",
  transport: "Transport",
} as const;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const cover = project.gallery[0];
  const rest = project.gallery.slice(1);
  const enquiry = projectEnquiryMessage(project.name);
  const { acres, unitCount, unitNoun } = project.scale;
  const scene = getScene(project.slug);
  const availability = scene ? getAvailability(project.slug) : undefined;

  return (
    <main>
      {/* ─────────────────────────────── 1. Where */}
      <header className="mx-auto max-w-[86rem] px-6 pt-12 sm:px-10 sm:pt-16 lg:px-16">
        <p className="u-mono text-canopy">
          {TYPE_LABELS_ONE[project.type]} · {project.location.label}
        </p>
        <h1 className="mt-5 text-[clamp(2.75rem,8vw,6rem)]">{project.name}</h1>
        <p className="mt-6 max-w-[46ch] font-display text-2xl text-ink-soft sm:text-3xl">
          {project.tagline}
        </p>
        <div className="mt-8">
          <StatusChip status={project.status} type={project.type} />
        </div>
      </header>

      {cover && (
        <div className="relative mt-12 aspect-16/9 w-full overflow-hidden bg-paper-2 sm:mt-16">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-[86rem] px-6 sm:px-10 lg:px-16">
        <div className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <p className="max-w-[62ch] text-xl leading-relaxed sm:text-2xl">
            {project.description}
          </p>

          <dl className="grid grid-cols-2 gap-8 self-start">
            {unitCount !== undefined && (
              <DataPoint
                label={unitNoun}
                value={formatIndianNumber(unitCount)}
              />
            )}
            {acres !== undefined && <DataPoint label="Acres" value={acres} />}
          </dl>
        </div>

        {/* ─────────────────────────────── 2. What
            §11 puts the plan at the centre of the page, high, not buried.
            The 3D scene replaces the SVG here in Phase 4; the drawer, the
            shortlist and the actions are already the ones it will use, so
            that swap adds spectacle without adding capability (§9). */}
        {scene && (
          <Section eyebrow="What" title={`Choose your ${singularNoun(unitNoun).toLowerCase()}`}>
            {/* No query reading here, so all nine project pages stay
                statically generated. Deep links belong to /plan. */}
            <PlanExplorer
              scene={scene}
              availability={availability}
              projectName={project.name}
              projectSlug={project.slug}
              unitNoun={unitNoun}
              unitNounSingular={singularNoun(unitNoun)}
              publishedAcres={project.scale.acres}
            />
            <p className="mt-8">
              <Link
                href={`/projects/${project.slug}/plan`}
                className="u-mono text-canopy underline underline-offset-4"
              >
                Open the full plan
              </Link>
            </p>
          </Section>
        )}

        {/* ─────────────────────────────── 3. How much */}
        {project.configurations.length > 0 && (
          <Section eyebrow="How much" title="Configurations">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="u-mono py-3 text-muted">
                      Configuration
                    </th>
                    <th scope="col" className="u-mono py-3 text-muted">
                      Area
                    </th>
                    <th scope="col" className="u-mono py-3 text-muted">
                      Facing
                    </th>
                    <th scope="col" className="u-mono py-3 text-right text-muted">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {project.configurations.map((c) => (
                    <tr key={c.label} className="border-b border-line">
                      <td className="py-4 font-display text-2xl">{c.label}</td>
                      <td className="py-4 text-ink-soft">
                        {formatArea(c.areaSqft) ?? "—"}
                      </td>
                      <td className="py-4 text-ink-soft">{c.facing ?? "—"}</td>
                      <td className="py-4 text-right text-ink-soft">
                        {c.count ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-8 max-w-[60ch] text-ink-soft">
              Prices are not published. Ask the sales team for the current price
              list for {project.name}.
            </p>
            <a
              href={whatsappHref(
                `Hello Sunpure Homes — please send me the price list for ${project.name}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="u-mono mt-5 inline-block rounded-full bg-ink px-5 py-3 text-paper transition-colors duration-hover ease-hover hover:bg-canopy"
            >
              Request the price list
            </a>
          </Section>
        )}

        {/* Amenities */}
        {project.amenities.length > 0 && (
          <Section eyebrow="On site" title="Amenities">
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.amenities.map((a) => (
                <li
                  key={a.name}
                  className="flex gap-3 border-b border-line pb-4 text-lg"
                >
                  <span
                    aria-hidden
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-canopy"
                  />
                  <span>
                    {a.name}
                    {a.description && (
                      <span className="block text-base text-ink-soft">
                        {a.description}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Specifications */}
        {project.specifications.length > 0 && (
          <Section eyebrow="Built to" title="Specifications">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {project.specifications.map((group) => (
                <div key={group.group}>
                  <h3 className="u-mono text-muted">{group.group}</h3>
                  <ul className="mt-4 space-y-2 text-ink-soft">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Connectivity */}
        {project.connectivity.length > 0 && (
          <Section eyebrow="Nearby" title="Connectivity">
            {/* Phase 3 draws these on the city model (§11). The list carries
                the same data and stays as the permanent fallback. */}
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {project.connectivity.map((c) => (
                <li
                  key={c.name}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-4"
                >
                  <span>
                    {c.name}
                    <span className="u-mono ml-3 text-muted">
                      {CATEGORY_LABELS[c.category]}
                    </span>
                  </span>
                  <span className="u-mono shrink-0 text-ink">
                    {c.distanceKm !== undefined
                      ? `${c.distanceKm} km`
                      : `${c.travelMinutes} min`}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ─────────────────────────────── 4. Is it safe */}
        <Section eyebrow="Is it safe" title="Approvals and assurances">
          <Approvals project={project} />
        </Section>

        {/* Gallery */}
        {rest.length > 0 && (
          <Section eyebrow="See it" title="Gallery">
            <Gallery shots={rest} projectName={project.name} />
          </Section>
        )}

        {/* ─────────────────────────────── 5. See it */}
        <Section eyebrow="Next" title="Come and look">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="max-w-[46ch] text-lg leading-relaxed text-ink-soft">
                Talk to the sales team about {project.name}, or arrange a visit
                to the site.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappHref(enquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-mono rounded-full bg-ink px-5 py-3 text-paper transition-colors duration-hover ease-hover hover:bg-canopy"
                >
                  WhatsApp the sales team
                </a>
                <a
                  href={telHref}
                  className="u-mono rounded-full border border-line px-5 py-3 text-ink transition-colors duration-hover ease-hover hover:border-ink"
                >
                  {site.contact.phoneDisplay}
                </a>
                <a
                  href={mailtoHref}
                  className="u-mono rounded-full border border-line px-5 py-3 text-ink transition-colors duration-hover ease-hover hover:border-ink"
                >
                  {site.contact.email}
                </a>
              </div>
            </div>

            {project.location.addressLines.length > 0 && (
              <div>
                <h3 className="u-mono text-muted">Address</h3>
                <address className="mt-4 not-italic leading-relaxed text-ink-soft">
                  {project.location.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </div>
            )}
          </div>
        </Section>

        {/* A disclaimer that describes what is actually on this page (§11).
            No floor plans are shown here, so none are mentioned. */}
        <p className="max-w-[80ch] border-t border-line py-10 text-sm leading-relaxed text-ink-soft">
          Information about {project.name} on this page is representational and
          informative, and is subject to variation during execution.{" "}
          {project.gallery.length > 0 &&
            "Images are indicative of the intended character of the development and do not form part of the offering or specification. "}
          {site.name} reserves the right to make additions, deletions,
          alterations or amendments as it deems fit, without prior notice.
        </p>
      </div>
    </main>
  );
}
