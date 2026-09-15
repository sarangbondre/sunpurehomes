import Link from "next/link";

export type HeroImage = { src: string; alt: string; portraitSrc?: string };

/**
 * The landing hero: one photograph, full bleed, with the brand line over it.
 *
 * There is no panel and no left-hand wash. An earlier version put the text on
 * a paper column beside the picture, which split the page in two and bleached
 * the half the building stood in. The picture now runs clear edge to edge and
 * the type sits on it.
 *
 * That inverts the palette, and for the better. Over a bright sunrise, ink
 * needs the ground lightened under it — which is the wash that was doing the
 * splitting. Over a dark foot, paper needs nothing, and the second line can
 * finally use the real brand orange: --laterite measures 2.95:1 on paper,
 * which is why --accent-ink existed as a deepened stand-in, but 5.17:1 on
 * ink. The colour the brand actually specifies works here and nowhere else.
 *
 * Two plates, not one. A phone sees about a quarter of the landscape frame,
 * and the sun and the building are too far apart to both survive that crop —
 * so below lg the picture is a portrait plate composed for it. They are
 * genuinely different images, which is what <picture> is for; two <Image>
 * elements toggled with `hidden` would make every phone download the desktop
 * plate as well.
 */
export function Hero({ image }: { image: HeroImage }) {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <picture>
          {image.portraitSrc && (
            <source media="(max-width: 1023px)" srcSet={image.portraitSrc} />
          )}
          {/*
            A bare <img>, because art direction needs <picture> and
            next/image cannot express it. Both plates are already sized and
            compressed for the one place they are used, so the optimiser has
            nothing left to do; fetchPriority carries the LCP hint that
            `priority` would have.
          */}
          <img
            src={image.src}
            alt={image.alt}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[30%_center] lg:object-left"
          />
        </picture>

        {/* Shade shaped to the type and clear of the sun — see .u-hero-shade. */}
        <div aria-hidden className="u-hero-shade absolute inset-0" />
        <div
          aria-hidden
          className="u-hero-shade-corner absolute inset-0 hidden lg:block"
        />
        {/*
          A short fall of shade under the header. The wordmark and nav sit
          over open sky, which at dawn is dusky but not dark, and paper type
          on it is marginal without this.
        */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/88 via-ink/40 via-42% to-transparent sm:h-44"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[86rem] px-6 pb-14 pt-32 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
        <p className="u-mono leading-[1.9] text-paper">
          Spaces for a
          <br />
          more meaningful tomorrow
        </p>
        <span aria-hidden className="mt-5 block h-px w-20 bg-paper/40" />

        <h1 className="mt-7 max-w-[16ch] text-[clamp(2.4rem,5.1vw,4.5rem)] leading-[1.06] text-paper">
          Thoughtfully&nbsp;Built,
          <span className="mt-1 block text-laterite">Deeply&nbsp;Lived.</span>
        </h1>

        <div className="mt-8">
          <Link
            href="/projects"
            className="u-mono inline-flex items-center gap-4 border border-paper/60 px-7 py-5 text-paper transition-colors duration-hover ease-hover hover:border-paper hover:bg-paper hover:text-ink"
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

      <p className="u-mono absolute bottom-10 right-10 z-10 hidden text-right leading-[2] text-paper/80 lg:block">
        Homes
        <br />
        for a
        <br />
        brighter
        <br />
        tomorrow
        <span aria-hidden className="mt-3 ml-auto block h-px w-10 bg-paper/50" />
      </p>
    </section>
  );
}
