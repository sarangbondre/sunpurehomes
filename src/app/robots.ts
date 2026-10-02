import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * /robots.txt — crawl everything except the two paths that are not pages.
 *
 * `/api/` holds the chat and lead endpoints, which answer POST only and 404
 * while Arka is off. `/virtual-tour-preview` already sends `noindex` in its
 * metadata; naming it here keeps it out of the crawl rather than relying on a
 * crawler fetching it first to find that out.
 *
 * The sitemap is given as an absolute URL on the canonical host, which is
 * what the specification requires — a relative path is ignored.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/virtual-tour-preview"],
      },
    ],
    sitemap: new URL("/sitemap.xml", site.url).href,
  };
}
