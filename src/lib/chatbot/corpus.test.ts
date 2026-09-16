import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PORTFOLIO_INDEX, allBriefs, getBrief } from "@/lib/chatbot/corpus";
import { getAllProjects } from "@/lib/content";

const text = (slug: string) => getBrief(slug)?.text ?? "";

describe("corpus", () => {
  it("has a record for every project", () => {
    assert.equal(allBriefs().length, getAllProjects().length);
  });

  it("never carries a contentWarning", () => {
    const all = allBriefs().map((b) => b.text).join("\n");
    for (const project of getAllProjects()) {
      for (const warning of project.contentWarnings ?? []) {
        // A warning's opening words are distinctive enough to catch a leak.
        const probe = warning.slice(0, 40);
        assert.equal(all.includes(probe), false, `leaked: ${probe}`);
      }
    }
  });

  it("carries no image paths, scene data or client defects", () => {
    const all = allBriefs().map((b) => b.text).join("\n");
    assert.doesNotMatch(all, /\/images\/|dataUrl|\.jpe?g|\.webp|NUMBER GOES HERE/i);
  });

  it("withholds the disputed unit counts, in figures and in words", () => {
    // The descriptions are prose and spell numbers out. Checking only the
    // digits let "two hundred and seventy-nine plots" straight through.
    const withheld: [string, RegExp][] = [
      ["curve", /\b32\b|thirty[- ]two/i],
      ["blessed", /\b21\b|twenty[- ]one/i],
      ["rare-earth", /\b279\b|two hundred and seventy[- ]nine/i],
    ];
    for (const [slug, pattern] of withheld) {
      assert.doesNotMatch(text(slug), pattern, slug);
    }
  });

  it("keeps the rest of a redacted description", () => {
    assert.match(text("rare-earth"), /Its plots sit across 73,552 sq m/);
    assert.match(text("blessed"), /Its homes are 2 and 3 BHK/);
  });

  it("withholds per-size counts where they add up to a withheld total", () => {
    assert.doesNotMatch(text("rare-earth"), /of these/);
    // Where the total is not withheld, the per-size counts stay.
    assert.match(text("fadal"), /12 of these/);
  });

  it("states Fadal's plot count, because the approval settles it", () => {
    assert.match(text("fadal"), /43 plots/);
  });

  it("drops the unconfirmed survey number and PIN at Fadal", () => {
    assert.doesNotMatch(text("fadal"), /Survey No|570016/);
  });

  it("drops the villa size that contradicts Happiness II's own table", () => {
    assert.doesNotMatch(text("happiness-2"), /2,543/);
    assert.match(text("happiness-2"), /Villas 22–27; 2,167–2,371 sq ft built-up/);
  });

  it("drops Happiness II's unverified hospital distances", () => {
    assert.doesNotMatch(text("happiness-2"), /\(health\)/);
  });

  it("marks V4 as fully sold", () => {
    assert.match(text("v4"), /FULLY SOLD/);
    assert.match(PORTFOLIO_INDEX, /V4:.*fully sold/);
  });

  it("indexes all nine without project detail", () => {
    assert.equal(PORTFOLIO_INDEX.split("\n").length, allBriefs().length + 1);
  });
});
