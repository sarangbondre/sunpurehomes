import Image from "next/image";
import { formatIndianNumber } from "@/lib/format";
import type { Project } from "@/lib/schema";

/**
 * The first thing after the pictures, to the client's reference design: the
 * project's name as a label, a headline, its description, the scale in
 * figures with a line about the homes beside it, and a picture that fades in
 * from the right with the place named on it.
 *
 * The headline and the homes line are the project's own content
 * (`headline`, `homesLine`); a project without them falls back to its
 * tagline and the configurations it offers.
 */
export function Overview({
  project,
  shot,
}: {
  project: Project;
  shot?: { src: string; alt: string };
}) {
  const { acres, unitCount, unitNoun, floors, parking } = project.scale;
  // The configurations, named once each: "2 BHK · 3 BHK".
  const kinds = [...new Set(project.configurations.map((c) => c.label.split(" · ")[0]))];
  const homesLine =
    project.homesLine ??
    (project.type !== "plot" && kinds.length > 0 && kinds.length <= 3
      ? kinds.join(" · ")
      : undefined);
  const figures = [
    unitCount !== undefined && { label: unitNoun, value: formatIndianNumber(unitCount) },
    acres !== undefined && { label: "Acres", value: String(acres) },
    floors && { label: "Floors", value: floors },
  ].filter((f): f is { label: string; value: string } => Boolean(f));

  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      {/*
        Full width, so the picture runs to the edge of the screen; the text
        column is padded to line up with the page's 86rem measure.
      */}
      <div className="grid lg:grid-cols-2">
        <div className="px-6 py-16 sm:px-10 sm:py-24 lg:py-28 lg:pl-[max(4rem,calc((100vw-86rem)/2+4rem))] lg:pr-12">
          <p className="u-mono flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8rem] tracking-[0.22em] text-ink-soft">
            {project.name}
            {project.category && (
              <>
                <span aria-hidden>·</span>
                {project.category}
              </>
            )}
            <span aria-hidden className="h-px w-16 bg-ink/25 sm:w-24" />
          </p>
          <h2 className="mt-5 max-w-[13ch] text-[clamp(2.75rem,6vw,5rem)] leading-[1.02] tracking-[-0.01em]">
            {project.headline ?? project.tagline}
          </h2>
          <p className="mt-8 max-w-[48ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
            {project.description}
          </p>

          {(figures.length > 0 || homesLine) && (
            <dl className="mt-12 flex flex-wrap items-stretch gap-x-10 gap-y-8">
              {figures.map((f) => (
                <div key={f.label}>
                  <dt className="u-mono tracking-[0.2em] text-muted">{f.label}</dt>
                  <dd className="mt-2 font-display text-[clamp(3rem,6vw,4.5rem)] leading-none">
                    {f.value}
                  </dd>
                </div>
              ))}
              {homesLine && (
                <div className="flex max-w-[16rem] items-center border-line sm:border-l sm:pl-10">
                  <div>
                    <dt className="sr-only">The homes</dt>
                    <dd className="font-display text-[clamp(1.4rem,2.2vw,1.75rem)] leading-snug text-ink">
                      {homesLine}
                    </dd>
                    {parking && (
                      <dd className="u-mono mt-3 tracking-[0.18em] text-muted">
                        Parking · {parking}
                      </dd>
                    )}
                  </div>
                </div>
              )}
            </dl>
          )}
        </div>

        {shot && (
          <div className="relative min-h-[22rem] sm:min-h-[28rem]">
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            {/* Fades into the page on the side the text is. */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-paper to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-1/3 lg:bg-gradient-to-r"
            />
            {/*
              On its own dark pill: the pictures range from bright lawn to
              white sky, and a shade alone let the name fall to 1.3:1.
            */}
            <p className="u-mono absolute bottom-6 right-6 flex items-center gap-3 rounded-full bg-ink/75 px-4 py-2 text-paper backdrop-blur-sm">
              <span aria-hidden className="h-px w-6 bg-paper/70" />
              {project.location.label}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
