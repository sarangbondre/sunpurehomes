import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  YouTubeIcon,
} from "@/components/brand/icons";
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

/**
 * Icons only, at the client's instruction on 17 September. The footer's
 * menu was removed — every page is now in the header's menu — and what is
 * left is the ways to reach a person and the places to follow, each a mark
 * with its name in an aria-label, then the fine print.
 *
 * Email and phone open the mail app and the dialler; the address and number
 * themselves are still written out on /about and every project page.
 *
 * The disclaimer keeps its exact wording. It is a legal notice on a
 * RERA-registered sales site, so it is set quietly rather than dropped. The
 * privacy policy and the terms sit beside it, because nothing else on the
 * site links to either and an unreachable policy is not a policy.
 *
 * Two paragraphs describing a corner WhatsApp button and a footer laid over
 * the landing picture were removed on 2 October: the button went on
 * 22 September and the overlay in 667fc00, and neither had left any code
 * behind for the comment to describe.
 */
export function SiteFooter() {
  const icon =
    "flex size-10 items-center justify-center rounded-full border border-line text-ink-soft transition-colors duration-hover ease-hover hover:border-accent-ink hover:text-accent-ink";
  const legalLink =
    "transition-colors duration-hover ease-hover hover:text-accent-ink";

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-5 px-6 py-8 sm:px-10 lg:pl-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <ul className="flex shrink-0 flex-wrap items-center gap-3">
          <li>
            <a className={icon} href={mailtoHref} aria-label={`Email ${site.contact.email}`}>
              <MailIcon className="size-[1.1rem]" />
            </a>
          </li>
          <li>
            <a className={icon} href={telHref} aria-label={`Call ${site.contact.phoneDisplay}`}>
              <PhoneIcon className="size-[1.1rem]" />
            </a>
          </li>
          <li aria-hidden className="mx-1 h-6 w-px bg-line" />
          {SOCIAL.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                className={icon}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Icon className="size-[1.1rem]" />
              </a>
            </li>
          ))}
        </ul>

          {/*
            The two legal pages, which nothing else on the site links to. The
            client's own site carries them in the same place.
          */}
          <div className="u-mono flex shrink-0 items-center gap-3 text-xs text-muted">
            <Link className={legalLink} href="/privacy">
              Privacy
            </Link>
            <span aria-hidden className="h-3 w-px bg-line" />
            <Link className={legalLink} href="/terms">
              Terms
            </Link>
            <span aria-hidden className="h-3 w-px bg-line" />
            <span>© {site.name}</span>
          </div>
        </div>

        {/*
          The disclaimer runs the full width on its own row, on one line from
          xl (client, 2 October). One line is a matter of arithmetic: the
          sentence measures 1328px at 12px, and the row is the page's measure
          less its padding — 1272px at the widest. So the type is fluid, sized
          to the viewport until the measure caps, and it wraps below xl rather
          than shrink to the 8px that would be needed at 1024.

          Re-measure if the wording changes: a longer sentence needs a smaller
          coefficient, and nothing here will tell you it has started to clip.
        */}
        <p className="text-xs leading-relaxed text-muted xl:whitespace-nowrap xl:text-[clamp(0.625rem,0.82vw,0.7rem)]">
          Information on this website is representational and informative, and
          is subject to variation during execution. {site.name} reserves the
          right to make additions, deletions, alterations or amendments as it
          deems fit, without prior notice.
        </p>
      </div>
    </footer>
  );
}
