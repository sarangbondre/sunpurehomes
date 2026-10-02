# Running this site on Webflow Cloud

The site is deployed on Vercel. The client also asked for it on Webflow
Cloud, which runs Next.js on Cloudflare Workers through the OpenNext
adapter. Both hosts build the same repository with no switches; this note
records what the Workers runtime needs, and how to check it before a deploy.

## What the Workers runtime forced

- **No filesystem.** `content/*.json` and the two "is this file there?"
  checks used `node:fs`, which Workers do not have, so the worker threw at
  startup and *every* page — static ones included — returned 500. The JSON is
  imported now (`src/lib/content-files.ts`), and the asset lists are in code
  (`BRAND_MARKS` in `src/lib/partners.ts`, `HERO` in
  `src/lib/home-showcase.ts`). `src/lib/content-files.test.ts` and
  `src/lib/assets.test.ts` read the directories and fail if the lists drift.
- **No usable image optimiser.** Webflow's build swaps Next's loader for
  Cloudflare's URL resizer, `/cdn-cgi/image/{params}/{src}`. Two things are
  wrong with it here: it cannot read AVIF — it answers `415 ERROR 9520:
  Original image has unsupported format`, and 61 of the 68 photographs on this
  site are AVIF — and on `sunpurehomes.webflow.io` the path is not routed at
  all, so even the JPEGs 404. Every picture on the deployed site was broken.
  `next.config.ts` therefore sets `images.unoptimized` unless `VERCEL` is set,
  which only Vercel's build sets. Nothing is lost on Workers: the image route
  there passes the bytes through without resizing, so the request was already
  fetching the original. Vercel is untouched and still resizes.
- **Node runtime on the API routes, not edge.** Webflow's docs say to use
  `export const runtime = "edge"`, but OpenNext refuses to build an edge
  route handler ("cannot use the edge runtime"). Both routes stay `nodejs`
  and run under the `nodejs_compat` flag.
- **Next 15.5.26 or newer.** The adapter Webflow installs declares
  `next: ">=15.5.26 <16"`. The repo was on 15.5.24, which fails to resolve.

## Checking it locally before a deploy

Needs Node 22 (Wrangler's floor) and two packages that are deliberately not
dependencies of this repo — Webflow installs the adapter itself:

```
npm install --no-save @opennextjs/cloudflare wrangler
```

Write `open-next.config.ts`:

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();
```

and `wrangler.jsonc`:

```jsonc
{
  "name": "sunpure",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-09-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" }
}
```

Then:

```
npx @opennextjs/cloudflare build
npx wrangler dev --port 8788
```

Every route should answer 200 — `/`, `/about`, `/amenities`, `/privacy`,
`/projects`, `/projects?type=villa&status=completed`, `/projects/[slug]`,
`/projects/[slug]/plan`, `/sitemap.xml`, `/robots.txt` — and `/api/chat`
should answer 404 while Arka is off.

Check the pictures too, because this is the host that gets them wrong: every
`src` on a page should be a plain `/images/...` path, and each one should
answer 200. A `/cdn-cgi/image/...` src means `unoptimized` did not take
effect. To check the Vercel path instead, build with `VERCEL=1` and expect
`/_next/image?url=...` srcs. Delete `.open-next`, `open-next.config.ts` and `wrangler.jsonc`
afterwards; they are local scaffolding, and Webflow Cloud generates its own.

## Environment variables

**They do not reach the build.** Webflow Cloud injects the variables set on an
environment at request time, so nothing it is given is visible to
`next build` or to `next.config.ts`. This is why the image setting is keyed on
Vercel's own `VERCEL` rather than a flag Webflow would supply: a
`WEBFLOW_CLOUD=true` entry in their dashboard cannot work, and the version of
this note that told you to add one was wrong.

The site needs none to render. Arka stays off unless `ARKA_ENABLED=true`
(see docs/adr/0002-arka.md), and `HF_TOKEN`, `RESEND_API_KEY` and `LEAD_FROM`
only matter when it is on. In Webflow Cloud they go on the environment, and a
redeploy is needed for them to take effect.

If Webflow mounts the app on a path rather than the root, set
`NEXT_PUBLIC_BASE_PATH` to that mount path. Their builder sets Next's own
`basePath`; this repo must not set it (`next.config.ts` deliberately does
not).
