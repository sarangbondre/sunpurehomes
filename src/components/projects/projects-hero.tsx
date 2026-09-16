import Image from "next/image";

/**
 * The Projects page's opening, to the client's reference design: "Our
 * Projects" over a sunset terrace, full bleed, with the header over it.
 *
 * The photograph is cut from the client's reference mockup (the only copy of
 * this frame at this framing), with the mockup's own header, headline and
 * caption removed and the frame enlarged 2x — so it is soft on large screens.
 * The original file would replace it at the same path. It is not a Sunpure
 * development: no caption, no project name, no link
 * (docs/adr/0001-non-project-imagery-on-the-landing-page.md).
 *
 * The type sits on the sky's own light. A soft paper wash at the top left
 * guarantees it on every crop, including phones, where the frame is cut to a
 * narrow strip.
 */
export function ProjectsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-paper">
      <Image
        src="/images/pages/projects-hero.jpg"
        alt="A concrete villa terrace with an infinity pool at sunset, looking out over wooded hills."
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="-z-10 object-cover object-[48%_center] lg:object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_75%_at_0%_20%,rgba(244,240,231,0.72)_0%,rgba(244,240,231,0.4)_45%,transparent_80%)]"
      />
      {/*
        A haze under the header. The menu sits hard right, where the villa's
        concrete roof is — dark enough to lose ink type (1.83:1 at 1920px
        before this). On the landing page the same job is done by the top
        of its wash.
      */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-paper/95 via-paper/70 via-45% to-transparent sm:h-44"
      />

      <div className="mx-auto flex min-h-[36rem] max-w-[86rem] flex-col px-6 pb-16 pt-36 sm:min-h-[40rem] sm:px-10 sm:pt-40 lg:h-[clamp(34rem,54vw,48rem)] lg:min-h-0 lg:px-16 lg:pt-44">
        <h1 className="text-[clamp(4.25rem,10vw,9.5rem)] leading-[0.92] tracking-[-0.02em] text-ink">
          Our
          <span className="block text-laterite">Projects</span>
        </h1>
        <span aria-hidden className="mt-8 block h-px w-20 bg-laterite/70" />
      </div>

      <p className="u-mono absolute left-[61%] top-[46%] hidden leading-[2.1] tracking-[0.3em] text-ink-soft lg:block">
        Spaces
        <br />
        for a
        <br />
        brighter
        <br />
        tomorrow
        <span aria-hidden className="mt-4 block h-px w-10 bg-ink-soft/60" />
      </p>
    </section>
  );
}
