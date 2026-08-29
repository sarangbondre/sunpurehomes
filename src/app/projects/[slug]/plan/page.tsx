import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlanExplorer } from "@/components/plan/plan-explorer";
import { getProject, getProjectSlugs } from "@/lib/content";
import { getAvailability, getScene, hasPlan } from "@/lib/scenes";
import { singularNoun } from "@/lib/nouns";

export function generateStaticParams() {
  return getProjectSlugs()
    .filter(hasPlan)
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.name} — plan`,
    description: `Explore the ${project.name} layout ${project.scale.unitCount ? `— ${project.scale.unitCount} ${project.scale.unitNoun} ` : ""}and check availability.`,
  };
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const scene = getScene(slug);
  if (!scene) notFound();

  const availability = getAvailability(slug);
  const noun = project.scale.unitNoun;

  return (
    <main className="mx-auto max-w-[86rem] px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
      <nav aria-label="Breadcrumb" className="u-mono">
        <Link href="/projects" className="text-muted hover:text-ink">
          Projects
        </Link>
        <span className="mx-2 text-muted">/</span>
        <Link href={`/projects/${slug}`} className="text-muted hover:text-ink">
          {project.name}
        </Link>
        <span className="mx-2 text-muted">/</span>
        <span className="text-ink">Plan</span>
      </nav>

      <header className="mt-8 max-w-[52rem]">
        <h1 className="text-[clamp(2.25rem,6vw,4rem)]">
          {project.name} <em className="italic">plan</em>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          {scene.units.length} {noun}
          {project.scale.acres ? ` across ${project.scale.acres} acres` : ""}.
          Select one to see its dimensions, orientation and status.
        </p>
      </header>

      <div className="mt-12">
        {/* useSearchParams needs a Suspense boundary so the rest of the page
            can still be prerendered as static HTML. */}
        <Suspense
          fallback={
            <p className="u-mono text-muted">Loading the plan…</p>
          }
        >
          <PlanExplorer
            scene={scene}
            availability={availability}
            projectName={project.name}
            projectSlug={slug}
            unitNoun={noun}
            unitNounSingular={singularNoun(noun)}
          />
        </Suspense>
      </div>
    </main>
  );
}
