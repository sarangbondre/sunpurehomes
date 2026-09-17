import type { ReactNode } from "react";
import { amenityIcon, type AmenityIcon as Kind } from "@/lib/amenity-icon";

/**
 * A line drawing for each amenity, at the client's request.
 *
 * Outlined on the 24-unit grid, like the phone and mail marks in icons.tsx,
 * and stroked in currentColor so the list that holds them sets their colour.
 * They are decoration beside a name that is always written out, so they are
 * hidden from screen readers.
 */

const DOT = { fill: "currentColor", stroke: "none" } as const;

const DRAWINGS: Record<Kind, ReactNode> = {
  ev: (
    <>
      <path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 0 1-10 0Z" />
      <path d="M12 16v5M12.8 9l-2 2.6h2.4l-2 2.4" />
    </>
  ),
  lift: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="m9 9.5 3-3 3 3M9 14.5l3 3 3-3" />
    </>
  ),
  gas: (
    <path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-1.5-2-1.5-3C7.5 10 6 12.5 6 15a6 6 0 0 0 6 6Z" />
  ),
  "hot-water": (
    <>
      <path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z" />
      <path d="M12 9v8M17.5 5.5c1 1 1 2 0 3s-1 2 0 3" />
    </>
  ),
  power: <path d="M13 2.5 4.5 14H11l-1 7.5L18.5 10H12Z" />,
  water: (
    <>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
      <path d="M9.5 14.5A2.5 2.5 0 0 0 12 17" />
    </>
  ),
  rain: (
    <>
      <path d="M7 14a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.5A3.3 3.3 0 0 1 17 14Z" />
      <path d="m8.5 17-1 3M12.5 17l-1 3M16.5 17l-1 3" />
    </>
  ),
  utilities: (
    <>
      <path d="M3 7h9a4 4 0 0 1 4 4v10M3 11h7a2 2 0 0 1 2 2v8" />
      <path d="M3 5v8M10 21h8" />
    </>
  ),
  camera: (
    <>
      <path d="m3 7.5 12-3 1.5 6-12 3Z" />
      <path d="m16.2 9 4-1 .8 3-4 1M8 12.5 9 17H4.5M4.5 14.5v5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  lamp: (
    <>
      <path d="M8 21h8M12 21V8a4 4 0 0 1 4-4h1" />
      <path d="M15 7h5l-1-3h-3Z" />
    </>
  ),
  road: <path d="M8 3 4 21M16 3l4 18M12 4v3M12 10.5v3M12 17v4" />,
  parking: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M10 17V8h3a2.5 2.5 0 0 1 0 5h-3" />
    </>
  ),
  walk: (
    <>
      <circle cx="13.5" cy="4.5" r="1.6" />
      <path d="m9 21 2.5-6.5L14 16l1 5M11.5 14.5 12.5 9l-3 1.5L8 13.5M12.5 9l2 3 3 1" />
    </>
  ),
  footprints: (
    <>
      <path d="M8 3c1.7 0 2.5 1.8 2.5 4S9.8 11 8 11 5.5 9.2 5.5 7 6.3 3 8 3Z" />
      <path d="M6 13.5h4V15a2 2 0 0 1-4 0Z" />
      <path d="M16 8c1.7 0 2.5 1.8 2.5 4s-.7 4-2.5 4-2.5-1.8-2.5-4 .8-4 2.5-4Z" />
      <path d="M14 18.5h4V20a2 2 0 0 1-4 0Z" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18M6 5.2c3.2 3.4 3.2 10.2 0 13.6M18 5.2c-3.2 3.4-3.2 10.2 0 13.6" />
    </>
  ),
  play: <path d="M4 21 7 4M20 21 17 4M5.5 4h13M10 4v10M14 4v10M8.5 14h7" />,
  fitness: <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />,
  yoga: (
    <>
      <path d="M12 20c-2.5-2-3.5-5-3.5-8S10 6 12 4c2 2 3.5 5 3.5 8s-1 6-3.5 8Z" />
      <path d="M12 20c-4 0-8-2-9-6 3 0 5.5 1 7 3M12 20c4 0 8-2 9-6-3 0-5.5 1-7 3" />
    </>
  ),
  amphitheatre: <path d="M2 20h20M3 20a9 9 0 0 1 18 0M6.5 20a5.5 5.5 0 0 1 11 0M10 20a2 2 0 0 1 4 0" />,
  games: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.2" {...DOT} />
      <circle cx="15.5" cy="8.5" r="1.2" {...DOT} />
      <circle cx="12" cy="12" r="1.2" {...DOT} />
      <circle cx="8.5" cy="15.5" r="1.2" {...DOT} />
      <circle cx="15.5" cy="15.5" r="1.2" {...DOT} />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5C10 5 7 4.5 4 5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5Z" />
      <path d="M12 6.5v14" />
    </>
  ),
  bench: <path d="M5 10V7h14v3M3.5 10h17M3.5 14h17M6 14v5M18 14v5" />,
  pavilion: <path d="M2.5 9.5 12 4l9.5 5.5M4 9.5h16M6 9.5V20M18 9.5V20M3 20h18" />,
  hall: (
    <>
      <path d="M3 20h18M5 20V10l7-5 7 5v10" />
      <path d="M10 20v-5h4v5M9 11h6" />
    </>
  ),
  arch: <path d="M2 21h20M4 21V10a8 8 0 0 1 16 0v11M8 21V10.5a4 4 0 0 1 8 0V21" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  home: (
    <>
      <path d="M3 11 12 4l9 7M5 9.5V20h14V9.5" />
      <path d="M9 20v-5h6v5" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15Z" />
      <path d="m5 19 8-8" />
    </>
  ),
  tree: (
    <>
      <path d="M12 15c-4 0-6-2.5-6-5.5S8.5 3 12 3s6 3.5 6 6.5S16 15 12 15Z" />
      <path d="M12 21V11M12 15l-2.5-2.5M9 21h6" />
    </>
  ),
};

/** The drawing for an amenity, falling back to a leaf for an unknown name. */
export function AmenityIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {DRAWINGS[amenityIcon(name) ?? "leaf"]}
    </svg>
  );
}
