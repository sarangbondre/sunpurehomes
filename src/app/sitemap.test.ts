import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, it } from "node:test";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { getProjectSlugs } from "@/lib/content";
import { hasPlan, isFullySold } from "@/lib/scenes";
import { site } from "@/lib/site";

/**
 * The sitemap is a hand-written list, so the thing that will go wrong is
 * adding a page and forgetting it. This reads the route tree and fails if the
 * two disagree — the same trick as content-files.test.ts and assets.test.ts.
 */
const APP = join(process.cwd(), "src", "app");

function pageFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return pageFiles(full);
    return entry.name === "page.tsx" ? [full] : [];
  });
}

/** Every route the app serves, and whether its own metadata says noindex. */
const routes = pageFiles(APP).map((file) => ({
  route: `/${relative(APP, file).split(sep).slice(0, -1).join("/")}`,
  noindex: /index:\s*false/.test(readFileSync(file, "utf8")),
}));

/**
 * A dynamic route stands for one page per project — except the plan, which
 * notFound()s where there is no scene or the project is sold out.
 */
function expand(route: string): string[] {
  if (!route.includes("[slug]")) return [route];
  const slugs = route.endsWith("/plan")
    ? getProjectSlugs().filter((slug) => hasPlan(slug) && !isFullySold(slug))
    : getProjectSlugs();
  return slugs.map((slug) => route.replace("[slug]", slug));
}

const absolute = (path: string) => new URL(path, site.url).href;
const urls = sitemap().map((entry) => entry.url);

describe("sitemap", () => {
  it("found the route tree at all", () => {
    assert.ok(routes.length >= 8, `only found ${routes.length} pages`);
  });

  it("lists every page that may be indexed", () => {
    for (const { route, noindex } of routes) {
      if (noindex) continue;
      for (const path of expand(route)) {
        assert.ok(urls.includes(absolute(path)), `sitemap is missing ${path}`);
      }
    }
  });

  it("leaves out the pages whose metadata says noindex", () => {
    for (const { route, noindex } of routes) {
      if (!noindex) continue;
      for (const path of expand(route)) {
        assert.ok(!urls.includes(absolute(path)), `sitemap should not list ${path}`);
      }
    }
  });

  it("leaves out the plan of a project that is sold out", () => {
    for (const slug of getProjectSlugs()) {
      if (hasPlan(slug) && !isFullySold(slug)) continue;
      assert.ok(
        !urls.includes(absolute(`/projects/${slug}/plan`)),
        `${slug} has no plan page to offer`,
      );
    }
  });

  it("gives absolute URLs on the canonical host, once each", () => {
    for (const url of urls) {
      assert.ok(url.startsWith(`${site.url}/`), url);
    }
    assert.equal(new Set(urls).size, urls.length, "a URL is listed twice");
  });
});

describe("robots", () => {
  const txt = robots();
  const rule = Array.isArray(txt.rules) ? txt.rules[0] : txt.rules;

  it("points at the sitemap absolutely — a relative path is ignored", () => {
    assert.equal(txt.sitemap, `${site.url}/sitemap.xml`);
  });

  it("keeps crawlers off the API and off anything noindexed", () => {
    const disallow = [rule.disallow].flat().filter(Boolean) as string[];
    assert.ok(disallow.includes("/api/"));
    for (const { route, noindex } of routes) {
      if (!noindex) continue;
      assert.ok(disallow.includes(route), `robots.txt should disallow ${route}`);
    }
  });
});
