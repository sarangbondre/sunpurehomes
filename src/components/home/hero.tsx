import Image from "next/image";
import { site } from "@/lib/site";

/**
 * BRIEF.md §11 — Hero: full-bleed film or still, one line of tagline, one
 * supporting sentence about the legacy. No carousel. No badge stack.
 * Nothing else competes.
 *
 * The film/still does not exist yet. Rather than ship stock imagery that
 * pretends to be a Sunpure project, the media is a typed optional field:
 * absent, the hero renders a tonal field built from the palette; present,
 * it drops straight in. Swapping it is a data change, not a rebuild.
 */
export type HeroMedia =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster: string; alt: string };

export function Hero({ media }: { media?: HeroMedia }) {
  return (
    <section // A floor as well as a ceiling: sized purely to the viewport, the hero
    // collapsed on a phone held sideways until the scrims met in the middle
    // and swallowed the photograph.
    className="relative isolate flex min-h-[max(30rem,calc(100svh-4rem))] flex-col sm:min-h-[max(32rem,calc(100svh-5rem))]">
      <HeroBackdrop media={media} />

      <div className="relative z-10 mt-auto px-6 pb-16 sm:px-10 sm:pb-20 lg:px-16 lg:pb-24">
        {/*
          The reading scrim is tied to the text block, not to the viewport.
          Sized as a share of the hero it could not guarantee anything: on a
          tall phone the eyebrow landed high enough to sit over the palace
          facade at half opacity and became unreadable. Anchored here it
          always covers the text with the same fade above it, whatever the
          photograph or the screen.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-32 bottom-0 -z-10 bg-gradient-to-t from-paper via-paper/96 via-78% to-transparent"
        />

        <p className="u-mono text-canopy">
          {site.city} · {site.region}
        </p>

        <h1 className="mt-6 max-w-[16ch] text-[clamp(3rem,10vw,7.5rem)]">
          Thoughtfully Built.{" "}
          <em className="italic">Deeply&nbsp;Lived.</em>
        </h1>

        <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
          A residential venture of the {site.group.name} — the family behind{" "}
          {site.group.consumerBrand}, refining in {site.city} for more than{" "}
          {site.legacyYears} years.
        </p>
      </div>
    </section>
  );
}

function HeroBackdrop({ media }: { media?: HeroMedia }) {
  if (media?.kind === "image") {
    return (
      <div className="absolute inset-0 -z-10">
        <Image
          src={media.src}
          alt={media.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[center_34%] [filter:saturate(0.8)_contrast(1.02)]"
        />
        {/* Pulls the photo's warmth toward the cool palette (§8) without
            draining it, and keeps the mark and the headline legible. */}
        <div className="absolute inset-0 bg-mist/15 mix-blend-color" />
        {/*
          Both scrims are capped in absolute units as well as percentages.
          Sized purely as a percentage of the hero, they overlapped on a short
          viewport — a phone held sideways, or a small laptop window — and
          between them erased the photograph completely.
        */}
        <div className="absolute inset-x-0 top-0 h-[min(18%,6rem)] bg-gradient-to-b from-paper/70 to-transparent" />
      </div>
    );
  }

  if (media?.kind === "video") {
    return (
      <div className="absolute inset-0 -z-10">
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
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/55 to-paper/10" />
      </div>
    );
  }

  return <HeroField />;
}

/**
 * The stand-in until the client supplies footage: a still, tonal field in the
 * §8 palette. Decorative, so it is hidden from assistive technology. No
 * motion — motion here would be decoration, and §8 forbids that.
 */
function HeroField() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-paper" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-b from-transparent via-mist/35 to-mist/60" />
      <div
        className="absolute inset-x-0 bottom-0 h-[38%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to top, transparent 0 46px, var(--color-line) 46px 47px)",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-px bg-line" />
    </div>
  );
}
