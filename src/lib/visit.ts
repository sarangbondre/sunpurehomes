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

/** Only what the rule needs, so a test does not have to build a whole project. */
type Offerable = {
  readonly slug: string;
  readonly status: "ongoing" | "completed" | "upcoming";
};

/**
 * The developments a visit can be booked to: the ones still selling.
 *
 * A finished building or a sold-out one is left off the list entirely, at the
 * client's instruction of 6 October. It was offered and marked "fully sold"
 * for a day, on the reasoning that someone deciding on Curve might want to
 * walk around Blessed first — the client's answer is that a site visit is a
 * sales appointment and there is nothing at the far end of one for a building
 * with nothing left in it. Their call, and it is their sales team's diary.
 *
 * Both conditions are needed and neither implies the other: V4 is ongoing and
 * fully sold, Blessed is completed and was never flagged sold. Checking only
 * the status would offer V4; checking only the flag would offer Blessed.
 */
export function offerableProjects<T extends Offerable>(
  projects: readonly T[],
  isFullySold: (slug: string) => boolean,
): readonly T[] {
  return projects.filter(
    (project) => project.status !== "completed" && !isFullySold(project.slug),
  );
}

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

