import type { Metadata, Viewport } from "next";
import { Arka } from "@/components/chat/arka";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { arkaEnabled } from "@/lib/chatbot/env";
import { getAllProjects } from "@/lib/content";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: `${site.name} builds villas, apartments and plotted developments in ${site.city}. Nine projects, thoughtfully built.`,
};

export const viewport: Viewport = {
  themeColor: "#f8f9f6",
};

/** Names only: the widget ships to browsers and needs nothing more. */
const ARKA_PROJECTS = getAllProjects().map(({ slug, name }) => ({ slug, name }));

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
      suppressHydrationWarning here covers ONLY the attributes of <html> and
      <body> themselves — React still checks every descendant, so a genuine
      mismatch inside the app still reports.
      Extensions (password managers, Grammarly, dark-mode and translation
      tools) commonly stamp attributes onto these two elements before React
      hydrates: cz-shortcut-listen, data-gr-ext-installed, data-darkreader-*.
      That produces "some attributes of the server rendered HTML didn't match"
      with no diff anywhere in the application's own markup.
    */
    <html lang="en-IN" className={fontVariables} suppressHydrationWarning>
      <body
        className="relative flex min-h-dvh flex-col bg-paper text-ink antialiased"
        suppressHydrationWarning
      >
        <a
          href="#main"
          className="u-mono sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div id="main" className="flex-1">
          {children}
        </div>
        <SiteFooter />
        {/*
          WhatsApp in the corner of every page, where Arka was, at the
          client's instruction on 17 September. Arka stays in the code behind
          ARKA_ENABLED; it and this button share the corner, so only one shows.
        */}
        {arkaEnabled() ? <Arka projects={ARKA_PROJECTS} /> : <WhatsAppButton />}
      </body>
    </html>
  );
}
