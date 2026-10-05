/**
 * The hint that there is more below, at the foot of a full-height hero.
 *
 * Phones only (lg:hidden), at the client's instruction of 3 October. On a
 * desktop the fold is obvious from the window's proportions and the page
 * scrolls under the mouse; on a phone a hero that fills the screen edge to
 * edge can read as the whole page.
 *
 * It is decorative, so aria-hidden: a screen reader is already told the page
 * continues by the headings after it, and "scroll down" is meaningless to
 * someone who is not scrolling. Nothing here is a control — tapping it does
 * nothing, because a cue that moves the page would need a focus target and a
 * label, and the gesture it describes is the one the reader already has.
 *
 * The travel is motion-safe: prefers-reduced-motion leaves the mark still,
 * which is the whole point of BRIEF §8's rule about movement.
 */
export function ScrollCue({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 pb-7 lg:hidden ${className}`}
    >
      {/*
        Ink on its own short ground, which is the only version that works on
        both heroes. Paper type over the landing picture measured 1:1 against
        the highlights in the wet forecourt — invisible — and a dark shade
        behind it only reached 1.3:1, because those highlights are brighter
        than the shade is deep. A light ground decides what the type sits on
        instead of hoping the picture cooperates. On /projects, which fades
        back to paper for the filter panel anyway, it costs nothing.
      */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-paper via-paper/60 to-transparent"
      />
      {/*
        And a halo under the two marks themselves, because the band alone is
        only as good as the picture beneath it. On /projects from 5 October
        that picture is V4 at dusk, and where the band has faded to about 45%
        the words were standing on the dark plinth at 1.79:1. The halo is
        nearly solid paper at its centre and radial, so it has no edge to
        find, and it is sized to the marks rather than to the frame — the
        same device as the corner caption on the landing page. closest-side,
        not the default farthest-corner: with the origin at the centre that
        is the only size whose last stop lands on the box edge rather than
        past it, and a ramp that ends past the edge ends in mid-air and draws
        the rectangle this is meant to avoid. It did, the first time.

        It costs the landing page nothing: paper over a brighter picture is
        still paper, and that cue measured well before this was added.
      */}
      <span
        aria-hidden
        className="absolute bottom-0 left-1/2 -z-10 h-28 w-72 -translate-x-1/2 bg-[radial-gradient(ellipse_closest-side_at_center,rgba(244,240,231,0.97)_0%,rgba(244,240,231,0.93)_26%,rgba(244,240,231,0.82)_40%,rgba(244,240,231,0.64)_53%,rgba(244,240,231,0.44)_65%,rgba(244,240,231,0.26)_76%,rgba(244,240,231,0.12)_86%,rgba(244,240,231,0.04)_94%,transparent_100%)]"
      />
      <span className="u-mono text-[0.62rem] tracking-[0.3em] text-ink-soft">
        Scroll
      </span>
      <span className="motion-safe:animate-[scroll-cue_2.4s_ease-in-out_infinite]">
        <svg
          viewBox="0 0 12 22"
          className="h-5 w-3 text-ink-soft"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M6 0v18M1.5 13.5 6 18l4.5-4.5" />
        </svg>
      </span>
    </div>
  );
}
