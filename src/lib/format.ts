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

/**
 * "3 July 2026" from "2026-07-03".
 *
 * Same reasoning as `formatIndianNumber`: `toLocaleDateString` depends on the
 * ICU data compiled into the runtime, and a slim server image would render a
 * different string from the browser and trip a hydration mismatch. Parsed by
 * hand rather than through `new Date`, which reads a bare YYYY-MM-DD as UTC
 * and can shift the day backwards west of Greenwich.
 */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export function formatDayMonthYear(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
