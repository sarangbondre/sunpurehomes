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
- **No image optimiser.** `next.config.ts` sets `images.unoptimized` when
  `WEBFLOW_CLOUD=true`. Vercel does not set it, so Vercel keeps optimising.
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
WEBFLOW_CLOUD=true npx @opennextjs/cloudflare build
npx wrangler dev --port 8788
```

Every route should answer 200 — `/`, `/about`, `/amenities`, `/privacy`,
`/projects`, `/projects?type=villa&status=completed`, `/projects/[slug]`,
`/projects/[slug]/plan` — and `/api/chat` should answer 404 while Arka is
off. Delete `.open-next`, `open-next.config.ts` and `wrangler.jsonc`
afterwards; they are local scaffolding, and Webflow Cloud generates its own.

## Environment variables

The site needs none to render. Arka stays off unless `ARKA_ENABLED=true`
(see docs/adr/0002-arka.md), and `HF_TOKEN`, `RESEND_API_KEY` and `LEAD_FROM`
only matter when it is on. In Webflow Cloud they go on the environment, and a
redeploy is needed for them to take effect.

If Webflow mounts the app on a path rather than the root, set
`NEXT_PUBLIC_BASE_PATH` to that mount path. Their builder sets Next's own
`basePath`; this repo must not set it (`next.config.ts` deliberately does
not).
