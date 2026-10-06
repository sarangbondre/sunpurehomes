import type { Metadata } from "next";
import { VisitForm } from "@/components/visit/visit-form";
import { offerableProjects, type VisitProject } from "@/lib/visit";
import { getAllProjects, sortProjects } from "@/lib/content";
import { isFullySold } from "@/lib/scenes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Arrange a site visit",
  description: `Choose a ${site.name} development to see, leave your details, and send them by WhatsApp or email.`,
};

/**
 * "Arrange a site visit" in the menu, at the client's instruction of
 * 6 October. It replaced a link to the contact block on About, which gave a
 * number and an address and left the visitor to compose the message.
 *
 * Only the developments still selling are offered — see offerableProjects in
 * lib/visit.ts for the rule and whose decision it was.
 *
 * The form is a client component; the list of developments is read here on
 * the server from content/projects so it cannot drift from the site.
 */
export default function VisitPage() {
  const projects: VisitProject[] = offerableProjects(
    sortProjects(getAllProjects(), "featured", isFullySold),
    isFullySold,
  ).map((project) => ({
    slug: project.slug,
    name: project.name,
    place: project.location.label,
  }));

  return (
    <main className="mx-auto max-w-[86rem] px-6 pb-20 sm:px-10 lg:px-16">
      <header className="pb-4 pt-12 sm:pt-16 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-16">
        <h1 className="u-mono text-[1.05rem] leading-snug tracking-[0.14em] text-laterite sm:text-[1.2rem]">
          Arrange a site visit
        </h1>
        <div className="lg:col-start-2">
          <p className="mt-8 max-w-[52ch] leading-relaxed text-ink-soft sm:text-lg lg:mt-0 lg:text-xl">
            Tell us which development you would like to see and how to reach
            you. Send it by WhatsApp or by email — whichever you prefer — and
            the sales team will call to fix a time.
          </p>
        </div>
      </header>

      <div className="border-t border-line pt-10 sm:pt-14 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-16">
        <p className="u-mono text-muted">Your details</p>
        <div className="mt-8 lg:mt-0">
          <VisitForm projects={projects} />
        </div>
      </div>
    </main>
  );
}
