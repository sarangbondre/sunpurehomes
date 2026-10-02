/**
 * A section with its label beside its content from lg, and above it below
 * that. The About page is the only thing that uses this, and it was a single
 * 52rem column inside an 86rem page — which left a third of every wide
 * screen blank and made the page read as unfinished (client, 2 October).
 * Putting the label in a rail of its own spends that width on the layout
 * rather than on the measure, which stays where prose wants it.
 *
 * `title` is optional. Where it is left off the label becomes the heading —
 * set larger, and as the h2 the section would otherwise not have. The About
 * page runs this way at the client's instruction: its three titles were
 * dropped and its three labels asked to carry the sections on their own.
 * Those headings are the accent red (17 September), as "Deeply Lived." is.
 */
export function Section({
  eyebrow,
  title,
  children,
  className = "",
  id,
}: {
  eyebrow: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** Anchor target, so a nav item can link straight to this section. */
  id?: string;
}) {
  return (
    <section
      id={id}
      /*
        scroll-mt clears the sticky header, which would otherwise cover the
        eyebrow of whichever section was jumped to.
      */
      className={`scroll-mt-24 border-t border-line py-14 sm:py-20 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-16 ${className}`}
    >
      {title === undefined ? (
        <h2 className="u-mono text-[1.05rem] leading-snug tracking-[0.14em] text-laterite sm:text-[1.2rem]">
          {eyebrow}
        </h2>
      ) : (
        <div>
          <p className="u-mono text-canopy">{eyebrow}</p>
          <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)]">{title}</h2>
        </div>
      )}
      <div className="mt-10 lg:mt-0">{children}</div>
    </section>
  );
}
