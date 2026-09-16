import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  containsPrice,
  guardStream,
  scrubContacts,
  type ArkaEvent,
} from "@/lib/chatbot/guards";
import { PRICE_HANDOFF } from "@/lib/chatbot/persona";

async function* chunks(...parts: string[]) {
  for (const p of parts) yield p;
}

async function collect(source: AsyncIterable<string>): Promise<ArkaEvent[]> {
  const out: ArkaEvent[] = [];
  for await (const e of guardStream(source)) out.push(e);
  return out;
}

const shown = (events: ArkaEvent[]) =>
  events.flatMap((e) => (e.t === "text" ? [e.v] : [])).join("");

describe("containsPrice", () => {
  for (const text of [
    "It is ₹85 lakh.",
    "Around Rs. 1.2 crore",
    "roughly 90L all in",
    "INR 6500 onwards",
    "₹6,500 per sq ft",
    "6,500 per sq ft",
    "about 4500 psf",
    "an EMI of 40,000",
    "1.2 cr for the corner villa",
  ]) {
    it(`catches: ${text}`, () => assert.equal(containsPrice(text), true));
  }

  for (const text of [
    "Prices aren't published here.",
    "The 3 BHK is 1,946 sq ft super built-up.",
    "43 plots in the approved layout.",
    "SVEI School is 5 min away, NPS is 9.5 km.",
    "RERA registration: PRM/KA/RERA/1268/378/PR/080125/007364",
    "It has 3 levels and a premium lift.",
    "9.0 × 12.0 m plots",
  ]) {
    it(`passes: ${text}`, () => assert.equal(containsPrice(text), false));
  }
});

describe("scrubContacts", () => {
  it("removes phone numbers, emails and links but not RERA numbers", () => {
    const { text, scrubbed } = scrubContacts(
      "Call +91 99169 00511 or mail sales@sunpurehomes.com, see https://sunpurehomes.com. RERA PRM/KA/RERA/1268/378/PR/080125/007364.",
    );
    assert.equal(scrubbed, true);
    assert.doesNotMatch(text, /99169|@|https?:|sunpurehomes\.com/);
    assert.match(text, /PRM\/KA\/RERA\/1268\/378\/PR\/080125\/007364/);
  });

  it("uses a caller's placeholder for visitor input", () => {
    assert.equal(
      scrubContacts("My number is 98450 12345", "[contact detail removed]").text,
      "My number is [contact detail removed]",
    );
  });

  it("leaves ordinary text alone", () => {
    const input = "The 2 BHK is 1,398–1,589 sq ft.";
    assert.deepEqual(scrubContacts(input), { text: input, scrubbed: false });
  });
});

describe("guardStream", () => {
  it("releases whole sentences and ends with done", async () => {
    const events = await collect(chunks("Curve has a gy", "m. It also has a yo", "ga pavilion."));
    assert.equal(shown(events), "Curve has a gym. It also has a yoga pavilion.");
    assert.deepEqual(events.at(-1), { t: "done" });
  });

  it("never releases a price, even split across chunks and after 'Rs.'", async () => {
    const events = await collect(chunks("Sure. The 3 BHK is Rs.", " 1.2", " crore. Want a visit?"));
    const text = shown(events);
    assert.doesNotMatch(text, /1\.2|crore/);
    assert.ok(events.some((e) => e.t === "replace" && e.v === PRICE_HANDOFF));
    assert.ok(events.some((e) => e.t === "handoff" && e.reason === "price"));
    assert.ok(events.some((e) => e.t === "lead"), "a price question is a lead");
    // Nothing after the replacement.
    assert.deepEqual(events.at(-1), { t: "done" });
  });

  it("turns markers into events and strips them from the text", async () => {
    const events = await collect(chunks("Happy to arrange that. [[le", "ad]]"));
    assert.equal(shown(events).includes("[["), false);
    assert.ok(events.some((e) => e.t === "lead"));

    const handoff = await collect(chunks("Ask the team. [[handoff]]"));
    assert.ok(handoff.some((e) => e.t === "handoff" && e.reason === "model"));
  });

  it("scrubs a contact detail and asks the widget for the buttons", async () => {
    const events = await collect(chunks("Call 9916900511 today."));
    assert.doesNotMatch(shown(events), /9916900511/);
    assert.ok(events.some((e) => e.t === "handoff" && e.reason === "contact"));
  });
});
