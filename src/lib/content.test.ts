import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAllProjects, sortProjects } from "@/lib/content";

const all = getAllProjects();
const names = (list: { name: string }[]) => list.map((p) => p.name);

describe("sortProjects", () => {
  it("puts what a buyer can act on first, and sold-out last", () => {
    const sorted = sortProjects(all, "featured", (slug) => slug === "v4");
    const statuses = sorted.map((p) => (p.slug === "v4" ? "sold" : p.status));
    const firstCompleted = statuses.indexOf("completed");
    assert.ok(statuses.slice(0, firstCompleted).every((s) => s === "ongoing" || s === "upcoming"));
    assert.equal(sorted.at(-1)?.slug, "v4");
  });

  it("leads with the three the client asked for, then falls back to name", () => {
    const ongoing = sortProjects(all, "featured", () => false)
      .filter((p) => p.status === "ongoing")
      .map((p) => p.slug);
    assert.deepEqual(ongoing.slice(0, 3), ["curve", "h4", "rare-earth"]);
    // The rest keep the old rule, so the change is only to the head.
    const rest = ongoing.slice(3);
    assert.deepEqual(rest, [...rest].sort((a, b) => a.localeCompare(b, "en")));
  });

  it("sorts by name", () => {
    const sorted = names(sortProjects(all, "name", () => false));
    assert.deepEqual(sorted, [...sorted].sort((a, b) => a.localeCompare(b, "en")));
  });

  it("groups by type: villas, apartments, plots", () => {
    const types = sortProjects(all, "type", () => false).map((p) => p.type);
    const order = ["villa", "apartment", "plot"];
    assert.deepEqual(types, [...types].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
  });

  it("does not reorder the list it was given", () => {
    const before = names(all);
    sortProjects(all, "type", () => false);
    assert.deepEqual(names(all), before);
  });
});
