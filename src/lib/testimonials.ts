/**
 * What five households have said about living in a Sunpure development.
 *
 * Copied on 5 October 2026 from the client's live site at sunpurehomes.com,
 * at their instruction, as the terms and the privacy policy were. The words
 * are the residents' and are reproduced as published; the photographs are the
 * client's, re-encoded to AVIF at 480px and nothing else.
 *
 * Their home page carries these in a GSAP carousel that advances itself every
 * eight seconds. That part is deliberately not copied: BRIEF §8 rules out
 * decorative movement, and WCAG 2.2.2 would require a pause control for
 * anything that moves for more than five seconds. All five are simply on the
 * page, which also means a reader who never scrolls past the first one is not
 * the only reader who sees the rest.
 *
 * Named in code rather than read from content/, because Cloudflare Workers —
 * which Webflow Cloud runs this on — have no filesystem. assets.test.ts fails
 * if a portrait named here is missing from public/.
 *
 * FOUR THINGS TO PUT TO THE CLIENT. They are their copy, about real people,
 * so none of them is ours to decide:
 *   - Their live site calls the second household "Mrs. Sunitha N.S. & Mr.
 *     Dakshayini". An earlier version of the same block on the same page says
 *     "Mrs. Dakshayini". One of the two has a person's title wrong and we
 *     cannot tell which, so the current published version stands.
 *   - "Akshaya P BaBu" is capitalised that way on their site. It reads as a
 *     slip, but a name is not ours to correct.
 *   - The second quote says "Booking an apartment at Sunpure Happiness" while
 *     its own attribution reads Villa No. 13, and Happiness 1 is a villa
 *     development in content/. Left as published.
 *   - Only Blessed and Happiness 1 are represented. Seven other developments
 *     have none, and a line from Curve or H4 would be worth more here than
 *     any of these, because those are the ones still selling.
 *
 * Two edits, both typographic and neither touching a word: "name-our family"
 * is set with an em dash, because a hyphen between two words reads as a
 * compound and looked like a defect at display size; and "Happiness - I" is
 * resolved to the development's own name through its slug, so the one place
 * a project is named on this site stays content/projects/*.json (§14).
 */

export type Testimonial = {
  /** As the client publishes it, honorifics and all. */
  readonly name: string;
  /** The development they live in — a slug in content/projects. */
  readonly project: string;
  /** Their unit, as the client publishes it. */
  readonly unit: string;
  readonly quote: string;
  /** Filename in public/images/testimonials. */
  readonly portrait: string;
  readonly portraitAlt: string;
};

const PORTRAIT_DIR = "images/testimonials";

const TESTIMONIALS: readonly Testimonial[] = [
  {
    name: "Mithun M",
    project: "blessed",
    unit: "Unit No. G1",
    quote:
      "We were looking for a home that could accommodate our growing family without feeling cramped, and Blessed exceeded all our expectations. The roomy layout ensures that every family member has their own space while still feeling connected. The premium location adds to the charm with its peaceful vibe and proximity to essential amenities. It's truly the perfect blend of luxury and convenience.",
    portrait: "mithun.avif",
    portraitAlt: "Mithun M with family.",
  },
  {
    name: "Mrs. Sunitha N.S. & Mr. Dakshayini",
    project: "happiness-1",
    unit: "Villa No. 13",
    quote:
      "Booking an apartment at Sunpure Happiness was one of the best decisions we've ever made. Our 3 BHK is spacious, well-ventilated, and beautifully designed to cater to our individual preferences. Right at Vijayanagar in Mysuru, it offers a perfect escape from the city's chaos while keeping us connected to top schools, and healthcare. As a salute to its name, we can proudly say that we found Happiness right here!",
    portrait: "daksh.avif",
    portraitAlt: "Mrs. Sunitha N.S. and Mr. Dakshayini with family.",
  },
  {
    name: "Shylaja M G",
    project: "blessed",
    unit: "Unit No. G5",
    quote:
      "Our family couldn't have asked for a better experience than moving into the Sunpure Blessed. Every nook and cranny of our home exudes a sense of warmth and hospitality, thanks to the ample ventilation, and abundant natural light. We have been able to significantly improve our way of life because of the tranquil surroundings and the easy location. Our pride lies in the fact that we are able to call this location our home; it is the ideal combination of convenience and neighbourhood!",
    portrait: "shyla.avif",
    portraitAlt: "Shylaja M G with family.",
  },
  {
    name: "Mr. Sunil Kumar & Mrs. Arathi Sunil",
    project: "happiness-1",
    unit: "Villa No. 8",
    quote:
      "Our Villa at Sunpure Happiness has truly redefined the meaning of luxury and comfort. The serene environment and spacious design make it a perfect haven for families. From the well-planned layouts to the lush green surroundings, every detail exudes elegance and thoughtfulness. It's not just a house; it's a lifestyle upgrade. Living here feels like a dream come true!",
    portrait: "sunil.avif",
    portraitAlt: "Mr. Sunil Kumar and Mrs. Arathi Sunil with family.",
  },
  {
    name: "Akshaya P BaBu",
    project: "blessed",
    unit: "Unit No. G2",
    quote:
      "Our 3 BHK at Sunpure Blessed feels like it was made just for us. The expansive spaces, surrounded by greenery and tranquility, make it a perfect escape from the chaos of daily life. Its prime location in Vijayanagar in Mysuru means that we're close to great schools, hospitals, and even shopping destinations. Blessed truly lives up to its name—our family couldn't be happier.",
    portrait: "babu.avif",
    portraitAlt: "Akshaya P BaBu with family.",
  },
];

export function getTestimonials(): readonly Testimonial[] {
  return TESTIMONIALS;
}

export function portraitSrc(testimonial: Testimonial): string {
  return `/${PORTRAIT_DIR}/${testimonial.portrait}`;
}
