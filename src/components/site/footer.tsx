import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { mailtoHref, telHref } from "@/lib/links";
import { site } from "@/lib/site";

/** One canonical URL each (§14). Absent entries are simply not rendered. */
const SOCIAL: { href: string; label: string }[] = (
  [
    [site.social.instagram, "Instagram"],
    [site.social.facebook, "Facebook"],
    [site.social.youtube, "YouTube"],
    [site.social.linkedin, "LinkedIn"],
  ] as const
).flatMap(([href, label]) => (href ? [{ href, label }] : []));

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-2">
      <div className="mx-auto max-w-[86rem] px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo variant="stacked" className="h-16 w-auto text-ink" />
            <p className="mt-6 font-display text-2xl">{site.tagline}</p>
          </div>

          <div>
            <h2 className="u-mono text-muted">Contact</h2>
            <ul className="mt-4 space-y-2 text-ink-soft">
              <li>
                <a className="hover:text-canopy" href={mailtoHref}>
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a className="hover:text-canopy" href={telHref}>
                  {site.contact.phoneDisplay}
                </a>
              </li>
            </ul>

            <h2 className="u-mono mt-8 text-muted">Follow</h2>
            <ul className="mt-4 space-y-2 text-ink-soft">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    className="hover:text-canopy"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="u-mono text-muted">Explore</h2>
            <ul className="mt-4 space-y-2 text-ink-soft">
              <li>
                <Link className="hover:text-canopy" href="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="hover:text-canopy" href="/projects">
                  Projects
                </Link>
              </li>
            </ul>
            {/* Privacy and Terms are linked once those routes exist (Phase 6). */}
          </div>
        </div>

        <p className="mt-16 max-w-[80ch] border-t border-line pt-8 text-sm leading-relaxed text-ink-soft">
          Information on this website is representational and informative, and is
          subject to variation during execution. {site.name} reserves the right to
          make additions, deletions, alterations or amendments as it deems fit,
          without prior notice.
        </p>

        <p className="u-mono mt-8 text-muted">
          © {site.group.legalName}
        </p>
      </div>
    </footer>
  );
}
