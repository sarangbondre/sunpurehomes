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
 * The reference design briefly put five here. Our Philosophy, Amenities and
 * Contact moved into the footer rather than being deleted: /amenities is a
 * real page and the two anchors point at real sections of /about, so
 * dropping the links entirely would have orphaned them.
 */
const NAV = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
] as const;

/**
 * Everything else, behind the three-line button. These were in the footer
 * only; the client asked for them at the top as well, on every width.
 */
const MORE = [
  { href: "/amenities", label: "Amenities" },
  { href: "/about#philosophy", label: "Our philosophy" },
  { href: "/about#contact", label: "Contact & visits" },
] as const;

export function SiteHeader() {
  /*
    The landing hero is a full-bleed photograph at every width now, so the
    header sits over it with no bar of its own at every width too. It was
    transparent only from lg while the picture was a column; leaving that in
    place would have put paper type on a paper bar on phones, which is
    invisible. Everywhere else it is the sticky bar — transparent over
    scrolling content would be unreadable.
  */
  const overlay = usePathname() === "/";
  /*
    Ink everywhere, including the landing page. The hero there is the split
    design again: the header floats over the paper column on the left and
    over the picture's own top wash on the right, both of which are paper.
    It was set in paper for the two days the hero ran full bleed on a dark
    picture; that is the condition to restore it under, and nothing else.
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
        A taller bar on the landing page, where it floats over the picture and
        costs no layout: the client asked for a bigger wordmark there, and a
        bigger wordmark needs the room. Everywhere else the bar is sticky and
        pushes the page down, so it grows by less.
      */}
      <div
        className={`mx-auto flex items-center gap-2 px-3 min-[400px]:px-5 sm:px-10 lg:px-16 ${
          overlay ? "h-24 sm:h-28 lg:h-32" : "h-20 sm:h-24 lg:h-28"
        }`}
      >
        <Link href="/" className="shrink-0" aria-label={`${site.name} — home`}>
          <Logo
            decorative
            className={`w-auto ${
              overlay
                ? "h-9 min-[360px]:h-10 min-[400px]:h-12 sm:h-18 lg:h-22"
                : "h-9 min-[400px]:h-11 sm:h-15 lg:h-18"
            } text-ink`}
          />
        </Link>

        {/* Nav and the pill travel together, hard right against the wordmark. */}
        <div className="ml-auto flex items-center gap-3 min-[400px]:gap-6 sm:gap-8">
          <nav aria-label="Main">
            <ul className="flex items-center gap-3 min-[400px]:gap-6 sm:gap-8">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="whitespace-nowrap text-ink transition-colors duration-hover ease-hover hover:text-accent-ink text-[0.8125rem] min-[400px]:text-[0.875rem] sm:text-[0.95rem]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <WhatsAppPill className="inline-flex" />
          <MenuPanel links={MORE} tone="ink" />
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
