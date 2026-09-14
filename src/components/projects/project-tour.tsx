"use client";

import Image from "next/image";
import { useState } from "react";
import type { Project } from "@/lib/schema";
import { formatDayMonthYear } from "@/lib/format";

const PROVIDER_LABELS = {
  matterport: "Matterport",
  istaging: "iStaging",
  kuula: "Kuula",
  cloudpano: "CloudPano",
  shapespark: "Shapespark",
} as const;

/**
 * A hosted 360 tour, embedded on the project page.
 *
 * It does NOT load on page load. The frame is attached only when the visitor
 * asks for it, for two reasons that both matter here:
 *
 *   A tour is tens of megabytes. Most of this audience is on a phone on
 *   mobile data, and nobody should pay for a walkthrough they did not open.
 *
 *   An iframe runs third-party code in the visitor's session and sets that
 *   party's cookies. Loading one unasked makes every visitor a Matterport or
 *   iStaging user whether or not they ever touch it. Click-to-load keeps that
 *   a choice, and the notice under the button says whose player it is.
 *
 * The poster is the project's own cover image, so the block is composed
 * rather than blank before anything is fetched.
 */
export function ProjectTour({
  tour,
  name,
  poster,
}: {
  tour: NonNullable<Project["tour"]>;
  name: string;
  poster?: { src: string; alt: string };
}) {
  const [started, setStarted] = useState(false);
  const provider = PROVIDER_LABELS[tour.provider];

  return (
    <figure className="relative isolate mt-16 w-full overflow-hidden bg-ink sm:mt-24">
      <div className="relative aspect-4/3 w-full sm:aspect-16/9">
        {started ? (
          <iframe
            src={tour.url}
            title={`${name} — 360° virtual tour of ${tour.subject}`}
            className="absolute inset-0 size-full border-0"
            /* What these players need: fullscreen, and the motion sensors
               that let a phone be moved around the room. Nothing else. */
            allow="fullscreen; accelerometer; gyroscope; magnetometer; xr-spatial-tracking"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
          />
        ) : (
          <>
            {poster && (
              <Image
                src={poster.src}
                alt={poster.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div aria-hidden className="absolute inset-0 bg-ink/55" />

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="u-mono inline-flex items-center gap-3 rounded-full border border-paper bg-paper px-7 py-4 text-ink transition-colors duration-hover ease-hover hover:bg-transparent hover:text-paper"
              >
                Start the virtual tour
                <svg
                  aria-hidden
                  viewBox="0 0 24 12"
                  className="h-2.5 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
                  <path d="M0 6h22M17 1l5 5-5 5" />
                </svg>
              </button>
              <p className="u-mono max-w-[46ch] text-paper/75">
                Opens {provider}&rsquo;s player in this page. It loads from
                their servers and may set their cookies.
              </p>
            </div>
          </>
        )}
      </div>

      <figcaption className="u-mono flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 bg-ink px-6 py-5 text-paper/75 sm:px-10 lg:px-16">
        <span>
          {name} — {tour.subject}
        </span>
        <span>
          {tour.captured
            ? `Scanned ${formatDayMonthYear(tour.captured)} · ${provider}`
            : `${provider}`}
        </span>
      </figcaption>
    </figure>
  );
}
