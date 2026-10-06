import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects, getProject, sortProjects } from "@/lib/content";
import { embedSrc, getFilms, groupFilms, watchHref } from "@/lib/films";
import { isFullySold } from "@/lib/scenes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Films",
  description: `Walkthroughs and films of every ${site.name} development in ${site.city}.`,
};

/**
 * The brand's films, at the client's instruction of 6 October, grouped by the
 * development each one is about. lib/films.ts records where the list came
 * from and why three of the seventeen are filed under the company instead.
 *
 * The developments run in the same order /projects shows them, read from the
 * same function, so the two pages cannot disagree about which comes first.
 *
 * THE PLAYERS LOAD WITH THE PAGE, at the client's choice of 6 October over a
 * click-to-load still. Two things keep that from being as heavy as it sounds
 * and neither changes what they asked for: the embeds come from
 * youtube-nocookie.com, which sets no tracking cookie until a film is played,
 * and each iframe is loading="lazy", so the ones below the fold fetch as they
 * are scrolled to rather than seventeen players at once on open. A visitor
 * still finds a ready player wherever they look, with nothing to click first.
 *
 * This is a first pass for the client to look at. What else belongs here —
 * each development's locality and map, stills from its gallery — is their
 * decision to make once they have seen it.
 */
export default function FilmsPage() {
  const order = sortProjects(getAllProjects(), "featured", isFullySold).map(
    (project) => project.slug,
  );
  const groups = groupFilms(getFilms(), order);

  return (
    <main className="mx-auto max-w-[86rem] px-6 pb-20 sm:px-10 lg:px-16">
      <header className="pb-4 pt-12 sm:pt-16 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-16">
        <h1 className="u-mono text-[1.05rem] leading-snug tracking-[0.14em] text-laterite sm:text-[1.2rem]">
          Films
        </h1>
        <div className="lg:col-start-2">
          <p className="mt-8 max-w-[52ch] leading-relaxed text-ink-soft sm:text-lg lg:mt-0 lg:text-xl">
            Walkthroughs and films of our developments across {site.city}, from
            our{" "}
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-ink underline underline-offset-4"
            >
              YouTube channel
            </a>
            .
          </p>
        </div>
      </header>

      <div className="mt-2">
        {groups.map((group) => {
          const project = group.project ? getProject(group.project) : undefined;

          return (
            <section
              key={group.project ?? "house"}
              aria-labelledby={`films-${group.project ?? "house"}`}
              className="border-t border-line py-10 sm:py-14 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-16"
            >
              <div>
                <h2
                  id={`films-${group.project ?? "house"}`}
                  className="font-display text-2xl leading-tight text-ink sm:text-3xl"
                >
                  {project?.name ?? site.name}
                </h2>
                {project && (
                  <p className="u-mono mt-3 text-muted">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="text-accent-ink underline underline-offset-4 transition-colors duration-hover ease-hover hover:text-ink"
                    >
                      See the development
                    </Link>
                  </p>
                )}
              </div>

              <ul className="mt-8 grid gap-8 lg:mt-0 lg:grid-cols-2">
                {group.films.map((film) => (
                  <li key={film.id}>
                    {/*
                      The frame owns the ratio and the iframe fills it, because
                      YouTube's own width and height attributes are a 200x113
                      thumbnail's and would letterbox the player at any other
                      size.
                    */}
                    <div className="relative aspect-video overflow-hidden rounded-md border border-line bg-paper-2">
                      <iframe
                        src={embedSrc(film)}
                        title={film.title}
                        loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 size-full"
                      />
                    </div>
                    {/*
                      The title under the player as well as inside it. The
                      iframe's own title is what a screen reader announces for
                      the frame, and it is not visible until the player has
                      drawn itself — which on a slow connection is after the
                      reader has decided whether to wait.
                    */}
                    <p className="mt-3 leading-snug text-ink-soft">
                      <a
                        href={watchHref(film)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-line underline-offset-4 transition-colors duration-hover ease-hover hover:decoration-accent-ink hover:text-ink"
                      >
                        {film.title}
                      </a>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
