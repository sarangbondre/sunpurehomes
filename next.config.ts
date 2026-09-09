import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * `next dev` and `next build` both write to `.next` by default, so running
   * a production build while the dev server is up overwrites the files it is
   * serving from and every request 500s until it is restarted. Deploys still
   * get the default, because nothing sets this in their environment — it is
   * `npm run build:verify` that points builds somewhere else.
   */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
