import Image from "next/image";
import {
  ArrowRightIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/brand/icons";
import { mailtoHref, projectEnquiryMessage, telHref, whatsappHref } from "@/lib/links";
import type { Project } from "@/lib/schema";
import { site } from "@/lib/site";
import { LineIcon } from "@/components/brand/amenity-icons";
import { ASIDES, CLOSING, visitRow } from "./copy";
import { Aside, NoteRow, SectionHead } from "./section-head";

/**
 * A maps search for the published address. No project has coordinates (see
 * the schema), so the address is the query; built from our own content, never
 * from anything a visitor supplied.
 */
function directionsHref(addressLines: readonly string[]): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines.join(", "))}`;
}

/**
 * "Come and look", to the client's reference design: the three ways to reach
 * the sales team, the address with directions, and a picture of the project
 * fading in from the right.
 */
export function Visit({
  project,
  shot,
}: {
  project: Project;
  shot?: { src: string; alt: string };
}) {
  const address = project.location.addressLines;
  const place = /mysuru|mysore/i.test(project.location.label)
    ? project.location.label
    : `${project.location.label}, ${site.city}`;
  const pill =
    "inline-flex w-full max-w-[26rem] items-center gap-4 rounded-full border px-6 py-4 transition-colors duration-hover ease-hover";

  return (
    <section className="relative isolate overflow-hidden border-t border-line">
      {/*
        Full width, so the picture runs to the edge of the screen; the text
        column is padded to line up with the page's 86rem measure.
      */}
      <div className="grid lg:grid-cols-2">
        <div className="px-6 py-16 sm:px-10 sm:py-24 lg:pl-[max(4rem,calc((100vw-86rem)/2+4rem))] lg:pr-12">
          <SectionHead
            eyebrow="Next"
            title="Come and look"
            lede={`Experience ${project.name} in person. Talk to our sales team or schedule a site visit.`}
          />

          <div className="mt-10 flex flex-col gap-3">
            <a
              href={whatsappHref(projectEnquiryMessage(project.name))}
              target="_blank"
              rel="noopener noreferrer"
              className={`${pill} u-mono justify-between border-ink bg-ink text-[0.8rem] tracking-[0.2em] text-paper hover:border-laterite hover:bg-laterite`}
            >
              <span className="flex items-center gap-4">
                <WhatsAppIcon className="size-6" />
                WhatsApp the sales team
              </span>
              <ArrowRightIcon className="size-4" />
            </a>
            <a
              href={telHref}
              className={`${pill} u-mono border-line text-[0.85rem] tracking-[0.16em] text-ink hover:border-ink`}
            >
              <PhoneIcon className="size-5" />
              {site.contact.phoneDisplay}
            </a>
            <a
              href={mailtoHref}
              className={`${pill} u-mono whitespace-nowrap border-line text-[clamp(0.7rem,3.2vw,0.85rem)] tracking-[0.1em] text-ink hover:border-ink`}
            >
              <MailIcon className="size-5" />
              {site.contact.email}
            </a>
          </div>

          {address.length > 0 && (
            <div className="mt-14">
              <h3 className="u-mono flex items-center gap-4 text-[0.8rem] tracking-[0.22em] text-ink-soft">
                Address
                <span aria-hidden className="h-px w-16 bg-ink/25" />
              </h3>
              <div className="mt-6 flex gap-4">
                <PinIcon className="mt-1 size-6 text-ink-soft" />
                <div>
                  <address className="not-italic">
                    <span className="block font-display text-2xl leading-snug">{address[0]}</span>
                    {address.slice(1).map((line) => (
                      <span key={line} className="block text-lg leading-relaxed text-ink-soft">
                        {line}
                      </span>
                    ))}
                  </address>
                  <a
                    href={directionsHref(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="u-mono mt-6 inline-flex items-center gap-4 border-b border-ink pb-2 tracking-[0.2em] text-ink transition-colors duration-hover ease-hover hover:border-laterite hover:text-laterite"
                  >
                    Get directions
                    <ArrowRightIcon className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {shot && (
          <div className="relative min-h-[24rem] lg:min-h-full">
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/20" />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-paper to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-2/5 lg:bg-gradient-to-r lg:from-paper lg:via-paper/50"
            />
            {/* Its own shade: the top of a render is usually bright sky. */}
            <div
              aria-hidden
              className="absolute right-0 top-0 hidden h-64 w-72 bg-[radial-gradient(ellipse_100%_100%_at_top_right,rgba(28,26,24,0.85)_0%,rgba(28,26,24,0.6)_40%,rgba(28,26,24,0.2)_75%,transparent_100%)] sm:block"
            />
            <Aside
              lines={ASIDES.visit}
              tone="paper"
              className="absolute right-8 top-10 hidden rounded-sm bg-ink/55 py-3 pr-5 backdrop-blur-sm sm:block"
            />
            <div className="absolute bottom-8 left-8 right-8 lg:left-[40%]">
              <span aria-hidden className="block h-px w-16 bg-paper/70" />
              <p className="mt-4 font-display text-[clamp(1.5rem,2.4vw,2rem)] italic leading-snug text-paper">
                {CLOSING.visitImage.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-line bg-paper-2">
        <div className="mx-auto max-w-[86rem] px-6 py-10 sm:px-10 lg:px-16">
          <NoteRow
            items={visitRow(place).map((n) => ({
              icon: <LineIcon kind={n.icon} className="size-9" />,
              title: n.title,
              line: n.line,
            }))}
          />
        </div>
      </div>
      <div className="mx-auto flex max-w-[86rem] flex-wrap items-end justify-between gap-6 px-6 pb-4 pt-12 sm:px-10 lg:px-16">
        <p className="u-mono tracking-[0.26em] text-ink-soft">
          <span aria-hidden className="mb-5 block h-px w-12 bg-ink/40" />
          {site.name}
        </p>
        <p className="u-mono tracking-[0.26em] text-ink-soft">{CLOSING.strip}</p>
      </div>
    </section>
  );
}
