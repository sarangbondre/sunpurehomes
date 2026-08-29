import * as THREE from "three";
import type { Scene } from "@/lib/scene-schema";

/**
 * Turns the scene JSON into three.js geometry. Kept out of the components so
 * the maths is testable and so a surveyed layout swaps in as data (§15).
 *
 * The data plane is x east, y north, origin at the site's south-west corner.
 * three.js is y-up, so ground positions map to (x, height, -y): the scene's
 * north runs into -z. Every conversion happens here, once.
 */

export const toWorld = (
  [x, y]: readonly [number, number],
  height = 0,
): [number, number, number] => [x, height, -y];

/** Centre of the site, used to recentre the model on the origin. */
export function sceneCentre(scene: Scene): [number, number, number] {
  return [scene.extent.width / 2, 0, -scene.extent.depth / 2];
}

/** A flat, filled polygon lying on the ground plane. */
export function ringGeometry(ring: readonly (readonly [number, number])[]) {
  const shape = new THREE.Shape();
  ring.forEach(([x, y], i) => {
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape);
  // Shapes are built in XY; lay them onto the ground and flip north to -z.
  geometry.rotateX(Math.PI / 2);
  geometry.scale(1, 1, -1);
  return geometry;
}

/** A road drawn as a flat ribbon of its real width. */
export function roadGeometry(
  centreline: readonly (readonly [number, number])[],
  widthM: number,
) {
  const half = widthM / 2;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < centreline.length - 1; i++) {
    const [x0, y0] = centreline[i];
    const [x1, y1] = centreline[i + 1];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * half;
    const ny = (dx / len) * half;

    const base = positions.length / 3;
    positions.push(
      x0 + nx, 0, -(y0 + ny),
      x0 - nx, 0, -(y0 - ny),
      x1 + nx, 0, -(y1 + ny),
      x1 - nx, 0, -(y1 - ny),
    );
    indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Sun direction for a time of day, as a unit vector.
 *
 * A real solar position needs latitude, date and true site orientation. Not
 * one of the nine projects has published coordinates, so this is a plain
 * east-to-west arc at Mysuru's approximate solar altitude — enough to show
 * how a plot is lit through the day, and deliberately not presented as a
 * survey. It becomes real the moment coordinates arrive.
 */
export function sunDirection(hour: number): [number, number, number] {
  const t = Math.min(Math.max((hour - 6) / 12, 0), 1); // 06:00 → 18:00
  const azimuth = Math.PI * t; // east to west
  const altitude = Math.sin(Math.PI * t) * 1.15; // peak near noon
  return [Math.cos(azimuth), Math.max(Math.sin(altitude), 0.06), -0.35];
}
