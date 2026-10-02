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
          A light wash on a phone — the type carries its own haze below — and
          at lg the paper washes in from the left instead, so the picture
          meets the ground without a seam.
        */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-paper/75 from-0% via-paper/35 via-45% to-transparent to-78% lg:inset-y-0 lg:left-0 lg:right-auto lg:w-2/5 lg:bg-gradient-to-r lg:from-paper lg:via-paper/60 lg:via-35% lg:to-transparent"
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

      <div className="relative mx-auto flex min-h-[40rem] max-w-[86rem] flex-col px-6 pb-16 pt-36 sm:min-h-[42rem] sm:px-10 sm:pt-40 lg:h-[clamp(34rem,54vw,48rem)] lg:min-h-0 lg:justify-center lg:px-16 lg:pt-32">
        {/*
          The frame is taller than the type on a phone, so the picture still
          reads below the haze rather than being hidden by it.

          The haze belongs to the type: it hugs these three lines and fades
          just past the last of them, so it never grows with the frame. A
          wash on the picture instead left the caption at 1.5:1 on a tall
          tablet, and a haze on the whole block hid the building at 768px.
        */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-24 -bottom-16 -z-10 bg-[linear-gradient(to_bottom,transparent_0%,rgba(244,240,231,0.93)_16%,rgba(244,240,231,0.93)_88%,transparent_100%)] lg:hidden"
          />
          <h1 className="text-[clamp(4.25rem,10vw,9.5rem)] leading-[0.92] tracking-[-0.02em] text-ink">
            Our
            <span className="block text-laterite">Projects</span>
          </h1>
          <span aria-hidden className="mt-8 block h-px w-20 bg-laterite/70" />
          <p className="u-mono mt-8 leading-[2.1] tracking-[0.3em] text-ink-soft">
            Spaces for a
            <br />
            brighter tomorrow
          </p>
        </div>
      </div>
    </section>
  );
}
