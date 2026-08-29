import { site } from "@/lib/site";

/**
 * Outbound links, built in one place so a number or address is never typed
 * into a component. WhatsApp is a first-class channel here (§15): property
 * decisions in Mysuru are made by families, and sharing is not a nice-to-have.
 */

export const telHref = `tel:${site.contact.phoneE164}`;
export const mailtoHref = `mailto:${site.contact.email}`;

/** wa.me wants the number without a leading +. */
const waNumber = site.contact.phoneE164.replace(/^\+/, "");

export function whatsappHref(message: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

export function projectEnquiryMessage(projectName: string, unit?: string): string {
  const about = unit
    ? `${projectName}, unit ${unit}`
    : projectName;
  return `Hello Sunpure Homes — I'd like to know more about ${about}.`;
}
