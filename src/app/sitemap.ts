import type { MetadataRoute } from "next";
import { getProjectSlugs } from "@/lib/content";
import { hasPlan, isFullySold } from "@/lib/scenes";
import { site } from "@/lib/site";

/**
 * /sitemap.xml — every page a search engine should know about.
 *
 * The site had none, so the nine project pages were left to be discovered by
 * crawling, and the plan pages — which nothing links to from outside a
 * project — were effectively invisible.
 *
 * Two deliberate omissions:
 *
 * - **No `lastModified`.** Next would happily take `new Date()`, but that
 *   says "all nine projects changed" on every deploy, which is false. A lastmod
 *   that is wrong is worse than none: Google discounts the signal for the whole
 *   file. Add real dates here when the content files carry one.
 * - **No `priority` or `changeFrequency`.** Google ignores both and has said
 *   so; they would be decoration.
 *
 * /virtual-tour-preview is absent on purpose — it sets `robots: noindex`
 * because it shows the tour platform's sample space, not a Sunpure building.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getProjectSlugs();

  const paths = [
    "/",
    "/projects",
    ...slugs.map((slug) => `/projects/${slug}`),
    /*
      Mirrors generateStaticParams in projects/[slug]/plan/page.tsx, which
      notFound()s for a project with no scene or one that is fully sold.
      Listing a 404 in a sitemap is a crawl error, so the filter has to match.
    */
    ...slugs
      .filter((slug) => hasPlan(slug) && !isFullySold(slug))
      .map((slug) => `/projects/${slug}/plan`),
    "/amenities",
    "/about",
    "/privacy",
  ];

  return paths.map((path) => ({ url: new URL(path, site.url).href }));
}
