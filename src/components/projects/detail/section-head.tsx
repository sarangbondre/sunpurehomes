/**
 * The project page's section opening, to the client's reference design: a
 * mono label trailed by a short rule, a large title, and an optional line
 * beneath it.
 */
export function SectionHead({
  eyebrow,
  title,
  lede,
  aside,
  as: Heading = "h2",
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  /** The short stacked lines on the right, from wide screens up. */
  aside?: readonly string[];
  as?: "h1" | "h2";
}) {
  return (
    <div className="flex items-end justify-between gap-10">
      <div>
        <p className="u-mono flex items-center gap-4 text-[0.8rem] tracking-[0.22em] text-ink-soft">
          {eyebrow}
          <span aria-hidden className="h-px w-16 bg-ink/25 sm:w-24" />
        </p>
        <Heading className="mt-5 text-[clamp(2.75rem,6.5vw,5rem)] leading-[0.98] tracking-[-0.01em]">
          {title}
        </Heading>
        {lede && (
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
            {lede}
          </p>
        )}
      </div>
      {aside && <Aside lines={aside} className="hidden lg:block" />}
    </div>
  );
}

/** Stacked mono lines behind a short vertical rule, as the reference sets them. */
export function Aside({
  lines,
  className = "",
  tone = "ink",
}: {
  lines: readonly string[];
  className?: string;
  tone?: "ink" | "paper";
}) {
  return (
    <p
      className={`u-mono shrink-0 border-l pl-6 leading-[2.1] tracking-[0.26em] ${
        tone === "paper" ? "border-paper/50 text-paper" : "border-ink/20 text-ink-soft"
      } ${className}`}
    >
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </p>
  );
}

/** An italic two-line close with a short red rule above it. */
export function ClosingLine({
  lines,
  children,
}: {
  lines: readonly string[];
  /** Whatever sits to the right: a link, a row of marks. */
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-14 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span aria-hidden className="block h-px w-12 bg-laterite" />
        <p className="mt-5 font-display text-[clamp(1.9rem,3.6vw,2.75rem)] italic leading-[1.12]">
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>
      {children}
    </div>
  );
}

/** Icon, mono title and a plain line, in a row of ruled cells. */
export function NoteRow({
  items,
}: {
  items: readonly { icon: React.ReactNode; title: string; line?: string }[];
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-3 sm:gap-0">
      {items.map((item, i) => (
        <li
          key={item.title}
          className={`flex items-start gap-4 sm:px-6 ${i > 0 ? "sm:border-l sm:border-line" : "sm:pl-0"}`}
        >
          <span className="mt-0.5 text-laterite">{item.icon}</span>
          <span>
            <span className="u-mono block tracking-[0.2em] text-ink">{item.title}</span>
            {item.line && <span className="mt-1 block text-ink-soft">{item.line}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** A section of the project page, spaced for the reference design. */
export function DetailSection({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      // scroll-mt clears the sticky header when a link jumps here.
      className={`scroll-mt-28 border-t border-line py-16 sm:py-24 ${className}`}
    >
      {children}
    </section>
  );
}

/** A round tile holding a line icon, in the accent. */
export function IconTile({
  children,
  size = "md",
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const box = { sm: "size-12", md: "size-16", lg: "size-20" }[size];
  return (
    <span
      className={`flex ${box} shrink-0 items-center justify-center rounded-full bg-paper-2 text-laterite`}
    >
      {children}
    </span>
  );
}
