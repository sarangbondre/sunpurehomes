import {
  CONTACT_HANDOFF,
  HANDOFF,
  LEAD,
  PRICE_HANDOFF,
} from "@/lib/chatbot/persona";

/**
 * The model's text, made safe to show, as a stream of events.
 *
 * The prompt asks Arka never to quote a price or write a contact detail.
 * This makes both true regardless of what the model does, because on a
 * RERA-registered sales site a price that was never published is not a
 * style slip.
 *
 * Text is held back until a sentence ends and each sentence is checked before
 * any of it is sent. A price therefore never reaches the browser — not even
 * for the half-second before a correction — and the delay is one sentence,
 * which still reads as streaming.
 */

export type ArkaEvent =
  | { t: "text"; v: string }
  /** Throw away what was shown for this reply and show this instead. */
  | { t: "replace"; v: string }
  | { t: "handoff"; reason: "model" | "price" | "contact" | "unavailable" }
  | { t: "lead" }
  | { t: "done" }
  | { t: "error"; code: "unavailable" | "limited" | "invalid" | "failed" };

/*
  Money, not the word. "Prices aren't published" must pass; "₹85 lakh",
  "Rs 1.2 cr", "85L", "6,500 per sq ft" and "EMI of 40,000" must not. Areas
  ("1,946 sq ft") carry no currency and no "per", so they pass.

  Biased toward false positives on purpose: a wrongly blocked answer costs a
  visitor one tap on WhatsApp; a leaked price costs the developer far more.
*/
const PRICE = new RegExp(
  [
    String.raw`(?:₹|\brs\.?|\binr\b|\brupees?\b)\s*\d`,
    String.raw`\b\d[\d,.]*\s*(?:lakhs?|lacs?|lkh|crores?|cr|l)\b`,
    String.raw`\b\d[\d,.]*\s*(?:\/|per)\s*(?:sq\.?\s*(?:ft|feet|m)|sqft|square\s*(?:feet|foot|metres?|meters?))`,
    String.raw`\b\d[\d,.]*\s*psf\b`,
    String.raw`\bemi\b[^.\n]{0,24}\d`,
  ].join("|"),
  "i",
);

const CONTACT: readonly { pattern: RegExp; replaceWith: string }[] = [
  // Indian mobile numbers, with or without +91 and a space in the middle.
  { pattern: /(?:\+?91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b/g, replaceWith: "the sales team" },
  // Any other long run of digits. RERA numbers are slash-separated runs of
  // six or fewer, so they are untouched.
  { pattern: /\b\d{10,}\b/g, replaceWith: "the sales team" },
  { pattern: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, replaceWith: "the sales team" },
  { pattern: /\bhttps?:\/\/\S+|\bwww\.\S+/gi, replaceWith: "" },
  { pattern: /\b[\w-]+\.(?:com|in|co\.in|org|net)\b\S*/gi, replaceWith: "" },
];

const MARKER = /\[\[\s*(handoff|lead)\s*\]\]?/gi;
/*
  A sentence ends at . ! ? or a newline, followed by space or the end — except
  after an abbreviation. "Rs." ending a piece would release "The price is Rs."
  on its own, before the number that makes it a price had arrived.
*/
const BOUNDARY =
  /(?<!\b(?:rs|no|sq|approx|nos|dr|mr|ms|st|vs|etc))[.!?](?=\s)|\n/gi;

export function containsPrice(text: string): boolean {
  return PRICE.test(text);
}

/**
 * Returns the text with contact details removed, and whether any were.
 *
 * In Arka's replies a number becomes "the sales team", which still reads as a
 * sentence. In a visitor's message that would say "my number is the sales
 * team", so input passes its own placeholder.
 */
export function scrubContacts(
  text: string,
  placeholder?: string,
): { text: string; scrubbed: boolean } {
  let out = text;
  let scrubbed = false;
  for (const { pattern, replaceWith } of CONTACT) {
    out = out.replace(pattern, () => {
      scrubbed = true;
      return placeholder ?? replaceWith;
    });
  }
  return { text: scrubbed ? out.replace(/[ \t]{2,}/g, " ") : out, scrubbed };
}

function takeMarkers(text: string): { text: string; handoff: boolean; lead: boolean } {
  let handoff = false;
  let lead = false;
  const stripped = text.replace(MARKER, (_, kind: string) => {
    if (kind.toLowerCase() === "lead") lead = true;
    else handoff = true;
    return "";
  });
  return { text: stripped, handoff, lead };
}

/** Index just past the last sentence boundary in `text`, or -1. */
function lastBoundary(text: string): number {
  let end = -1;
  for (const m of text.matchAll(BOUNDARY)) end = m.index + m[0].length;
  return end;
}

export async function* guardStream(
  source: AsyncIterable<string>,
): AsyncGenerator<ArkaEvent> {
  let pending = "";
  let handoff: Extract<ArkaEvent, { t: "handoff" }>["reason"] | null = null;
  let lead = false;

  /** Checks one flushed piece. Returns false if the reply must stop. */
  function* release(piece: string): Generator<ArkaEvent, boolean> {
    const marked = takeMarkers(piece);
    if (marked.handoff) handoff ??= "model";
    if (marked.lead) lead = true;

    if (containsPrice(marked.text)) {
      // Someone asking about price is the warmest lead there is.
      yield { t: "replace", v: PRICE_HANDOFF };
      yield { t: "lead" };
      yield { t: "handoff", reason: "price" };
      yield { t: "done" };
      return false;
    }

    const clean = scrubContacts(marked.text);
    if (clean.scrubbed) handoff = "contact";
    if (clean.text) yield { t: "text", v: clean.text };
    return true;
  }

  for await (const chunk of source) {
    pending += chunk;
    const cut = lastBoundary(pending);
    if (cut === -1) continue;

    const ready = pending.slice(0, cut);
    pending = pending.slice(cut);
    if (!(yield* release(ready))) return;
  }

  if (pending && !(yield* release(pending))) return;

  if (handoff === "contact") yield { t: "text", v: ` ${CONTACT_HANDOFF}` };
  if (lead) yield { t: "lead" };
  if (handoff) yield { t: "handoff", reason: handoff };
  yield { t: "done" };
}

// Re-exported so tests and the eval can refer to the markers by name.
export { HANDOFF, LEAD };
