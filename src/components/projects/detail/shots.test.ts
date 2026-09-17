import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickShots } from "@/components/projects/detail/shots";

const shot = (n: number, view: "exterior" | "interior") => ({ src: `/${n}.avif`, alt: `Shot ${n}`, view });

describe("pickShots", () => {
  const gallery = [shot(1, "exterior"), shot(2, "interior"), shot(3, "exterior")];

  it("puts exteriors first and skips pictures already used", () => {
    assert.deepEqual(pickShots(gallery, 2, ["/1.avif"]).map((s) => s.src), ["/3.avif", "/2.avif"]);
  });

  it("wraps round rather than leaving a panel empty", () => {
    assert.deepEqual(pickShots(gallery, 3, ["/1.avif", "/3.avif"]).map((s) => s.src), ["/2.avif", "/2.avif", "/2.avif"]);
  });

  it("falls back to used pictures when nothing else is left", () => {
    assert.equal(pickShots([shot(1, "exterior")], 1, ["/1.avif"])[0]?.src, "/1.avif");
  });

  it("returns nothing for a project with no pictures", () => {
    assert.deepEqual(pickShots([], 2), []);
  });
});
