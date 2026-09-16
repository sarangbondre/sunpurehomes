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
 *
 * Restored on 16 September. The page went full bleed for two days — one
 * picture edge to edge with paper type over it — and the client asked for
 * this back, so this is that design again, with the Curve render it carried.
 *
 * The picture is a 70% column carrying the first grading of the Curve
 * render, where the sun sits low and to the RIGHT of the building. That is
 * the version the client picked out of two, and it is the one the crop is
 * built around.
 *
 * The column is much taller than the frame is deep, so on most windows the
 * picture is cropped hard from the sides and only a short window shows the
 * whole width. Anchored at 75% rather than left, what survives that crop is
 * the building, the sun behind it and the treeline — anchored left the sun
 * is the first thing to go. That is the measurement to re-check if the
 * image or the column width ever changes: a sun outside the crop, or inside
 * the wash, is a sun the client cannot see.
 */
export function Hero({ image }: { image: HeroImage }) {
  return (
    <section className="relative overflow-hidden bg-paper lg:min-h-svh">
      {/* ── Text, over the wash */}
      <div /*
           The top padding clears the header, which is absolute over this
           hero and grew when the wordmark did. At lg the block is centred
           and the padding is only a floor — it matters on a short window.
         */
        className="relative z-10 flex flex-col justify-center px-6 pb-14 pt-28 sm:px-10 sm:pt-32 lg:min-h-svh lg:max-w-[42%] lg:py-0 lg:pl-16 lg:pr-10 lg:pt-32">
        <p className="u-mono leading-[1.9] text-muted">
          Spaces for a
          <br />
          more meaningful tomorrow
        </p>
        <span aria-hidden className="mt-5 block h-px w-20 bg-line" />

        <h1 className="mt-10 text-[clamp(2.6rem,4.8vw,4.6rem)] leading-[1.08] text-ink">
          Thoughtfully&nbsp;Built,
          {/*
            --laterite, the brand orange the previous site gives "Thought."
            in "Built on Thought.", at the client's instruction on 15
            September. On paper it measures 2.95:1, a hair under the 3:1
            large-text floor — --accent-ink exists as the deepened stand-in
            and clears it at 4.51:1. The client asked for this one, and
            their own site sets it this way; the trade is recorded here so
            nobody has to rediscover it.
          */}
          <span className="mt-1 block text-laterite">Deeply&nbsp;Lived.</span>
        </h1>

        <div className="mt-12">
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
      <div className="relative aspect-4/3 w-full sm:aspect-16/9 lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[70%]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="object-cover object-[75%_center]"
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
          className="absolute inset-0 bg-gradient-to-b from-paper from-0% via-paper/92 via-13% to-transparent to-27% lg:bg-gradient-to-r"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-paper to-transparent"
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-0 hidden h-[24rem] w-[22rem] bg-[radial-gradient(ellipse_at_bottom_right,rgba(28,26,24,0.94)_0%,rgba(28,26,24,0.72)_34%,rgba(28,26,24,0.3)_58%,transparent_80%)] lg:block"
        />

        <p className="u-mono absolute bottom-9 right-8 hidden text-right leading-[2] text-paper lg:block">
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
