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
 *        Published for Happiness 2, V4 and Fadal only.
 *
 *   connectivity[].distanceKm    → optional, joined by `travelMinutes`
 *        The old WordPress site published kilometres; the current site
 *        publishes travel times. Converting one into the other would be
 *        inventing a number, so the schema carries whichever is real.
 *
 *   amenities[].description/icon → optional
 *        The live site publishes amenity names only.
 */

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
    }),

    configurations: z.array(
      z.object({
        label: realString("configuration label"),
        areaSqft: z
          .union([z.number().positive(), z.tuple([z.number(), z.number()])])
          .optional(),
        facing: realString("facing").optional(),
        count: z.number().int().positive().optional(),
      }),
    ),

    compliance: z.object({
      /**
       * Required to publish (§4). Absent → the page renders a "Registration
       * details on request" state and the project is left out of the sitemap.
       */
      reraNumber: realString("reraNumber").optional(),
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
          ]),
          distanceKm: z.number().positive().optional(),
          travelMinutes: z.number().int().positive().optional(),
        })
        .refine((c) => c.distanceKm !== undefined || c.travelMinutes !== undefined, {
          message: "connectivity entry needs a distance or a travel time",
        }),
    ),

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
