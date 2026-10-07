import Image from "next/image";
import Link from "next/link";
import { ScrollCue } from "@/components/brand/scroll-cue";

export type HeroImage = { src: string; alt: string };

/**
 * The landing page: the picture edge to edge and the full height of the
 * screen, with the brand line over it on paper that dissolves into the
 * photograph.
 *
 * Asked for on 2 October, after the half-and-half split of the same morning:
 * the picture behind everything and covering more than the type.
 *
 * On a phone the ground peaks at 0.86, raised from 0.7 on 7 October when the
 * client put the ungraded daylight render on this page. That picture has no
 * bright sky behind the type where the others did — a phone's crop puts the
 * building's own grey facade there — and "Deeply Lived." measured 2.25:1
 * against the 3:1 it owes as large text. It took 0.86 to clear — 0.8 reached only
 * 2.85:1 — and that is a lot of paper over a picture the client asked to see
 * more of, which is the trade and it is theirs to re-make. The shape of the
 * ramp is untouched: every stop was scaled by the same factor, so the eighteen
 * stops still ease the same way and there is still no straight line in it.
 *
 * The number belongs to the picture, not to a house style. 0.7 was right for
 * the golden sunrise and would be right again; whoever changes this image
 * should re-measure rather than assume either figure.
 *
 * The ground under the type is opaque, and reaches the picture through a
 * ramp long enough that there is no edge to find — the client's words on
 * 2 October were that no one should be able to feel the line between the
 * transparent part and the opaque part.
 *
 * That replaces a translucent field, and takes a contrast problem with it.
 * "Deeply Lived." is the weakest thing on the page — laterite, 4.86:1 even
 * on solid paper — and over a picture it was measuring 3.5:1, which clears
 * WCAG only because the brand line is large text. On paper it is 4.86:1
 * again, the figure it carries everywhere else on this site.
 *
 * Two things make the ramp invisible. It has eighteen stops, because three
 * of them draw a straight line and the eye reads a straight line as an edge.
 * And it is laid on the section, full bleed, not on a box around the type: a
 * gradient is clipped by its own element, so a small box ends its ramp in
 * mid-air and leaves exactly the line this is meant to avoid.
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
          Centre on a phone, and pulled toward the left of the source from lg
          — which moves the BUILDING to the right, off the words, at the
          client's instruction of 7 October.

          How far it moves depends on the window, and there is less room than
          it sounds. The picture is 16:9 and the frame is whatever the browser
          is, so cover leaves only the difference as travel: 160px at
          1440x900, which is 80px either side of centre. 25% spends half of
          that, 40px to the right. On a 16:9 window there is no travel at all
          and this does nothing — not a bug, just the arithmetic of a 16:9
          picture in a 16:9 hole.
        */
        className="-z-10 object-cover object-center lg:object-[25%_50%]"
      />

      {/*
        The ground the type stands on: paper where the words are, nothing at
        all over the rest of the picture, and a ramp between them long enough
        that there is no edge to find. Across the frame at lg, down it on a
        phone, where the type sits at the top instead.

        It is laid on the section rather than on a box around the type. A
        gradient is clipped by its own element, so a small box ends its ramp
        in mid-air and leaves exactly the line this is meant to avoid; given
        the whole frame, the ramp finishes on its own terms.

        Opaque under the words, so the contrast questions that dogged the
        translucent version are gone: the brand line is back to 4.86:1, the
        figure it carries on paper anywhere else on the site.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(244,240,231,0.189)_0%,rgba(244,240,231,0.344)_4%,rgba(244,240,231,0.516)_7%,rgba(244,240,231,0.671)_10%,rgba(244,240,231,0.774)_12%,rgba(244,240,231,0.834)_14%,rgba(244,240,231,0.86)_16%,rgba(244,240,231,0.86)_41%,rgba(244,240,231,0.817)_44%,rgba(244,240,231,0.74)_47%,rgba(244,240,231,0.628)_50%,rgba(244,240,231,0.49)_53%,rgba(244,240,231,0.353)_56%,rgba(244,240,231,0.232)_59%,rgba(244,240,231,0.129)_62%,rgba(244,240,231,0.052)_65%,transparent_68%)] lg:bg-[radial-gradient(ellipse_57%_41%_at_24%_47%,rgba(244,240,231,1)_0%,rgba(244,240,231,1)_38%,rgba(244,240,231,0.975)_43%,rgba(244,240,231,0.94)_47%,rgba(244,240,231,0.89)_51%,rgba(244,240,231,0.82)_55%,rgba(244,240,231,0.73)_59%,rgba(244,240,231,0.65)_62%,rgba(244,240,231,0.56)_65%,rgba(244,240,231,0.47)_68%,rgba(244,240,231,0.38)_71%,rgba(244,240,231,0.29)_74%,rgba(244,240,231,0.21)_77%,rgba(244,240,231,0.14)_80%,rgba(244,240,231,0.08)_84%,rgba(244,240,231,0.04)_88%,rgba(244,240,231,0.01)_92%,transparent_96%)]"
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
        <div className="relative">
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

            35% since 2 October, at the client's instruction, down from 55%.
            It can afford it: its label is ink, which measures 14:1 against
            the ground it sits on, where the red of the brand line has nothing
            to spare.

            It sits inside the ground, though, so what it has to refract
            is mostly paper — glass needs something behind it, and the same
            instruction that put the type on opaque ground took the picture
            out from under this. It reads as a tinted pill with a lit top
            edge. Moving it clear of the ground would mean a ramp steep
            enough to see, which is the thing being avoided.

            On hover it fills with laterite and stops being glass — a solid
            fill is the only way paper type on red holds its 4.86:1.
          */}
          <Link
            href="/projects"
            className="u-mono u-glass gap-4 px-7 py-5"
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

      <ScrollCue />

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
