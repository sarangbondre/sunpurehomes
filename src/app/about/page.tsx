import type { Metadata } from "next";
import Link from "next/link";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/brand/icons";
import { PartnerList } from "@/components/brand/partner-list";
import { Section } from "@/components/ui/section";
import { getAllProjects } from "@/lib/content";
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
 * It is about Sunpure Homes and nothing else. Every reference to the parent
 * group and to the edible-oil business was removed from the site at the
 * client's instruction, which is also why there are no leadership profiles
 * here yet: the only titles on record for the two directors are roles in the
 * group companies, and inventing Sunpure Homes titles for them would be the
 * failure this rebuild exists to avoid. Send the titles and the section goes in.
 */
export default function AboutPage() {
  const projects = getAllProjects();
  const partners = getMaterialPartners();
  const villas = projects.filter((p) => p.type === "villa").length;
  const apartments = projects.filter((p) => p.type === "apartment").length;
  const plots = projects.filter((p) => p.type === "plot").length;

  return (
    <main className="mx-auto max-w-[86rem] px-6 pb-8 sm:px-10 lg:px-16">
      <header className="max-w-[52rem] pb-6 pt-16 sm:pt-24">
        {/* The same size as the section headings below, at the client's request. */}
        <p className="u-mono text-[1.05rem] leading-snug tracking-[0.14em] text-laterite sm:text-[1.2rem]">
          About
        </p>
        {/*
          This read "We build in Mysuru. Only in Mysuru." until 15 September
          2026, when the client asked for it to say the practice works across
          India. No city outside Mysuru is named here, because none has been
          given — see openQuestions in lib/site.ts. What is named is what the
          content file can prove: nine developments, all of them here.
        */}
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)]">
          We build across India.{" "}
          <em className="italic">It began in {site.city}.</em>
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-ink-soft sm:text-xl">
          Nine developments to date — {villas} villa communities,{" "}
          {apartments} apartment buildings and {plots} plotted developments —
          all of them in {site.city}, where the practice started and where the
          work still runs deepest.
        </p>
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
