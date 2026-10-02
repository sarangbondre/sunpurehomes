import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Next's image optimiser needs a Node server. Vercel has one; Webflow
   * Cloud runs this on Cloudflare Workers, which do not, so that build sets
   * WEBFLOW_CLOUD=true and the images are served as they are. Nothing else
   * about the pages changes.
   */
  images: { unoptimized: process.env.WEBFLOW_CLOUD === "true" },

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
