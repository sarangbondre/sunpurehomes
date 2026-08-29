import Image from "next/image";
import Link from "next/link";
import { StatusChip } from "@/components/projects/status-chip";
import { TYPE_LABELS_ONE, getCoverImage } from "@/lib/content";
import type { Project } from "@/lib/schema";

/**
 * §11: image, name, type · location, status chip. Nothing else.
 *
 * The live cards render each description twice and append a tenth project
 * that does not exist (§2, defects 3 and 4). Keeping the card to exactly the
 * four things above is what stops that class of bug recurring.
 */
export function ProjectCard({ project }: { project: Project }) {
  const cover = getCoverImage(project);

  return (
    <article>
      <Link href={`/projects/${project.slug}`} className="group block">
        <div className="relative aspect-4/3 overflow-hidden rounded-sm bg-paper-2">
          {cover && (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
              className="object-cover transition-transform duration-[600ms] ease-enter group-hover:scale-[1.03]"
            />
          )}
        </div>

        <h3 className="mt-5 text-3xl group-hover:text-canopy">{project.name}</h3>

        <p className="mt-1 text-ink-soft">
          {TYPE_LABELS_ONE[project.type]} · {project.location.label}
        </p>
      </Link>

      <div className="mt-3">
        <StatusChip status={project.status} type={project.type} />
      </div>
    </article>
  );
}
