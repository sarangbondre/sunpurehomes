"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type MenuLink = { href: string; label: string };

/**
 * The three-line menu beside the main navigation.
 *
 * It holds the pages that are not in the top three — Amenities, the
 * philosophy and contact sections of /about — so they are reachable from
 * every page rather than only from the footer, without putting five items
 * back in a nav the client asked to keep at three.
 *
 * Same control on every width, at the client's direction. It is a disclosure,
 * not a modal: it does not trap focus or block the page, because it holds
 * four links and nothing else. What it does owe the visitor is the usual
 * contract for a thing that opens — Escape closes it, a click outside closes
 * it, focus returns to the button when it does, and the button reports its
 * state so a screen reader knows whether the panel is open.
 */
export function MenuPanel({ links }: { links: readonly MenuLink[] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="more-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors duration-hover ease-hover hover:border-ink sm:size-10"
      >
        <svg aria-hidden viewBox="0 0 20 14" className="h-3 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          {open ? (
            <>
              <path d="M2 2l16 10" />
              <path d="M18 2L2 12" />
            </>
          ) : (
            <>
              <path d="M0 1h20" />
              <path d="M0 7h20" />
              <path d="M0 13h20" />
            </>
          )}
        </svg>
      </button>

      <div
        id="more-menu"
        hidden={!open}
        className="absolute right-0 top-[calc(100%+0.75rem)] z-50 min-w-[14rem] border border-line bg-paper py-2 shadow-[0_18px_40px_-24px_rgba(28,26,24,0.45)]"
      >
        <ul>
          {links.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-5 py-3 text-[0.9rem] text-ink transition-colors duration-hover ease-hover hover:bg-paper-2 hover:text-accent-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
