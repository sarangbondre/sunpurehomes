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
    <header className="sticky top-0 z-50 bg-paper/92 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-6 px-6 sm:h-20 sm:px-10 lg:px-16">
        <Link href="/" className="shrink-0" aria-label={`${site.name} — home`}>
          <Logo decorative className="h-8 w-auto text-laterite sm:h-9" />
        </Link>

        {/*
          The reference shows Projects, Philosophy, Journal and Contact. Only
          the routes that exist are linked — a menu of dead links is the
          defect this rebuild removes. Philosophy and Journal join here in the
          phase that builds them.
        */}
        <nav aria-label="Main" className="ml-auto flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.95rem] text-ink transition-colors duration-hover ease-hover hover:text-laterite"
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
            className="text-[0.95rem] text-laterite transition-opacity duration-hover ease-hover hover:opacity-70"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
