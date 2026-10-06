/**
 * The brand's films on YouTube, as at 6 October 2026.
 *
 * Read off the channel at youtube.com/@sunpurehomesmysore and checked one by
 * one against YouTube's own oEmbed endpoint, which is what confirms a video
 * both exists and may be embedded — a private or embedding-disabled video
 * answers 401 or 404 there and would otherwise reach the page as a grey box
 * saying "Video unavailable".
 *
 * TITLES ARE YOUTUBE'S, NOT OURS, to the character. They are how someone who
 * has seen a film on the channel will recognise it here, and rewriting them
 * would quietly make this page disagree with the channel it points at.
 *
 * Each film is tied to a development by what its own title says: "Curve
 * Apartments" is Curve, "Happiness IV" is h4. Nothing is placed on a
 * development the title does not name. That rule leaves three films with no
 * project — two are about the company and one, "Possession Soon | Limited
 * Homes", names no development at all and would be a guess. They are grouped
 * as the company's own rather than filed under something plausible.
 *
 * Rare Earth has no film. It is simply absent rather than given someone
 * else's, which is the failure the project pages already guard against with
 * the shared-connectivity note: the same footage on several pages says
 * nothing true about any of them.
 *
 * A film is an id and a title and nothing else. Views, dates and descriptions
 * would all have to be re-read from the channel to stay true, and a number
 * that is eight months stale is worse than no number.
 */

export type Film = {
  /** The YouTube id. The page embeds it from youtube-nocookie.com. */
  readonly id: string;
  /** YouTube's own title, verbatim. */
  readonly title: string;
  /** A slug in content/projects, or undefined for the company's own films. */
  readonly project?: string;
};

const FILMS: readonly Film[] = [
  { id: "o59d5IY3hBM", title: "Celebrate Life at CURVE | Thoughtfully Designed Living", project: "curve" },
  {
    id: "oUXqd_6YTHE",
    title: "Curve Apartments | A Masterpiece of Contemporary Design | by Sunpure Homes",
    project: "curve",
  },
  { id: "_A3g3AIQ-tI", title: "Happiness IV where Luxury finds its Calm", project: "h4" },
  {
    id: "msBeC2uwE5g",
    title: "Happiness IV | Spacious Independent Villas in Mysore |  H4 Villas by Sunpure Homes",
    project: "h4",
  },
  {
    id: "AFFVAeZiIcI",
    title: "Happiness IV by Sunpure Homes- Where Luxury Finds Its Calm",
    project: "h4",
  },
  {
    id: "u4nPD6oZrpQ",
    title: "Sunpure Homes V4 – Mysore’s Finest Address in Vijayanagar 4th Stage",
    project: "v4",
  },
  {
    id: "4or6QsRXwwY",
    title: "V4 Apartments – Affordable Luxury in Vijayanagar 4th Stage, Mysore",
    project: "v4",
  },
  {
    id: "b6zS_EOZvFo",
    title: "Sunpure Homes |  V4 3 BHK Apartments | Vijayanagar 4th Stage | V4 Walkthrough",
    project: "v4",
  },
  { id: "UR_AMtdyUGk", title: "Blessed | Blissful Villa-like Apartments | Walkthrough", project: "blessed" },
  { id: "5OC2yCNr2hw", title: "Experience ‘Blessed’ – Sunpure Homes Mysore #sunpurehomes", project: "blessed" },
  {
    id: "9BUgDeNf9qE",
    title: "Happiness I Villas | A Signature Living Experience in Mysore | #sunpurehomes",
    project: "happiness-1",
  },
  {
    id: "C94L7R7C2_A",
    title: "Sunpure Homes | Happiness II | Mysore Homes | 3 BHK Villa | Vijayanagar 4th Stage",
    project: "happiness-2",
  },
  {
    id: "9UPq8dz4cSs",
    title: "Sunpure Homes | Mysuru Plots | Fadal Enclave Walkthrough | KRS Main Road | Mysuru",
    project: "fadal",
  },
  { id: "_5eKjSTcDzo", title: "Meraki | Where your heart feels at home | Walkthrough", project: "meraki" },
  { id: "UZtLXfyVAdE", title: "Sunpure Homes - The Next Big Signature in Mysore" },
  { id: "sXfOfXmQzPc", title: "Every home begins with a thought. 🏡✨ | Sunpure Homes" },
  { id: "UVBBsKNJlPs", title: "Possession Soon | Limited Homes" },
];

export function getFilms(): readonly Film[] {
  return FILMS;
}

/** A development and its films, or the company's own films with no slug. */
export type FilmGroup = { readonly project?: string; readonly films: readonly Film[] };

/**
 * The films grouped by development, in the order the caller gives — the same
 * order /projects shows, so the two pages do not disagree about which
 * development comes first.
 *
 * A development with no film is left out rather than shown empty, and the
 * company's own films come last: someone on this page is looking for the
 * building they are thinking of buying into, not for us.
 */
export function groupFilms(
  films: readonly Film[],
  order: readonly string[],
): readonly FilmGroup[] {
  const groups = order.flatMap((slug) => {
    const own = films.filter((film) => film.project === slug);
    return own.length > 0 ? [{ project: slug, films: own }] : [];
  });

  const house = films.filter((film) => film.project === undefined);
  return house.length > 0 ? [...groups, { films: house }] : groups;
}

/** youtube-nocookie.com: no tracking cookie is set until a film is played. */
export function embedSrc(film: Film): string {
  return `https://www.youtube-nocookie.com/embed/${film.id}`;
}

export function watchHref(film: Film): string {
  return `https://www.youtube.com/watch?v=${film.id}`;
}
