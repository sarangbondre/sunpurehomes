"use client";

import * as THREE from "three";

/**
 * The 3D scene's colours, read from the CSS tokens rather than repeated.
 *
 * §8 requires the meaning contract to hold across cards, pins and 3D:
 * laterite = villas and held, stone = apartments and sold, canopy = plots and
 * available. Those hues were duplicated as hex literals inside the scene, so
 * a palette change updated the page and left the model behind. Reading the
 * custom properties means the two cannot drift.
 *
 * Falls back to the shipped values if the variables cannot be read — a canvas
 * rendering in a detached document, for instance.
 */

const FALLBACK: Record<string, string> = {
  "--color-ink": "#1c1a18",
  "--color-paper": "#f4f0e7",
  "--color-paper-2": "#eae3d5",
  "--color-line": "#ded5c4",
  "--color-canopy": "#6f7b5a",
  "--color-laterite": "#b0634a",
  "--color-stone": "#c4bcac",
  "--color-mist": "#ded6c6",
};

function token(name: string): string {
  if (typeof window === "undefined") return FALLBACK[name];
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || FALLBACK[name];
}

export type ScenePalette = {
  available: THREE.Color;
  held: THREE.Color;
  sold: THREE.Color;
  unknown: THREE.Color;
  selected: THREE.Color;
  ground: THREE.Color;
  open: THREE.Color;
  road: THREE.Color;
  wall: THREE.Color;
  roof: THREE.Color;
  trunk: THREE.Color;
  podium: THREE.Color;
  sky: THREE.Color;
};

export function readScenePalette(): ScenePalette {
  const c = (name: string) => new THREE.Color(token(name));
  const paper = c("--color-paper");
  const stone = c("--color-stone");

  return {
    available: c("--color-canopy"),
    held: c("--color-laterite"),
    sold: stone,
    unknown: c("--color-paper-2"),
    selected: c("--color-ink"),

    // Ground fabric sits between paper and stone so the parcels stay the
    // subject and the site reads as one material (§9.1).
    ground: paper.clone().lerp(stone, 0.42),
    open: c("--color-mist"),
    road: c("--color-line"),
    wall: paper.clone().lerp(new THREE.Color("#ffffff"), 0.45),
    /*
      Roofs sit well clear of the walls in value so the massing reads at a
      glance. Kept in the stone family rather than terracotta: laterite
      already means "held" on the pads below, and a clay roof over a held
      plot would blur a status the buyer is meant to read.
    */
    roof: stone.clone().lerp(c("--color-ink"), 0.46),
    trunk: c("--color-laterite").clone().lerp(c("--color-ink"), 0.45),
    podium: paper.clone().lerp(stone, 0.3),
    sky: paper,
  };
}
