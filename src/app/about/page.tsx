import type { Metadata } from "next";
import Link from "next/link";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/brand/icons";
import { PartnerList } from "@/components/brand/partner-list";
import { Section } from "@/components/ui/section";
import { mailtoHref, telHref, whatsappHref } from "@/lib/links";
import { getMaterialPartners } from "@/lib/partners";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who ${site.name} are, how they build, and the developments they have delivered across ${site.city}.`,
};

/**
 * The client asked for About in the main menu, so this route exists to give
 * that link somewhere real to land.
 *
 * The opening is the client's own copy, sent on 20 September 2026. It names
 * the House of Sunpure and three decades of it; that is the client speaking
 * about themselves, and it is set here as they wrote it. The edible-oil
 * business is still named nowhere, and no legal entity is claimed — which
 * openQuestions in lib/site.ts still asks about.
 *
 * There are no leadership profiles here yet: the only titles on record for
 * the two directors are roles in the group companies, and inventing Sunpure
 * Homes titles for them would be the failure this rebuild exists to avoid.
 * Send the titles and the section goes in.
 */
export default function AboutPage() {
  const partners = getMaterialPartners();

  return (
    <main className="mx-auto max-w-[86rem] px-6 pb-8 sm:px-10 lg:px-16">
      <header className="pb-6 pt-16 sm:pt-24 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-16">
        {/*
          "About" is the page's heading now. The line it sat under — "We build
          across India. It began in Mysuru." — was removed on 22 September at
          the client's instruction, so this label carries the page, at the size
          the client asked for on 17 September.
        */}
        <h1 className="u-mono text-[1.05rem] leading-snug tracking-[0.14em] text-laterite sm:text-[1.2rem]">
          About
        </h1>
        <div className="lg:col-start-2">
        {/*
          The client's own words, sent on 20 September 2026, set here as they
          were written but for one mark: the em dash after "House of Sunpure"
          became a comma on 2 October at their instruction. The sentence needs
          something there, and a comma is the quietest thing that serves.
          They replaced a paragraph that counted the developments by type.
        */}
        <div className="mt-10 max-w-[58ch] space-y-6 text-lg leading-relaxed text-ink-soft sm:text-xl lg:mt-0">
          <p>
            We come from the House of Sunpure, a name built on more than three
            decades of enterprise, integrity and enduring trust. We carry that
            legacy into real estate with a clear purpose: to create the right
            development for its place, its people and the lives they aspire to
            lead.
          </p>
          <p>
            Our portfolio spans thoughtfully planned communities, distinctive
            villas and contemporary apartments. Across every project, our focus
            remains unchanged: considered design, lasting quality, honest
            delivery and spaces that continue to add value over time.
          </p>
          <p>
            Wherever we build, we seek to understand the land, respect its
            context and create something that truly belongs.
          </p>
        </div>
        <blockquote className="mt-12 border-l-2 border-laterite pl-6 sm:pl-8">
          <p className="max-w-[40ch] font-display text-[clamp(1.6rem,3vw,2.25rem)] italic leading-snug text-ink">
            We do not simply build for today. We build spaces that grow
            meaningful with time.
          </p>
        </blockquote>
        </div>
      </header>

      <Section id="philosophy" eyebrow="How we build">
        <dl className="grid gap-10 sm:grid-cols-3">
          {[
            {
              term: "Empathy",
              detail:
                "A home is bought once in a lifetime by most families. The decision deserves patience, and answers rather than pressure.",
            },
            {
              term: "Integrity",
              detail:
                "What is published is what is built. Registration, approvals and specifications are put in front of a buyer, not held back until they ask.",
            },
            {
              term: "Design excellence",
              detail:
                "Light, air and proportion decided before anything is priced. The plan comes first and the elevation follows it.",
            },
          ].map((value) => (
            <div key={value.term}>
              <dt className="font-display text-3xl">{value.term}</dt>
              <dd className="mt-3 leading-relaxed text-ink-soft">{value.detail}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section eyebrow="What goes in">
        <p className="max-w-[58ch] leading-relaxed text-ink-soft">
          The same names appear across every development, which is what makes a
          specification worth reading.
        </p>
        <div className="mt-8">
          <PartnerList partners={partners} />
        </div>
      </Section>

      <Section id="contact" eyebrow="Talk to us">
        {/*
          Three channels, each wearing its own mark at the client's
          instruction. WhatsApp is the mark alone — square, no label — so the
          aria-label is the only thing naming it and has to say where it goes.
          The other two keep their value as the label, because a phone number
          and an address are the useful part of the control.
        */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={whatsappHref(
              `Hello ${site.name} — I'd like to arrange a visit.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp the ${site.name} sales team`}
            className="u-cta justify-center px-4"
          >
            <WhatsAppIcon className="size-5" />
          </a>
          <a href={telHref} className="u-cta">
            <PhoneIcon className="size-4" />
            {site.contact.phoneDisplay}
          </a>
          {/*
            Always one line, at the client's request. Lowercase and untracked,
            as an address is written, and sized with the screen so it fits a
            320px phone without breaking.
          */}
          <a
            href={mailtoHref}
            className="u-cta whitespace-nowrap px-4 text-[clamp(0.7rem,3.9vw,0.9rem)] normal-case tracking-[0.02em] sm:px-6"
          >
            <MailIcon className="size-4" />
            {site.contact.email}
          </a>
        </div>
        <p className="mt-8">
          <Link
            href="/projects"
            className="u-mono text-accent-ink underline underline-offset-4"
          >
            See all projects
          </Link>
        </p>
      </Section>
    </main>
  );
}
