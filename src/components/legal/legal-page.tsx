/**
 * The shell the two legal pages share: a measure narrow enough to read, a
 * heading, and sections divided by a rule.
 *
 * It exists because /privacy and /terms are the same page with different
 * words. The words themselves are the client's, copied from their live site
 * — see the note at the top of each page.
 */

export function LegalPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-[86rem] px-6 pb-16 sm:px-10 lg:px-16">
      <div className="max-w-[46rem]">
        <header className="pb-10 pt-16 sm:pt-24">
          <p className="u-mono text-accent-ink">{eyebrow}</p>
          <h1 className="mt-6 text-[clamp(2.5rem,6vw,4rem)]">{title}</h1>
          {lead && (
            <div className="mt-8 space-y-4 leading-relaxed text-ink-soft">{lead}</div>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight">{title}</h2>
      <div className="mt-5 space-y-4 leading-relaxed text-ink-soft [&_a]:text-accent-ink [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
