import Image from "next/image";
import { LineIcon } from "@/components/brand/amenity-icons";
import type { Project } from "@/lib/schema";
import { ASIDES, CLOSING, LEDES, groupCopy, itemCopy } from "./copy";
import { Aside, ClosingLine, DetailSection, IconTile, SectionHead } from "./section-head";

type Shot = { src: string; alt: string };

/**
 * "Built to", to the client's reference design: a card per group — its
 * drawing, name and a line on the left; what it contains in the middle, the
 * items the reference names ("Underground electrical system", "100% power
 * backup") with their own drawing and line; and a captioned picture on the
 * right.
 *
 * The pictures are the project's own renders, not photographs of switches or
 * taps, and the captions say nothing a render could be taken to show.
 */
export function Specifications({
  project,
  shots,
}: {
  project: Project;
  shots: readonly Shot[];
}) {
  return (
    <DetailSection>
      <SectionHead
        eyebrow="Built to"
        title="Specifications"
        lede={LEDES.specifications}
        aside={ASIDES.specifications}
      />
      <div className="mt-12 space-y-5">
        {project.specifications.map((group, i) => {
          const shot = shots[i];
          const copy = groupCopy(group.group);
          return (
            <article
              key={group.group}
              className="grid overflow-hidden rounded-lg border border-line bg-paper shadow-[0_1px_2px_rgba(28,26,24,0.04)] md:grid-cols-[15rem_1fr] lg:grid-cols-[17rem_1fr_19rem]"
            >
              <div className="flex items-center gap-5 border-b border-line px-6 py-6 md:flex-col md:items-start md:justify-center md:border-b-0 md:border-r md:px-8 md:py-10">
                <IconTile size="lg">
                  <LineIcon kind={copy.icon} className="size-9" />
                </IconTile>
                <div>
                  <h3 className="u-mono text-[0.85rem] tracking-[0.24em] text-ink">{group.group}</h3>
                  <p className="mt-2 max-w-[16ch] font-display text-lg leading-snug text-ink-soft">
                    {copy.line}
                  </p>
                </div>
              </div>

              <ul className="grid content-center gap-x-8 gap-y-5 px-6 py-7 md:px-10 md:py-10 xl:grid-cols-2">
                {group.items.map((item) => {
                  const known = itemCopy(item);
                  return (
                    <li key={item} className="flex items-center gap-4">
                      {known ? (
                        <IconTile size="sm">
                          <LineIcon kind={known.icon} className="size-6" />
                        </IconTile>
                      ) : (
                        <span aria-hidden className="ml-1 size-1.5 shrink-0 rounded-full bg-laterite" />
                      )}
                      <span>
                        <span className={`block leading-snug text-ink ${known ? "font-display text-xl" : "text-lg"}`}>
                          {item}
                        </span>
                        {known && (
                          <span className="mt-0.5 block font-display text-ink-soft">{known.line}</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {shot && (
                <div className="relative hidden min-h-[14rem] lg:block">
                  <Image src={shot.src} alt="" fill sizes="19rem" className="object-cover" />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/5"
                  />
                  <p className="u-mono absolute bottom-6 left-6 right-6 leading-[1.9] tracking-[0.24em] text-paper">
                    {copy.caption}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
      <ClosingLine lines={CLOSING.specifications}>
        <Aside lines={CLOSING.specificationsAside} />
      </ClosingLine>
    </DetailSection>
  );
}
