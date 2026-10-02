import Image from "next/image";

/**
 * The Projects page's opening, to the client's reference design: "Our
 * Projects" over a full-bleed picture, with the header over it.
 *
 * The picture is Curve at dawn — the client's own render, from the project's
 * elevation folder on their Drive ("01 (4).png", 2000px), chosen on
 * 17 September for its sunrise sky. It replaced a frame cut from the
 * reference mockup, which was soft and was not a Sunpure development.
 * Larger exports of the same render sit beside it on the Drive; one of those
 * at this path would sharpen the page on very large screens.
 *
 * The heading's floor is 2.9rem, not the 4.25rem it carried until
 * 2 October: below about 430px the floor won rather than the 10vw, so the
 * words came out 68px on a 375px phone against the landing page's 47px, and
 * read as a different size of site. Every width where 10vw already won is
 * unchanged.
 *
 * Shorter since 2 October: it stood 768px deep at 1440 with the type
 * floating in the middle, and the client asked for the white back. The
 * picture is unchanged — only the frame around it closed up.
 *
 * Two arrangements of the same parts. On a phone the picture fills the
 * frame and the type sits on it, under a paper haze that falls from the top
 * (client, 30 September). From lg the picture is a column on the right —
 * the render is nearly square, so a wide frame would crop the building — and
 * the type stands on the paper beside it.
 */
export function ProjectsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-paper">
      {/*
        The picture: behind everything on a phone, the right-hand column from
        lg. The washes below keep the type and the header clear of it.
      */}
      <div className="absolute inset-0 -z-10 lg:left-auto lg:w-[60%]">
        <Image
          src="/images/pages/projects-hero.jpg"
          alt="Curve at dawn: the white apartment building with its curved balconies under a pink and gold sky, reflected in the wet forecourt."
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover object-[58%_38%] lg:object-[50%_40%]"
        />
        {/*
          Below lg this is the ground the type stands on: paper through the
          words at the top, nothing at all across the middle so the picture is
          the background, and paper again at the foot so it dissolves into the
          filter panel rather than ending on a line. It replaced a haze that
          hugged the type and read as a pale slab laid over the picture
          (client, 2 October).

          There are two of them because the heading is half again as tall
          between sm and lg: on the phone's ground the caption measured 2.52:1
          over the building there. The sm frame is also taller — 44rem against
          34 — because holding the paper far enough down to carry the caption
          in a 36rem frame left nothing below it but the waterline.

          They are scoped with max-lg rather than left to be overridden at lg: an
          arbitrary background-image and the gradient utilities are separate
          rules, and which won depended on their order in the stylesheet — it
          went the wrong way once already and left lg with no wash at all.

          At lg the paper washes in from the left instead, so the picture
          meets the ground without a seam.
        */}
        <div
          aria-hidden
          className="absolute inset-0 max-lg:bg-[linear-gradient(to_bottom,rgba(244,240,231,0.34)_0%,rgba(244,240,231,0.5)_4%,rgba(244,240,231,0.68)_8%,rgba(244,240,231,0.84)_12%,rgba(244,240,231,0.94)_16%,rgba(244,240,231,0.99)_20%,rgba(244,240,231,1)_24%,rgba(244,240,231,1)_46%,rgba(244,240,231,0.96)_50%,rgba(244,240,231,0.88)_54%,rgba(244,240,231,0.75)_58%,rgba(244,240,231,0.59)_62%,rgba(244,240,231,0.43)_66%,rgba(244,240,231,0.28)_70%,rgba(244,240,231,0.15)_74%,rgba(244,240,231,0.06)_78%,transparent_82%,transparent_90%,rgba(244,240,231,0.2)_93%,rgba(244,240,231,0.5)_96%,rgba(244,240,231,0.78)_98%,rgba(244,240,231,0.95)_100%)] sm:max-lg:bg-[linear-gradient(to_bottom,rgba(244,240,231,0.34)_0%,rgba(244,240,231,0.5)_4%,rgba(244,240,231,0.68)_8%,rgba(244,240,231,0.84)_12%,rgba(244,240,231,0.94)_16%,rgba(244,240,231,0.99)_20%,rgba(244,240,231,1)_24%,rgba(244,240,231,1)_57%,rgba(244,240,231,0.96)_60%,rgba(244,240,231,0.88)_63%,rgba(244,240,231,0.76)_66%,rgba(244,240,231,0.6)_69%,rgba(244,240,231,0.44)_72%,rgba(244,240,231,0.28)_75%,rgba(244,240,231,0.15)_78%,rgba(244,240,231,0.06)_81%,transparent_84%,transparent_92%,rgba(244,240,231,0.25)_95%,rgba(244,240,231,0.55)_97%,rgba(244,240,231,0.82)_99%,rgba(244,240,231,0.93)_100%)] lg:inset-y-0 lg:left-0 lg:right-auto lg:w-2/5 lg:bg-gradient-to-r lg:from-paper lg:via-paper/60 lg:via-35% lg:to-transparent"
        />
        {/*
          The header's links sit over the top of the picture; the sky there is
          light, and this haze keeps the ink type clear of it.
        */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-paper/85 via-paper/45 to-transparent"
        />
      </div>

      <div className="relative mx-auto flex min-h-[34rem] max-w-[86rem] flex-col px-6 pb-12 pt-24 sm:min-h-[44rem] sm:px-10 sm:pt-28 lg:h-[clamp(26rem,40vw,34rem)] lg:min-h-0 lg:justify-center lg:px-16 lg:pt-28">
        {/*
          The frame is taller than the type on a phone, so the picture still
          reads below the haze rather than being hidden by it.

          The haze belongs to the type: it hugs these three lines and fades
          just past the last of them, so it never grows with the frame. A
          wash on the picture instead left the caption at 1.5:1 on a tall
          tablet, and a haze on the whole block hid the building at 768px.
        */}
        <div className="relative">
          <h1 className="text-[clamp(2.9rem,10vw,9.5rem)] leading-[0.92] tracking-[-0.02em] text-ink">
            Our
            <span className="block text-laterite">Projects</span>
          </h1>
          <span aria-hidden className="mt-6 block h-px w-20 bg-laterite/70 sm:mt-8" />
          <p className="u-mono mt-6 leading-[2.1] tracking-[0.3em] text-ink-soft sm:mt-8">
            Spaces for a
            <br />
            brighter tomorrow
          </p>
        </div>
      </div>
    </section>
  );
}
