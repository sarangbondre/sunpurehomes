import Image from "next/image";
import type { MaterialPartner } from "@/lib/partners";

/**
 * The material partners as a row of pills, each carrying its mark.
 *
 * The mark is decorative: the name is right beside it in the same pill, and
 * a screen reader that read both would say every brand twice. Where no mark
 * has been supplied the pill is the name on its own — see lib/partners.ts.
 */
export function PartnerList({
  partners,
  size = "md",
}: {
  partners: readonly MaterialPartner[];
  /** sm on a project page, where the list sits inside a column of detail. */
  size?: "sm" | "md";
}) {
  const pill =
    size === "sm" ? "gap-2 px-4 py-2 text-sm" : "gap-2.5 px-5 py-2.5";
  const mark = size === "sm" ? "h-4" : "h-5";

  return (
    <ul className="flex flex-wrap gap-2">
      {partners.map((partner) => (
        <li
          key={partner.name}
          className={`inline-flex items-center rounded-full border border-line text-ink-soft ${pill}`}
        >
          {partner.logoSrc && (
            <Image
              src={partner.logoSrc}
              alt=""
              width={96}
              height={24}
              className={`${mark} w-auto object-contain`}
            />
          )}
          {partner.name}
        </li>
      ))}
    </ul>
  );
}
