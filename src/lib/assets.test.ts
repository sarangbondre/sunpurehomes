import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { readdirSync } from "node:fs";
import { getHeroImage } from "@/lib/home-showcase";
import { BRAND_MARKS } from "@/lib/partners";

/**
 * Two things the site used to check for at runtime with node:fs, which
 * Cloudflare Workers cannot do. The files are named in code now, and this is
 * what keeps the names honest.
 */
const inPublic = (src: string) => existsSync(join(process.cwd(), "public", src));

describe("files the site names", () => {
  it("has the landing hero where home-showcase says it is", () => {
    assert.ok(inPublic(getHeroImage().src), getHeroImage().src);
  });

  it("has every brand mark BRAND_MARKS lists", () => {
    for (const [slug, extension] of Object.entries(BRAND_MARKS)) {
      const src = `/images/brands/${slug}.${extension}`;
      assert.ok(inPublic(src), `missing ${src}`);
    }
  });

  it("lists every brand mark that is in public/images/brands", () => {
    const onDisk = readdirSync(join(process.cwd(), "public", "images", "brands"))
      .filter((f) => /\.(svg|png)$/.test(f))
      .map((f) => f.replace(/\.(svg|png)$/, ""))
      .sort();
    assert.deepEqual(Object.keys(BRAND_MARKS).sort(), onDisk);
  });
});
