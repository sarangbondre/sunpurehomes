import Image from "next/image";
import Link from "next/link";

export type HeroImage = { src: string; alt: string };

/**
 * The landing page: one picture, edge to edge and the full height of the
 * screen, with the brand line over it.
 *
 * Full bleed at the client's instruction on 17 September — "the entire
 * landing page has to be full of only image". It replaces the split design
 * (paper column left, picture right) that ran from 16 September.
 *
 * The type is ink and the accent red, as before, so it sits on light rather
 * than dark: a paper haze falls from the top-left corner, over the sky, and
 * fades out well before the building. It is what keeps the headline, the
 * red "Deeply Lived." (4.86:1 on paper) and the header readable on every
 * crop, and it is the only thing laid over the picture on the left.
 *
 * The source is 1440px wide — the client's current file. A larger original
 * at the same path (see src/lib/home-showcase.ts) sharpens this with no code
 * change; next/image serves the width each screen needs.
 *
 * One picture, not a rotation: a plain server component with no client
 * JavaScript, and nothing that moves, so WCAG 2.2.2 does not apply.
 */
export function Hero({ image }: { image: HeroImage }) {
  return (
    <section className="relative isolate min-h-svh overflow-hidden bg-paper">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        /*
          Moved right at the client's instruction on 2 October. A lower
          percentage aligns an earlier slice of the picture with the left of
          the frame, so the building travels right — at 1440x900 the 30% here
          carries it about 70px clear of the brand line, and more on a taller
          screen, where the crop is wider.

          On a portrait phone the frame keeps a narrow strip, so it shifts
          less: below 50% the sun falls off the right edge.
        */
        className="-z-10 object-cover object-[52%_center] lg:object-[30%_center]"
      />

      {/*
        Two washes, both decorative. The first is the haze the type sits on:
        from the top-left on wide screens, from the top on phones, where the
        text runs full width above the building. The second clears the top
        edge for the header on the right, where the menu sits.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-paper/94 from-0% via-paper/88 via-40% to-transparent to-62% lg:bg-[radial-gradient(ellipse_62%_85%_at_0%_45%,rgba(244,240,231,0.95)_0%,rgba(244,240,231,0.86)_46%,rgba(244,240,231,0.45)_72%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-paper/90 via-paper/55 to-transparent"
      />

      {/*
        The top padding clears the header, which is absolute over this hero.
        At lg the block is centred and the padding is only a floor.
      */}
      <div className="flex min-h-svh flex-col px-6 pb-16 pt-28 sm:px-10 sm:pt-32 lg:max-w-[50%] lg:justify-center lg:pb-32 lg:pl-16 lg:pr-10 lg:pt-28 lg:[@media(max-height:700px)]:pb-16">
        {/* The brand line stands alone: the eyebrow above it was removed on
            29 September at the client's instruction. */}
        {/*
          "Thoughtfully Built," never wraps and measures 6.21 times the font
          size, so the vw factor is the largest that still fits at 320px on a
          phone and in half the screen at lg. Change the words and re-measure.
        */}
        {/*
          The brand line stands on paper, not on the picture: the client asked
          on 2 October for no image behind it.

          A blurred paper shape rather than a gradient. A gradient is clipped
          by its own box, so the fade stopped dead at the edge and the line
          sat in a visible rectangle; blurring a solid shape puts the fade
          outside the box, where there is room for it. The core stays fully
          opaque, so no picture shows through the words, and the hero still
          reads as one photograph under a wash rather than the split panel
          this design had in September.
        */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 rounded-[30%] bg-paper blur-2xl"
          />
          <h1 className="text-[clamp(2.6rem,12.5vw,4.5rem)] leading-[1.08] text-ink lg:text-[clamp(3rem,6vw,6.5rem)]">
            Thoughtfully&nbsp;Built,
            <span className="mt-1 block text-laterite">Deeply&nbsp;Lived.</span>
          </h1>
        </div>

        <div className="mt-12">
          <Link
            href="/projects"
            className="u-mono inline-flex items-center gap-4 border border-ink/30 bg-paper/60 px-7 py-5 text-ink backdrop-blur-[2px] transition-colors duration-hover ease-hover hover:border-laterite hover:bg-laterite hover:text-paper"
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

      {/*
        The corner caption, on its own soft shade in the water's reflection. The shade is sized to its box so no edge shows, and written as
        literal rgba because a colour token with an alpha does not parse
        inside a gradient.
      */}
      <div
        aria-hidden
        className="absolute bottom-0 right-0 -z-10 hidden h-[32rem] w-[24rem] bg-[radial-gradient(ellipse_100%_100%_at_bottom_right,rgba(28,26,24,0.94)_0%,rgba(28,26,24,0.8)_36%,rgba(28,26,24,0.42)_62%,rgba(28,26,24,0.12)_84%,transparent_100%)] lg:block"
      />
      <p className="u-mono absolute bottom-12 right-8 hidden text-right leading-[2] text-paper lg:block">
        Homes
        <br />
        for a
        <br />
        brighter
        <br />
        tomorrow
        <span aria-hidden className="mt-3 ml-auto block h-px w-10 bg-paper/70" />
      </p>
    </section>
  );
}
