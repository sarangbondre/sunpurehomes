"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { galleryCaption } from "@/components/projects/detail/copy";

type View = "exterior" | "interior";
type Shot = { src: string; alt: string; view: View };

const TABS = [
  { key: "all", label: "All" },
  { key: "exterior", label: "Exteriors" },
  { key: "interior", label: "Interiors" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const VIEW_LABELS: Record<View, string> = { exterior: "Exterior", interior: "Interior" };

/**
 * §11 — gallery with an accessible lightbox.
 *
 * Every thumbnail is a real <button>, reachable by keyboard; the live site
 * ships all six gallery images as href="#" (§2, defect 13). The dialog traps
 * focus natively via showModal(), closes on Escape, and returns focus to the
 * thumbnail that opened it. With JavaScript off the thumbnails still render
 * and still carry their alt text — only the enlargement is lost.
 *
 * Split into All, Exteriors and Interiors at the client's request
 * (17 September). A tab with nothing in it is not shown. The lightbox steps
 * through the tab that is open, not the whole set.
 */
export function Gallery({ shots: all, projectName }: { shots: Shot[]; projectName: string }) {
  const [tab, setTab] = useState<Tab>("all");
  const shots = tab === "all" ? all : all.filter((s) => s.view === tab);
  // Captions follow each picture's place among its own kind, so they stay
  // the same whichever tab is open.
  const captionOf = (shot: Shot) =>
    galleryCaption(shot.view, all.filter((s) => s.view === shot.view).indexOf(shot));
  const tabs = TABS.filter((t) => t.key === "all" || all.some((s) => s.view === t.key));
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openerIndex = useRef<number | null>(null);

  /**
   * Focus restoration lives in onClose, not in the Close button's handler,
   * so it also runs when the dialog is dismissed with Escape or by clicking
   * the backdrop — those paths bypass any button handler. The focus call is
   * deferred a frame so it lands after React has torn the dialog content
   * down; called synchronously it is undone by the unmount.
   */
  const handleClose = useCallback(() => {
    const index = openerIndex.current;
    setOpen(null);
    requestAnimationFrame(() => {
      if (index !== null) thumbRefs.current[index]?.focus();
    });
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Kept in sync both ways, so the element and the state cannot drift
    // apart if the dialog is dismissed by a route the component did not
    // initiate.
    if (open !== null && !dialog.open) dialog.showModal();
    if (open === null && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "ArrowRight")
        setOpen((i) => (i === null ? i : (i + 1) % shots.length));
      if (e.key === "ArrowLeft")
        setOpen((i) => (i === null ? i : (i - 1 + shots.length) % shots.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shots.length]);

  const current = open === null ? null : shots[open];

  return (
    <>
      <div role="group" aria-label="Show" className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`u-mono -mb-px border-b-2 pb-3 text-[0.8rem] tracking-[0.2em] transition-colors duration-hover ease-hover ${
              tab === t.key
                ? "border-laterite text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
        {shots.map((shot, i) => (
          <li key={shot.src}>
            <button
              type="button"
              ref={(node) => {
                thumbRefs.current[i] = node;
              }}
              onClick={() => {
                openerIndex.current = i;
                setOpen(i);
              }}
              aria-label={`Enlarge: ${shot.alt}`}
              className="group relative block aspect-[1.6] w-full overflow-hidden rounded-lg bg-paper-2 text-left"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(min-width: 640px) 46vw, 94vw"
                className="object-cover transition-transform duration-[600ms] ease-enter group-hover:scale-[1.03]"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink/90 via-ink/65 via-40% to-transparent"
              />
              <span
                aria-hidden
                className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-paper sm:inset-x-6 sm:bottom-6"
              >
                <span>
                  <span className="u-mono block tracking-[0.22em]">{VIEW_LABELS[shot.view]}s</span>
                  <span className="mt-1.5 block max-w-[18ch] font-display text-[1.4rem] leading-tight sm:text-2xl">
                    {captionOf(shot)}
                  </span>
                </span>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-paper/80 transition-colors duration-hover ease-hover group-hover:bg-paper group-hover:text-ink">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        aria-label={`${projectName} gallery`}
        className="w-full max-w-5xl bg-transparent backdrop:bg-ink/80"
      >
        {current && (
          <figure className="m-0">
            <div className="relative aspect-3/2 w-full overflow-hidden rounded-sm bg-ink">
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="object-contain"
              />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4 text-paper">
              <span className="max-w-[60ch] text-sm">{current.alt}</span>
              <span className="u-mono flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setOpen((i) =>
                      i === null ? i : (i - 1 + shots.length) % shots.length,
                    )
                  }
                >
                  Previous
                </button>
                <span className="text-paper/60">
                  {(open ?? 0) + 1} / {shots.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpen((i) => (i === null ? i : (i + 1) % shots.length))
                  }
                >
                  Next
                </button>
                <button type="button" onClick={close} className="underline underline-offset-4">
                  Close
                </button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
