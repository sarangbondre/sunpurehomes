import Image from "next/image";
import type { MaterialPartner } from "@/lib/partners";

/**
 * The material partners as a row of marks.
 *
 * The mark alone, at the client's instruction of 29 September 2026 — the
 * name used to sit beside it. The brand is still named for anyone who cannot
 * see the mark, as the image's alt text. Where no mark has been supplied the
 * name stands in its place, because a blank card says nothing: see
 * lib/partners.ts for how a file is found.
 */
export function PartnerList({
  partners,
  size = "md",
}: {
  partners: readonly MaterialPartner[];
  /** sm on a project page, where the list sits inside a column of detail. */
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "min-h-12 min-w-28 px-4 py-2" : "min-h-14 min-w-32 px-5 py-3";
  const mark = size === "sm" ? "h-6" : "h-8";

  return (
    <ul className="flex flex-wrap gap-3">
      {partners.map((partner) => (
        <li
          key={partner.name}
          className={`inline-flex items-center justify-center rounded-md border border-line bg-paper ${box}`}
        >
          {partner.logoSrc ? (
            <Image
              src={partner.logoSrc}
              alt={partner.name}
              width={160}
              height={48}
              className={`${mark} w-auto max-w-[8rem] object-contain`}
            />
          ) : (
            <span className="font-display text-lg leading-tight text-ink">{partner.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
