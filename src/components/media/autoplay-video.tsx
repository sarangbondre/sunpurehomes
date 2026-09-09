"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A muted, looping clip layered over a poster still — the home hero and the
 * per-project films both use it.
 *
 * Two things this deliberately does not do:
 *
 *   It does not render a `src` on the server, and sets `preload="none"`.
 *   The poster is the LCP element; a hero clip is several megabytes and
 *   would otherwise contend with it on the first paint. The source is
 *   attached after mount, once the still has had its turn.
 *
 *   It does not play when the visitor has asked for reduced motion. The
 *   poster is then the entire hero, which is why the still has to stand on
 *   its own as a composition rather than being a blurred first frame.
 *
  * It does not carry a `poster` attribute either. The still behind it is a
 * next/image, already optimised and already painted; a poster here would be
 * a second, unoptimised download of the same frame that nobody ever sees,
 * because this element is transparent until it is playing.
 *
 * The fade masks the swap from still to first video frame; they are the
 * same shot, so without it the join reads as a flicker.
 */
export function AutoplayVideo({
  src,
  className = "absolute inset-0 size-full object-cover",
}: {
  src: string;
  /** Layout is the caller's; this component owns behaviour only. */
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    /*
      Most of this audience arrives on a phone on mobile data. Eight
      megabytes of drone footage is not worth their money when they have
      told the browser to economise, and the poster loses them nothing.
    */
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) {
      return;
    }

    /*
      play() is what starts the fetch. `preload="none"` keeps the clip out of
      the first paint, and it also means the element never buffers on its
      own — so waiting on `canplay` would wait forever. Calling play()
      directly both loads and starts, and its promise is the honest signal
      that a frame is actually on screen.

      It rejects when autoplay is refused — iOS Low Power Mode, a data
      saver, a browser media setting — and when the file is missing or
      undecodable. Every one of those has the same right answer: leave
      `ready` false so the poster remains, which is a complete hero on its
      own. There is nothing to report to the visitor.
    */
    let cancelled = false;
    video.src = src;

    const attempt = () => {
      if (cancelled) return;
      video.play().then(
        () => !cancelled && setReady(true),
        () => {
          /*
            Nothing to do here, and nothing to tell the visitor: the poster
            is a complete hero. Retried on the next visibilitychange, which
            is the case that actually recovers — see below.
          */
        },
      );
    };

    attempt();

    /*
      A page opened in a background tab is the common failure. Chrome pauses
      "video-only background media to save power", so the first play()
      rejects, and without this the clip would stay frozen behind the poster
      for the whole session even after the visitor switches to the tab.
    */
    const onVisibilityChange = () => {
      if (!document.hidden && video.paused) attempt();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      video.pause();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      preload="none"
      muted
      loop
      playsInline
      /* Decorative: the poster's alt on the parent already describes the shot. */
      aria-hidden
      tabIndex={-1}
      className={`${className} transition-opacity ease-enter ${
        ready ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: "var(--duration-camera)" }}
    />
  );
}
