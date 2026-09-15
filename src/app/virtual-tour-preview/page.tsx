import type { Metadata } from "next";
import Link from "next/link";
import { ProjectTour } from "@/components/projects/project-tour";
import { site } from "@/lib/site";

/**
 * A working demonstration of the tour feature, for showing the client before
 * any Sunpure tour exists.
 *
 * It is NOT a project page and must never become one. The tour embedded here
 * belongs to another developer — it is the link the client sent as their
 * reference. Putting it on a Sunpure project page would present someone
 * else's building as Sunpure's, which is the exact claim docs/adr/0001 was
 * written to keep off this site.
 *
 * So: noindex, absent from the navigation, reachable only by direct link,
 * and the page says plainly whose building it is in the first sentence a
 * visitor reads. Delete the route once real tours land.
 */
export const metadata: Metadata = {
  title: "Virtual tour — preview",
  robots: { index: false, follow: false },
};

const SAMPLE = {
  provider: "matterport",
  url: "https://my.matterport.com/show/?m=Sqfui6CzcVx",
  subject: "a sample three-bedroom show flat",
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
              The tour below is not a {site.name} property.
            </strong>{" "}
            It is another developer&rsquo;s show flat, embedded here only to
            demonstrate that the feature works. Nothing on this page is ours
            except the frame around it.
          </p>
        </div>
        <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-soft">
          On a real project page this block sits directly under the project
          name, with that project&rsquo;s own photograph behind the button and
          its own caption beneath.
        </p>
      </header>

      <ProjectTour tour={SAMPLE} name="Sample" />

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
