import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { whatsappHref } from "@/lib/links";
import { site } from "@/lib/site";

/**
 * Every link here resolves. Routes that do not exist yet — /about, /legacy,
 * /contact, /journal — are deliberately absent rather than stubbed, because
 * a menu of dead links is the defect this rebuild exists to remove (§2).
 * Add each entry in the phase that builds its route.
 */
const NAV = [{ href: "/projects", label: "Projects" }] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[86rem] items-center gap-6 px-6 sm:h-20 sm:px-10 lg:px-16">
        <Link href="/" className="shrink-0" aria-label={`${site.name} — home`}>
          <Logo decorative className="h-8 w-auto text-ink sm:h-9" />
        </Link>

        <nav aria-label="Main" className="ml-auto flex items-center gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="u-mono text-ink transition-colors duration-hover ease-hover hover:text-canopy"
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
            className="u-mono rounded-full bg-ink px-4 py-2 text-paper transition-colors duration-hover ease-hover hover:bg-canopy"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
