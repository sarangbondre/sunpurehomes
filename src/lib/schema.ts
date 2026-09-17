import { z } from "zod";

/**
 * Content schema — BRIEF.md §7.
 *
 * DELIBERATE DEVIATIONS from the interface as written in the brief. Each one
 * exists because the brief also says (§15) "ask before inventing": a required
 * field forces a value, and the only values available would be made up. The
 * live site's failure mode is confidently displaying wrong information, so
 * these are optional instead, and absence is surfaced in `contentWarnings`.
 *
 *   location.lat / location.lng  → optional `coordinates`
 *        No project's real coordinates are published anywhere. Placing nine
 *        pins at guessed points would be worse than placing none.
 *        REQUIRED BEFORE PHASE 3 — the city scene cannot be built without them.
 *
 *   configurations[].areaSqft    → optional
 *        Published for Happiness 2, V4, Fadal, Rare Earth and Curve.
 *
 *   connectivity[].distanceKm    → optional, joined by `travelMinutes`
 *        The old WordPress site published kilometres; the current site
 *        publishes travel times. Converting one into the other would be
 *        inventing a number, so the schema carries whichever is real.
 *
 *   amenities[].description/icon → optional
 *        The live site publishes amenity names only.
 */

/**
 * Hosts we will frame. An iframe executes third-party code inside the
 * visitor's session, so the host is checked rather than trusted: a tour URL
 * arrives from a sales conversation, and §6 treats anything from outside the
 * process as untrusted.
 */
export const TOUR_HOSTS = {
  matterport: ["my.matterport.com"],
  istaging: ["livetour.istaging.com"],
  kuula: ["kuula.co"],
  cloudpano: ["app.cloudpano.com"],
  shapespark: [".shapespark.com"],
} as const;

export const TOUR_PROVIDERS = [
  "matterport",
  "istaging",
  "kuula",
  "cloudpano",
  "shapespark",
] as const;

export type TourProvider = (typeof TOUR_PROVIDERS)[number];

export function isAllowedTourHost(provider: TourProvider, url: string): boolean {
  let host: string;
  try {
    const parsed = new URL(url);
    /* http embeds are blocked on an https page anyway; reject them here so the
       failure is a build error with a message rather than a blank frame. */
    if (parsed.protocol !== "https:") return false;
    host = parsed.hostname.toLowerCase();
  } catch {
    return false;
  }
  return TOUR_HOSTS[provider].some((allowed) =>
    allowed.startsWith(".") ? host.endsWith(allowed) : host === allowed,
  );
}

export const PROJECT_TYPES = ["villa", "apartment", "plot"] as const;
export const PROJECT_STATUSES = ["ongoing", "completed", "upcoming"] as const;

export const projectTypeSchema = z.enum(PROJECT_TYPES);
export const projectStatusSchema = z.enum(PROJECT_STATUSES);

export type ProjectType = z.infer<typeof projectTypeSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

/** Rejects the placeholder strings §14 requires the build to fail on. */
const PLACEHOLDER = /lorem ipsum|text inside of a div|NUMBER GOES HERE|\bTBD\b|\bXXX\b/i;
const realString = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} must not be empty`)
    .refine((v) => !PLACEHOLDER.test(v), {
      message: `${label} contains a placeholder string`,
    });

export const projectSchema = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
    name: realString("name"),
    type: projectTypeSchema,
    status: projectStatusSchema,

    tagline: realString("tagline"),
    description: realString("description"),

    /*
      Page copy for the client's reference design (17 September 2026). Short
      lines of voice, not facts: each must stay true of the project, and none
      may carry a figure the data does not.
    */
    /** The large line that opens the page body: "A home for a fuller life." */
    headline: realString("headline").optional(),
    /** Beside the unit count: "Spacious 3 BHK homes with deep balconies." */
    homesLine: realString("homesLine").optional(),
    /** Under the configurations: "Well-proportioned homes designed for…" */
    configurationsNote: realString("configurationsNote").optional(),
    /** The client's own class for the project, e.g. "Premium apartments". */
    category: realString("category").optional(),

    /**
     * Which flats face which way, as the client lists them — flat numbers
     * repeat on every floor. From the client's data sheet.
     */
    facings: z
      .array(z.object({ flats: realString("facing flats"), facing: realString("facing") }))
      .optional(),

    /**
     * The brands a project is built with and what each supplies, when the
     * client has given them for this project. Absent → the site-wide list.
     */
    materials: z
      .array(z.object({ brand: realString("material brand"), use: realString("material use") }))
      .optional(),

    location: z.object({
      label: realString("location.label"),
      addressLines: z.array(realString("address line")),
      /** Absent for every project today. See the note above. */
      coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }),

    scale: z.object({
      acres: z.number().positive().optional(),
      unitCount: z.number().int().positive().optional(),
      unitNoun: realString("scale.unitNoun"),
      /** As the client writes it: "G+4". */
      floors: realString("scale.floors").optional(),
      /** Where the parking is: "Ground floor". */
      parking: realString("scale.parking").optional(),
    }),

    configurations: z.array(
      z.object({
        label: realString("configuration label"),
        areaSqft: z
          .union([z.number().positive(), z.tuple([z.number(), z.number()])])
          .optional(),
        /**
         * Which measurement `areaSqft` is. For a plot the figure is the plot
         * itself and needs no qualifier; for a built home "1,946 sq ft" means
         * nothing until you know whether it is super built-up or carpet, and
         * the two differ by a third. Absent → the column renders as a bare
         * "Area", which is what every project published before the
         * brochures arrived.
         */
        areaBasis: z
          .enum(["plot", "super-built-up", "built-up", "carpet"])
          .optional(),
        /**
         * Carpet area is the figure RERA requires a promoter to disclose, so
         * it is carried separately rather than replacing `areaSqft` — buyers
         * are quoted the super built-up figure and need both to compare.
         */
        carpetAreaSqft: z
          .union([z.number().positive(), z.tuple([z.number(), z.number()])])
          .optional(),
        facing: realString("facing").optional(),
        count: z.number().int().positive().optional(),
        /** A short line under the label: "With deep balconies". */
        note: realString("configuration note").optional(),
        /** Shown with the room icons: "Deep balcony". */
        balcony: realString("configuration balcony").optional(),
      }),
    ),

    compliance: z.object({
      /**
       * Required to publish (§4). Absent → the page renders a "Registration
       * details on request" state and the project is left out of the sitemap.
       */
      reraNumber: realString("reraNumber").optional(),
      /**
       * Further registrations on the same project — an extension, for
       * instance, which carries an EX/ prefix. Additive, so the primary
       * number keeps its meaning and the uniqueness check still applies
       * to it alone.
       */
      reraAdditionalNumbers: z.array(realString("reraNumber")).optional(),
      /**
       * A RERA number is a statutory disclosure. "placeholder" means the
       * number is a stand-in for development and has NOT been checked
       * against the Karnataka register — the page labels it as unverified,
       * and `isPublishable` keeps the project out of the sitemap.
       *
       * Only "verified" numbers may be presented as registrations. Flipping
       * this field is the single action that turns the label off.
       */
      reraProvenance: z.enum(["placeholder", "verified"]).optional(),
      reraAuthorityUrl: z.string().url(),
      planSanction: z.boolean().optional(),
      khataConversion: z.boolean().optional(),
      approvedBanks: z.array(realString("bank")).optional(),
    }),

    amenities: z.array(
      z.object({
        name: realString("amenity name"),
        description: realString("amenity description").optional(),
        icon: realString("amenity icon").optional(),
        /** Hotspot in the 3D scene — Phase 4. */
        position: z.tuple([z.number(), z.number(), z.number()]).optional(),
      }),
    ),

    specifications: z.array(
      z.object({
        group: realString("specification group"),
        items: z.array(realString("specification item")).min(1),
      }),
    ),

    connectivity: z.array(
      z
        .object({
          name: realString("connectivity name"),
          category: z.enum([
            "work",
            "education",
            "retail",
            "health",
            "transport",
            /**
             * The brochures lead on landmarks — the Palace, KRS, Chamundi
             * Hill, the zoo. None of them is retail or transport, and
             * dropping them to fit the original five would have thrown away
             * the distances the client actually publishes.
             */
            "leisure",
          ]),
          distanceKm: z.number().positive().optional(),
          travelMinutes: z.number().int().positive().optional(),
        })
        .refine((c) => c.distanceKm !== undefined || c.travelMinutes !== undefined, {
          message: "connectivity entry needs a distance or a travel time",
        }),
    ),

    /**
     * A hosted 360 virtual tour, embedded on the project page.
     *
     * The tour itself is never built here — it is captured. Either a camera
     * operator scans a finished room, or 360 panoramas are rendered from the
     * architect's model, and a platform hosts the result. The site's whole
     * job is to embed the URL that comes back.
     *
     * `provider` is not decoration. It selects the allowlist that `url` is
     * checked against, so a mistyped or hostile URL cannot be framed into the
     * page — an iframe runs third-party code in the visitor's session.
     */
    tour: z
      .object({
        provider: z.enum(TOUR_PROVIDERS),
        url: z.string().url(),
        /**
         * What the tour actually shows. A show flat is not the flat being
         * sold, and a visitor is entitled to know which they are walking
         * through.
         */
        subject: realString("tour subject"),
        /** Absent for a rendered tour; set when a real room was scanned. */
        captured: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "captured must be YYYY-MM-DD")
          .optional(),
      })
      .refine((t) => isAllowedTourHost(t.provider, t.url), {
        message:
          "tour.url host does not belong to the named provider — see TOUR_HOSTS",
        path: ["url"],
      })
      .optional(),

    /**
     * Drone footage of this project, web-encoded. Optional and expected to
     * stay that way for most projects: the flight on 3 July 2026 covered the
     * Vijayanagar campus only, so Fadal, Rare Earth and Meraki have none.
     *
     * A film must show THIS project. The live site's failure mode is one
     * identical connectivity list across seven projects in different
     * neighbourhoods (§2); putting the same campus clip on six project pages
     * would be the same mistake in a new medium.
     */
    film: z
      .object({
        /** H.264 MP4, muted, built to loop. */
        src: z.string().startsWith("/"),
        /** The clip's own first frame, so the still and first frame match. */
        poster: z.string().startsWith("/"),
        alt: realString("film alt"),
        /** ISO date the footage was shot, shown as a caption. */
        captured: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "captured must be YYYY-MM-DD"),
      })
      .optional(),

    scene: z
      .object({
        kind: z.enum(["villa-cluster", "apartment-block", "plot-layout"]),
        dataUrl: z.string(),
      })
      .optional(),

    gallery: z.array(
      z.object({
        src: z.string().startsWith("/"),
        /** Non-empty alt is a hard requirement (§14). */
        alt: realString("gallery alt"),
        /**
         * Which gallery tab the image belongs to (client, 17 September).
         * Set by looking at the image, not guessed from its name.
         */
        view: z.enum(["exterior", "interior"]),
      }),
    ),

    /**
     * Internal only, never rendered — so these are exempt from the
     * placeholder ban. A warning has to be able to quote the defect it
     * describes, including the literal "NUMBER GOES HERE" on the live site.
     */
    contentWarnings: z.array(z.string().trim().min(1)).optional(),
  })
  .strict();

export type Project = z.infer<typeof projectSchema>;
