# 0003 — Project pages: the client's reference copy, and what it rests on

Date: 2026-09-17
Status: Accepted

## Context

On 17 September 2026 the client sent seven reference images for the project
page and a data sheet for Curve, and asked for every project to follow them:
headlines, taglines, room icons, the Karnataka government's emblem beside the
RERA number, and brand logos. Some of that is voice; some of it reads as fact
to a buyer on a RERA-registered sales site.

## Decision

- **Voice lines are shared; facts stay per project.** Section ledes, closing
  lines and notes ("Transparent process", "Built with integrity. For
  generations ahead.") live in `src/components/projects/detail/copy.ts`.
  Each project's `headline`, `homesLine` and `configurationsNote` are in its
  content file and must stay true of that project.
- **Specification items get a drawing and a line only when the table in
  `copy.ts` knows them.** An unknown item is listed plainly; no line is made up
  for it.
- **Areas are named "built-up" everywhere**, at the client's instruction ("it
  cannot be super built up, it has to be built-up"). Curve's sheet confirms
  its figures. Meraki's brochure said super built-up; it was relabelled on the
  client's word and is listed in `openQuestions` to confirm.
- **Bathrooms are shown as equal to bedrooms**, at the client's instruction.
  No project file records them. The rule is in `configurations.tsx` and in
  `openQuestions`, so it can be replaced by real counts.
- **No government emblem.** The State Emblem of India (Prohibition of
  Improper Use) Act, 2005 restricts its use, and beside a sales pitch it reads
  as endorsement. A seal drawn for this site says "Registered under RERA ·
  Karnataka" and links to the register.
- **Brand marks were taken from Wikipedia / Wikimedia Commons** (the logo each
  company's own article uses) and are shown nominatively, beside what each
  brand supplies. Brands with no mark found show as names.
- **Curve's plan is regenerated** from the sheet: four floors of eight flats
  over ground-floor parking, facings by flat number. It is still marked
  indicative.

## Consequences

- When the client sends bathroom counts, add them to the configurations and
  drop the rule.
- If Meraki's figures turn out to be super built-up, restore `areaBasis` and
  the label map's `super-built-up` entry.
- Curve's 55,000 sq ft total is unconfirmed and is not published.
