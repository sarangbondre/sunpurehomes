"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { rememberEntry, type Entry } from "@/lib/chatbot/entry";

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
 * The panel stays mounted once loaded and is hidden rather than removed, so a
 * conversation survives closing and reopening, and survives moving between
 * pages — this sits in the root layout, which client navigation keeps.
 */
export function Arka({ projects }: { projects: readonly ProjectOption[] }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [refocus, setRefocus] = useState(false);
  const [entry, setEntry] = useState<Entry>();
  const launcher = useRef<HTMLButtonElement>(null);

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
      <button
        ref={launcher}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={loaded ? PANEL_ID : undefined}
        onClick={() => {
          setLoaded(true);
          setOpen((o) => !o);
        }}
        className={`fixed bottom-4 right-4 z-50 items-center gap-2.5 rounded-full bg-ink py-3 pl-3.5 pr-5 text-[0.9rem] text-paper shadow-[0_6px_24px_rgba(28,26,24,0.22)] transition-colors duration-hover ease-hover hover:bg-ink-soft sm:bottom-6 sm:right-6 ${
          open ? "hidden sm:inline-flex" : "inline-flex"
        }`}
      >
        <SunMark className="size-5 text-laterite" />
        {open ? "Close Arka" : "Ask Arka"}
      </button>
    </>
  );
}
