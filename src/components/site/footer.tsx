"use client";

import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  YouTubeIcon,
} from "@/components/brand/icons";
import { usePathname } from "next/navigation";
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
 * RERA-registered sales site, so it is set quietly rather than dropped.
 *
 * The right and bottom padding keep everything clear of the WhatsApp button
 * fixed in the corner.
 *
 * On the landing page it sits over the foot of the picture rather than below
 * it (client, 17 September), so the page is the picture and nothing else. It
 * turns to paper type there, on a shade that deepens the water's dark
 * reflection. The body is the positioning parent, and the hero fills the
 * screen, so "the bottom of the body" is the bottom of the picture.
 */
export function SiteFooter() {
  const overImage = usePathname() === "/";
  const icon = `flex size-10 items-center justify-center rounded-full border transition-colors duration-hover ease-hover ${
    overImage
      ? "border-paper/45 text-paper hover:border-paper hover:bg-paper hover:text-ink"
      : "border-line text-ink-soft hover:border-accent-ink hover:text-accent-ink"
  }`;

  return (
    <footer
      className={
        overImage
          ? "absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink/90 via-ink/70 via-60% to-transparent pt-10"
          : "border-t border-line"
      }
    >
      <div className="mx-auto flex max-w-[86rem] flex-col gap-5 px-6 pb-24 pt-8 sm:px-10 sm:pb-8 sm:pr-28 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:pl-16">
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
          <li aria-hidden className={`mx-1 h-6 w-px ${overImage ? "bg-paper/40" : "bg-line"}`} />
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

        <div className={`flex flex-col gap-2 text-xs leading-relaxed sm:flex-row sm:items-baseline sm:gap-6 lg:min-w-0 lg:max-w-[46rem] ${overImage ? "text-paper/85" : "text-muted"}`}>
          <p>
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
