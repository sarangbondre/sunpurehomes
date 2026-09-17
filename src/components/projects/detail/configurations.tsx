import { LineIcon } from "@/components/brand/amenity-icons";
import { ArrowRightIcon } from "@/components/brand/icons";
import { formatArea } from "@/lib/content";
import { whatsappHref } from "@/lib/links";
import type { Project } from "@/lib/schema";
import { CLOSING, LEDES, TRUST_ROW } from "./copy";
import { ClosingLine, DetailSection, IconTile, NoteRow, SectionHead } from "./section-head";

/**
 * Every figure is shown as built-up, at the client's instruction of
 * 17 September 2026 ("it cannot be super built up, it has to be built-up").
 * The content files carry the basis; this is how each is named on the page.
 */
const AREA_BASIS_LABELS = {
  plot: "Plot area",
  "super-built-up": "Built-up area",
  "built-up": "Built-up area",
  carpet: "Carpet area",
} as const;

type Configuration = Project["configurations"][number];

/**
 * Bedrooms, read from the label ("3 BHK" → 3). Bathrooms are shown as the
 * same number at the client's instruction of 17 September 2026 — no project
 * file records them, so this is the client's rule, not a measured figure.
 */
function rooms(label: string): number | undefined {
  const m = /(\d)\s*BHK/i.exec(label);
  return m ? Number(m[1]) : undefined;
}

/**
 * "How much", to the client's reference design: a card for each kind of
 * home, then a line about them, the price band, and three notes.
 *
 * A project with up to three kinds of home gets a card each; a longer list —
 * the villa plans, the plot sizes — is a table inside one card, because a
 * table is the honest way to compare many rows.
 */
export function Configurations({ project }: { project: Project }) {
  const list = project.configurations;
  const asCards = project.type !== "plot" && list.length <= 3;

  return (
    <DetailSection>
      <SectionHead eyebrow="How much" title="Configurations" lede={LEDES.configurations} />

      <div className="mt-12 space-y-5">
        {asCards ? (
          list.map((c) => <Card key={c.label} configuration={c} />)
        ) : (
          <div className={CARD}>
            <Table list={list} />
          </div>
        )}
      </div>

      {project.facings?.length ? (
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border border-line px-6 py-5 sm:px-10">
          <span className="u-mono tracking-[0.2em] text-muted">Facing, by flat</span>
          {project.facings.map((f) => (
            <span key={f.flats} className="text-ink">
              <span className="font-display text-xl">Flats {f.flats}</span>
              <span className="ml-2 text-ink-soft">{f.facing}</span>
            </span>
          ))}
        </div>
      ) : null}

      {project.configurationsNote && (
        <p className="mt-12 flex items-center gap-6 sm:gap-10">
          <span aria-hidden className="h-px w-16 shrink-0 bg-ink/40 sm:w-24" />
          <span className="max-w-[34ch] font-display text-[clamp(1.5rem,2.6vw,2rem)] italic leading-snug">
            {project.configurationsNote}
          </span>
        </p>
      )}

      <div className="mt-12 flex flex-col gap-6 rounded-lg bg-paper-2 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex items-start gap-5">
          <IconTile size="sm">
            <LineIcon kind="document" className="size-6" />
          </IconTile>
          <div>
            <p className="u-mono flex items-center gap-4 tracking-[0.2em] text-ink">
              Pricing
              <span aria-hidden className="h-px w-10 bg-laterite/60" />
            </p>
            <p className="mt-2 max-w-[44ch] text-lg leading-relaxed text-ink">
              Prices are not published. Ask the sales team for the current
              price list for {project.name}.
            </p>
          </div>
        </div>
        <a
          href={whatsappHref(
            `Hello Sunpure Homes — please send me the price list for ${project.name}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="u-mono inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-full bg-ink px-7 py-4 text-paper transition-colors duration-hover ease-hover hover:bg-laterite sm:self-auto"
        >
          Request the price list
          <ArrowRightIcon className="size-4" />
        </a>
      </div>

      <div className="mt-10">
        <NoteRow
          items={TRUST_ROW.map((t) => ({
            icon: <LineIcon kind={t.icon} className="size-8" />,
            title: t.title,
            line: t.line,
          }))}
        />
      </div>

      <ClosingLine lines={CLOSING.configurations} />
    </DetailSection>
  );
}

const CARD =
  "rounded-lg border border-line bg-paper px-6 py-8 shadow-[0_1px_2px_rgba(28,26,24,0.04),0_10px_30px_rgba(28,26,24,0.05)] sm:px-10 sm:py-10";

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function Card({ configuration: c }: { configuration: Configuration }) {
  const area = formatArea(c.areaSqft);
  const carpet = formatArea(c.carpetAreaSqft);
  const bedrooms = rooms(c.label);
  const features = [
    bedrooms && { icon: "bed" as const, value: String(bedrooms), label: bedrooms === 1 ? "Bedroom" : "Bedrooms" },
    bedrooms && { icon: "bath" as const, value: String(bedrooms), label: bedrooms === 1 ? "Bathroom" : "Bathrooms" },
    c.balcony && {
      icon: "balcony" as const,
      // "Deep balcony" → "Deep" over "Balcony", as the reference sets it.
      value: c.balcony.split(" ")[0],
      label: capitalise(c.balcony.split(" ").slice(1).join(" ") || "balcony"),
    },
  ].filter((f): f is { icon: "bed" | "bath" | "balcony"; value: string; label: string } => Boolean(f));

  return (
    <dl className={`${CARD} grid gap-10 sm:grid-cols-2 sm:gap-0`}>
      <div className="sm:pr-10">
        <dt className="u-mono tracking-[0.22em] text-muted">Configuration</dt>
        <dd className="mt-4 font-display text-[clamp(3rem,7vw,5rem)] leading-none">{c.label}</dd>
        {c.note && (
          <dd className="u-mono mt-6 tracking-[0.24em] text-ink-soft">{c.note}</dd>
        )}
        {c.count && (
          <dd className="u-mono mt-2 tracking-[0.2em] text-muted">
            {c.count} homes{c.facing ? ` · ${c.facing}` : ""}
          </dd>
        )}
      </div>
      <div className="border-line sm:border-l sm:pl-10">
        <dt className="u-mono tracking-[0.22em] text-muted">
          {c.areaBasis ? AREA_BASIS_LABELS[c.areaBasis] : "Area"}
        </dt>
        <dd className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] leading-tight">
          {area ?? "Ask the sales team"}
        </dd>
        {carpet && (
          <dd className="mt-2 text-ink-soft">
            Carpet area <span className="text-ink">{carpet}</span>
          </dd>
        )}
        {features.length > 0 && (
          <dd className="mt-6">
            <span aria-hidden className="block h-px w-8 bg-ink/30" />
            <ul className="mt-6 flex flex-wrap gap-y-4">
              {features.map((f, i) => (
                <li
                  key={f.icon}
                  className={`min-w-[6.5rem] pr-6 ${i > 0 ? "border-l border-line pl-6" : ""}`}
                >
                  <LineIcon kind={f.icon} className="size-9 text-laterite" />
                  <span className="mt-2 block text-lg leading-tight text-ink">{f.value}</span>
                  <span className="block text-ink-soft">{f.label}</span>
                </li>
              ))}
            </ul>
          </dd>
        )}
      </div>
    </dl>
  );
}

function Table({ list }: { list: readonly Configuration[] }) {
  const bases = new Set(list.map((c) => c.areaBasis).filter((b) => b !== undefined));
  const areaHeading = bases.size === 1 ? AREA_BASIS_LABELS[[...bases][0]] : "Area";
  const showsCarpet = list.some((c) => c.carpetAreaSqft !== undefined);
  const showsFacing = list.some((c) => c.facing !== undefined);
  const showsCount = list.some((c) => c.count !== undefined);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="u-mono py-3 pr-4 font-medium text-muted">Configuration</th>
            <th scope="col" className="u-mono py-3 pr-4 font-medium text-muted">{areaHeading}</th>
            {showsCarpet && (
              <th scope="col" className="u-mono py-3 pr-4 font-medium text-muted">Carpet area</th>
            )}
            {showsFacing && (
              <th scope="col" className="u-mono py-3 pr-4 font-medium text-muted">Facing</th>
            )}
            {showsCount && (
              <th scope="col" className="u-mono py-3 text-right font-medium text-muted">Count</th>
            )}
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.label} className="border-b border-line last:border-b-0">
              <td className="py-4 pr-4 font-display text-2xl">{c.label}</td>
              <td className="py-4 pr-4 text-ink-soft">{formatArea(c.areaSqft) ?? "—"}</td>
              {showsCarpet && (
                <td className="py-4 pr-4 text-ink-soft">{formatArea(c.carpetAreaSqft) ?? "—"}</td>
              )}
              {showsFacing && <td className="py-4 pr-4 text-ink-soft">{c.facing ?? "—"}</td>}
              {showsCount && <td className="py-4 text-right text-ink-soft">{c.count ?? "—"}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
