"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { MenuPanel } from "@/components/site/menu-panel";
import { whatsappHref } from "@/lib/links";
import { site } from "@/lib/site";

/**
 * Three items, at the client's instruction: About, Projects and WhatsApp,
 * with no Home link — the wordmark carries that, as it does on most sites.
 *
 * The rest of the site is in the menu beside them.
 */
const NAV = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
] as const;

/**
 * Every page, behind the three-line button. The footer that used to carry
 * these was removed at the client's instruction on 17 September, so this is
 * now the one place Amenities, the About sections and Privacy are linked
 * from — About and Projects repeat here so the menu reads as complete.
 */
const MENU = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/amenities", label: "Amenities" },
  { href: "/about#philosophy", label: "Our philosophy" },
  { href: "/about#contact", label: "Arrange a visit" },
  { href: "/privacy", label: "Privacy" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Pages whose opening picture runs under the header.
  const overlay = isHome || pathname === "/projects";
  /*
    Ink everywhere. Where the header overlays a picture — the landing page
    and /projects — the picture carries a paper haze across its top for it.
  */

  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-50"
          : "sticky top-0 z-50 bg-paper/92 backdrop-blur-sm"
      }
    >
      {/*
        The full lockup — mark and name — on the landing page only, at the
        client's instruction on 17 September, and a step smaller than it was.
        Every other page carries the mark alone.
      */}
      <div
        className={`mx-auto flex items-center gap-2 px-3 min-[400px]:px-5 sm:px-10 lg:px-16 ${
          isHome ? "h-20 sm:h-24 lg:h-28" : "h-20 sm:h-22 lg:h-24"
        }`}
      >
        <Link href="/" className="shrink-0" aria-label={`${site.name} — home`}>
          {isHome ? (
            <Logo
              decorative
              className="h-9 w-auto text-ink min-[400px]:h-11 sm:h-15 lg:h-18"
            />
          ) : (
            <Logo
              variant="mark"
              decorative
              className="h-10 w-auto text-ink sm:h-12 lg:h-13"
            />
          )}
        </Link>

        {/* Nav and the pill travel together, hard right against the wordmark. */}
        <div className="ml-auto flex items-center gap-3 min-[400px]:gap-6 sm:gap-8">
          <nav aria-label="Main">
            <ul className="flex items-center gap-3 min-[400px]:gap-6 sm:gap-8">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    // The section you are in carries a short red rule, as in
                    // the reference design — project pages count as Projects.
                    className={`relative whitespace-nowrap text-ink transition-colors duration-hover ease-hover hover:text-accent-ink text-[0.8125rem] min-[400px]:text-[0.875rem] sm:text-[0.95rem] ${
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? "after:absolute after:inset-x-0 after:-bottom-2 after:h-px after:bg-laterite"
                        : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <WhatsAppPill className="inline-flex" />
          <MenuPanel links={MENU} tone="ink" />
        </div>
      </div>
    </header>
  );
}

/**
 * Filled with paper rather than left transparent. At lg the pill sits over
 * the hero image, and the images change — a transparent pill would be
 * legible over a bright sky and invisible over the dark courtyard one. The
 * fill makes its contrast a known quantity: 4.50:1, independent of what is
 * behind it.
 */
function WhatsAppPill({ className = "" }: { className?: string }) {
  return (
    <a
      href={whatsappHref(
        `Hello Sunpure Homes — I'd like to know more about your projects in ${site.city}.`,
      )}
      target="_blank"
      rel="noopener noreferrer"
      /*
        The label is hidden below sm. The wordmark grew at the client's
        instruction, and on a phone the row only fits with the mark standing
        for the word. The aria-label carries the name regardless, so the
        control is never anonymous to a screen reader.
      */
      aria-label={`Message ${site.name} on WhatsApp`}
      className={`shrink-0 items-center gap-2 rounded-full border border-accent-ink bg-paper px-2.5 py-2 text-[0.8125rem] text-accent-ink transition-colors duration-hover ease-hover hover:bg-accent-ink hover:text-paper min-[400px]:px-3 min-[400px]:text-[0.875rem] sm:px-5 sm:py-2.5 sm:text-[0.95rem] ${className}`}
    >
      <WhatsAppIcon className="size-4" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
