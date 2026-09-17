import { AmenityIcon } from "@/components/brand/amenity-icons";
import type { Project } from "@/lib/schema";
import { ArrowRightIcon } from "@/components/brand/icons";
import { CLOSING, LEDES } from "./copy";
import { ClosingLine, DetailSection, IconTile, SectionHead } from "./section-head";

/**
 * "On site", to the client's reference design: every amenity in a cell with
 * its drawing above its name, the cells ruled apart.
 *
 * Each cell draws its right and bottom rule; the list is pulled a pixel past
 * its frame so the outermost rules are clipped, leaving only the lines
 * between cells — and nothing at all in the gap after a short last row.
 */
export function AmenitiesGrid({ project }: { project: Project }) {
  return (
    <DetailSection>
      <SectionHead eyebrow="On site" title="Amenities" lede={LEDES.amenities} />
      <div className="mt-12 overflow-hidden">
      <ul className="-mb-px -mr-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {project.amenities.map((a) => (
          <li
            key={a.name}
            className="flex flex-col items-center gap-5 border-b border-r border-line px-3 py-9 text-center sm:px-6 sm:py-11"
          >
            <IconTile size="lg">
              <AmenityIcon name={a.name} className="size-9" />
            </IconTile>
            <span className="max-w-[16ch] font-display text-[1.3rem] leading-snug sm:text-2xl">
              {a.name}
            </span>
            {a.description && (
              <span className="-mt-3 max-w-[24ch] text-sm text-ink-soft">{a.description}</span>
            )}
          </li>
        ))}
      </ul>
      </div>
      <ClosingLine lines={CLOSING.amenities}>
        <a
          href="#gallery"
          className="u-mono inline-flex items-center gap-4 self-start border-b border-ink pb-2 tracking-[0.2em] text-ink transition-colors duration-hover ease-hover hover:border-laterite hover:text-laterite sm:self-auto"
        >
          See the gallery
          <ArrowRightIcon className="size-4" />
        </a>
      </ClosingLine>
    </DetailSection>
  );
}
