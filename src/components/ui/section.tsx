/**
 * A section with a label above a heading.
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
      className={`scroll-mt-24 border-t border-line py-14 sm:py-20 ${className}`}
    >
      {title === undefined ? (
        <h2 className="u-mono text-[1.05rem] leading-snug tracking-[0.14em] text-laterite sm:text-[1.2rem]">
          {eyebrow}
        </h2>
      ) : (
        <>
          <p className="u-mono text-canopy">{eyebrow}</p>
          <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)]">{title}</h2>
        </>
      )}
      <div className="mt-10">{children}</div>
    </section>
  );
}

/** Label above value, mono above display. Used for scale and configuration. */
export function DataPoint({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="u-mono text-muted">{label}</dt>
      <dd className="mt-2 font-display text-3xl leading-none sm:text-4xl">
        {value}
      </dd>
    </div>
  );
}
