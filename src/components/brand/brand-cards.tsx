import Image from "next/image";
import type { MaterialGroup } from "@/lib/partners";

/**
 * The brands, a card for each thing supplied: the use at the head of the
 * card, the marks centred under it, and the names beneath them.
 *
 * The client's own layout, from the Happiness IV deck they sent on 2 October.
 * It replaced a row of marks on the About page and a two-column list on the
 * project pages, and it is the same component in both places so they cannot
 * drift apart.
 *
 * 48px tall since 7 October, up from 36. Most of these are wide wordmarks
 * that the 9rem width cap governs anyway, so for them nothing changed; what
 * drove it is the square ones. SK Super Steel arrived as a tile carrying a
 * mascot and two lines of type, and at 36px it was a yellow smudge. Width is
 * still capped, so a long wordmark is still bound by its width and simply
 * ends up shorter than 48.
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
        return (
          <li
            key={group.use ?? `other-${i}`}
            className="rounded-md border border-line bg-paper px-6 py-5"
          >
            {/*
              14px, not the 11.2px this carried until 6 October: the client
              reported that buyers could not read what each card was for.
              Uppercase mono at 0.22em is the widest-set type on the site and
              the hardest of it to read small, and these labels are the only
              thing saying whether a card is paints or plumbing.

              The tracking comes in to 0.18em as the size goes up, so the
              words hold together rather than spreading into letters, and the
              colour moves from muted to ink-soft — 8.36:1 against the 4.92:1
              it had. The complaint was legibility, and half of legibility at
              this size is contrast.
            */}
            <p className="u-mono text-[0.875rem] tracking-[0.18em] text-ink-soft">
              {group.use ?? "Also"}
            </p>
            <div className="mt-5 flex min-h-[3.5rem] flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {group.brands.map((brand) =>
                brand.logoSrc ? (
                  <Image
                    key={brand.name}
                    src={brand.logoSrc}
                    alt={brand.name}
                    width={180}
                    height={56}
                    className="h-12 w-auto max-w-[9rem] object-contain"
                  />
                ) : (
                  <span
                    key={brand.name}
                    className="font-display text-xl leading-tight text-ink"
                  >
                    {brand.name}
                  </span>
                ),
              )}
            </div>
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
