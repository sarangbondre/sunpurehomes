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
 * and the picture dissolves into the paper instead of butting against it.
 *
 * THERE IS NO CROP TO SPEAK OF ON A WIDE SCREEN any more, because the
 * picture changed shape on 3 November. The corner view is 1080x960, which is
 * 1.125:1, and at 1440x900 the column is 1008x900, which is 1.12:1 — the two
 * agree to within half a percent. The picture is drawn 1013 wide into 1008,
 * so there are FIVE pixels of travel where the old 2400x1350 frame had 592,
 * and object-position has nothing left to move. The column shows 99.6% of
 * the width.
 *
 * That retires the 7 October instruction to push the building further right:
 * it was carried out by spending crop travel, and this frame has none to
 * spend. Moving the building within the column now means changing the
 * column, not the crop. If they ask for it again, say so rather than
 * nudging a number that cannot do anything.
 *
 * The wash does a second job beyond looking like one canvas: it is why the
 * header can sit over the picture with no bar of its own and stay legible.
 *
 * BOTH CROPS ARE CENTRE, re-measured for the corner view on 3 November and
 * not inherited: the previous 43% phone / 32% desktop pair belonged to the
 * 2400x1350 frame and means something else on this one.
 *
 * Centre is not a default here, it is the answer. The client's instruction
 * of 1 November was to place the building on a phone as the desktop does,
 * and on this frame the two land on the same point exactly: the lg column
 * shows original x 2-1078 of 1080, centred on 540; the phone shows x
 * 318-762, centred on 540 as well. The old frame could only approximate
 * that — 43.3% desktop against 44.8% phone — because its crop centres
 * genuinely differed.
 *
 * The phone also sees more of the building than it did: 41% of the width
 * against 26%, because a 1.125:1 picture overflows a 375x812 frame far less
 * than a 1.78:1 one. That is the client's 1 November request answered by the
 * shape of the picture rather than by a number.
 *
 * Showing more still needs the picture to stop filling the height, which is
 * a layout change to the full-bleed arrangement the client asked for on
 * 3 October, not a crop. Not done without them choosing it.
 *
 *
 * On a phone the ground peaks at 0.5, to match what the picture does on a
 * wide screen — the client asked for 0.5 and it applies to both. The
 * headline then carries its own radial ground at 0.86 on top of that.
 * Seventeen stops either way, because three draw a straight line and the eye
 * reads a straight line as an edge.
 *
 * RE-MEASURED 3 November for the corner view, and the reason for the 0.86
 * has changed. Under the old frame the darkest pixel beneath "Deeply Lived."
 * was (8,0,0), a window reveal, which left laterite at 1.27:1 against the
 * 3:1 it owes as large text — the radial was the only thing making that line
 * legible. On this frame those words fall over sky and pale facade, the
 * darkest pixel is (169,153,138), and laterite clears 3:1 on the 0.5 veil
 * alone at 3.23:1. With the radial it is 4.36:1, and "Thoughtfully Built,"
 * in ink is 14.05:1.
 *
 * So the radial is now insurance rather than necessity, and it stays: 3.23:1
 * is 7% of headroom over the floor, this picture has been replaced seven
 * times, and the next frame may put a dark window back under that line. The
 * cost of keeping it is a little less picture showing through two words.
 * Dropping it is a visual decision for the client, not a cleanup.
 *
 * Both numbers belong to the picture, not to a house style. Whoever changes
 * the image should re-measure rather than assume them — the method is to
 * draw the img to a canvas with the same object-cover geometry, take the
 * darkest pixel under each line's box, composite it under the veil, and
 * check the ratio. Measuring the rendered line box instead reports a false
 * failure, because the empty space below the baseline catches whatever the
 * picture has there.
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
      <div className="absolute inset-0 -z-10 lg:left-auto lg:w-[70%] lg:[mask-image:linear-gradient(to_right,rgba(0,0,0,0)_0%,rgba(0,0,0,0.08)_2%,rgba(0,0,0,0.17)_4%,rgba(0,0,0,0.26)_6%,rgba(0,0,0,0.34)_8%,rgba(0,0,0,0.42)_10%,rgba(0,0,0,0.49)_12%,rgba(0,0,0,0.55)_16%,rgba(0,0,0,0.6)_20%,rgba(0,0,0,0.66)_26%,rgba(0,0,0,0.72)_32%,rgba(0,0,0,0.78)_40%,rgba(0,0,0,0.85)_50%,rgba(0,0,0,0.91)_60%,rgba(0,0,0,0.96)_72%,rgba(0,0,0,0.99)_85%,rgba(0,0,0,1)_100%)] lg:[-webkit-mask-image:linear-gradient(to_right,rgba(0,0,0,0)_0%,rgba(0,0,0,0.08)_2%,rgba(0,0,0,0.17)_4%,rgba(0,0,0,0.26)_6%,rgba(0,0,0,0.34)_8%,rgba(0,0,0,0.42)_10%,rgba(0,0,0,0.49)_12%,rgba(0,0,0,0.55)_16%,rgba(0,0,0,0.6)_20%,rgba(0,0,0,0.66)_26%,rgba(0,0,0,0.72)_32%,rgba(0,0,0,0.78)_40%,rgba(0,0,0,0.85)_50%,rgba(0,0,0,0.91)_60%,rgba(0,0,0,0.96)_72%,rgba(0,0,0,0.99)_85%,rgba(0,0,0,1)_100%)]">
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
          The ground the type stands on.

          Below lg it falls down the frame: paper through the words at the
          top, a long eased ramp, and nothing at all over the lower half, so
          the picture is the background rather than a strip under it.

          From lg the picture FADES OUT ALONG ITS OWN LEFT EDGE, with a
          mask on the element rather than paper laid over it.

          That distinction is the whole of this. A wash painted inside the
          column can only soften what is already inside it; it cannot touch
          the column's own boundary. While the wash started at full paper the
          boundary was hidden underneath it and nobody saw the problem. The
          moment the client took the veil down to 0.5 the edge appeared as a
          hard vertical line at 30% of the screen — exactly the straight line
          every other ramp in this file exists to avoid — and no adjustment
          of the wash could have removed it, because the wash was on the
          wrong side of the edge.

          The mask ramps the image's own alpha instead: nothing at the left
          edge, about half by 12% of the column, the full photograph by the
          right. Seventeen stops, for the usual reason. -webkit- as well,
          because Safari still wants the prefix.

          There is no paper gradient at lg any more. The mask does both jobs,
          and two overlapping fades would be two curves to keep in step.
        */}
        <div
          aria-hidden
          className="absolute inset-0 max-lg:bg-[linear-gradient(to_bottom,rgba(244,240,231,0.11)_0%,rgba(244,240,231,0.2)_4%,rgba(244,240,231,0.3)_7%,rgba(244,240,231,0.39)_10%,rgba(244,240,231,0.45)_12%,rgba(244,240,231,0.48)_14%,rgba(244,240,231,0.5)_16%,rgba(244,240,231,0.5)_41%,rgba(244,240,231,0.475)_44%,rgba(244,240,231,0.43)_47%,rgba(244,240,231,0.365)_50%,rgba(244,240,231,0.285)_53%,rgba(244,240,231,0.205)_56%,rgba(244,240,231,0.135)_59%,rgba(244,240,231,0.075)_62%,rgba(244,240,231,0.03)_65%,transparent_68%)]"
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
      {/*
        A ground behind the headline, phones only.

        The base veil is 0.5 there now, to match what the picture does on a
        wide screen, and 0.5 is not survivable for "Deeply Lived." on its own:
        the darkest pixel of this render under those words is (8,0,0) — a
        window reveal — and laterite over it at 0.5 measures 1.27:1 against
        the 3:1 it owes. So the words carry their own ground and the rest of
        the frame does not have to.

        It is sized to the whole text block, not to its centre. A first
        attempt centred a smaller ellipse on the headline and reached only
        2.32:1, because the worst pixel is at the END of the line where a
        radial has already fallen away. This one holds above 0.55 across the
        full 291 by 115 of the type and fades to nothing past it.

        Its left and right edges sit outside the viewport on purpose, so the
        only edges that can be seen are the top and bottom, and closest-side
        puts those exactly where the ramp reaches zero. Nothing to find.

        RE-MEASURED 1 November 2026, when the phone crop moved to 43%. A crop
        change moves different pixels under the type, so the figures above are
        about the old centre crop and are kept for the reasoning, not the
        numbers. At 375x812, masked to the glyph strokes themselves rather
        than to the line box: "Thoughtfully Built," 12.27:1 and "Deeply
        Lived." 3.96:1, both against the 3:1 large text owes. The ground did
        not have to change.

        Mask to the glyphs, not the box. The same measurement taken over the
        whole line box reports 1.02:1, because the box reaches below the
        baseline into a balcony shadow no letter touches. That number is an
        artefact; it is written down here so it is not rediscovered and acted
        on.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[80px] top-[64px] -z-10 h-[200px] w-[500px] bg-[radial-gradient(ellipse_closest-side_at_center,rgba(244,240,231,0.86)_0%,rgba(244,240,231,0.84)_30%,rgba(244,240,231,0.79)_45%,rgba(244,240,231,0.72)_55%,rgba(244,240,231,0.62)_65%,rgba(244,240,231,0.47)_75%,rgba(244,240,231,0.3)_85%,rgba(244,240,231,0.14)_93%,transparent_100%)] lg:hidden"
      />

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
