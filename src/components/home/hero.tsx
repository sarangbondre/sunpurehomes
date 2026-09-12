import Image from "next/image";
import Link from "next/link";

export type HeroImage = { src: string; alt: string };

/**
 * The landing hero, to the client's reference design: the brand line on the
 * paper ground at the left, the photograph bleeding in from the right, and a
 * soft wash between them rather than a seam.
 *
 * The wash does a second job beyond looking like one canvas — it is why the
 * header can sit over the picture with no bar of its own and stay legible.
 *
 * One picture, not a rotation. That is a plain server component again: no
 * state, no interval, no reduced-motion branch, and no pause control, since
 * WCAG 2.2.2 only applies to something that moves. The home page ships no
 * client JavaScript of its own as a result.
 */
export function Hero({ image }: { image: HeroImage }) {
  return (
    <section className="relative overflow-hidden bg-paper lg:min-h-svh">
      {/* ── Text, over the wash */}
      <div className="relative z-10 flex flex-col justify-center px-6 pb-14 pt-14 sm:px-10 sm:pt-16 lg:min-h-svh lg:max-w-[52%] lg:py-0 lg:pl-16 lg:pr-8 lg:pt-24">
        <p className="u-mono leading-[1.9] text-muted">
          Spaces for a
          <br />
          more meaningful tomorrow
        </p>
        <span aria-hidden className="mt-5 block h-px w-20 bg-line" />

        <h1 className="mt-8 text-[clamp(2.75rem,5.4vw,4.9rem)] text-ink">
          Thoughtfully&nbsp;Built,
          <span className="mt-1 block text-accent-ink">Deeply&nbsp;Lived.</span>
        </h1>

        <div className="mt-10">
          <Link
            href="/projects"
            className="u-mono inline-flex items-center gap-4 border border-ink/25 px-7 py-5 text-ink transition-colors duration-hover ease-hover hover:border-ink hover:bg-ink hover:text-paper"
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

      {/* ── The photograph. In flow beneath the text on small screens; at lg it
             fills the right of the section and washes into the paper. */}
      <div className="relative aspect-4/5 w-full sm:aspect-16/10 lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[64%]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 64vw, 100vw"
          className="object-cover"
        />

        {/*
          Three washes, all decorative. The first dissolves the left edge into
          the panel. The second keeps the top light enough for the nav and the
          WhatsApp pill to sit over the picture. The third does the same for
          the caption in the corner — as literal rgba, because
          var(--color-ink)/0.55 does not parse inside a gradient and was
          being dropped silently.
        */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-paper from-0% via-paper/40 via-10% to-transparent to-26% lg:bg-gradient-to-r"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-paper to-transparent"
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-0 hidden h-[28rem] w-[34rem] bg-[radial-gradient(ellipse_at_bottom_right,rgba(28,26,24,0.94)_0%,rgba(28,26,24,0.72)_32%,rgba(28,26,24,0.3)_55%,transparent_78%)] lg:block"
        />

        <p className="u-mono absolute bottom-10 right-10 hidden text-right leading-[2] text-paper lg:block">
          Homes
          <br />
          for a
          <br />
          brighter
          <br />
          tomorrow
          <span aria-hidden className="mt-3 ml-auto block h-px w-10 bg-paper/70" />
        </p>
      </div>
    </section>
  );
}
