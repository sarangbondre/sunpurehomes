import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

/**
 * The split hero from the client's reference: a warm panel carrying the
 * brand line on the left, a full-bleed photograph bleeding off the right
 * edge, and the seam between them labelled.
 *
 * The reference sets the headline in two tones — the first line in ink, the
 * second in terracotta. The wording here stays "Thoughtfully Built. Deeply
 * Lived." because §14 requires one tagline site-wide and that is the one the
 * client approved; the reference's "Built on thought. Lived deeply." is a
 * rewording of a line that was retired.
 *
 * The photograph is a typed field, so swapping it is a data change (§15).
 */
export type HeroMedia =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster: string; alt: string };

export function Hero({ media }: { media?: HeroMedia }) {
  return (
    <section className="relative bg-paper lg:grid lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[42fr_58fr]">
      {/* ── Left: the brand panel */}
      <div className="relative flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-24 lg:py-0 lg:pl-16 lg:pr-14">
        <h1 className="text-[clamp(2.75rem,6.2vw,4.6rem)]">
          Thoughtfully&nbsp;Built.
          <span className="mt-1 block text-laterite">Deeply&nbsp;Lived.</span>
        </h1>

        <p className="mt-7 max-w-[34ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
          A residential venture of the {site.group.name} — the family behind{" "}
          {site.group.consumerBrand}, refining in {site.city} for more than{" "}
          {site.legacyYears} years.
        </p>

        <span aria-hidden className="mt-10 block h-px w-32 bg-laterite/45" />

        <div className="mt-10">
          <Link href="/projects" className="u-cta">
            Discover our projects
            <svg
              aria-hidden
              viewBox="0 0 24 12"
              className="h-2.5 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M0 6h22M17 1l5 5-5 5" />
            </svg>
          </Link>
        </div>

        {/* The seam label from the reference. Decorative, and only where
            there is a seam to label. */}
        <span
          aria-hidden
          className="u-mono absolute right-5 top-1/2 hidden -translate-y-1/2 rotate-90 whitespace-nowrap text-muted lg:block"
        >
          01 &mdash; Featured home
        </span>
      </div>

      {/* ── Right: the photograph */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-paper-2 sm:aspect-16/10 lg:aspect-auto lg:h-full">
        <HeroMediaLayer media={media} />
      </div>
    </section>
  );
}

function HeroMediaLayer({ media }: { media?: HeroMedia }) {
  if (media?.kind === "image") {
    return (
      <Image
        src={media.src}
        alt={media.alt}
        fill
        priority
        fetchPriority="high"
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="object-cover"
      />
    );
  }

  if (media?.kind === "video") {
    return (
      <video
        className="size-full object-cover"
        src={media.src}
        poster={media.poster}
        aria-label={media.alt}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  // No photograph supplied: a quiet tonal field rather than stock imagery.
  return (
    <div aria-hidden className="absolute inset-0 bg-paper-2">
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-mist/70 to-transparent" />
    </div>
  );
}
