"use client";

import Link from "next/link";
import { whatsappHref } from "@/lib/links";
import { SHORTLIST_LIMIT, useShortlist } from "@/lib/shortlist";

/**
 * §9.2 — up to five units, persisted, shareable over WhatsApp.
 *
 * Renders nothing until something is shortlisted, so it never occupies space
 * as an empty affordance. The PDF export is gated on contact details and
 * lands with the rest of the conversion work in Phase 5.
 */
export function ShortlistTray({
  projectSlug,
  projectName,
  unitNounSingular,
}: {
  projectSlug: string;
  projectName: string;
  unitNounSingular: string;
}) {
  const entries = useShortlist((s) => s.entries);
  const remove = useShortlist((s) => s.remove);
  const clear = useShortlist((s) => s.clear);

  const mine = entries.filter((e) => e.slug === projectSlug);
  if (entries.length === 0) return null;

  const noun = unitNounSingular.toLowerCase();
  const shareMessage =
    mine.length > 0
      ? `Hello Sunpure Homes — I'm interested in these ${noun}s at ${projectName}: ${mine
          .map((e) => e.unitId)
          .join(", ")}. Could you send me details?`
      : "";

  return (
    <section
      aria-label="Shortlist"
      className="rounded-sm border border-line bg-paper-2 p-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="u-mono text-muted">
          Shortlist {entries.length}/{SHORTLIST_LIMIT}
        </h3>
        <button
          type="button"
          onClick={clear}
          className="u-mono text-muted underline underline-offset-4 hover:text-ink"
        >
          Clear
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {entries.map((e) => (
          <li
            key={`${e.slug}-${e.unitId}`}
            className="flex items-baseline justify-between gap-4 border-b border-line pb-2"
          >
            <Link
              href={`/projects/${e.slug}/plan?unit=${encodeURIComponent(e.unitId)}`}
              className="hover:text-canopy"
            >
              {e.projectName} · {e.unitId}
            </Link>
            <button
              type="button"
              onClick={() => remove(e)}
              aria-label={`Remove ${e.unitId} from shortlist`}
              className="u-mono text-muted hover:text-ink"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {mine.length > 0 && (
        <a
          href={whatsappHref(shareMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="u-mono mt-5 block rounded-full bg-ink px-5 py-3 text-center text-paper transition-colors duration-hover ease-hover hover:bg-canopy"
        >
          Send shortlist on WhatsApp
        </a>
      )}
    </section>
  );
}
