import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  YouTubeIcon,
} from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { mailtoHref, telHref } from "@/lib/links";
import { site } from "@/lib/site";

/**
 * One canonical URL each (§14), now each with its own mark at the client's
 * instruction. Absent entries are simply not rendered.
 *
 * The mark is decorative and the name stays beside it: an icon-only row of
 * four would be four unlabelled links, and the names are what make the list
 * scannable.
 */
const SOCIAL: {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}[] = (
  [
    [site.social.instagram, "Instagram", InstagramIcon],
    [site.social.facebook, "Facebook", FacebookIcon],
    [site.social.youtube, "YouTube", YouTubeIcon],
    [site.social.linkedin, "LinkedIn", LinkedInIcon],
  ] as const
).flatMap(([href, label, Icon]) => (href ? [{ href, label, Icon }] : []));

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-2">
      <div className="mx-auto max-w-[86rem] px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo variant="stacked" className="h-24 w-auto text-ink sm:h-28" />
            <p className="mt-6 font-display text-2xl">{site.tagline}</p>
          </div>

          <div>
            <h2 className="u-mono text-muted">Contact</h2>
            <ul className="mt-4 space-y-2 text-ink-soft">
              <li>
                <a
                  className="inline-flex items-center gap-2.5 hover:text-accent-ink"
                  href={mailtoHref}
                >
                  <MailIcon className="size-4" />
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-2.5 hover:text-accent-ink"
                  href={telHref}
                >
                  <PhoneIcon className="size-4" />
                  {site.contact.phoneDisplay}
                </a>
              </li>
            </ul>

            <h2 className="u-mono mt-8 text-muted">Follow</h2>
            <ul className="mt-4 space-y-2 text-ink-soft">
              {SOCIAL.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    className="inline-flex items-center gap-2.5 hover:text-accent-ink"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="size-4" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="u-mono text-muted">Explore</h2>
            {/*
              The header carries three items at the client's instruction.
              These are the rest — a real page and two real sections of
              /about — kept reachable here rather than deleted, because a
              page nothing links to is a page nobody finds.
            */}
            <ul className="mt-4 space-y-2 text-ink-soft">
              {[
                { href: "/about", label: "About" },
                { href: "/projects", label: "Projects" },
                { href: "/amenities", label: "Amenities" },
                { href: "/about#philosophy", label: "Our philosophy" },
                { href: "/about#contact", label: "Arrange a visit" },
              ].map((item) => (
                <li key={item.href}>
                  <Link className="hover:text-accent-ink" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
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
          © {site.name}
        </p>
      </div>
    </footer>
  );
}
