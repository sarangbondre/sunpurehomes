"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { whatsappHref } from "@/lib/links";
import { site } from "@/lib/site";

/**
 * Five items and a WhatsApp pill, to the client's reference design.
 *
 * Every one of them resolves. Our Philosophy and Contact anchor to the
 * sections on /about that already carry that content; Amenities is a real
 * page assembled from the nine project files. §14 forbids a dead href, so a
 * nav item that had nowhere to go would have meant not shipping the design.
 */
const NAV = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/about#philosophy", label: "Our Philosophy" },
  { href: "/amenities", label: "Amenities" },
  { href: "/about#contact", label: "Contact" },
] as const;

export function SiteHeader() {
  /*
    On the landing page at lg the hero runs to the top of the viewport and
    the header sits over it with no bar of its own, which is what makes the
    page read as one canvas. Below lg the header is two rows and the image
    is stacked under the text, so there is no canvas to preserve and it stays
    a normal bar. Everywhere else it is always the sticky bar — transparent
    over scrolling content would be unreadable.
  */
  const overlay = usePathname() === "/";

  return (
    <header
      className={`sticky top-0 z-50 bg-paper/92 backdrop-blur-sm ${
        overlay
          ? "lg:absolute lg:inset-x-0 lg:bg-transparent lg:backdrop-blur-none"
          : ""
      }`}
    >
      <div className="mx-auto flex flex-col gap-2 px-4 py-3 min-[400px]:px-5 sm:px-10 lg:grid lg:h-24 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-6 lg:px-16 lg:py-0">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0" aria-label={`${site.name} — home`}>
            <Logo decorative className="h-8 w-auto text-ink min-[400px]:h-9 sm:h-11 lg:h-13" />
          </Link>

          {/* On mobile the pill shares the first row; at lg it moves to the third column. */}
          <WhatsAppPill className="inline-flex lg:hidden" />
        </div>

        {/*
          Five items do not fit a phone and a menu was not part of the brief,
          so on small screens the row scrolls sideways instead. The scrollbar
          is hidden but the row is still keyboard- and touch-reachable.
        */}
        <nav
          aria-label="Main"
          className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[400px]:-mx-5 min-[400px]:px-5 sm:-mx-10 sm:px-10 lg:mx-0 lg:overflow-visible lg:px-0"
        >
          <ul className="flex w-max items-center gap-6 pb-1 sm:gap-8 lg:w-auto lg:justify-center lg:pb-0">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="whitespace-nowrap text-[0.875rem] text-ink transition-colors duration-hover ease-hover hover:text-accent-ink sm:text-[0.95rem]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <WhatsAppPill className="hidden lg:inline-flex" />
      </div>
    </header>
  );
}

/**
 * Takes its display utility from the caller. `inline-flex` baked into the
 * base class competed with the `hidden` passed in — same specificity, so the
 * winner was stylesheet order, and the pill rendered twice on phones.
 *
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
      className={`shrink-0 items-center gap-2 rounded-full border border-accent-ink bg-paper px-4 py-2 text-[0.875rem] text-accent-ink transition-colors duration-hover ease-hover hover:bg-accent-ink hover:text-paper sm:px-5 sm:py-2.5 sm:text-[0.95rem] ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488" />
      </svg>
      WhatsApp
    </a>
  );
}
