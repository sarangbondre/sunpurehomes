"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { rememberEntry, type Entry } from "@/lib/chatbot/entry";
import { slugFromPath } from "@/lib/chatbot/paths";

export type ProjectOption = { slug: string; name: string };

/*
  The panel is loaded on first open, not with the page. BRIEF §15: most
  visitors are on mid-range Android over 4G, and most never open the chat, so
  they should not download it.
*/
const ArkaPanel = dynamic(
  () => import("@/components/chat/arka-panel").then((m) => m.ArkaPanel),
  { ssr: false },
);

const PANEL_ID = "arka-panel";

/** How long after arrival the greeting appears, once per visit. */
const TEASER_DELAY_MS = 4_000;
const TEASER_KEY = "arka:teaser-seen";

function teaserSeen(): boolean {
  try {
    return sessionStorage.getItem(TEASER_KEY) === "1";
  } catch {
    // Storage blocked: show it, at worst once per page.
    return false;
  }
}

function markTeaserSeen(): void {
  try {
    sessionStorage.setItem(TEASER_KEY, "1");
  } catch {
    // Storage blocked: nothing to remember it in.
  }
}

/** Arka's mark: a sun, since Arka is a ray of one. */
export function SunMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
      </g>
    </svg>
  );
}

/**
 * The launcher, fixed bottom-right on every page, and the panel it opens.
 *
 * Made to be noticed, at the client's request: the brand orange rather than
 * ink, a second line saying what it is for, a sun that pulses three times on
 * arrival, and a greeting that appears once per visit. The greeting sits
 * beside the launcher on wide screens, not above it, so the corner of the
 * landing hero stays clear for its caption.
 *
 * The panel stays mounted once loaded and is hidden rather than removed, so a
 * conversation survives closing and reopening, and survives moving between
 * pages — this sits in the root layout, which client navigation keeps.
 */
export function Arka({ projects }: { projects: readonly ProjectOption[] }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [refocus, setRefocus] = useState(false);
  const [entry, setEntry] = useState<Entry>();
  const [teaser, setTeaser] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const pageProject = projects.find((p) => p.slug === slugFromPath(pathname));

  useEffect(() => {
    if (teaserSeen()) return;
    const timer = setTimeout(() => setTeaser(true), TEASER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function openChat() {
    setLoaded(true);
    setOpen(true);
    setTeaser(false);
    markTeaserSeen();
  }

  function dismissTeaser() {
    setTeaser(false);
    markTeaserSeen();
  }

  // On arrival, not on first open: by then the visitor may have moved pages.
  useEffect(() => {
    setEntry(rememberEntry());
  }, []);

  /*
    On a phone the panel covers the launcher, which is hidden while it is
    open. Focus goes back to it after the render that shows it again —
    focusing it synchronously would target an element that is still hidden.
  */
  useEffect(() => {
    if (!open && refocus) {
      launcher.current?.focus();
      setRefocus(false);
    }
  }, [open, refocus]);

  return (
    <>
      {loaded && (
        <ArkaPanel
          id={PANEL_ID}
          open={open}
          projects={projects}
          entry={entry}
          onClose={() => {
            setOpen(false);
            setRefocus(true);
          }}
        />
      )}
      <div
        className={`fixed bottom-4 right-4 z-50 flex-col items-end gap-3 sm:bottom-6 sm:right-6 lg:flex-row lg:items-center ${
          open ? "hidden sm:flex" : "flex"
        }`}
      >
        {teaser && !open && (
          <div className="relative max-w-[17.5rem] rounded-2xl border border-line bg-paper py-3.5 pl-4 pr-10 text-ink shadow-[0_12px_40px_rgba(28,26,24,0.18)] motion-safe:animate-[arka-in_220ms_ease-out]">
            <button type="button" onClick={openChat} className="text-left">
              <span className="block font-display text-lg leading-tight">Hi, I&rsquo;m Arka.</span>
              <span className="mt-1 block text-sm leading-snug text-ink-soft">
                {pageProject
                  ? `Questions about ${pageProject.name}? Ask me — sizes, amenities, what's nearby.`
                  : "Ask me about any Sunpure project — sizes, amenities, what's nearby."}
              </span>
            </button>
            <button
              type="button"
              onClick={dismissTeaser}
              aria-label="Dismiss Arka's greeting"
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full text-muted transition-colors duration-hover ease-hover hover:bg-paper-2 hover:text-ink"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )}

        <button
          ref={launcher}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={loaded ? PANEL_ID : undefined}
          onClick={() => (open ? setOpen(false) : openChat())}
          /*
            --accent-ink, not --laterite: paper type on the brand orange
            measures 2.95:1, on the deepened stand-in 4.51:1. The sun sits on
            a paper disc in the same colour, for the same reason.
          */
          className="inline-flex shrink-0 items-center gap-3 rounded-full bg-accent-ink py-2 pl-2 pr-5 text-paper shadow-[0_10px_30px_rgba(192,69,15,0.38)] transition-colors duration-hover ease-hover hover:bg-ink sm:py-2.5 sm:pl-2.5 sm:pr-6"
        >
          <span className="relative flex size-9 items-center justify-center rounded-full bg-paper sm:size-10">
            {!open && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-paper motion-safe:animate-[arka-halo_2.2s_ease-out_1s_3]"
              />
            )}
            <SunMark className="relative size-6 text-accent-ink" />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-[0.98rem] font-medium">
              {open ? "Close Arka" : "Ask Arka"}
            </span>
            {!open && (
              <span className="hidden text-[0.8rem] font-medium sm:block">
                Questions about our homes?
              </span>
            )}
          </span>
        </button>
      </div>
    </>
  );
}
