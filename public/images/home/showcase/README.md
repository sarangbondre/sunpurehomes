Drop the six landing-page images here, named exactly as listed in
`src/lib/home-showcase.ts`, in the order they were supplied:

    01-travertine-villa-sunset.jpg
    02-stone-villa-pool.jpg
    03-pavilion-palms.jpg
    04-villa-dusk.jpg
    05-courtyard-stair.jpg
    06-cantilever-terrace.jpg

The alt text for each is already written and reviewed in that file, matched
to the image it describes — so the names matter. Any file missing is skipped;
if none are here the hero falls back to the developments' own cover renders.

`.jpg` is the expected extension. If yours are `.png` or `.webp`, change the
extension in `src/lib/home-showcase.ts` to match rather than renaming a file
to a format it is not — Next's image optimiser reads the real bytes, but the
mismatch will confuse the next person.

Why these images are here at all, and the boundary that must not be crossed:
docs/adr/0001-non-project-imagery-on-the-landing-page.md
