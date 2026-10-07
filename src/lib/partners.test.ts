import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAllProjects } from "@/lib/content";
import { brandLogo, getAllMaterialGroups, getMaterialGroups } from "@/lib/partners";
import { site } from "@/lib/site";

/**
 * The About page's "What goes in" is the union of every brand the projects
 * name and every site-wide partner. Two things can go wrong silently: a brand
 * appearing twice because two projects file it under different words, and a
 * brand disappearing because one source quietly stopped being read.
 */

const names = (groups: readonly { brands: readonly { name: string }[] }[]) =>
  groups.flatMap((g) => g.brands.map((b) => b.name));

describe("the consolidated brand list", () => {
  const groups = getAllMaterialGroups(getAllProjects());

  it("names every brand any project names", () => {
    const fromProjects = getAllProjects().flatMap((p) =>
      (p.materials ?? []).map((m) => m.brand),
    );
    for (const brand of fromProjects) {
      assert.ok(names(groups).includes(brand), `${brand} is missing`);
    }
  });

  it("keeps the site-wide partners no project names", () => {
    for (const brand of site.materialPartners) {
      assert.ok(names(groups).includes(brand), `${brand} was dropped`);
    }
  });

  it("names each brand exactly once, however many projects use it", () => {
    const all = names(groups);
    assert.deepEqual([...new Set(all)].sort(), [...all].sort());
  });

  it("is longer than either source alone, which is the point of it", () => {
    assert.ok(names(groups).length > site.materialPartners.length);
  });

  it("prefers a project's wording over the site-wide one", () => {
    /*
      Curve files Saint-Gobain under its own specific label; the site-wide
      list calls it "Glass & building solutions". The project wins, and the
      brand does not appear under both.
    */
    const curve = getAllProjects().find((p) => p.slug === "curve");
    const fromCurve = curve?.materials?.find((m) => m.brand === "Saint-Gobain");
    assert.ok(fromCurve, "Curve no longer records Saint-Gobain — rewrite this test");

    const holding = groups.filter((g) =>
      g.brands.some((b) => b.name === "Saint-Gobain"),
    );
    assert.equal(holding.length, 1);
    assert.equal(holding[0].use, fromCurve.use);
  });

  it("does not show one trade twice under two names", () => {
    /*
      Astral Pipes is "Pipes & plumbing" site-wide; Curve files Ashirvad and
      Supreme under "Plumbing". Two cards for the same trade read as two
      trades, so the declared pair in SAME_TRADE folds them into one.
    */
    const plumbing = groups.filter((g) => /plumbing/i.test(g.use ?? ""));
    assert.equal(plumbing.length, 1, "plumbing is on more than one card");
    const brands = plumbing[0].brands.map((b) => b.name).sort();
    assert.deepEqual(brands, ["Ashirvad", "Astral Pipes", "Supreme"]);
  });

  it("gives every group a label", () => {
    for (const group of groups) {
      assert.ok(group.use && group.use.trim().length > 0);
    }
  });

  it("carries a mark wherever one is on file", () => {
    for (const group of groups) {
      for (const brand of group.brands) {
        assert.equal(brand.logoSrc, brandLogo(brand.name));
      }
    }
  });

  it("leaves the per-project list alone — a project still shows its own", () => {
    const curve = getAllProjects().find((p) => p.slug === "curve")!;
    const own = names(getMaterialGroups(curve.materials));
    assert.deepEqual(
      own.sort(),
      (curve.materials ?? []).map((m) => m.brand).sort(),
    );
  });
});
