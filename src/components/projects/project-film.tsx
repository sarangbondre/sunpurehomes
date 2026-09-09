import Image from "next/image";
import { AutoplayVideo } from "@/components/media/autoplay-video";
import type { Project } from "@/lib/schema";
import { formatDayMonthYear } from "@/lib/format";

/**
 * Drone footage of the project, full-bleed.
 *
 * The renders elsewhere on the page show the intent; this shows the site as
 * it actually is, which is the thing a buyer cannot get anywhere else. The
 * capture date is printed for exactly that reason — footage of a development
 * under construction is only meaningful if you know when it was taken.
 */
export function ProjectFilm({ film, name }: { film: NonNullable<Project["film"]>; name: string }) {
  return (
    <figure className="relative isolate mt-16 w-full overflow-hidden bg-ink sm:mt-24">
      <div className="relative aspect-4/3 w-full sm:aspect-16/9">
        <Image
          src={film.poster}
          alt={film.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <AutoplayVideo src={film.src} />
      </div>

      <figcaption className="u-mono flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 bg-ink px-6 py-5 text-paper/75 sm:px-10 lg:px-16">
        <span>{name} from the air</span>
        <span>Filmed {formatDayMonthYear(film.captured)}</span>
      </figcaption>
    </figure>
  );
}
