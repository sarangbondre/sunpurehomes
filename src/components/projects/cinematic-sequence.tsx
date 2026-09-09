"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * A scroll-driven cinematic sequence built from the project's own
 * photographs: each shot holds, pushes in slowly, and hands over to the next
 * as the page scrolls, with a small pointer-led drift for depth.
 *
 * Three constraints shaped this, all from the brief:
 *
 *   §8  motion reveals structure and is never decorative, and
 *       prefers-reduced-motion must disable parallax entirely — not soften
 *       it. Reduced motion here renders a single still and no scroll effect.
 *   §9.4 the floor is 30fps on a mid-range Android over 4G. Only transform
 *       and opacity are animated, they are written straight to the DOM in one
 *       rAF rather than through React state, and the loop stops the moment
 *       the section leaves the viewport.
 *   §15 the audience is largely on 4G, so at most three frames are mounted
 *       at once. Seven full-bleed images in the DOM would all decode at once
 *       inside a sticky viewport, because every one of them counts as
 *       on-screen.
 *
 * With JavaScript off the first shot renders as an ordinary image, which is
 * exactly what the page showed before this existed.
 */

type Shot = { src: string; alt: string };

const HOLD_VH = 90; // scroll distance per shot, in vh

export function CinematicSequence({ shots }: { shots: Shot[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState(false);

  // Opt in only once we know the device wants motion. Server and first client
  // render therefore agree: a plain still.
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setEnabled(!motion.matches);
    apply();
    motion.addEventListener("change", apply);
    return () => motion.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current;
    if (!section) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let raf = 0;
    let running = false;

    const onPointer = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const frame = () => {
      if (!running) return;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress =
        travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0;

      const exact = progress * (shots.length - 1);
      const index = Math.min(Math.floor(exact), shots.length - 1);
      const local = exact - index;

      setActive((current) => (current === index ? current : index));

      // Ease the pointer so it trails rather than snaps.
      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.06;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.06;

      for (let i = 0; i < shots.length; i++) {
        const layer = layerRefs.current[i];
        if (!layer) continue;

        const distance = i - index;
        // The outgoing shot fades across the second half of the hand-over.
        const opacity =
          distance === 0 ? 1 - Math.max(local - 0.72, 0) / 0.28
          : distance === 1 ? Math.max(local - 0.72, 0) / 0.28
          : 0;

        if (opacity <= 0.001) {
          layer.style.opacity = "0";
          continue;
        }

        const push = distance === 0 ? local : 0;
        const scale = 1.06 + push * 0.07;
        const driftX = pointer.current.x * -14;
        const driftY = pointer.current.y * -10 - push * 18;

        layer.style.opacity = String(opacity);
        layer.style.transform = `translate3d(${driftX}px, ${driftY}px, 0) scale(${scale})`;
      }

      if (captionRef.current) {
        captionRef.current.style.opacity = String(
          local < 0.72 ? Math.min(local / 0.12, 1) : Math.max(1 - (local - 0.72) / 0.2, 0),
        );
      }

      raf = requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          if (finePointer) window.addEventListener("pointermove", onPointer);
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
          window.removeEventListener("pointermove", onPointer);
        }
      },
      { rootMargin: "10% 0px" },
    );
    observer.observe(section);

    return () => {
      running = false;
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [enabled, shots.length]);

  // Reduced motion, or before the check resolves: the still the page had.
  if (!enabled) {
    const first = shots[0];
    return (
      <div className="relative mt-12 aspect-16/9 w-full overflow-hidden bg-paper-2 sm:mt-16">
        <Image
          src={first.src}
          alt={first.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Project sequence"
      className="relative mt-12 sm:mt-16"
      style={{ height: `${shots.length * HOLD_VH}vh` }}
    >
      <div className="sticky top-20 h-[calc(100svh-5rem)] overflow-hidden bg-ink sm:top-24 sm:h-[calc(100svh-6rem)]">
        {shots.map((shot, i) =>
          Math.abs(i - active) <= 1 ? (
            <div
              key={shot.src}
              ref={(node) => {
                layerRefs.current[i] = node;
              }}
              className="absolute inset-0 will-change-transform"
              style={{ opacity: i === active ? 1 : 0 }}
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ) : null,
        )}

        {/* Keeps the caption legible over any frame. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink/80 to-transparent"
        />

        <p
          ref={captionRef}
          className="absolute inset-x-0 bottom-0 mx-auto max-w-[86rem] px-6 pb-10 text-lg text-paper sm:px-10 sm:text-xl lg:px-16"
          style={{ opacity: 0 }}
        >
          {shots[active]?.alt}
        </p>

        <p className="u-mono absolute right-6 top-6 text-paper/70 sm:right-10 lg:right-16">
          {String(active + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}
