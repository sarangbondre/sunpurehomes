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
 * One canonical URL each (§14). Absent entries are simply not rendered.
 *
 * The mark stands alone here, so each link carries the name as its
 * aria-label — four unlabelled icons would be four anonymous links.
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

/*
  The header carries three items at the client's instruction. These are the
  rest — a real page and two real sections of /about — kept reachable here
  rather than deleted, because a page nothing links to is a page nobody
  finds. Terms joins them once that route exists (Phase 6).
*/
const LINKS = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/amenities", label: "Amenities" },
  { href: "/about#philosophy", label: "Our philosophy" },
  { href: "/about#contact", label: "Arrange a visit" },
  { href: "/privacy", label: "Privacy" },
] as const;

/**
 * Minimalist, at the client's instruction.
 *
 * It was a four-column slab on its own ground with a repeated tagline and
 * two column headings. It is now one hairline and three lines: the wordmark
 * with the links, the two ways to reach a person with the four places to
 * follow, and the fine print. Nothing has been dropped that anyone could
 * reach only from here — the headings went, not the links under them.
 *
 * The disclaimer keeps its exact wording. It is a legal notice on a
 * RERA-registered sales site, so it is set quietly rather than edited down.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[86rem] px-6 py-12 sm:px-10 sm:py-14 lg:px-16">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label={`${site.name} — home`}>
            <Logo decorative className="h-10 w-auto text-ink sm:h-11" />
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7 gap-y-2 text-ink-soft">
              {LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    className="transition-colors duration-hover ease-hover hover:text-accent-ink"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-ink-soft">
            <li>
              <a
                className="inline-flex items-center gap-2.5 transition-colors duration-hover ease-hover hover:text-accent-ink"
                href={mailtoHref}
              >
                <MailIcon className="size-4" />
                {site.contact.email}
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-2.5 transition-colors duration-hover ease-hover hover:text-accent-ink"
                href={telHref}
              >
                <PhoneIcon className="size-4" />
                {site.contact.phoneDisplay}
              </a>
            </li>
          </ul>

          <ul className="flex items-center gap-5">
            {SOCIAL.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  className="block text-ink-soft transition-colors duration-hover ease-hover hover:text-accent-ink"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-muted sm:flex-row-reverse sm:items-baseline sm:justify-between sm:gap-10">
          <p className="max-w-[72ch]">
            Information on this website is representational and informative, and
            is subject to variation during execution. {site.name} reserves the
            right to make additions, deletions, alterations or amendments as it
            deems fit, without prior notice.
          </p>
          <p className="u-mono shrink-0">© {site.name}</p>
        </div>
      </div>
    </footer>
  );
}
