import Image from "next/image";
import Link from "next/link";
import { ScrollCue } from "@/components/brand/scroll-cue";

export type HeroImage = { src: string; alt: string };

/**
 * The landing hero. Two arrangements of the same parts.
 *
 * FROM LG: half text, half picture — the brand line on the paper ground at
 * the left, the photograph bleeding in from the right, and a wash between
 * them rather than a seam. This is the client's reference design, restored on
 * 7 October from the version that ran on 2 October before they asked for one
 * picture edge to edge. They sent the old screenshot back and said they
 * wanted it like that again, so the newer instruction wins, as it did when it
 * went the other way.
 *
 * BELOW LG: unchanged — the picture behind the type, edge to edge, which the
 * client asked for on 3 October and has not withdrawn. The split was never
 * what a phone did: the old version stacked the picture under the text in
 * flow, and putting that back would quietly undo a later instruction. So the
 * restoration is scoped to lg and the phone keeps its full-bleed ground.
 *
 * TWO THINGS IN THEIR SCREENSHOT ARE DELIBERATELY NOT BACK, because each was
 * removed at their own later instruction and neither is the picture:
 *   - the eyebrow over the brand line ("Spaces for a more meaningful
 *     tomorrow"), dropped 29 September;
 *   - the outlined button, which became glass on 3 October when they asked
 *     for every control on the site to match the WhatsApp pill.
 * Both are a line each to restore if they want them; neither should be
 * reverted by inference from an old screenshot.
 *
 * The picture is a 70% column against a 46% text column, so the two overlap
 * and the picture dissolves into the paper instead of butting against it. The
 * column is much taller than it is wide, so the picture is cropped hard from
 * the sides: at 1440x900 the column is 1008 wide and the picture is drawn
 * 1600, which is 592px of travel. That is four times what the full-bleed
 * arrangement had, and why the crop is anchored at 32% from lg,
 * which pushes the building a further 106px to the right inside its own
 * column — the client asked for that on 7 October, on top of the half it
 * already had. The column gives the crop 592px of travel against the
 * full-bleed arrangement's 160, so there is room to spend.
 *
 * The wash does a second job beyond looking like one canvas: it is why the
 * header can sit over the picture with no bar of its own and stay legible.
 *
 * On a phone the ground peaks at 0.86, raised from 0.7 on 7 October when the
 * client put an ungraded daylight render on this page. That picture has no
 * bright sky behind the type where the others did, and "Deeply Lived."
 * measured 2.25:1 against the 3:1 it owes as large text; 0.8 reached only
 * 2.85:1. The eighteen stops still ease the same way — every one was scaled
 * by the same factor — because three stops draw a straight line and the eye
 * reads a straight line as an edge.
 *
 * The number belongs to the picture, not to a house style. Whoever changes
 * the image should re-measure rather than assume it.
 *
 * One picture, not a rotation: a plain server component with no client
 * JavaScript, and nothing that moves, so WCAG 2.2.2 does not apply.
 */
export function Hero({ image }: { image: HeroImage }) {
  return (
    <section className="relative isolate min-h-svh overflow-hidden bg-paper">
      {/*
        The picture: the whole frame below lg, the right 70% from lg. The
        washes live inside it so they travel with it and cannot be left
        covering paper when the column narrows.
      */}
      <div className="absolute inset-0 -z-10 lg:left-auto lg:w-[70%]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="object-cover object-center lg:object-[32%_50%]"
        />

        {/*
          The ground the type stands on.

          Below lg it falls down the frame: paper through the words at the
          top, a long eased ramp, and nothing at all over the lower half, so
          the picture is the background rather than a strip under it.

          From lg it washes in from the left instead, so the photograph
          reaches the paper without a seam. The ramp runs the whole column and
          is very late: solid paper across the first 42% of it, 0.85 at 62%,
          and gone only at the far edge. In screen terms the photograph does
          not begin to show until 59% across and carries the right third of
          the frame alone.

          The hold has been pushed later FOUR times — 10%, 22%, 32%, 42% —
          each at the client asking for the left to be "more transparent". In
          their use that means MORE VEILED: more paper over the picture, not
          more picture showing through. The one change that read it the other
          way, a 0.9 ceiling so the photograph ghosted through behind the
          words, was asked for and reverted the same day (7be1c23).

          There is not much further this can go. Past about 50% the picture
          is a sliver at the right edge and the hero is a page of paper with a
          photograph in the corner; at that point the thing to change is the
          column width or the picture, not this ramp. Eighteen stops, for the same reason
          the phone ramp has eighteen: three would draw a straight line and
          the eye reads a straight line as an edge.
        */}
        <div
          aria-hidden
          className="absolute inset-0 max-lg:bg-[linear-gradient(to_bottom,rgba(244,240,231,0.189)_0%,rgba(244,240,231,0.344)_4%,rgba(244,240,231,0.516)_7%,rgba(244,240,231,0.671)_10%,rgba(244,240,231,0.774)_12%,rgba(244,240,231,0.834)_14%,rgba(244,240,231,0.86)_16%,rgba(244,240,231,0.86)_41%,rgba(244,240,231,0.817)_44%,rgba(244,240,231,0.74)_47%,rgba(244,240,231,0.628)_50%,rgba(244,240,231,0.49)_53%,rgba(244,240,231,0.353)_56%,rgba(244,240,231,0.232)_59%,rgba(244,240,231,0.129)_62%,rgba(244,240,231,0.052)_65%,transparent_68%)] lg:bg-[linear-gradient(to_right,rgba(244,240,231,1)_0%,rgba(244,240,231,1)_42%,rgba(244,240,231,0.99)_46%,rgba(244,240,231,0.97)_50%,rgba(244,240,231,0.94)_54%,rgba(244,240,231,0.9)_58%,rgba(244,240,231,0.85)_62%,rgba(244,240,231,0.78)_66%,rgba(244,240,231,0.7)_70%,rgba(244,240,231,0.61)_74%,rgba(244,240,231,0.51)_78%,rgba(244,240,231,0.41)_82%,rgba(244,240,231,0.31)_86%,rgba(244,240,231,0.22)_90%,rgba(244,240,231,0.15)_93%,rgba(244,240,231,0.09)_96%,rgba(244,240,231,0.04)_98%,transparent_100%)]"
        />

        {/*
          The header's links sit over the top of the picture with no bar of
          their own, and the sky there is bright but not white.
        */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-paper/90 via-paper/50 to-transparent lg:h-40 lg:from-paper"
        />

        {/*
          The corner caption's shade, inside the picture column so it sits on
          the photograph at every width. Sized to its own box so no hard
          rectangle shows, and written as literal rgba because a colour token
          carrying an alpha does not parse inside a gradient.
        */}
        <div
          aria-hidden
          className="absolute bottom-0 right-0 hidden h-[32rem] w-[24rem] bg-[radial-gradient(ellipse_100%_100%_at_bottom_right,rgba(28,26,24,0.94)_0%,rgba(28,26,24,0.8)_36%,rgba(28,26,24,0.42)_62%,rgba(28,26,24,0.12)_84%,transparent_100%)] lg:block"
        />
      </div>

      {/*
        The text column. 46% from lg, against the picture's 70%: they overlap
        by 16% of the screen, and that overlap is where the wash lives.
      */}
      <div className="flex min-h-svh flex-col px-6 pb-16 pt-28 sm:px-10 sm:pt-32 lg:max-w-[46%] lg:justify-center lg:pb-28 lg:pl-16 lg:pr-10 lg:pt-28 lg:[@media(max-height:700px)]:pb-16">
        <div className="relative">
          {/*
            Sized to its column. "Thoughtfully Built," never wraps and
            measures 6.21 times the font size, so the vw factor is the largest
            that still fits at 320px on a phone and in a 46% column at lg.
            5.6vw, not the 6vw the full-bleed version could afford on a 52%
            column. Change the words or the column and re-measure.
          */}
          <h1 className="text-[clamp(2.6rem,12.5vw,4.5rem)] leading-[1.08] text-ink lg:text-[clamp(3rem,5.6vw,6rem)]">
            Thoughtfully&nbsp;Built,
            <span className="mt-1 block text-laterite">Deeply&nbsp;Lived.</span>
          </h1>
        </div>

        <div className="mt-12">
          {/*
            Glass, at the client's instruction of 3 October that every control
            on the site match the WhatsApp pill. Their 2 October screenshot
            shows the outlined button this replaced; it is not restored with
            the layout, because the instruction that changed it came after.

            On hover it fills with laterite and stops being glass — a solid
            fill is the only way paper type on red holds its 4.86:1.
          */}
          <Link href="/projects" className="u-mono u-glass gap-4 px-7 py-5">
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

      <ScrollCue />

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
