import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Optimise images only where there is an optimiser we can use.
   *
   * Vercel sets VERCEL=1 in its own build, so Vercel is unchanged: the pages
   * still ask for /_next/image and still get resized AVIF per breakpoint.
   *
   * Anywhere else — Webflow Cloud, which runs this on Cloudflare Workers —
   * the images are served as they are. Webflow's build replaces the loader
   * with Cloudflare's URL resizer, /cdn-cgi/image/..., and that endpoint
   * cannot read AVIF ("ERROR 9520: Original image has unsupported format")
   * and is not routed at all on sunpurehomes.webflow.io, where it 404s. 61
   * of the 68 photographs on this site are AVIF, so every one of them was
   * broken. Asking for the file itself works on both hosts, and costs
   * nothing: the Workers image route passes the bytes through unchanged, so
   * there was no resizing there to lose.
   *
   * This is keyed on Vercel's variable rather than a Webflow one because
   * Webflow Cloud injects environment variables at request time — nothing it
   * is given reaches next build, so the flag this used to read was never set
   * and the Cloudflare loader was always used.
   *
   * The failure is one-way: if VERCEL were ever missing, Vercel would serve
   * the original files, which is heavier but correct. The reverse — what was
   * happening — showed no picture at all.
   */
  images: { unoptimized: !process.env.VERCEL },

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
