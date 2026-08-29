# Sunpure Homes — Website Build Brief

**For:** Claude Code
**Author:** Ekhlas Ahmed
**Client:** Sunpure Homes, Mysuru, Karnataka, India
**Status:** Build brief

---

## 0. Kickoff prompt

> Paste this into Claude Code with this file present in the repo.

```
Read BRIEF.md in full before writing any code.

Build the Sunpure Homes website described in it. Work in the phases listed in
§12 — do not skip ahead. At the end of each phase, stop and show me what you
built before starting the next one.

Start with Phase 0. Set up the project, install dependencies, implement the
design tokens from §8, and build one static page (the home hero) so I can see
the typography and colour working. Do not build any 3D yet.

Constraints that matter most:
- Everything real: no lorem ipsum, no placeholder strings, no dead `href="#"`.
  The current live site fails on exactly this and the whole point of the
  rebuild is that it does not. If content is unknown, make it a typed field
  that renders nothing rather than a fake value.
- Every project route must resolve. Every filter must actually filter.
- The 3D is progressive enhancement. The site must be complete and sellable
  with JavaScript 3D disabled.
```

---

## 1. What this is

Sunpure Homes is a residential developer in Mysuru. Nine projects across three product types: independent villas, apartments, and plotted developments (land). They are a venture of **Masoom Group** / M.K. Agrotech — the company behind **Sunpure Oil**, a 40-year-old Indian edible oil brand.

We are replacing their web presence with a single new site whose centrepiece is a **real-time 3D model of Mysuru with all nine projects placed on it**, plus per-project 3D scenes (villa clusters, apartment blocks, plot layouts) that a buyer can explore and act on.

**The brand line is `Thoughtfully Built. Deeply Lived.`** It is the only tagline. Three others exist on the current site and are being retired.

---

## 2. Why we are rebuilding (context Claude Code needs)

There are currently **two live websites on one domain**, because a migration was started and never finished.

| | Old site | New site |
|---|---|---|
| Stack | WordPress + Elementor | Webflow |
| Still serving | `/fadal-enclave/` | `/about`, `/project`, `/project/*`, `/contact` |
| Nav | Its own logo, menu, footer, WhatsApp | Different logo, menu, footer, no WhatsApp |

### Defects verified on the live site (do not reproduce any of these)

**New site**

1. The projects filter panel ships Webflow's default placeholder string — *"This is some text inside of a div block."* — three times, in production.
2. The filter controls are non-functional. Project Type, Status, Location, Filter and Reset are all `href="#"`.
3. All nine project cards leak a tenth project: every card ends with `Kaivalyam · Upcoming · Hillside Mansion Development`. A broken CMS collection binding.
4. Each card's description renders twice.
5. Form success and error states ("Thank you! Your submission has been received!" / "Oops! Something went wrong…") render inline in page content instead of being hidden until triggered.
6. `Blessed` is tagged **Premium Independent Villa** but described as **2BHK apartments**.
7. `Rare Earth` and `H4` cards carry no location while all others do.
8. Two different LinkedIn URLs appear in the two footer instances on the same page (`www.linkedin.com/company/sunpure-homes-mysore/` vs `in.linkedin.com/company/sunpure-homes`).
9. No RERA registration number appears anywhere on the projects index or About page.
10. The legal disclaimer references "floor plans" and "furniture shown in visuals" on pages containing neither.
11. Duplicated stacked CTAs — e.g. "Turn thoughtful design into well-crafted homes." immediately followed by "Discover what thoughtful design feels like."
12. On `/project/rare-earth`, the RERA field renders the literal string **`NUMBER GOES HERE`**.
13. On `/project/rare-earth`, all 8 amenity items and all 6 gallery images are `href="#"` — 14 dead links on one page.

**Old site (`/fadal-enclave/`)**

14. Fadal is a **plotted development**. Its "Master Plan" section shows **villa floor plans**, with thumbnails named `Sunpure-Happiness-II-brochure-*.jpg` — another project's brochure.
15. "Entrance" is misspelled **"Enterance"** three times. "Corporate" is misspelled "Corparate".
16. A "Luxury Interiors" feature block (windows, tiles) appears on a page selling bare land — and is duplicated verbatim immediately after itself.
17. The connectivity list is repeated three times on the page.
18. The location paragraph begins mid-sentence: *"is situated in one of the top-most localities…"* — a failed merge field.
19. Six menu links now 404: Villas, Apartments, Happiness 1, Blessed, Meraki, Curve 1.
20. The Privacy Policy link is malformed (`/privacy-policy/"` with a trailing quote) and its label is split across two broken anchors.
21. The same RERA number `PRM/KA/RERA/1268/378/PR/150423/005864` appears on **both** Fadal (plots) and V4 (apartments). Two projects cannot share one registration.
22. Nav markup is duplicated six times in the DOM.
23. Essentially no alt text.

### The design consequence

These are not styling problems. They are the symptoms of two systems that nobody owns end to end. **The fix is one content model, one template set, one deployment**, and a real decommissioning of the old site with redirects.

---

## 3. Goals

1. **One site.** Old WordPress site retired, every URL redirected, rankings preserved.
2. **One content model.** Adding a tenth project is a data entry, not a new page build.
3. **Spatial browsing.** A buyer picks by neighbourhood first, product second — via a 3D map of Mysuru.
4. **Nothing broken.** Zero dead links, zero placeholder strings, zero empty alt attributes, enforced in CI.
5. **Trust made visible.** RERA, approvals, material partners and the Masoom Group legacy on every project page, not buried on About.
6. **Frictionless enquiry.** Inline capture, shortlist, WhatsApp handoff, site-visit booking — never a page change.

### Non-goals

- No e-commerce, no payments, no user accounts.
- No blog rewrite in phase 1 (existing posts migrate as-is under `/journal`, flagged for later rewrite — see §13).
- No photoreal rendering. The 3D is stylised, fast and readable, not architectural visualisation.

---

## 4. Real project data

Use this as the seed content. All of it is from the live site. Fields marked `⚠︎` are known-uncertain — model them as optional and render nothing when absent rather than inventing a value.

| Slug | Name | Type | Status | Location | Key figures |
|---|---|---|---|---|---|
| `happiness-1` | Happiness 1 | Villa | Completed | Vijayanagar 4th Stage | Premium 3BHK villas |
| `happiness-2` | Happiness 2 | Villa | Completed | Vijayanagar 4th Stage | 3BHK, 2,543 sq ft, 4 acres, 32 villas + 2 apartments |
| `h4` | H4 | Villa | Ongoing | ⚠︎ not stated | Nature-integrated villa community |
| `v4` | V4 | Apartment | Ongoing | Vijayanagar 4th Stage | 3BHK, 1,678–1,870 sq ft, 24 units |
| `curve` | Curve | Apartment | Ongoing | Vijayanagar 4th Stage | 3BHK, golden-ratio design philosophy |
| `blessed` | Blessed | Apartment ⚠︎ | Completed | Vijayanagar 4th Stage | 2BHK, villa-like in expansiveness |
| `meraki` | Meraki | Apartment | Completed | Yadavagiri | Spacious 3BHK |
| `fadal` | Fadal | Plots | Ongoing | KRS Main Road | 1,164–2,498 sq ft, 3 acres, 43 plots |
| `rare-earth` | Rare Earth | Plots | Ongoing | Mysuru–Ooty Rd, 10th km stone, nr Kadakola | 279 plots, 18 acres, 280 m from NH 766 |

> ⚠︎ `blessed` is tagged "Premium Independent Villa" on the live site but described as 2BHK apartments. Model it as **Apartment** and flag it in a `contentWarnings` array for the client to confirm.

**Fadal amenities:** landscaped garden, green walkways, one tree per plot, concrete roads, underground drainage, street lighting, STP. Vaastu and Feng Shui compliant.

**Rare Earth amenities (8):** Multi-Purpose Court, Yoga Deck, Amphitheatre, Fitness Zones, Kids Play Area, Walk Park, Reflexology Path, Reading Zones.

**Fadal connectivity:** JK Tyres 1.1 km · RBI 2.8 km · L&T 5 km · Infosys 5 km · Wipro 5.5 km · GSSS 2 km · Pooja Bhagavat Mahajana College 2 km · Vision Cinemas 2.6 km · GRS Fantasy Park 3.5 km · Excel Public School Hootagalli 6.5 km · Reliance Smart 7 km · BM Habitat Mall 7 km · Excel Public School Koorgalli 7.7 km.

### Company

- **Group:** Masoom Group / M.K. Agrotech Pvt. Ltd. · **Brand:** Sunpure Oil · **40+ years**
- Sunpure Oil is processed without caustic or sulphuric acid and refined using wind energy.
- **Subhan Khan** — Managing Director, M.K. Agrotech. 36 years in edible oils.
- **Imran Khan** — Managing Director, M.K. Agrotech; Director, M.K. Infra Holdings.
- **Values:** Empathy · Integrity · Design Excellence
- **Material partners:** Asian Paints, Saint-Gobain, Somany, Jaquar, Astral Pipes, V-Guard, Schneider Electric, Fujitec

### Contact

- `sales@sunpurehomes.com` · `+91 96069 07153` (also the WhatsApp number)
- Instagram `@sunpurehomes` · Facebook `sunpurehomesmysore` · YouTube `@sunpurehomesmysore`
- LinkedIn: **pick one canonical URL** and use it everywhere. Ask the client which.

### RERA

`PRM/KA/RERA/1268/378/PR/150423/005864` is the only number available, and it is currently shown on two different projects, so **at most one project can legitimately use it.**

Treat `reraNumber` as a **required-to-publish** field: a project without one renders a "Registration details on request" state and is excluded from the sitemap. Never render a placeholder. Add a build-time check that fails on any `reraNumber` matching `/NUMBER GOES HERE|TBD|XXX/i` or appearing on more than one project.

---

## 5. Tech stack

```
Next.js 15 (App Router) + TypeScript (strict)
Tailwind CSS v4
react-three-fiber + @react-three/drei + three
zustand              — 3D scene + shortlist state
next/font (local)    — Instrument Serif, Inter, JetBrains Mono
zod                  — content schema validation at build time
```

**Content:** local `content/projects/*.json` validated with zod, read at build time. Put all reads behind `lib/content.ts` so a headless CMS (Sanity or Payload) can replace the file layer later without touching components. Do not hardcode project data into components.

**Deployment target:** static export where possible; ISR acceptable. Assume Vercel.

**Do not use:** localStorage for anything the site depends on (shortlist may use it as an enhancement only, with in-memory fallback); any CSS-in-JS runtime; any 3D asset pipeline requiring a paid service.

---

## 6. Routes

```
/                          Home
/projects                  Portfolio index — 3D map + filterable grid
/projects/[slug]           Project page (one template, nine projects)
/projects/[slug]/plan      Deep-linked 3D scene (shareable, e.g. ?plot=114)
/about                     Company, values, team
/legacy                    Masoom Group / Sunpure Oil story
/contact                   Enquiry, offices, sales team
/journal                   Migrated blog posts
/journal/[slug]
/privacy  /terms
/404                       Designed, with routes out
```

---

## 7. Content model

```ts
type ProjectType   = 'villa' | 'apartment' | 'plot';
type ProjectStatus = 'ongoing' | 'completed' | 'upcoming';

interface Project {
  slug: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  tagline: string;                 // one line, no marketing filler
  description: string;             // 2–4 sentences

  location: {
    label: string;                 // "Vijayanagar 4th Stage"
    lat: number; lng: number;
    addressLines: string[];
  };

  scale: {
    acres?: number;
    unitCount?: number;            // 279 plots, 24 apartments, 32 villas
    unitNoun: string;              // "plots" | "apartments" | "villas"
  };

  configurations: Array<{
    label: string;                 // "30 × 40" | "3 BHK"
    areaSqft: [number, number] | number;
    facing?: string;
    count?: number;
  }>;

  compliance: {
    reraNumber?: string;           // REQUIRED to publish — see §4
    reraAuthorityUrl: string;      // always rera.karnataka.gov.in
    planSanction?: boolean;
    khataConversion?: boolean;
    approvedBanks?: string[];
  };

  amenities: Array<{ name: string; description: string; icon: string;
                     position?: [number, number, number] }>;  // position = hotspot in the 3D scene

  specifications: Array<{ group: string; items: string[] }>;

  connectivity: Array<{ name: string; category: 'work'|'education'|'retail'|'health'|'transport';
                        distanceKm: number }>;

  scene?: {                        // omit → project renders without 3D, page still complete
    kind: 'villa-cluster' | 'apartment-block' | 'plot-layout';
    dataUrl: string;               // JSON of units/plots with geometry + status
  };

  gallery: Array<{ src: string; alt: string }>;   // alt is REQUIRED, non-empty
  contentWarnings?: string[];      // internal, never rendered
}
```

**Unit availability** (`available` | `held` | `sold`) lives in a separate `content/availability/[slug].json` so it can be edited without touching project copy — this is the file the sales team owns.

---

## 8. Design system

### Tokens

```css
--ink:      #101614;   /* text, dark sections, selected unit */
--canopy:   #5F7355;   /* plots, available, primary green */
--laterite: #B0722C;   /* villas, held, accent */
--mist:     #BFD0C6;   /* cool sky / soft surfaces */
--paper:    #F8F9F6;   /* page background */
--paper-2:  #EBEEE8;   /* panels */
--stone:    #C7CCC2;   /* apartments, sold */
--line:     #D7DBD3;
--muted:    #78827C;
```

The palette is **cool green-grey, never warm beige**. An earlier iteration used cream/sand tones and read as pink against the greens — avoid `#E8DCC6`-family neutrals entirely.

Colour carries meaning and is used consistently across map pins, cards and 3D: **laterite = villas, stone = apartments, canopy = plots**. Availability uses the same three: canopy = available, laterite = held, stone = sold, ink = user's selection. Never rely on colour alone — always pair with a text label.

### Type

| Role | Family | Use |
|---|---|---|
| Display | **Instrument Serif** | Headlines, project names, large numbers. Italic for emphasis. |
| UI / body | **Inter** | Interface, body copy, project data |
| Mono | **JetBrains Mono** | RERA numbers, status labels, eyebrows, coordinates. Uppercase, `letter-spacing: 0.12em`, small. |

Headlines are large and set tight (`line-height: 1.02`, `letter-spacing: -0.014em`). Body copy is generous. Nothing shouts.

### Motion

| Token | Duration | Easing |
|---|---|---|
| `enter` | 600 ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `camera` | 900 ms | `cubic-bezier(0.33, 1, 0.68, 1)` |
| `hover` | 180 ms | `cubic-bezier(0.4, 0, 0.2, 1)` |

Long, eased, unhurried. Motion reveals structure — a camera settling on a unit, a drawer arriving. Never decorative. **`prefers-reduced-motion: reduce` must disable camera flights, autoplay and parallax entirely**, and replace them with instant state changes.

### Voice

Plain, confident, specific. No "opulence", no "spectrum of advantages", no "curators of fine living spaces" — the current site's blog is machine-spun and it is the tone to move away from. Short sentences. Numbers where numbers help.

---

## 9. The 3D system

> **Read §10 for the visual reference before building any of this.**

Progressive enhancement, always. Every 3D view has a 2D equivalent carrying **identical data and identical actions**. The commercial capability never disappears — only the spectacle does.

### 9.1 City scene — `/projects`

A stylised isometric-perspective model of Mysuru with all nine projects placed at their real coordinates.

- Ground plane with arterial roads, a green belt and water, kept deliberately recessive (`--stone` fabric, low contrast) so the nine Sunpure parcels read as the subject.
- Each project sits on a raised pad and renders a small massing cluster in its type colour: villa gables, apartment blocks, plot grids.
- Vertical pin per project. Hover raises the pad and shows a label; click flies the camera and opens a project card.
- Filter chips (type / status / location) dim non-matching parcels rather than hiding them — the map should never look empty.
- Camera: constrained orbit, limited polar angle, damped. No free-fly.
- **Fallback:** a filterable card grid with the same chips, same data, same links.

### 9.2 Project scenes — `/projects/[slug]/plan`

| Kind | Content | Selectable unit |
|---|---|---|
| `plot-layout` | Terrain, roads, boundaries, plot parcels, planting | Each plot |
| `villa-cluster` | Street, plots, villa massing with pitched roofs, setbacks | Each villa |
| `apartment-block` | Block massing with floor bands, podium, landscape | Each floor / facing |

Shared behaviour:

- Units coloured by availability, driven from `content/availability/[slug].json`.
- Click a unit → camera settles, a **detail drawer** slides in: dimensions, area, facing, road width, sunlight window, nearest amenity, status, and actions (Book a visit / Shortlist / WhatsApp).
- Amenity hotspots that fly the camera and open detail — these replace the 14 dead `href="#"` links currently on Rare Earth.
- Deep-linkable: `/projects/rare-earth/plan?unit=114` restores camera and drawer.
- **Sun path** (plot + villa scenes): a slider through the day driving a directional light and real cast shadows.
- **Canopy growth** (plot scenes): toggle between handover and year-five planting.
- **Shortlist:** up to 5 units, persisted, shareable via WhatsApp or a generated PDF gated on contact details.

### 9.3 Technical rules

- One `<Canvas>` per route, lazy-loaded via `next/dynamic` with `ssr: false`. **The 3D bundle must never block first paint.**
- Instance everything repeated — plots, villas, trees — via `InstancedMesh`. A 279-plot layout is one draw call for the parcels, not 279.
- Assets as `.glb` with Draco compression; textures as KTX2/Basis. Bake ambient occlusion into lightmaps for static geometry; keep only the sun real-time.
- LOD tiers; frustum culling; cap `dpr` at `[1, 2]`.
- Detect WebGL support and device memory. Below threshold → 2D plan, no download attempted.
- Raycasting for selection must hit an invisible simplified collider mesh, not the display geometry.

### 9.4 Budgets — enforce these in CI

| Metric | Budget |
|---|---|
| LCP (mid-range Android, 4G) | < 2.5 s |
| INP | < 200 ms |
| Initial JS, non-3D | < 200 KB |
| 3D scene initial payload | < 8 MB |
| Desktop frame rate | 60 fps |
| Mid-range mobile floor | 30 fps |
| Time to first interaction with plan | < 4 s on 4G |

---

## 10. Visual reference — **TO BE COMPLETED BY EKHLAS**

> I could not open the Instagram post — Instagram blocks automated access, so I have not seen it. **Fill this section in before running the build**, or Claude Code will default to the house style in §8 and §9, which may not be what you want.

**Reference:** `https://www.instagram.com/p/DcRG_k1gqa7/`

Replace the bracketed lines below:

```
LOOK
- Camera:            [ isometric / perspective / orthographic; fixed or orbiting ]
- Realism:           [ stylised-flat / stylised-shaded / semi-real / photoreal ]
- Palette:           [ colours it uses — and whether ours should match or stay as §8 ]
- Materials:         [ flat colour / soft gradients / matte PBR / glass and reflections ]
- Lighting:          [ flat ambient / soft key + shadow / dramatic sun / night ]
- Detail level:      [ massing blocks only / windows and balconies / full architectural ]
- Landscape:         [ how trees, ground and water are handled ]

MOTION
- What moves:        [ camera / the model / elements within it / nothing ]
- On scroll:         [ does the model respond to scroll? how? ]
- On interaction:    [ what happens on hover and click ]
- Pace:              [ slow and drifting / snappy / cinematic ]

WHAT TO TAKE, WHAT TO LEAVE
- Take:              [ the specific thing that made you save this post ]
- Leave:             [ anything that would not suit a property buyer ]
```

If the post is a video, the most useful thing you can add is **timestamps**: "0:00–0:04 camera descends", "0:06 plot highlights on hover". That converts directly into a spec.

**Fallback if left blank:** build to §8/§9 — stylised isometric, flat-shaded massing, matte materials, one soft directional sun with baked AO, no reflections, restrained cool-green palette, slow damped camera.

---

## 11. Page specifications

### `/` Home

1. **Hero** — full-bleed film or still, slow descent onto the city. One line: *Thoughtfully Built. Deeply Lived.* One supporting sentence about the 40-year Masoom Group legacy. No carousel. No badge stack. Nothing else competes.
2. **Finder** — three product chips (Villas / Apartments / Plots) + neighbourhood select + Search. This is the primary action on the page.
3. **The map** — the city scene rises into view on scroll (lazy-loaded).
4. **Featured projects** — three cards, real data.
5. **Legacy strip** — 40+ years, 9 projects, 8 material partners → links to `/legacy`.
6. **Enquiry** — inline form, not a link to another page.

### `/projects` Portfolio index

- City scene (§9.1) with a **Map / List** toggle, list being the fallback default on low-end devices.
- Working filters: type, status, location. **Filters must actually filter** and must update the URL (`?type=plot&status=ongoing`) so results are shareable.
- Cards: image, name, type · location, status chip. **Nothing else.** No stray project, no duplicated description — the two bugs this page currently ships.
- Empty state: "No projects match these filters" + a reset that works.

### `/projects/[slug]` Project page

One template, nine projects, five questions in order:

1. **Where** — hero, location on the city model, connectivity with distances drawn on a map rather than listed as text.
2. **What** — the 3D plan (§9.2) with the unit drawer. This is the centre of the page, placed high, not buried.
3. **How much** — configuration table (dimensions, area, facing, count). Price is *not* published; a gated "Request the price list" exchange captures the lead.
4. **Is it safe** — approvals module: RERA number linked to `rera.karnataka.gov.in`, plan sanction, khata/conversion, approved banks, material partners.
5. **See it** — Book a visit (calendar), Shortlist, WhatsApp (deep link pre-filled with project and unit), Download brochure.

Plus: amenities (as located hotspots, never as dead links), specifications, gallery with an accessible lightbox, FAQ with `FAQPage` structured data, and a correct disclaimer that describes what is actually on the page.

### `/legacy`

The Masoom Group / Sunpure Oil story, the founders, the wind-energy and no-caustic-acid detail, the material partners. Currently this sits only on About and is the most underused asset on the site.

---

## 12. Build phases

Stop after each phase and show me the result.

**Phase 0 — Foundation**
Scaffold Next.js + TS + Tailwind. Implement §8 tokens as CSS variables and Tailwind theme. Load the three fonts locally. Build the home hero only. No 3D, no content system yet.

**Phase 1 — Content system**
Zod schemas from §7. Seed all nine projects from §4 as JSON. `lib/content.ts` as the only read path. Build `/projects` with a working filterable card grid (list view only). Build `/projects/[slug]` fully, minus the 3D block. **At the end of this phase the site is already sellable.**

**Phase 2 — 2D plan**
Interactive SVG plan for `plot-layout`: clickable plots, availability colours, filters, the detail drawer, shortlist, WhatsApp deep link. This is the permanent fallback, so build it properly — not as a stopgap.

**Phase 3 — City scene**
The 3D map (§9.1). Map/List toggle. Filters drive both views from one state store. WebGL detection and graceful degradation.

**Phase 4 — Project scenes**
`plot-layout` first (Rare Earth, 279 plots — the hardest case, so do it first). Then `villa-cluster`, then `apartment-block`. Sun path and canopy growth last.

**Phase 5 — Conversion & trust**
Enquiry forms, gated brochure and price list, site-visit booking, shortlist PDF generation, approvals module, lead routing.

**Phase 6 — Ship**
Redirects (§13), JSON-LD (`Organization`, `Residence`/`RealEstateListing`, `BreadcrumbList`, `FAQPage`), sitemap, robots, 404, print stylesheet, accessibility audit, performance budgets wired into CI.

---

## 13. Migration

Every old URL must redirect (301). Fadal ranks in search on the **old** page — the one carrying another project's villa plans — so losing that URL loses real traffic.

```
/fadal-enclave/            → /projects/fadal
/v4/                       → /projects/v4
/happiness-1/              → /projects/happiness-1
/happiness-2/              → /projects/happiness-2
/blessed/                  → /projects/blessed
/meraki/                   → /projects/meraki
/curve/                    → /projects/curve
/project/rare-earth        → /projects/rare-earth
/project/fadal             → /projects/fadal
/project/*                 → /projects/*
/project                   → /projects
/home-copy/                → /
/author/sunpure/           → /journal
/plots-off-krs-main-road-mysuru-from-sunpure-homes/ → /projects/fadal
/east-facing-villas-north-enterance/ → /projects/happiness-2
/testimonials/             → /about
/blog/                     → /journal
/privacy-policy/           → /privacy
```

Crawl the old WordPress site for any URL not listed and add it. **Nothing 404s after launch.** Write the redirect map as a typed array in `next.config.ts` so it is reviewable.

Also: the current homepage is disallowed to crawlers while inner pages are indexable. Fix `robots.txt` so the whole site is crawlable and the sitemap is discoverable.

Migrated blog posts read as machine-generated and hurt a premium positioning. Migrate them with `noindex` and a `needsRewrite: true` flag, and list them for the client to approve rewriting or deleting. Do not silently delete content.

---

## 14. Acceptance criteria

Each is checkable by anyone, without taking our word for it.

- [ ] Zero broken links site-wide — automated crawl in CI
- [ ] Zero `href="#"` on any interactive element
- [ ] Zero placeholder strings — CI fails on `/lorem|text inside of a div|NUMBER GOES HERE|TBD/i`
- [ ] Zero images with empty or missing `alt`
- [ ] No project renders data belonging to another project
- [ ] Every filter changes the result set and the URL
- [ ] Every RERA number is unique across projects and links to the authority
- [ ] One canonical LinkedIn URL, one tagline, one legacy year figure, site-wide
- [ ] WCAG 2.2 AA — axe clean, full keyboard path through the 3D plan
- [ ] Performance budgets in §9.4 met on a real mid-range Android
- [ ] The site is complete and sellable with WebGL disabled
- [ ] Every old URL 301s; nothing 404s
- [ ] Sales team can change unit availability without a developer

---

## 15. Notes for whoever runs this

- **The 3D models are indicative until real drawings arrive.** Build the scene generators to consume `content/scenes/[slug].json` (plot coordinates, unit footprints, road centrelines). Seed that JSON with plausible generated geometry now; swapping in surveyed data later must be a **data change, not a rebuild**. This is the single most important architectural decision in the project.
- **Ask before inventing.** If a field is unknown — H4's location, Blessed's real type, most RERA numbers — leave it absent and surface it in a `contentWarnings` list. The current site's failure mode is confidently displaying wrong information; do not repeat it in a new stack.
- The client's audience is Mysuru buyers, many on mid-range Android over 4G, and property decisions are made by families. **Sharing is a first-class feature, not a nice-to-have.**
