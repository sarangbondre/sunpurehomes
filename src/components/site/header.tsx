import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { whatsappHref } from "@/lib/links";
import { site } from "@/lib/site";

/**
 * Three items, at the client's instruction: About, Projects, WhatsApp, with
 * no Home link — the wordmark carries that, as it does on most sites.
 *
 * The sizes step twice rather than once. At the enlarged wordmark the logo
 * alone is 126px, and logo + gaps + nav came to 361px — so every viewport
 * under 414px scrolled sideways, on every page. sm: (640px) is far too late
 * to correct that, hence the min-[400px] step in between.
 *
 * Every one of them resolves. /about was built for this menu rather than
 * pointed at a placeholder.
 */
const NAV = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-paper/92 backdrop-blur-sm">
      <div className="flex h-20 items-center gap-3 px-4 min-[400px]:gap-4 min-[400px]:px-5 sm:h-24 sm:gap-6 sm:px-10 lg:px-16">
        <Link href="/" className="shrink-0" aria-label={`${site.name} — home`}>
          <Logo decorative className="h-8 w-auto text-ink min-[400px]:h-9 sm:h-13" />
        </Link>

        <nav aria-label="Main" className="ml-auto flex items-center gap-3.5 min-[400px]:gap-5 sm:gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.8125rem] text-ink transition-colors duration-hover ease-hover hover:text-laterite min-[400px]:text-[0.875rem] sm:text-[0.95rem]"
            >
              {item.label}
            </Link>
          ))}

          <a
            href={whatsappHref(
              `Hello Sunpure Homes — I'd like to know more about your projects in ${site.city}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.8125rem] text-accent-ink transition-opacity duration-hover ease-hover hover:opacity-70 min-[400px]:text-[0.875rem] sm:text-[0.95rem]"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
