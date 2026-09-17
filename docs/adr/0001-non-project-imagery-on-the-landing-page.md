# 0001 — Imagery on the landing page is not of Sunpure developments

Date: 2026-09-11
Status: Accepted

## Context

On 10 September 2026 the client supplied six architectural images for the
landing page hero and asked that they rotate.

None is a photograph or render of a Sunpure development. They show travertine
and marble villas, desert palms, marble pool surrounds and a boulder
courtyard — none of which corresponds to the built work in Mysuru, which is
visible in the 3 July drone footage and in each project's own renders.

The concern was raised: this is a RERA-registered sales site, and imagery a
visitor reads as "these are their homes" when it is not carries a
misleading-advertising exposure. Three options were put to the client — ship
as supplied, label the images as design inspiration rather than projects, or
replace them with photography of the four completed developments.

On 11 September the client confirmed the images should be used as they are.

## Decision

The six images ship in the landing page hero.

Nothing on the page attributes them to Sunpure. They carry no caption, no
project name and no link to a project. Their alt text describes only what is
visible in the frame — "a two-storey villa in pale travertine at sunset" —
and never names a development.

Every image that IS a Sunpure development, everywhere else on the site,
remains attributed and captioned as now.

## Amendment, 15 September 2026

The six rotating images were replaced by a single hero image, also supplied
by the client and also not attributed to a development. The decision above
governs it unchanged: no caption, no project name, no link, and alt text that
describes only what is in the frame.

## Amendment, 16 September 2026

The Projects page now opens on a photograph of a concrete villa terrace
with an infinity pool, cut from the client's reference mockup for that page
(the only copy of the frame) with the mockup's own header, headline and
caption removed. It is not a Sunpure development, and the same rule
applies: no caption, no project name, no link, and alt text that describes
only what is in the frame. The original file, if the client has it, should
replace `public/images/pages/projects-hero.jpg` — the cut is 1024px wide,
enlarged 2x, and soft on large screens.

**Amended 17 September 2026.** The landing page is full bleed again at the
client's instruction: the Curve render fills the screen, with the brand line
over a paper haze at the left. Curve is a Sunpure development, so this image
is outside this decision's concern; the note is here because the layout
changed. The file is 1440px wide and soft on large screens — the client's
original, at `public/images/home/curve-sunrise.jpg`, would sharpen it.

## Consequences

- A visitor may still infer the homes are Sunpure's. That risk is accepted by
  the client, not mitigated by the site.
- If the images are ever captioned, linked to a project, or moved next to a
  project name, this decision no longer holds and the exposure returns. That
  is the specific change a future reader should stop at.
- Photography of Happiness 1, Happiness 2, Blessed and Meraki — all marked
  complete — would let this be reversed. That remains the preferred end state.
