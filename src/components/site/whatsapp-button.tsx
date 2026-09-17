import { WhatsAppIcon } from "@/components/brand/icons";
import { whatsappHref } from "@/lib/links";
import { site } from "@/lib/site";

/**
 * WhatsApp, fixed to the bottom-right corner of every page, at the client's
 * instruction on 17 September — the corner Arka's launcher used to hold.
 *
 * The mark alone, in WhatsApp's own green, because that pairing is what
 * visitors recognise. The aria-label names where it goes. A plain link, so
 * it costs the page no JavaScript.
 */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref(
        `Hello ${site.name} — I'd like to know more about your projects.`,
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Message ${site.name} on WhatsApp`}
      className="fixed bottom-4 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_rgba(28,26,24,0.28)] transition-transform duration-hover ease-hover hover:scale-105 focus-visible:outline-offset-4 sm:bottom-6 sm:right-6 sm:size-16"
    >
      <WhatsAppIcon className="size-7 sm:size-8" />
    </a>
  );
}
