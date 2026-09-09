import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { getAllProjects } from "@/lib/content";
import { mailtoHref, telHref, whatsappHref } from "@/lib/links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who ${site.name} are, how they build, and the nine developments they have delivered across ${site.city}.`,
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
  const villas = projects.filter((p) => p.type === "villa").length;
  const apartments = projects.filter((p) => p.type === "apartment").length;
  const plots = projects.filter((p) => p.type === "plot").length;

  return (
    <main className="mx-auto max-w-[86rem] px-6 pb-8 sm:px-10 lg:px-16">
      <header className="max-w-[52rem] pb-6 pt-16 sm:pt-24">
        <p className="u-mono text-accent-ink">About</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)]">
          We build in {site.city}. <em className="italic">Only in {site.city}.</em>
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-ink-soft sm:text-xl">
          Nine developments across the city — {villas} villa communities,{" "}
          {apartments} apartment buildings and {plots} plotted developments.
          Every one of them within a short drive of the last.
        </p>
      </header>

      <Section eyebrow="How we build" title="Three things we hold to">
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

      <Section eyebrow="What goes in" title="Who we build with">
        <p className="max-w-[58ch] leading-relaxed text-ink-soft">
          The same names appear across every development, which is what makes a
          specification worth reading.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {site.materialPartners.map((partner) => (
            <li
              key={partner}
              className="rounded-full border border-line px-5 py-2.5 text-ink-soft"
            >
              {partner}
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Talk to us" title="Come and see one">
        <div className="flex flex-wrap gap-3">
          <a
            href={whatsappHref(
              `Hello ${site.name} — I'd like to arrange a visit.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="u-cta"
          >
            WhatsApp the sales team
          </a>
          <a href={telHref} className="u-cta">
            {site.contact.phoneDisplay}
          </a>
          <a href={mailtoHref} className="u-cta">
            {site.contact.email}
          </a>
        </div>
        <p className="mt-8">
          <Link
            href="/projects"
            className="u-mono text-accent-ink underline underline-offset-4"
          >
            See all {projects.length} projects
          </Link>
        </p>
      </Section>
    </main>
  );
}
