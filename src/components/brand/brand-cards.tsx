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
 * The marks sit in a 12rem by 14 box and object-contain fits each one in it.
 * That box governs them in two different ways, which is worth knowing before
 * changing either number: a wide wordmark is bound by the WIDTH and ends up
 * shorter than the box, while a square one is bound by the HEIGHT and ends up
 * narrower. Both were too small on 7 October and for opposite reasons.
 *
 * At 9rem by 12, Asian Paints — the widest at 5.5:1 — came out 144 by 26,
 * half the height of Jaquar beside it, while Somany, which is square, was
 * 48 by 48. The box grew in both directions rather than one: 12rem by 14
 * puts every mark between 34 and 56px tall, where they were 26 to 48.
 *
 * There is no setting that makes a 5.5:1 wordmark and a 1:1 badge look the
 * same size, because they are not the same shape. Matching their areas would
 * need a per-brand figure in BRAND_MARKS, and that is a lot of machinery for
 * a row of logos; growing the box got most of the way for one number.
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
            <div className="mt-5 flex min-h-[4.5rem] flex-wrap items-center justify-center gap-x-8 gap-y-5">
              {group.brands.map((brand) =>
                brand.logoSrc ? (
                  <Image
                    key={brand.name}
                    src={brand.logoSrc}
                    alt={brand.name}
                    width={180}
                    height={56}
                    className="h-14 w-auto max-w-[12rem] object-contain"
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
