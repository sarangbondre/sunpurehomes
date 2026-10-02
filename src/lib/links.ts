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
 * The place itself, seen from above: Google Maps in satellite view, centred
 * on the project and pulled back far enough to show the roads around it.
 *
 * It was Google Earth for an hour on 2 October, at the client's instruction,
 * and came back because Earth would not take the link. Neither the camera
 * form nor the search form landed in a browser with WebGL available — both
 * reset to the globe at 0,0 and showed Earth's overview page. This form was
 * watched doing the opposite: it resolves to the exact coordinate at 3,580m
 * with satellite imagery, in one hop, and on a phone it opens the Maps app
 * rather than needing a browser that can run a 3D globe.
 *
 * Pinned by coordinate rather than searched. The client's data sheet of the
 * same day gave a point for all nine projects, and a text search for an
 * Indian address can land a district away where a coordinate cannot. A
 * project with no point falls back to a search.
 *
 * ZOOM 15 is about 3.5km across: the plot, the roads that reach it and, in
 * Mysuru, enough of the city to recognise. It was 600m under Earth and the
 * client could not tell the link had gone anywhere.
 */
export function satelliteHref(place: Place): string {
  const c = place.coordinates;
  return c
    ? `https://www.google.com/maps/@?api=1&map_action=map&center=${c.lat},${c.lng}&zoom=15&basemap=satellite`
    : `https://www.google.com/maps/search/?api=1&query=${query(place)}&basemap=satellite`;
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
