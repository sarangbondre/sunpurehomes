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
 * Glass, at the client's instruction of 2 October, to match the landing
 * page's button: the picture blurred behind it under a paper tint, a lit top
 * edge, and the same full radius.
 *
 * IT WAS A SOLID FILL FOR A REASON, AND THE REASON STILL HOLDS. The label is
 * --accent-ink, #d40000, which is 4.86:1 on paper — a margin of 0.36 over
 * the 4.5:1 its size owes — and a solid fill made that figure independent of
 * whatever the pill happened to be sitting on. Glass gives that up: the pill
 * overlays the hero on the landing page and on /projects, and its contrast
 * is now a function of those pictures.
 *
 * 90% is the measured answer. It was 86% for half an hour, set by the dawn
 * render on /projects; the landing page then took a golden sunrise whose
 * top right corner is darker than the pale sky it replaced, and 86% fell to
 * 4.48:1 there — under the line. At 90% the landing page reads 4.59:1 and
 * /projects better than that. This is the second time in a day a new
 * picture has moved this figure, which is the whole point of the warning
 * below. Modelling the backdrop blur as a local mean moves it by 0.02: both
 * skies are evenly toned, so the blur has nothing dark to average away.
 *
 * Which is to say the glass here is thin, a tenth of what is behind it, and
 * it is the red that caps it. The landing page's button can be 55% glass
 * because its label is ink, which has contrast to spare. If this pill is
 * ever wanted as glassy as that one, the lever is the label's colour, not
 * the tint.
 *
 * If a hero is ever replaced with one whose top right corner is dark — a
 * dusk shot, a courtyard — this pill is the first thing that breaks, and
 * nothing in the build will say so.
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
      className={`shrink-0 items-center gap-2 rounded-full border border-accent-ink/70 bg-paper/90 px-2.5 py-2 text-[0.8125rem] text-accent-ink shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_6px_18px_rgba(28,26,24,0.1)] backdrop-blur-md transition-colors duration-hover ease-hover hover:border-accent-ink hover:bg-accent-ink hover:text-paper min-[400px]:px-3 min-[400px]:text-[0.875rem] sm:px-5 sm:py-2.5 sm:text-[0.95rem] ${className}`}
    >
      <WhatsAppIcon className="size-4" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
