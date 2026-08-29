"use client";

/**
 * §9.3 — "Detect WebGL support and device memory. Below threshold → 2D plan,
 * no download attempted."
 *
 * The check runs before the 3D bundle is imported, so a device that cannot
 * run the scene never pays to download it. The audience is Mysuru buyers,
 * many on mid-range Android over 4G (§15), so this is the common path, not
 * an edge case.
 */

export type Capability =
  | { ok: true }
  | { ok: false; reason: "no-webgl" | "low-memory" | "reduced-data" };

/** Below this the scene is not offered. Devices reporting 2 GB or less. */
const MIN_DEVICE_MEMORY_GB = 4;

export function detectCapability(): Capability {
  if (typeof window === "undefined") return { ok: false, reason: "no-webgl" };

  // Respect an explicit request for less data before spending any of it.
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData) return { ok: false, reason: "reduced-data" };

  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  if (typeof memory === "number" && memory < MIN_DEVICE_MEMORY_GB) {
    return { ok: false, reason: "low-memory" };
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return { ok: false, reason: "no-webgl" };

    // Release the probe context immediately rather than waiting for GC —
    // browsers cap the number of live contexts.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();

    return { ok: true };
  } catch {
    return { ok: false, reason: "no-webgl" };
  }
}

export const CAPABILITY_MESSAGES: Record<
  Exclude<Capability, { ok: true }>["reason"],
  string
> = {
  "no-webgl": "This device cannot display the 3D view.",
  "low-memory": "The 3D view is turned off to keep this page fast on this device.",
  "reduced-data": "The 3D view is turned off because your browser is set to save data.",
};
