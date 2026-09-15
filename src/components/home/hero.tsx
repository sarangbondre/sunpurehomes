import Image from "next/image";
import Link from "next/link";

export type HeroImage = { src: string; alt: string };

/**
 * The landing hero: one image, full bleed, with the brand line over it.
 *
 * The type sits at the TOP of the frame, which is the picture's doing. In the
 * image the client supplied the sun is low and to the left — at 13% across
 * and 72% down — which is exactly where a bottom-left headline would stand.
 * Shading the type there would have shaded the sun, and the sun is the reason
 * the client chose the frame. So the words take the open sky above and the
 * sun keeps the foot of the picture to itself.
 *
 * Paper type, and the second line in the real brand orange. --laterite
 * measures 2.95:1 on paper, which is why --accent-ink exists as a deepened
 * stand-in, but 5.17:1 on ink; over a shaded picture the colour the brand
 * actually specifies is the one that works. It is the same #f15b22 the
 * previous site gives "Thought." in "Built on Thought."
 *
 * One file serves every viewport because the source is square. A landscape
 * window crops it vertically, so object-position sets the vertical share and
 * keeps the building's crown in frame; a portrait window crops it
 * horizontally, so it sets the horizontal one and keeps the sun in frame.
 */
export function Hero({ image }: { image: HeroImage }) {
  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[0%_50%] lg:object-[50%_60%]"
        />

        {/* Shade shaped to the type and clear of the sun — see .u-hero-shade. */}
        <div aria-hidden className="u-hero-shade absolute inset-0" />
        <div
          aria-hidden
          className="u-hero-shade-corner absolute inset-0 hidden lg:block"
        />
        {/*
          A short fall of shade under the header, full width. The ellipse is
          left-anchored and the nav sits hard right, over open sky that at
          sunrise is bright; paper type on it is marginal without this.
        */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/92 via-ink/52 via-45% to-transparent sm:h-44"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[86rem] px-6 pb-20 pt-28 sm:px-10 sm:pt-36 lg:px-16 lg:pt-40">
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
