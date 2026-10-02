import Image from "next/image";
import Link from "next/link";

export type HeroImage = { src: string; alt: string };

/**
 * The landing page: the picture edge to edge and the full height of the
 * screen, with the brand line over it on a paper field that is not quite
 * opaque, so the photograph shows faintly through the words.
 *
 * Asked for on 2 October, after the half-and-half split of the same morning:
 * more picture, the picture behind everything, and "a little opaque where
 * there is a text".
 *
 * HOW OPAQUE THAT FIELD IS WAS MEASURED, NOT CHOSEN. The constraint is
 * "Deeply Lived.", which is --laterite and the weakest thing on the page:
 * 4.86:1 on solid paper, and less than that over a picture. It is also large
 * text at every width this site renders — 86px at lg, 47px on a 375px phone,
 * both well past the 24px that WCAG 1.4.3 counts as large — so the bar it
 * has to clear is 3:1, not the 4.5:1 the mono type beside it needs.
 *
 * 86% is the measured answer. The darkest pixel this picture puts behind
 * those words is all but black — the palm fronds, which fall right across
 * the line at lg — and over black, 86% paper leaves the red at 3.5:1. Over
 * the sky alone far more of the picture could show; the fronds set it.
 *
 * So if the picture changes, or a crop moves dark foliage up behind the
 * type, re-measure before trusting it: composite the picture under the
 * headline's box at this alpha, take the darkest pixel, and check it against
 * #d40000. Nothing here will tell you when it has stopped being legible.
 *
 * The field is blurred rather than faded with a gradient: a gradient is
 * clipped by its own box, so the fade stops dead and the line sits in a
 * visible rectangle. Blurring puts the fade outside the box, where there is
 * room for it.
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
          The building is centred in this file and all but fills the frame at
          this crop, so the anchor has little to do: at 1440x900 there are
          160px of travel in all. Centre keeps the palms at both edges.
        */
        className="-z-10 object-cover object-center"
      />

      {/*
        The header's links sit over the top of the picture with no bar of
        their own, and the sky there is bright but not white.
      */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-paper/90 via-paper/50 to-transparent"
      />

      <div className="flex min-h-svh flex-col px-6 pb-16 pt-28 sm:px-10 sm:pt-32 lg:max-w-[52%] lg:justify-center lg:pb-28 lg:pl-16 lg:pr-10 lg:pt-28 lg:[@media(max-height:700px)]:pb-16">
        {/* The field belongs to the brand line. The button carries its own. */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 rounded-[30%] bg-paper/86 blur-2xl"
          />

          {/*
            "Thoughtfully Built," never wraps and measures 6.21 times the font
            size, so the vw factor is the largest that still fits at 320px on
            a phone and in the column at lg. Change the words and re-measure.
          */}
          <h1 className="text-[clamp(2.6rem,12.5vw,4.5rem)] leading-[1.08] text-ink lg:text-[clamp(3rem,6vw,6.5rem)]">
            Thoughtfully&nbsp;Built,
            <span className="mt-1 block text-laterite">Deeply&nbsp;Lived.</span>
          </h1>
        </div>

        <div className="mt-12">
          {/*
            Glass, at the client's instruction of 2 October: the picture is
            blurred behind it rather than hidden, with a paper tint over the
            blur to lift the type and a light top edge where the glass catches
            the sky.

            The tint is what makes it legible, and it is measured like the
            field above: ink on 55% paper over the darkest foliage in this
            frame is 5.6:1. Ink has room to spare where the red of the brand
            line has none, which is why this can be glass and that cannot.

            On hover it fills with laterite and stops being glass — a solid
            fill is the only way paper type on red holds its 4.86:1.
          */}
          <Link
            href="/projects"
            className="u-mono inline-flex items-center gap-4 rounded-full border border-paper/60 bg-paper/55 px-7 py-5 text-ink shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_24px_rgba(28,26,24,0.12)] backdrop-blur-md transition-colors duration-hover ease-hover hover:border-laterite hover:bg-laterite hover:text-paper"
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
        The corner caption, on its own soft shade. The shade is sized to its
        box so no edge shows, and written as literal rgba because a colour
        token carrying an alpha does not parse inside a gradient.
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
