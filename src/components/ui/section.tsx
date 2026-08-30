export function Section({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-t border-line py-14 sm:py-20 ${className}`}>
      <p className="u-mono text-canopy">{eyebrow}</p>
      <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)]">{title}</h2>
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
