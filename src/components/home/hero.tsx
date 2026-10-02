import Image from "next/image";
import Link from "next/link";

export type HeroImage = { src: string; alt: string };

/**
 * The landing hero: the brand line on the paper ground at the left, the
 * photograph bleeding in from the right, and a soft wash between them rather
 * than a seam.
 *
 * Split again on 2 October, from the client's reference design — half text,
 * half picture. This is the arrangement that ran until 17 September, when
 * they asked for one picture edge to edge instead; their reference now shows
 * the split, so the newer instruction wins. Three decisions taken while it
 * was full bleed are kept: no eyebrow over the brand line (29 September),
 * the red hover on the button (2 October), and no corner launcher, which is
 * why the caption sits low again.
 *
 * The wash does a second job beyond looking like one canvas — it is why the
 * header can sit over the picture with no bar of its own and stay legible.
 *
 * The picture is a 70% column against a 46% text column, so the two overlap
 * and the picture dissolves into the paper instead of butting against it.
 * The column is much taller than the frame is deep, so the picture is
 * cropped hard from the sides and only a short window shows its whole width.
 * The building is centred in this file and the crop is centred with it; the
 * trees and the parked cars at either edge are what the crop spends. That is
 * the measurement to re-check if the image or the column width changes.
 *
 * One picture, not a rotation: a plain server component with no client
 * JavaScript, and nothing that moves, so WCAG 2.2.2 does not apply.
 */
export function Hero({ image }: { image: HeroImage }) {
  return (
    <section className="relative overflow-hidden bg-paper lg:min-h-svh">
      {/* ── Text, on the paper ground */}
      <div
        /*
          The top padding clears the header, which is absolute over this hero.
          At lg the block is centred and the padding is only a floor — it
          matters on a short window.
        */
        className="relative z-10 flex flex-col justify-center px-6 pb-14 pt-28 sm:px-10 sm:pt-32 lg:min-h-svh lg:max-w-[46%] lg:pb-40 lg:pl-16 lg:pr-10 lg:pt-32 lg:[@media(max-height:700px)]:pb-16"
      >
        {/*
          Sized to its column. "Thoughtfully Built," never wraps and measures
          6.21 times the font size, so the vw factor is the largest that still
          fits the column at the narrowest width it applies to — 320px on a
          phone, 1024px at lg, where the column is 46% of the screen. Change
          the column or the words and re-measure.
        */}
        <h1 className="text-[clamp(2.6rem,12.5vw,4.5rem)] leading-[1.08] text-ink lg:text-[clamp(3rem,5.6vw,6rem)]">
          Thoughtfully&nbsp;Built,
          {/*
            --laterite, Ferrari red since 16 September at the client's
            instruction. 4.86:1 on paper, so the contrast shortfall the brand
            orange had is gone.
          */}
          <span className="mt-1 block text-laterite">Deeply&nbsp;Lived.</span>
        </h1>

        <div className="mt-12">
          <Link
            href="/projects"
            /*
              Fills with the red of "Deeply Lived." on hover rather than ink,
              at the client's instruction of 2 October. Paper on laterite is
              4.86:1, the ratio the brand line already carries.
            */
            className="u-mono inline-flex items-center gap-4 border border-ink/30 px-7 py-5 text-ink transition-colors duration-hover ease-hover hover:border-laterite hover:bg-laterite hover:text-paper"
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

      {/* ── The photograph. In flow beneath the text on small screens; at lg
             it fills the right of the section and washes into the paper. */}
      <div className="relative aspect-4/3 w-full sm:aspect-16/9 lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[70%]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="object-cover object-center"
        />

        {/*
          Four washes, all decorative, all written as literal rgba because a
          colour token carrying an alpha does not parse inside a gradient and
          is dropped silently.

          The first warms the picture toward the page. The sky in this render
          is rgb(168,176,195), a cool blue-grey, and the paper is a warm
          cream — so where they met the eye read a change of colour, not a
          fade, however gently the alpha ramped. A thin paper veil over the
          whole frame pulls the two within reach of each other.

          The second dissolves the leading edge into the paper: downward on a
          phone, where the picture sits under the text, and leftward at lg,
          where it sits beside it. Below lg it fades back in at the foot too,
          because there the picture is a block in the page and both its ends
          meet paper; at lg its foot is the bottom of the screen. It holds opaque until past the end of the
          headline — 19% into the picture at 1440 — and then eases away over
          half the frame. The stops are many and close because a ramp drawn
          between three of them is a straight line, and the eye reads a
          straight line as an edge.

          The third keeps the top light enough for the header to sit over the
          picture, and is lg-only: on a phone the header is nowhere near the
          picture, and 10rem of paper over a frame 281px tall erased it. The fourth does the same for the caption in the corner,
          sized to its own box so no hard rectangle shows at its edges.
        */}
        <div aria-hidden className="absolute inset-0 bg-paper/12" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(244,240,231,1)_0%,rgba(244,240,231,1)_2%,rgba(244,240,231,0.94)_6%,rgba(244,240,231,0.84)_10%,rgba(244,240,231,0.7)_14%,rgba(244,240,231,0.52)_18%,rgba(244,240,231,0.33)_22%,rgba(244,240,231,0.17)_26%,rgba(244,240,231,0.06)_30%,transparent_34%,transparent_78%,rgba(244,240,231,0.07)_83%,rgba(244,240,231,0.2)_88%,rgba(244,240,231,0.42)_93%,rgba(244,240,231,0.7)_97%,rgba(244,240,231,0.9)_100%)] lg:bg-[linear-gradient(to_right,rgba(244,240,231,1)_0%,rgba(244,240,231,1)_19%,rgba(244,240,231,0.97)_24%,rgba(244,240,231,0.92)_28%,rgba(244,240,231,0.84)_32%,rgba(244,240,231,0.74)_36%,rgba(244,240,231,0.62)_40%,rgba(244,240,231,0.49)_44%,rgba(244,240,231,0.37)_48%,rgba(244,240,231,0.26)_52%,rgba(244,240,231,0.17)_56%,rgba(244,240,231,0.1)_60%,rgba(244,240,231,0.05)_64%,rgba(244,240,231,0.02)_68%,transparent_73%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 hidden h-40 bg-gradient-to-b from-paper to-transparent lg:block"
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-0 hidden h-[32rem] w-[24rem] bg-[radial-gradient(ellipse_100%_100%_at_bottom_right,rgba(28,26,24,0.94)_0%,rgba(28,26,24,0.8)_36%,rgba(28,26,24,0.42)_62%,rgba(28,26,24,0.12)_84%,transparent_100%)] lg:block"
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
      </div>
    </section>
  );
}
