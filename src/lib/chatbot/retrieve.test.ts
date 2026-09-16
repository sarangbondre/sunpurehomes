import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugFromPath } from "@/lib/chatbot/paths";
import { retrieve } from "@/lib/chatbot/retrieve";

describe("retrieve", () => {
  it("takes the project named in the question over the page being read", () => {
    // Plan verification step 4: asking about H4 from Curve's page gets H4.
    assert.deepEqual(
      retrieve({ question: "Tell me about H4", history: [], pagePath: "/projects/curve" }),
      ["h4"],
    );
  });

  it("falls back to the page when the question names nothing", () => {
    assert.deepEqual(
      retrieve({ question: "Is there a gym?", history: [], pagePath: "/projects/curve/plan" }),
      ["curve"],
    );
  });

  it("keeps the subject of the conversation over the page", () => {
    assert.deepEqual(
      retrieve({
        question: "Does it have a gym?",
        history: ["What is Meraki like?"],
        pagePath: "/projects/curve",
      }),
      ["meraki"],
    );
  });

  it("matches aliases on whole words only", () => {
    assert.deepEqual(retrieve({ question: "What about Happiness IV?", history: [] }), ["h4"]);
    assert.deepEqual(retrieve({ question: "happiness ii please", history: [] }), ["happiness-2"]);
    // "happiness i" must not fire inside "happiness is".
    assert.deepEqual(retrieve({ question: "happiness is a warm home", history: [] }), []);
  });

  it("returns projects in the order they were named, capped", () => {
    assert.deepEqual(
      retrieve({ question: "Compare Rare Earth, Fadal, Curve and Meraki", history: [] }),
      ["rare-earth", "fadal", "curve"],
    );
  });

  it("returns nothing when nothing is named and the page is not a project", () => {
    assert.deepEqual(retrieve({ question: "Which villas do you have?", history: [], pagePath: "/" }), []);
  });

  it("ignores a project page that does not exist", () => {
    assert.deepEqual(retrieve({ question: "hello", history: [], pagePath: "/projects/nope" }), []);
    assert.equal(slugFromPath("/about"), undefined);
  });
});
