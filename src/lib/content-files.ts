/**
 * Every content file, imported rather than read from disk.
 *
 * The site ran on a Node server, where `content/` could be read with
 * node:fs at startup. Webflow Cloud runs Next.js on Cloudflare Workers,
 * which have no filesystem, so the whole worker failed to start and every
 * page — static ones included — returned 500. Imports put the same JSON in
 * the bundle, which works on both hosts and is checked by the compiler.
 *
 * Adding a project means adding its three files and three lines here. The
 * test in content-files.test.ts fails if a file on disk is missing from this
 * list, so the two cannot drift.
 *
 * A project with no file of a kind is simply absent from its map — which is
 * how the code says "no plan for this one".
 *
 * The parsing and validation that used to live beside the reads has not
 * moved: lib/content.ts and lib/scenes.ts still own it. This module holds
 * nothing but the raw JSON, keyed by slug.
 */

import blessed from "../../content/projects/blessed.json";
import curve from "../../content/projects/curve.json";
import fadal from "../../content/projects/fadal.json";
import h4 from "../../content/projects/h4.json";
import happiness1 from "../../content/projects/happiness-1.json";
import happiness2 from "../../content/projects/happiness-2.json";
import meraki from "../../content/projects/meraki.json";
import rareEarth from "../../content/projects/rare-earth.json";
import v4 from "../../content/projects/v4.json";

import blessedScene from "../../content/scenes/blessed.json";
import curveScene from "../../content/scenes/curve.json";
import fadalScene from "../../content/scenes/fadal.json";
import h4Scene from "../../content/scenes/h4.json";
import happiness1Scene from "../../content/scenes/happiness-1.json";
import happiness2Scene from "../../content/scenes/happiness-2.json";
import merakiScene from "../../content/scenes/meraki.json";
import rareEarthScene from "../../content/scenes/rare-earth.json";
import v4Scene from "../../content/scenes/v4.json";

import blessedAvailability from "../../content/availability/blessed.json";
import curveAvailability from "../../content/availability/curve.json";
import fadalAvailability from "../../content/availability/fadal.json";
import h4Availability from "../../content/availability/h4.json";
import happiness1Availability from "../../content/availability/happiness-1.json";
import happiness2Availability from "../../content/availability/happiness-2.json";
import merakiAvailability from "../../content/availability/meraki.json";
import rareEarthAvailability from "../../content/availability/rare-earth.json";
import v4Availability from "../../content/availability/v4.json";

/** content/projects/[slug].json — every project the site publishes. */
export const PROJECT_FILES: Readonly<Record<string, unknown>> = {
  blessed,
  curve,
  fadal,
  h4,
  "happiness-1": happiness1,
  "happiness-2": happiness2,
  meraki,
  "rare-earth": rareEarth,
  v4,
};

/** content/scenes/[slug].json — site geometry. */
export const SCENE_FILES: Readonly<Record<string, unknown>> = {
  blessed: blessedScene,
  curve: curveScene,
  fadal: fadalScene,
  h4: h4Scene,
  "happiness-1": happiness1Scene,
  "happiness-2": happiness2Scene,
  meraki: merakiScene,
  "rare-earth": rareEarthScene,
  v4: v4Scene,
};

/** content/availability/[slug].json — owned by the sales team. */
export const AVAILABILITY_FILES: Readonly<Record<string, unknown>> = {
  blessed: blessedAvailability,
  curve: curveAvailability,
  fadal: fadalAvailability,
  h4: h4Availability,
  "happiness-1": happiness1Availability,
  "happiness-2": happiness2Availability,
  meraki: merakiAvailability,
  "rare-earth": rareEarthAvailability,
  v4: v4Availability,
};
