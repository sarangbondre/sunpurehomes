"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = { src: string; alt: string };

/**
 * The landing hero, to the client's reference design: the brand line on the
 * paper ground at the left, the imagery bleeding in from the right, and a
 * soft wash between them rather than a seam.
 *
 * The wash is what makes it read as one canvas instead of two panels, and it
 * does a second job — it is why the header can sit over the picture with no
 * bar of its own and stay legible.
 *
 * The images are portrait and square and only 736px wide (see
 * lib/home-showcase.ts). Letting them run the full height of a tall column
 * shows them close to whole and close to native width; the earlier
 * full-bleed landscape treatment cropped them to a band and stretched them.
 */
export function Hero({
  slides,
  intervalMs = 6000,
}: {
  slides: HeroSlide[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || paused || reduced) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [slides.length, paused, reduced, intervalMs]);

  const rotating = slides.length > 1 && !reduced;

  return (
    <section className="relative overflow-hidden bg-paper lg:min-h-svh">
      {/* ── Text, over the wash */}
      <div className="relative z-10 flex flex-col justify-center px-6 pb-14 pt-14 sm:px-10 sm:pt-16 lg:min-h-svh lg:max-w-[52%] lg:py-0 lg:pl-16 lg:pr-8 lg:pt-24">
        <p className="u-mono leading-[1.9] text-muted">
          Spaces for a
          <br />
          more meaningful tomorrow
        </p>
        <span aria-hidden className="mt-5 block h-px w-20 bg-line" />

        <h1 className="mt-8 text-[clamp(2.75rem,5.4vw,4.9rem)] text-ink">
          Thoughtfully&nbsp;Built,
          <span className="mt-1 block text-accent-ink">Deeply&nbsp;Lived.</span>
        </h1>

        <div className="mt-10">
          <Link
            href="/projects"
            className="u-mono inline-flex items-center gap-4 border border-ink/25 px-7 py-5 text-ink transition-colors duration-hover ease-hover hover:border-ink hover:bg-ink hover:text-paper"
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

        {rotating && (
          <div className="mt-10 flex items-center gap-4">
            <ul className="flex items-center gap-3">
              {slides.map((slide, i) => (
                <li key={slide.src}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-current={i === index}
                    aria-label={`Show image ${i + 1} of ${slides.length}`}
                    className={`block size-2.5 rounded-full border transition-colors duration-hover ease-hover ${
                      i === index
                        ? "border-accent-ink bg-accent-ink"
                        : "border-stone bg-transparent hover:border-ink"
                    }`}
                  />
                </li>
              ))}
            </ul>
            <span aria-hidden className="h-4 w-px bg-line" />
            {/*
              WCAG 2.2.2: the images change on their own and run past five
              seconds, so a control that stops them is required.
              prefers-reduced-motion suppresses rotation separately (2.3.3)
              and is not a substitute for this.
            */}
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="u-mono text-muted transition-colors duration-hover ease-hover hover:text-ink"
            >
              {paused ? "Play" : "Pause"}
            </button>
          </div>
        )}
      </div>

      {/* ── Imagery. In flow beneath the text on small screens; at lg it fills
             the right of the section and washes into the paper. */}
      <div className="relative aspect-4/5 w-full sm:aspect-16/10 lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[64%]">
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            fetchPriority={i === 0 ? "high" : "auto"}
            sizes="(min-width: 1024px) 64vw, 100vw"
            className="object-cover transition-opacity ease-enter"
            style={{
              opacity: i === index ? 1 : 0,
              transitionDuration: "var(--duration-camera)",
            }}
          />
        ))}

        {/*
          Three washes, all decorative. The first dissolves the left edge into
          the panel. The second keeps the top light enough for the nav and the
          WhatsApp pill to sit over the picture whatever the picture is — the
          slides run from a bright sunset to a dark courtyard interior. The
          third does the same for the caption in the corner.
        */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-paper from-0% via-paper/40 via-10% to-transparent to-26% lg:bg-gradient-to-r"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-paper to-transparent"
        />
        {/*
          Literal rgba, not var(--color-ink)/0.55 — a CSS variable with a
          slash alpha does not parse inside a gradient, so that rule was
          dropped silently and the caption had no scrim at all.
        */}
        <div
          aria-hidden
          className="absolute bottom-0 right-0 hidden h-[28rem] w-[34rem] bg-[radial-gradient(ellipse_at_bottom_right,rgba(28,26,24,0.94)_0%,rgba(28,26,24,0.72)_32%,rgba(28,26,24,0.3)_55%,transparent_78%)] lg:block"
        />

        <p className="u-mono absolute bottom-10 right-10 hidden text-right leading-[2] text-paper lg:block">
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
