"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = { src: string; alt: string };

/**
 * The landing hero: a warm panel carrying the brand line, and the imagery
 * beside it rather than behind it.
 *
 * This is a deliberate return to a split after a spell of full-bleed. Two
 * reasons, and the second is the one that matters:
 *
 *   The headline is set in ink and amber on paper, at the client's
 *   direction. Dark type cannot sit over photography — it needs a light
 *   ground of its own, and a panel is that ground.
 *
 *   The supplied images are portrait and square, at most 736px wide. A
 *   full-bleed landscape frame cropped each one to a horizontal band and
 *   threw away most of the composition — the travertine villa lost its
 *   garden and pool entirely. A tall panel is the shape these images
 *   actually are, so they are shown nearly whole, and at close to their
 *   native width they are far sharper than when stretched across a
 *   1440px-wide hero.
 *
 * There is no scrim now. Nothing is laid over the pictures, so they render
 * at full fidelity — which matters more than usual given how small the
 * sources are.
 *
 * The whole hero is a client component because the slide index is shared
 * between the images on the right and the controls on the left. Next still
 * renders it on the server for the first paint, so the headline is in the
 * initial HTML and the first image is still the LCP element.
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
    <section className="relative bg-paper lg:grid lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[46fr_54fr]">
      {/* ── Left: the brand panel */}
      <div className="relative flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-24 lg:py-0 lg:pl-16 lg:pr-14">
        <h1 className="text-[clamp(2.75rem,5.6vw,4.6rem)] text-ink">
          Thoughtfully&nbsp;Built.
          <span className="mt-1 block text-amber">Deeply&nbsp;Lived.</span>
        </h1>

        <span aria-hidden className="mt-10 block h-px w-32 bg-amber/60" />

        <div className="mt-9">
          {/*
            The shared .u-cta is laterite-on-paper, which fights the amber.
            This one is ink, so the panel holds to black and a single accent
            — .u-cta is untouched because /about still uses it.
          */}
          <Link
            href="/projects"
            className="u-mono inline-flex items-center gap-3.5 border border-ink px-6 py-4 text-ink transition-colors duration-hover ease-hover hover:bg-ink hover:text-paper"
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

        {/*
          The controls live on the panel, not over the pictures. On the light
          ground they are legible against a known colour instead of against
          whatever happens to be in the frame, and nothing has to be laid over
          the image to make them work.
        */}
        {rotating && (
          <div className="mt-12 flex items-center gap-5">
            <ul className="flex items-center gap-2.5">
              {slides.map((slide, i) => (
                <li key={slide.src}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-current={i === index}
                    aria-label={`Show image ${i + 1} of ${slides.length}`}
                    className={`block size-2.5 rounded-full border border-ink transition-colors duration-hover ease-hover ${
                      i === index ? "bg-ink" : "bg-transparent hover:bg-ink/40"
                    }`}
                  />
                </li>
              ))}
            </ul>

            {/*
              WCAG 2.2.2: the images change on their own, run past five
              seconds and sit alongside the headline, so a control that stops
              them is required. prefers-reduced-motion suppresses the
              rotation separately (2.3.3) and does not substitute for this.
            */}
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="u-mono text-ink-soft underline decoration-line underline-offset-4 transition-colors duration-hover ease-hover hover:text-ink"
            >
              {paused ? "Play" : "Pause"}
            </button>
          </div>
        )}
      </div>

      {/* ── Right: the imagery */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-paper-2 sm:aspect-16/10 lg:aspect-auto lg:h-full">
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            fetchPriority={i === 0 ? "high" : "auto"}
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover transition-opacity ease-enter"
            style={{
              opacity: i === index ? 1 : 0,
              transitionDuration: "var(--duration-camera)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
