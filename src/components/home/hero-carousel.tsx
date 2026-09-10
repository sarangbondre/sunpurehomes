"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type HeroSlide = { src: string; alt: string };

/**
 * The crossfading hero background.
 *
 * WCAG 2.2.2 (Pause, Stop, Hide) applies here: this moves on its own, runs
 * longer than five seconds and sits alongside the headline, so it needs a
 * control that stops it. That is what the pause button is — not a nicety.
 * `prefers-reduced-motion` suppresses the rotation entirely, which is a
 * different requirement (2.3.3) and does not substitute for the button.
 *
 * Only the first slide is priority-loaded; it is the LCP element. The rest
 * load lazily, so a six-image hero does not cost six images on first paint.
 */
export function HeroCarousel({
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
    <>
      {slides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          fetchPriority={i === 0 ? "high" : "auto"}
          sizes="100vw"
          className="object-cover transition-opacity ease-enter"
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: "var(--duration-camera)",
          }}
        />
      ))}

      {rotating && (
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-4 sm:bottom-8 sm:right-10 lg:right-16">
          <ul className="flex items-center gap-2.5">
            {slides.map((slide, i) => (
              <li key={slide.src}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index}
                  aria-label={`Show image ${i + 1} of ${slides.length}`}
                  className={`block size-2.5 rounded-full border border-paper transition-colors duration-hover ease-hover ${
                    i === index ? "bg-paper" : "bg-transparent hover:bg-paper/50"
                  }`}
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="u-mono rounded-full border border-paper/70 px-4 py-2 text-paper transition-colors duration-hover ease-hover hover:bg-paper hover:text-ink"
          >
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      )}
    </>
  );
}
