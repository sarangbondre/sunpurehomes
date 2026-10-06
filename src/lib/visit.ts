import { site } from "@/lib/site";

/**
 * The pure parts of the site-visit enquiry: what counts as a reachable
 * number, what counts as an address, and what the sales team receives.
 *
 * They live here rather than in the form because business rules do not need
 * React to be true, and because a test can reach them without standing up a
 * component — code-quality.md's rule about pushing I/O to the edges, where
 * the edge in this case is the two buttons that open WhatsApp and the mail
 * client.
 */

export type VisitProject = { slug: string; name: string; place: string };

/**
 * Enough of a number to call back. Deliberately generous, because a visitor
 * whose number is refused does not correct it, they leave: a ten-digit Indian
 * mobile, a landline with its STD code, or anything international with a +.
 *
 * The same shapes lib/chatbot/lead.ts accepts. That module cannot be imported
 * here — it pulls in the Resend SDK and a server-only config — so the rule is
 * stated twice and visit-form.test.ts pins the two together.
 */
export function phoneLooksReal(raw: string): boolean {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  const national =
    digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (trimmed.startsWith("+")) return /^\+\d{8,15}$/.test(`+${digits}`);
  return /^[6-9]\d{9}$/.test(national) || /^0\d{10}$/.test(national);
}

/** An address has to have a name, an @ and a dot in the domain. Nothing more. */
export function emailLooksReal(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

/**
 * What the sales team receives, in both channels. One function, because a
 * WhatsApp message and an email that say different things are two versions of
 * the same enquiry and the team has to reconcile them.
 */
export function visitMessage(fields: {
  name: string;
  phone: string;
  email: string;
  project: VisitProject | undefined;
  note: string;
}): string {
  const lines = [
    `Hello ${site.name} — I'd like to arrange a site visit.`,
    "",
    `Name: ${fields.name.trim()}`,
    `Phone: ${fields.phone.trim()}`,
    `Email: ${fields.email.trim()}`,
    `Project: ${fields.project ? `${fields.project.name}, ${fields.project.place}` : "Not decided yet"}`,
  ];
  if (fields.note.trim()) lines.push(`Note: ${fields.note.trim()}`);
  return lines.join("\n");
}

