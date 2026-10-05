import Image from "next/image";
import Link from "next/link";
import { getProject } from "@/lib/content";
import { getTestimonials, portraitSrc } from "@/lib/testimonials";

/**
 * What the people who live in these buildings have said, under the landing
 * hero. The client asked for it on 5 October; the words and the photographs
 * are theirs, and lib/testimonials.ts records where they came from and what
 * is still open about them.
 *
 * It goes here because until today the landing page was the hero and nothing
 * else: the scroll cue at the foot of it promised more below and delivered
 * the footer. This is what it promises now, and a buyer who has just read
 * "Thoughtfully Built, Deeply Lived." is at the one moment where someone
 * else saying it is worth more than we are.
 *
 * The layout is the About page's: the attribution in a 13rem rail and the
 * words beside it from lg, stacked below that. Reusing that rhythm is why
 * this reads as part of the site rather than a section bought in — the same
 * reason it is set in the display serif the rest of the site reserves for
 * headings. The quotes are long enough that italic would be tiring, so the
 * one italic thing on the page stays the About page's pull-quote.
 *
 * The development is a link. Three of these five are about Blessed and two
 * about Happiness 1, both finished and both still worth visiting, and a
 * reader moved by a stranger's words should not then have to go and find the
 * building themselves.
 *
 * A plain server component. The client's own site runs these in a carousel
 * that advances every eight seconds; nothing moves here, so WCAG 2.2.2 does
 * not apply and every quote is in the HTML for a reader, a crawler and a
 * browser with JavaScript off alike.
 */
export function Testimonials() {
  const testimonials = getTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <section
      aria-labelledby="testimonials"
      className="border-t border-line bg-paper"
    >
      <div className="mx-auto max-w-[86rem] px-6 py-14 sm:px-10 sm:py-20 lg:px-16">
        <h2
          id="testimonials"
          className="u-mono text-[1.05rem] leading-snug tracking-[0.14em] text-laterite sm:text-[1.2rem]"
        >
          In their words
        </h2>

        <ul className="mt-12 sm:mt-16">
          {testimonials.map((testimonial) => {
            const project = getProject(testimonial.project);

            return (
              <li
                key={`${testimonial.project}-${testimonial.unit}`}
                className="border-t border-line py-10 first:border-t-0 first:pt-0 last:pb-0 sm:py-12 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-16"
              >
                {/*
                  The attribution. Beside the portrait on a phone, where a
                  column of five portraits with the names under them would be
                  five scrolls of nothing much; under it in the rail from lg,
                  where the rail is 13rem and the photograph can have all of
                  it.

                  These are group photographs, two to four people across a
                  near-square frame, so they are set square and square-
                  cornered. A circular crop at this size would take somebody's
                  face off the edge of every one of them.
                */}
                <div className="flex items-center gap-5 lg:block">
                  <Image
                    src={portraitSrc(testimonial)}
                    alt={testimonial.portraitAlt}
                    width={480}
                    height={480}
                    sizes="(min-width: 1024px) 13rem, 7rem"
                    className="size-28 shrink-0 rounded-md border border-line object-cover lg:size-auto lg:w-full"
                  />
                  <div className="lg:mt-5">
                    <p className="font-display text-xl leading-tight text-ink sm:text-2xl">
                      {testimonial.name}
                    </p>
                    <p className="u-mono mt-2 text-muted">
                      {project ? (
                        /*
                          Underlined and in the accent, as every other inline
                          link on this site is. A link that announced itself
                          only on hover would be a link nobody on a phone
                          could see, and one told apart by colour alone fails
                          WCAG 1.4.1 even on a mouse.
                        */
                        <Link
                          href={`/projects/${testimonial.project}`}
                          className="text-accent-ink underline underline-offset-4 transition-colors duration-hover ease-hover hover:text-ink"
                        >
                          {project.name}
                        </Link>
                      ) : (
                        testimonial.project
                      )}
                      <span aria-hidden className="mx-2 text-line">
                        /
                      </span>
                      {testimonial.unit}
                    </p>
                  </div>
                </div>

                {/*
                  The quote itself, in the display serif at 58 characters to
                  the line. 58 rather than the 46 prose usually wants: the
                  column beside a 13rem rail is 976px at 1440, and a 46ch
                  measure left a third of it blank — which is the complaint
                  the client made about the About and Projects pages on
                  2 October, and the reason that rail exists at all. 58ch at
                  this size fills the column and still sits inside the 45-to-
                  75 a line can be read at.

                  The opening mark is hung into the margin on a wide screen so
                  the first line starts where every other line starts — the
                  thing that makes a set quotation look set rather than typed.
                */}
                <blockquote className="mt-8 lg:mt-0">
                  <p className="max-w-[58ch] font-display text-[clamp(1.2rem,1.9vw,1.6rem)] leading-[1.55] text-ink lg:-indent-[0.5em]">
                    <span aria-hidden className="text-laterite">
                      &ldquo;
                    </span>
                    {testimonial.quote}
                    <span aria-hidden className="text-laterite">
                      &rdquo;
                    </span>
                  </p>
                </blockquote>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
