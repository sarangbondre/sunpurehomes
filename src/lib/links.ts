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

/** Enough of a project's location to point at it. */
type Place = {
  label: string;
  addressLines?: readonly string[];
  coordinates?: { lat: number; lng: number };
};

const query = (place: Place) =>
  encodeURIComponent(
    place.addressLines?.length ? place.addressLines.join(", ") : place.label,
  );

/**
 * Google Earth, at the client's instruction of 2 October 2026, where every
 * place on the site used to open Google Maps.
 *
 * Pinned by coordinate rather than searched. The client's data sheet of the
 * same day gave a point for all nine projects, and Earth is much worse than
 * Maps at finding an Indian address from text — a search there can land a
 * district away, where a coordinate cannot. A project with no point falls
 * back to a search.
 *
 * CAMERA is the view Earth opens at, and the numbers after the coordinate
 * are its altitude, distance, field of view, heading, tilt and roll.
 *
 * 2,200m out, where it was 600m: at 600 the frame held the plot and little
 * else, so someone who had just left the site had nothing to recognise and
 * could not tell the link had taken them anywhere (client, 2 October). At
 * this distance the roads around it, and in Mysuru's case the city itself,
 * are in frame. The tilt is gentle rather than the 45° it was, because a
 * steep angle at this range hides as much as it shows.
 */
const CAMERA = "0a,2200d,35y,0h,20t,0r";
export function earthHref(place: Place): string {
  const c = place.coordinates;
  return c
    ? `https://earth.google.com/web/@${c.lat},${c.lng},${CAMERA}`
    : `https://earth.google.com/web/search/${query(place)}`;
}

/**
 * Google Maps, and only for the control that says "Get directions" — Earth
 * does not do directions, so sending that link there would take the one
 * useful thing away from it. Everything else about a place opens Earth.
 */
export function directionsHref(place: Place): string {
  return `https://www.google.com/maps/search/?api=1&query=${query(place)}`;
}

export function projectEnquiryMessage(projectName: string, unit?: string): string {
  const about = unit
    ? `${projectName}, unit ${unit}`
    : projectName;
  return `Hello Sunpure Homes — I'd like to know more about ${about}.`;
}
