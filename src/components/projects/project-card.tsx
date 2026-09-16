import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, PinIcon } from "@/components/brand/icons";
import { STATUS_LABELS, TYPE_LABELS, getCoverImage } from "@/lib/content";
import type { Project } from "@/lib/schema";
import { site } from "@/lib/site";

/**
 * A project as a picture, to the client's reference design: the type at the
 * top, the name and place at the foot, and an arrow into the project.
 *
 * §11 still holds — image, name, type, location and status, nothing else. The
 * reference shows only the type; the status rides beside it because "fully
 * sold" and "completed" are the first things a buyer needs to know, and the
 * live site's cards were the place that information went missing.
 *
 * The type sits on a short fall of shade at the top, and the name and place
 * on a deeper one at the foot. Both are needed because the photographs are
 * not ours to choose: several have bright skies exactly where the text goes.
 */
export function ProjectCard({
  project,
  soldOut = false,
  priority = false,
}: {
  project: Project;
  soldOut?: boolean;
  /** Set on the first row so the LCP image is not lazy-loaded (§9.4). */
  priority?: boolean;
}) {
  const cover = getCoverImage(project);
  const place = project.location.label.includes(site.city)
    ? project.location.label
    : `${project.location.label}, ${site.city}`;
  const status = soldOut ? "Fully sold" : STATUS_LABELS[project.status];

  return (
    <article className="h-full">
      <Link
        href={`/projects/${project.slug}`}
        className="group relative block aspect-[1.08] overflow-hidden rounded-sm bg-ink focus-visible:outline-offset-4"
      >
        {cover && (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 94vw"
            className="object-cover transition-transform duration-[700ms] ease-enter group-hover:scale-[1.04]"
          />
        )}

        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/90 via-ink/60 via-45% to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink/95 via-ink/70 via-50% to-transparent"
        />

        <p className="u-mono absolute left-5 top-5 text-paper sm:left-6 sm:top-6">
          {TYPE_LABELS[project.type]}
          <span aria-hidden className="mx-2 text-paper/60">
            ·
          </span>
          {status}
        </p>

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
          <div className="min-w-0">
            <h3 className="font-display text-[clamp(1.75rem,2.6vw,2.2rem)] leading-tight text-paper">
              {project.name}
            </h3>
            <p className="mt-2 flex items-start gap-1.5 text-[0.9rem] leading-snug text-paper">
              <PinIcon className="mt-0.5 size-4" />
              <span>{place}</span>
            </p>
          </div>
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-paper/80 text-paper transition-colors duration-hover ease-hover group-hover:border-paper group-hover:bg-paper group-hover:text-ink"
          >
            <ArrowRightIcon className="size-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
