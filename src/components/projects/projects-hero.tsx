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
 * The type sits on the paper ground, never on the picture, so it holds on
 * every screen; the picture washes into that ground from the left.
 */
export function ProjectsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-paper">
      {/*
        The text on paper. At lg it is the left of the frame; below lg it sits
        above the picture, because on a portrait screen the building would
        run straight through the headline.
      */}
      <div className="mx-auto flex max-w-[86rem] flex-col px-6 pb-10 pt-36 sm:px-10 sm:pt-40 lg:h-[clamp(34rem,54vw,48rem)] lg:justify-center lg:px-16 lg:pb-16 lg:pt-32">
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

      {/*
        The picture. The render is nearly square, so in a wide frame it is a
        column, which keeps the whole building, its sky and its reflection in
        view. The paper washes in from the left so there is no seam.
      */}
      <div className="relative aspect-[1.125] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[60%]">
        <Image
          src="/images/pages/projects-hero.jpg"
          alt="Curve at dawn: the white apartment building with its curved balconies under a pink and gold sky, reflected in the wet forecourt."
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover object-[50%_40%]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-paper to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-2/5 lg:bg-gradient-to-r lg:from-paper lg:via-paper/60 lg:via-35%"
        />
        {/*
          The header's links sit over the top of the picture at lg; the sky
          there is light, and this haze keeps the ink type clear of it.
        */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 hidden h-36 bg-gradient-to-b from-paper/85 via-paper/45 to-transparent lg:block"
        />
      </div>
    </section>
  );
}
