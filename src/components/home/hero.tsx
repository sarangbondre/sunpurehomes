import Image from "next/image";
import Link from "next/link";
import { HeroVideo } from "@/components/home/hero-video";

/**
 * The full-bleed cinematic hero, built to the reference the client sent
 * (lahontanrealty.com): the site's own footage running edge to edge, the
 * brand line set over it, and nothing else competing for the first screen.
 *
 * The headline wording stays "Thoughtfully Built. Deeply Lived." because
 * §14 requires one tagline site-wide and that is the one the client
 * approved.
 *
 * BOTH LINES ARE SET IN PAPER, not the two-tone ink/laterite of the earlier
 * split hero. Laterite over footage is unreadable: against a bright sky
 * behind an 85% scrim it measures 3.27:1, which fails AA for text. Paper on
 * the same ground measures 9.65:1. Laterite survives only on the rule and
 * the CTA border, where 3:1 for non-text applies.
 *
 * The media is a typed field, so swapping the clip is a data change (§15).
 */
export type HeroMedia =
  | { kind: "image"; src: string; alt: string }
  | {
      kind: "video";
      /** Web-encoded H.264 MP4. The poster carries the frame until it plays. */
      src: string;
      /** Also the LCP element, and the whole hero when motion is reduced. */
      poster: string;
      alt: string;
    };

export function Hero({ media }: { media?: HeroMedia }) {
  const poster = media?.kind === "video" ? media.poster : media?.src;

  return (
    <section className="relative isolate flex h-[calc(100svh-5rem)] min-h-[32rem] w-full flex-col justify-end overflow-hidden bg-ink sm:h-[calc(100svh-6rem)]">
      {/*
        The still is the LCP element and is fetched at high priority. The
        clip is deliberately NOT preloaded — HeroVideo attaches its source
        after mount so a multi-megabyte download never races the poster.
      */}
      {poster && (
        <Image
          src={poster}
          alt={media?.alt ?? ""}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
      )}

      {media?.kind === "video" && (
        <HeroVideo src={media.src} poster={media.poster} />
      )}

      {/*
        Two scrims. The base tint settles the whole frame; the band carries
        the text zone to the 85% that measured safe. Decorative, so aria-hidden.
      */}
      <div aria-hidden className="absolute inset-0 bg-ink/35" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-ink via-ink/85 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[86rem] px-6 pb-14 sm:px-10 sm:pb-20 lg:px-16 lg:pb-24">
        <h1 className="max-w-[18ch] text-balance text-paper text-[clamp(2.75rem,7vw,5.5rem)]">
          Thoughtfully&nbsp;Built.
          <span className="block">Deeply&nbsp;Lived.</span>
        </h1>

        <span aria-hidden className="mt-9 block h-px w-32 bg-laterite" />

        <div className="mt-9">
          <Link
            href="/projects"
            className="u-mono inline-flex items-center gap-3 rounded-full border border-paper/70 px-6 py-3 text-paper transition-colors duration-hover ease-hover hover:bg-paper hover:text-ink"
          >
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
      </div>
    </section>
  );
}
