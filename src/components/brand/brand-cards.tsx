import Image from "next/image";
import {
  markSize,
  type MaterialGroup,
  type ProjectMaterial,
} from "@/lib/partners";

/**
 * The brands, a card for each thing supplied: the use at the head of the
 * card, the marks centred under it, and the names beneath them.
 *
 * The client's own layout, from the Happiness IV deck they sent on 2 October.
 * It replaced a row of marks on the About page and a two-column list on the
 * project pages, and it is the same component in both places so they cannot
 * drift apart.
 *
 * Each mark is drawn at its own height, from markHeight, so they all cover
 * roughly the same AREA of the card. A single box cannot do that: cap the
 * height and a 5.5:1 wordmark is six times the area of a square badge; cap
 * the width and the square one is the bigger of the two. These range from
 * 5.5:1 to 1:1, so there is no one box that suits both ends.
 *
 * The client asked twice for the small ones to grow, naming blocks, steel and
 * tiles on the second time — Qcon, SK Super Steel and Somany, all square.
 * They are 72px tall now against 48, while the wide wordmarks they were
 * asked to match barely moved.
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
            <div className="mt-5 flex min-h-[5.25rem] flex-wrap items-center justify-center gap-x-8 gap-y-5">
              {group.brands.map((brand) =>
                brand.logoSrc ? (
                  /*
                    The computed size is the element's size, not a box it is
                    fitted inside: width and height both come from markSize,
                    so the box is the mark. Giving next/image a fixed 180x56
                    and letting width:auto work it out used ITS ratio rather
                    than the file's, which left a square mark sitting in a
                    192px-wide element with invisible space either side — and
                    flex rows wrapped against space nobody could see.
                  */
                  <Image
                    key={brand.name}
                    src={brand.logoSrc}
                    alt={brand.name}
                    {...markSize(brand.name)}
                    className="object-contain"
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

/**
 * The same marks with no categories: one card, every brand in it, nothing
 * saying what any of them supplies.
 *
 * This is the About page's "What goes in" as the client asked for it on
 * 6 November 2026 — the list back, the trade labels not. On a project page a
 * category earns its place, because a buyer reading about one development
 * wants to know which brand is the plumbing and which is the lift. On About
 * the same labels answer a question nobody asked: the page is making the
 * point that these names recur across all nine developments, and splitting
 * sixteen marks into twelve labelled boxes buries it.
 *
 * It renders from the same ProjectMaterial and the same markSize as
 * BrandCards, so the two cannot drift: a mark that grows there grows here.
 * What it does NOT do is take MaterialGroup — a caller has to flatten, which
 * is the point at which someone decides the categories are going.
 */
export function BrandMarks({ brands }: { brands: readonly ProjectMaterial[] }) {
  return (
    <div className="rounded-md border border-line bg-paper px-6 py-8 sm:px-10">
      {/*
        A list, not a row of images: these are sixteen separate names and a
        screen reader should be told how many. The marks carry their brand in
        alt text, so the names are not repeated visibly — the same bargain
        BrandCards strikes.

        Centred rather than left-aligned because the last row is always short
        and a ragged left edge under three full rows reads as a mistake.
      */}
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
        {brands.map((brand) => (
          <li key={brand.name} className="flex items-center justify-center">
            {brand.logoSrc ? (
              <Image
                src={brand.logoSrc}
                alt={brand.name}
                {...markSize(brand.name)}
                className="object-contain"
              />
            ) : (
              <span className="font-display text-xl leading-tight text-ink">
                {brand.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
