"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";

/**
 * A dropdown that changes the listing's URL — for location and sort.
 *
 * It is a real GET form underneath: with JavaScript off, the visitor picks an
 * option and presses Apply, and the server renders the same URL. With it on,
 * picking an option navigates straight away and Apply is never shown. Either
 * way the result set and the address bar agree, as they do for the chips.
 */
export function SelectNav({
  name,
  label,
  value,
  options,
  keep,
  labelClassName = "",
  selectClassName = "",
}: {
  name: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  /** The other query values to carry through. */
  keep: Readonly<Record<string, string | undefined>>;
  labelClassName?: string;
  selectClassName?: string;
}) {
  const router = useRouter();
  const id = useId();

  function go(next: string) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...keep, [name]: next })) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `/projects?${qs}` : "/projects", { scroll: false });
  }

  return (
    <form method="get" action="/projects" className="contents">
      {Object.entries(keep).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => go(e.target.value)}
          className={`w-full appearance-none rounded-sm border border-ink/70 bg-paper py-2.5 pl-4 pr-10 text-[0.9rem] text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${selectClassName}`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <noscript>
        <button type="submit" className="u-mono ml-2 underline underline-offset-4">
          Apply
        </button>
      </noscript>
    </form>
  );
}
