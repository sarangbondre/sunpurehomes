import type { Metadata } from "next";
import Link from "next/link";
import { ProjectTour } from "@/components/projects/project-tour";
import { site } from "@/lib/site";

/**
 * A working demonstration of the tour feature, for showing the client before
 * any Sunpure tour exists.
 *
 * It is NOT a project page and must never become one.
 *
 * The tour embedded is the platform's own sample space, branded to a
 * placeholder company and carrying no outbound links. An earlier version
 * used the reference tour the client sent, which was a real competing
 * development — that put another company's building, name and links on a
 * Sunpure page, which is the claim docs/adr/0001 exists to keep off this
 * site. A sample space demonstrates the same mechanism and represents
 * nobody.
 *
 * Still noindex, still absent from the navigation, still reachable only by
 * direct link, and the page says it is a sample in the first sentence a
 * visitor reads. Delete the route once real tours land.
 */
export const metadata: Metadata = {
  title: "Virtual tour — preview",
  robots: { index: false, follow: false },
};

/**
 * The tour platform's own sample space. It is branded to "Acme Realty" — a
 * placeholder company that does not exist — and carries no outbound links,
 * which is why it is here: it demonstrates the mechanism without putting a
 * real developer's building on a Sunpure page.
 */
const SAMPLE = {
  provider: "matterport",
  url: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
  subject: "a sample space, not a real development",
} as const;

export default function VirtualTourPreviewPage() {
  return (
    <main>
      <header className="mx-auto max-w-[86rem] px-6 pt-14 sm:px-10 sm:pt-16 lg:px-16">
        <p className="u-mono text-canopy">Preview · not a live page</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)]">
          What a virtual tour <em className="italic">will look like.</em>
        </h1>
        <div className="mt-8 max-w-[62ch] border-l-2 border-accent-ink bg-paper-2 px-6 py-5">
          <p className="leading-relaxed text-ink-soft">
            <strong className="text-ink">
              The tour below is a sample, not a {site.name} property.
            </strong>{" "}
            It is the tour platform&rsquo;s own demonstration space, branded to
            a placeholder company that does not exist. It shows no real
            development, belongs to no real developer, and links nowhere.
          </p>
        </div>
        <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-soft">
          On a real project page this block sits directly under the project
          name, with that project&rsquo;s own photograph behind the button and
          its own caption beneath.
        </p>
      </header>

      <ProjectTour tour={SAMPLE} name="Demonstration" />

      <section className="mx-auto max-w-[86rem] px-6 py-14 sm:px-10 lg:px-16">
        <h2 className="text-[clamp(1.9rem,4vw,3rem)]">
          Three things this does that a plain embed does not
        </h2>
        <dl className="mt-10 grid gap-10 sm:grid-cols-3">
          {[
            {
              term: "It waits to be asked",
              detail:
                "Nothing loads until the button is pressed. A tour is tens of megabytes, and most buyers arrive on a phone on mobile data.",
            },
            {
              term: "The link is checked",
              detail:
                "An embedded tour runs another company's code inside the visitor's session, so the address is verified against the platform it claims to come from before it can reach the page.",
            },
            {
              term: "It says what it is",
              detail:
                "The caption carries what the tour shows and when it was captured — a show flat is not the home a buyer receives, and the page says so.",
            },
          ].map((item) => (
            <div key={item.term}>
              <dt className="font-display text-2xl">{item.term}</dt>
              <dd className="mt-3 leading-relaxed text-ink-soft">
                {item.detail}
              </dd>
            </div>
          ))}
        </dl>

        <Link
          href="/projects"
          className="u-mono mt-12 inline-flex items-center gap-3 border border-ink px-6 py-4 text-ink transition-colors duration-hover ease-hover hover:bg-ink hover:text-paper"
        >
          Back to the projects
        </Link>
      </section>
    </main>
  );
}
