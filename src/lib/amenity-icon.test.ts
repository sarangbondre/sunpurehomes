import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { amenityIcon } from "@/lib/amenity-icon";
import { getAllProjects } from "@/lib/content";

describe("amenityIcon", () => {
  it("has a drawing for every amenity published on a project", () => {
    const unmatched = getAllProjects()
      .flatMap((p) => p.amenities.map((a) => a.name))
      .filter((name) => amenityIcon(name) === undefined);
    assert.deepEqual(unmatched, []);
  });

  it("lets the specific rule win over the general one", () => {
    assert.equal(amenityIcon("Stormwater drainage system"), "rain");
    assert.equal(amenityIcon("Garden and play area"), "play");
    assert.equal(amenityIcon("Green walkways"), "walk");
    assert.equal(amenityIcon("CCTV and 24-hour security"), "camera");
    assert.equal(amenityIcon("Indoor green courts"), "tree");
  });

  it("matches whole words, not fragments", () => {
    assert.equal(amenityIcon("RO treatment plant"), "water");
    assert.equal(amenityIcon("Front row seats"), undefined);
  });
});
