/**
 * Pure helpers shared by the server and the widget. Nothing here may import
 * the corpus or anything that reads from disk — the widget ships to browsers.
 */

/** "/projects/curve" and "/projects/curve/plan" both mean Curve. */
export function slugFromPath(path: string | undefined): string | undefined {
  const match = path?.match(/^\/projects\/([a-z0-9-]+)(?:\/|$)/);
  return match?.[1];
}
