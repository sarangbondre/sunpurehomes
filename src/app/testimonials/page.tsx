import type { Metadata } from "next";
import { TestimonialList } from "@/components/home/testimonials";
import { getTestimonials } from "@/lib/testimonials";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Happy customers",
  description: `Families who live in a ${site.name} development, in their own words.`,
};

/**
 * The testimonials on a page of their own, in the menu, at the client's
 * instruction of 6 October. They called it "Happy customers", so that is the
 * heading and the menu item; the route stays /testimonials because that is
 * what the page is and what anyone would guess.
 *
 * The same five households as the landing page, from the same module, through
 * the same component — there is no second copy of anyone's words to go stale.
 * lib/testimonials.ts records where they came from and what is still open
 * about them.
 *
 * The landing page keeps its own section. This is where the menu lands and
 * where a visitor who wants to read all five without the hero above them
 * goes; they are five, so paging or filtering would be furniture.
 */
export default function TestimonialsPage() {
  const testimonials = getTestimonials();

  return (
    <main className="mx-auto max-w-[86rem] px-6 pb-20 sm:px-10 lg:px-16">
      <header className="pb-4 pt-12 sm:pt-16 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-16">
        <h1 className="u-mono text-[1.05rem] leading-snug tracking-[0.14em] text-laterite sm:text-[1.2rem]">
          Happy customers
        </h1>
        <div className="lg:col-start-2">
          <p className="mt-8 max-w-[52ch] leading-relaxed text-ink-soft sm:text-lg lg:mt-0 lg:text-xl">
            {testimonials.length} households who bought a home from us, and
            what they say about living in it. Their words, not ours.
          </p>
        </div>
      </header>

      <div className="border-t border-line pt-10 sm:pt-14">
        <TestimonialList testimonials={testimonials} />
      </div>
    </main>
  );
}
