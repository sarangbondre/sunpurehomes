/**
 * Where a visitor came from, captured when they first land.
 *
 * The lead form posts from inside the site, so the request's Referer header is
 * always the site's own page — it says nothing about Google, Instagram or an
 * ad. The real source is document.referrer and the campaign tags on the URL
 * the visitor first arrived at, and both have to be caught at arrival.
 *
 * Kept in sessionStorage so a reload inside the tab does not overwrite the
 * original source with the site's own page. That is an enhancement only
 * (BRIEF §5): if storage is unavailable the value is still returned for this
 * page's lifetime.
 */

export type Entry = { referrer: string; landing: string };

const KEY = "arka:entry";

function read(): Entry | undefined {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Entry) : undefined;
  } catch {
    // Storage blocked (private mode, strict settings): fall through to a fresh capture.
    return undefined;
  }
}

/** Call once on arrival. Returns the first entry recorded in this tab. */
export function rememberEntry(): Entry {
  const existing = read();
  if (existing) return existing;
  const entry: Entry = {
    referrer: document.referrer,
    landing: `${location.pathname}${location.search}`,
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(entry));
  } catch {
    // Not stored; the caller still holds this page's copy.
  }
  return entry;
}
