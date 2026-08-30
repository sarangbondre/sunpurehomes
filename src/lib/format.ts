/**
 * Indian digit grouping, computed rather than delegated to Intl.
 *
 * `toLocaleString("en-IN")` depends on the ICU data compiled into the
 * runtime. A Node build without full ICU — common in slim container images —
 * silently falls back to en-US, so the server would render "100,000" while
 * the browser renders "1,00,000" and React would report a hydration
 * mismatch. Every current figure is under a lakh, so the two agree today;
 * this makes them agree permanently.
 *
 * Grouping: the last three digits, then in twos.
 *   1774 -> 1,774      100000 -> 1,00,000      1164000 -> 11,64,000
 */
export function formatIndianNumber(value: number): string {
  const negative = value < 0;
  const digits = Math.abs(Math.round(value)).toString();

  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}`
    : last3;

  return negative ? `-${grouped}` : grouped;
}
