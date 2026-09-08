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
  /*
    Shapes are built in XY. A single -90° turn about X lays them on the ground
    AND sends north to -z in one step: (x, y, 0) becomes (x, 0, -y).

    The earlier version turned +90° and then mirrored with scale(1, 1, -1).
    That reached the same positions but the mirror reversed the winding, so
    every ground face ended up with its normal pointing down and rendered
    unlit — the open spaces came out near-black under the sun.
  */
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
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
 * Distance at which a set of points fits inside the frustum, given a view
 * direction and the camera's real aspect ratio.
 *
 * Hand-picked camera distances only frame correctly at one canvas size. This
 * projects every corner of the site onto the camera's own axes and solves for
 * the distance that contains all of them, so the model fits on a phone, on a
 * laptop, and in the narrow column on a project page alike.
 */
export function fitDistance(
  corners: readonly THREE.Vector3[],
  target: THREE.Vector3,
  direction: THREE.Vector3,
  verticalFovRadians: number,
  aspect: number,
): number {
  const forward = direction.clone().normalize();
  const right = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), forward)
    .normalize();
  const up = new THREE.Vector3().crossVectors(forward, right).normalize();

  const tanV = Math.tan(verticalFovRadians / 2);
  const tanH = tanV * aspect;

  let distance = 0;
  const offset = new THREE.Vector3();
  for (const corner of corners) {
    offset.copy(corner).sub(target);
    const along = offset.dot(forward);
    const across = Math.abs(offset.dot(right));
    const vertical = Math.abs(offset.dot(up));
    distance = Math.max(distance, across / tanH + along, vertical / tanV + along);
  }
  return distance;
}

/** The eight corners of the site box, in world space, centred on the origin. */
export function siteCorners(
  width: number,
  depth: number,
  height = 6,
): THREE.Vector3[] {
  const hw = width / 2;
  const hd = depth / 2;
  return [0, height].flatMap((y) => [
    new THREE.Vector3(-hw, y, -hd),
    new THREE.Vector3(hw, y, -hd),
    new THREE.Vector3(hw, y, hd),
    new THREE.Vector3(-hw, y, hd),
  ]);
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

/**
 * A gable roof as a unit prism: 1×1 footprint, ridge at y=1 running along z.
 * Built once and instanced, so a cluster of villas is one draw call.
 */
export function gableRoofGeometry() {
  const a = [-0.5, 0, -0.5], b = [0.5, 0, -0.5];
  const c = [0.5, 0, 0.5], d = [-0.5, 0, 0.5];
  const r0 = [0, 1, -0.5], r1 = [0, 1, 0.5];

  const tri = (...pts: number[][]) => pts.flat();
  const positions = new Float32Array([
    // west slope
    ...tri(a, d, r1), ...tri(a, r1, r0),
    // east slope
    ...tri(b, r0, r1), ...tri(b, r1, c),
    // gable ends
    ...tri(a, r0, b), ...tri(d, c, r1),
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}
