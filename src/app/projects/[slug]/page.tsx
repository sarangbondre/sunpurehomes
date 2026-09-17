import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Approvals } from "@/components/projects/approvals";
import { ProjectFilm } from "@/components/projects/project-film";
import { ProjectTour } from "@/components/projects/project-tour";
import { CinematicSequence } from "@/components/projects/cinematic-sequence";
import { PlanExplorer } from "@/components/plan/plan-explorer";
import { Gallery } from "@/components/projects/gallery";
import { StatusChip } from "@/components/projects/status-chip";
import { ArrowRightIcon } from "@/components/brand/icons";
import { AmenitiesGrid } from "@/components/projects/detail/amenities-grid";
import { Configurations } from "@/components/projects/detail/configurations";
import { Overview } from "@/components/projects/detail/overview";
import { ASIDES, CLOSING, LEDES } from "@/components/projects/detail/copy";
import { ClosingLine, DetailSection, SectionHead } from "@/components/projects/detail/section-head";
import { pickShots } from "@/components/projects/detail/shots";
import { Specifications } from "@/components/projects/detail/specifications";
import { Visit } from "@/components/projects/detail/visit";
import { TYPE_LABELS_ONE, getProject, getProjectSlugs } from "@/lib/content";
import { singularNoun } from "@/lib/nouns";
import { getAvailability, getScene, isFullySold } from "@/lib/scenes";
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
  leisure: "Leisure",
} as const;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const cover = project.gallery[0];
  const scene = getScene(project.slug);
  const availability = scene ? getAvailability(project.slug) : undefined;
  const { unitNoun } = project.scale;
  /*
    §"Sold-out Developments": once everything is sold, the unit-by-unit plan
    is noise on the page. The project stays fully browsable — description,
    amenities, specifications, gallery and approvals all remain.
  */
  const soldOut = isFullySold(project.slug);

  // Pictures for the panels below the sequence, the cover left out where the
  // project has others, and no panel repeating its neighbour.
  const [overviewShot] = pickShots(project.gallery, 1, cover ? [cover.src] : []);
  const used = [cover?.src, overviewShot?.src].filter((s): s is string => Boolean(s));
  const panelShots = pickShots(project.gallery, project.specifications.length, used);
  // The closing picture is always the building: the last exterior there is.
  const visitShot =
    project.gallery.filter((s) => s.view === "exterior").at(-1) ?? overviewShot;

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

      {/*
        Footage of the real site outranks the renders, so it leads. Only a
        handful of projects have any — see the note on `film` in the schema.
      */}
      {project.film && <ProjectFilm film={project.film} label={project.name} />}

      {/* Walking the rooms beats looking at them, so the tour leads the page. */}
      {project.tour && (
        <ProjectTour tour={project.tour} name={project.name} poster={cover} />
      )}

      {/*
        Three or more photographs earn the scroll sequence; below that it
        would be a transition looking for something to transition between,
        and the still is the better answer.
      */}
      {project.gallery.length >= 3 ? (
        <CinematicSequence shots={project.gallery} />
      ) : (
        cover && (
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
        )
      )}

      {/*
        Everything below follows the client's reference design (17 September),
        in the order of §11's questions: what it is, what there is to choose,
        what it costs, what comes with it, whether it is safe, what it looks
        like, and how to see it.
      */}
      <Overview project={project} shot={overviewShot} />

      <div className="mx-auto max-w-[86rem] px-6 sm:px-10 lg:px-16">
        {/* ─────────────────────────────── 2. What
            §11 puts the plan at the centre of the page, high, not buried. */}
        {scene && !soldOut && (
          <DetailSection>
            <SectionHead
              eyebrow="What"
              title={`Choose your ${singularNoun(unitNoun).toLowerCase()}`}
            />
            <div className="mt-12">
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
            </div>
            <p className="mt-8">
              <Link
                href={`/projects/${project.slug}/plan`}
                className="u-mono inline-flex items-center gap-3 border-b border-ink pb-1.5 tracking-[0.2em] text-ink transition-colors duration-hover ease-hover hover:border-laterite hover:text-laterite"
              >
                Open the full plan
                <ArrowRightIcon className="size-4" />
              </Link>
            </p>
          </DetailSection>
        )}

        {soldOut && (
          <DetailSection>
            <SectionHead eyebrow="Status" title="Fully sold" aside={ASIDES.status} />
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
              Every {unitNoun.replace(/s$/, "").toLowerCase()} at {project.name}{" "}
              has been sold. The specifications, amenities and approvals below
              describe what was built.
            </p>
            <Link
              href="/projects"
              className="u-mono mt-10 inline-flex items-center gap-5 border border-ink px-8 py-5 tracking-[0.2em] text-ink transition-colors duration-hover ease-hover hover:bg-ink hover:text-paper"
            >
              Explore our other projects
              <ArrowRightIcon className="size-4" />
            </Link>
          </DetailSection>
        )}

        {/* ─────────────────────────────── 3. How much */}
        {project.configurations.length > 0 && <Configurations project={project} />}

        {project.amenities.length > 0 && <AmenitiesGrid project={project} />}

        {project.specifications.length > 0 && (
          <Specifications project={project} shots={panelShots} />
        )}

        {project.connectivity.length > 0 && (
          <DetailSection>
            <SectionHead eyebrow="Nearby" title="Connectivity" lede={LEDES.connectivity} />
            {/* Phase 3 draws these on the city model (§11). The list carries
                the same data and stays as the permanent fallback. */}
            <ul className="mt-12 grid gap-x-10 sm:grid-cols-2">
              {project.connectivity.map((c) => (
                <li
                  key={c.name}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-4"
                >
                  <span className="text-lg">
                    {c.name}
                    <span className="u-mono ml-3 text-muted">
                      {CATEGORY_LABELS[c.category]}
                    </span>
                  </span>
                  <span className="u-mono shrink-0 text-ink">
                    {[
                      c.distanceKm !== undefined ? `${c.distanceKm} km` : null,
                      c.travelMinutes !== undefined
                        ? `${c.travelMinutes} min`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

        {/* ─────────────────────────────── 4. Is it safe */}
        <DetailSection>
          <SectionHead
            eyebrow="Is it safe"
            title="Approvals and assurances"
            lede={LEDES.approvals}
            aside={ASIDES.approvals}
          />
          <div className="mt-12">
            <Approvals project={project} />
          </div>
        </DetailSection>

        {/* ─────────────────────────────── 5. See it */}
        {project.gallery.length > 0 && (
          <DetailSection id="gallery">
            <SectionHead
              eyebrow="See it"
              title="Gallery"
              lede={LEDES.gallery}
              aside={ASIDES.gallery}
            />
            <div className="mt-12">
              <Gallery shots={project.gallery} projectName={project.name} />
            </div>
            <ClosingLine lines={CLOSING.gallery}>
              <Link
                href={scene ? `/projects/${project.slug}/plan` : "/projects"}
                className="u-mono inline-flex items-center gap-6 self-start border-b border-ink pb-2 tracking-[0.2em] text-ink transition-colors duration-hover ease-hover hover:border-laterite hover:text-laterite sm:self-auto"
              >
                {scene ? "Explore the project" : "Explore our projects"}
                <ArrowRightIcon className="size-4" />
              </Link>
            </ClosingLine>
          </DetailSection>
        )}
      </div>

      <Visit project={project} shot={visitShot} />

      <div className="mx-auto max-w-[86rem] px-6 sm:px-10 lg:px-16">
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
