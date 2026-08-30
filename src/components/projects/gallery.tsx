"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Shot = { src: string; alt: string };

/**
 * §11 — gallery with an accessible lightbox.
 *
 * Every thumbnail is a real <button>, reachable by keyboard; the live site
 * ships all six gallery images as href="#" (§2, defect 13). The dialog traps
 * focus natively via showModal(), closes on Escape, and returns focus to the
 * thumbnail that opened it. With JavaScript off the thumbnails still render
 * and still carry their alt text — only the enlargement is lost.
 */
export function Gallery({ shots, projectName }: { shots: Shot[]; projectName: string }) {
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
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
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
              className="group relative block aspect-4/3 w-full overflow-hidden rounded-sm bg-paper-2"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(min-width: 640px) 30vw, 46vw"
                className="object-cover transition-transform duration-[600ms] ease-enter group-hover:scale-[1.03]"
              />
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
