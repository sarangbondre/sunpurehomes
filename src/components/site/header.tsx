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
 * now the one place Amenities, the About sections and the legal pages are
 * linked from — About repeats here so the menu reads as complete.
 *
 * "Projects" became the three kinds of home on 2 October at the client's
 * instruction. Each is the listing filtered to that type, which the page
 * reads from the query and renders on the server, so these work without
 * JavaScript and are linkable. The header's own Projects link, beside
 * About, still opens all nine.
 */
const MENU = [
  { href: "/about", label: "About" },
  { href: "/projects?type=villa", label: "Villas" },
  { href: "/projects?type=apartment", label: "Apartments" },
  { href: "/projects?type=plot", label: "Plots" },
  { href: "/amenities", label: "Amenities" },
  { href: "/about#philosophy", label: "Our philosophy" },
  { href: "/about#contact", label: "Arrange a visit" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
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
 * The same glass as the landing page's button, at the client's instruction
 * of 2 October: the same 35% paper over a 12px backdrop blur, the same lit
 * top edge and shadow, the same paper border, the same fill with laterite on
 * hover. Only the size differs, because a header pill cannot be a 28px-tall
 * call to action, and the label still hides below sm so the row fits a
 * phone.
 *
 * THE LABEL IS INK NOW, WHERE IT WAS THE BRAND RED, AND THAT IS WHAT MAKES
 * THE GLASS POSSIBLE. #d40000 is 4.86:1 on solid paper — a margin of 0.36
 * over the 4.5:1 this size owes — so over a picture it could never be more
 * than a tenth transparent, and it spent the day being re-measured every
 * time a hero changed. Ink is 16:1 on paper and has contrast to spend, which
 * is why the landing button could always be glass and this one could not.
 * Put the red back and the tint has to go back to roughly 90% with it.
 *
 * The red has not left the control: it is what the pill fills with on hover,
 * where a solid fill makes paper-on-red a known 4.86:1 again.
 *
 * Measured over both heroes, at the pill's own position, through the paper
 * each lays across its top for the header. If a hero is ever replaced with
 * one whose top right corner is dark, re-measure — ink has room, but it is
 * not infinite.
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
      className={`shrink-0 items-center gap-2 rounded-full border border-paper/60 bg-paper/35 px-2.5 py-2 text-[0.8125rem] text-ink shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_24px_rgba(28,26,24,0.12)] backdrop-blur-md transition-colors duration-hover ease-hover hover:border-laterite hover:bg-laterite hover:text-paper min-[400px]:px-3 min-[400px]:text-[0.875rem] sm:px-5 sm:py-2.5 sm:text-[0.95rem] ${className}`}
    >
      <WhatsAppIcon className="size-4" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
