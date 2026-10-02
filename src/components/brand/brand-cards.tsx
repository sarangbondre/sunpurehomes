import Image from "next/image";
import type { MaterialGroup } from "@/lib/partners";

/**
 * The brands, a card for each thing supplied: the use in small type at the
 * head of the card, the marks centred under it, and the names beneath them.
 *
 * The client's own layout, from the Happiness IV deck they sent on 2 October.
 * It replaced a row of marks on the About page and a two-column list on the
 * project pages, and it is the same component in both places so they cannot
 * drift apart.
 *
 * The names are under the marks because a mark is often unreadable at this
 * size, and several of these are wordmarks in a typeface nobody knows — the
 * card has to say what it is without them.
 *
 * A brand with no mark on file is named in the row instead, large, so a card
 * is never empty. If no brand in a group has a mark, the names carry the card
 * on their own and the caption is dropped, because it would only repeat them.
 */
export function BrandCards({ groups }: { groups: readonly MaterialGroup[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {groups.map((group, i) => {
        const marked = group.brands.filter((brand) => brand.logoSrc);
        return (
          <li
            key={group.use ?? `other-${i}`}
            className="rounded-md border border-line bg-paper px-6 py-5"
          >
            <p className="u-mono text-[0.7rem] tracking-[0.22em] text-muted">
              {group.use ?? "Also"}
            </p>
            <div className="mt-5 flex min-h-[3.5rem] flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {marked.length > 0
                ? marked.map((brand) => (
                    <Image
                      key={brand.name}
                      src={brand.logoSrc as string}
                      alt={brand.name}
                      width={180}
                      height={56}
                      className="h-9 w-auto max-w-[9rem] object-contain"
                    />
                  ))
                : group.brands.map((brand) => (
                    <span
                      key={brand.name}
                      className="font-display text-xl leading-tight text-ink"
                    >
                      {brand.name}
                    </span>
                  ))}
            </div>
            {marked.length > 0 && (
              <p className="mt-4 text-center text-sm leading-snug text-muted">
                {group.brands.map((brand) => brand.name).join(" / ")}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The client's own hedge, from the same deck. It is what makes a named brand
 * a statement of standard rather than a promise about a particular carton, so
 * it belongs with the marks rather than in small print elsewhere.
 */
export function BrandCardsNote() {
  return (
    <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted">
      Specifications may change with upgrades and availability, while ensuring
      equivalent quality and standards.
    </p>
  );
}
