/**
 * A sliding-window counter, per server instance.
 *
 * BEST EFFORT, and said so: serverless instances do not share memory, so a
 * visitor who lands on two instances gets two allowances. With the hard caps
 * on message length, history depth and max_tokens this is proportionate for a
 * brochure site's traffic. If abuse or an unexpected bill appears, replace
 * this module with Upstash Redis — the function signature is the seam.
 */

const MAX_KEYS = 5_000;
const hits = new Map<string, number[]>();

export function allow(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  // Re-inserting moves the key to the end, so the first key is the stalest.
  hits.delete(key);
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) {
    const stalest = hits.keys().next().value;
    if (stalest !== undefined) hits.delete(stalest);
  }
  return true;
}

/** The visitor's address as Vercel reports it. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}
