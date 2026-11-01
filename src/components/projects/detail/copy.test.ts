import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { facingSentence } from "@/components/projects/detail/copy";
import { getAllProjects } from "@/lib/content";

/**
 * The aspect line is composed from the content file, not written into it, so
 * the thing that can go wrong is the sentence quietly disagreeing with the
 * data — the right words and the wrong count. The last test reads the real
 * project rather than a fixture for exactly that reason.
 */

describe("facingSentence", () => {
  it("counts the flats an entry names and says it in words", () => {
    assert.equal(
      facingSentence([
        { flats: "1 & 2", facing: "South" },
        { flats: "3 & 4", facing: "West" },
        { flats: "5 & 6", facing: "North" },
        { flats: "7 & 8", facing: "East" },
      ]),
      "On every floor, two homes face south, two west, two north and two east.",
    );
  });

  it("agrees the verb with a single home", () => {
    assert.equal(
      facingSentence([{ flats: "1", facing: "North" }]),
      "On every floor, one home faces north.",
    );
  });

  it("does not assume every side has the same number", () => {
    assert.equal(
      facingSentence([
        { flats: "1, 2 & 3", facing: "South" },
        { flats: "4", facing: "East" },
      ]),
      "On every floor, three homes face south and one east.",
    );
  });

  it("drops an entry that names no flat rather than inventing a count", () => {
    assert.equal(
      facingSentence([
        { flats: "to be confirmed", facing: "South" },
        { flats: "3 & 4", facing: "West" },
      ]),
      "On every floor, two homes face west.",
    );
  });

  it("says nothing at all when nothing can be counted", () => {
    assert.equal(facingSentence([]), undefined);
    assert.equal(facingSentence([{ flats: "TBC", facing: "South" }]), undefined);
  });

  it("describes Curve the way the client stated it", () => {
    /*
      Curve is the only development carrying facings, and the client's own
      words on 1 November were two flats to each of south, west, north and
      east. If the content file ever stops saying that, this fails rather
      than the page quietly saying something else.
    */
    const curve = getAllProjects().find((p) => p.slug === "curve");
    assert.ok(curve?.facings?.length, "Curve no longer records facings — rewrite this test");

    const sentence = facingSentence(curve.facings);
    for (const aspect of ["south", "west", "north", "east"]) {
      assert.match(sentence!, new RegExp(`two ${aspect}|two homes face ${aspect}`));
    }
  });
});
