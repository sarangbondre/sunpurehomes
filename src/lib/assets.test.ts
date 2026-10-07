import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { readdirSync } from "node:fs";
import { getHeroImage } from "@/lib/home-showcase";
import { BRAND_MARKS } from "@/lib/partners";
import { getTestimonials, portraitSrc } from "@/lib/testimonials";

/**
 * Two things the site used to check for at runtime with node:fs, which
 * Cloudflare Workers cannot do. The files are named in code now, and this is
 * what keeps the names honest.
 */
const inPublic = (src: string) => existsSync(join(process.cwd(), "public", src));

/** Width ÷ height, read from the file: an SVG's viewBox or a PNG's IHDR. */
function aspectOf(file: string): number {
  if (file.endsWith(".svg")) {
    const svg = readFileSync(file, "utf8");
    const viewBox = svg.match(/viewBox="([\d.\s-]+)"/);
    if (viewBox) {
      const [, , w, h] = viewBox[1].trim().split(/\s+/).map(Number);
      return w / h;
    }
    const w = Number(svg.match(/width="([\d.]+)/)?.[1]);
    const h = Number(svg.match(/height="([\d.]+)/)?.[1]);
    return w / h;
  }
  const png = readFileSync(file);
  return png.readUInt32BE(16) / png.readUInt32BE(20);
}

describe("files the site names", () => {
  it("has the landing hero where home-showcase says it is", () => {
    assert.ok(inPublic(getHeroImage().src), getHeroImage().src);
  });

  it("has every brand mark BRAND_MARKS lists", () => {
    for (const [slug, mark] of Object.entries(BRAND_MARKS)) {
      const src = `/images/brands/${slug}.${mark.ext}`;
      assert.ok(inPublic(src), `missing ${src}`);
    }
  });

  /*
    The aspect decides how tall each mark is drawn (markHeight), so a logo
    replaced by one of a different shape would be silently mis-sized. This
    reads the files and fails instead.
  */
  it("records each mark's real shape", () => {
    for (const [slug, mark] of Object.entries(BRAND_MARKS)) {
      const file = join(process.cwd(), "public", "images", "brands", `${slug}.${mark.ext}`);
      const actual = aspectOf(file);
      assert.ok(
        Math.abs(actual - mark.aspect) < 0.02,
        `${slug}: recorded ${mark.aspect}, file is ${actual.toFixed(3)}`,
      );
    }
  });

  it("has a portrait for every testimonial", () => {
    for (const testimonial of getTestimonials()) {
      assert.ok(inPublic(portraitSrc(testimonial)), portraitSrc(testimonial));
    }
  });

  it("names every portrait that is in public/images/testimonials", () => {
    const onDisk = readdirSync(
      join(process.cwd(), "public", "images", "testimonials"),
    )
      .filter((f) => f.endsWith(".avif"))
      .sort();
    const named = getTestimonials()
      .map((testimonial) => testimonial.portrait)
      .sort();
    assert.deepEqual(named, onDisk);
  });

  it("lists every brand mark that is in public/images/brands", () => {
    const onDisk = readdirSync(join(process.cwd(), "public", "images", "brands"))
      .filter((f) => /\.(svg|png)$/.test(f))
      .map((f) => f.replace(/\.(svg|png)$/, ""))
      .sort();
    assert.deepEqual(Object.keys(BRAND_MARKS).sort(), onDisk);
  });
});
