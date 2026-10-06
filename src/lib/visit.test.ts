import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { leadSchema } from "@/lib/chatbot/lead";
import { emailLooksReal, phoneLooksReal, visitMessage } from "@/lib/visit";

/**
 * The site-visit page validates in the browser and sends through the
 * visitor's own WhatsApp or mail client, so nothing it collects ever reaches
 * a schema of ours. That is the point of the design and also its risk: the
 * rule for what counts as a reachable number is now written twice, here and
 * in lib/chatbot/lead.ts, and two copies of a rule drift.
 *
 * So the first test runs the same numbers through both and fails if they ever
 * disagree. Arka's form is the one that posts, and the day someone widens or
 * tightens it, this says so.
 */

const NUMBERS = [
  "9845012345",
  "98450 12345",
  "+919845012345",
  "919845012345",
  "08212345678",
  "+44 20 7946 0958",
  "12345",
  "",
  "not a number",
  "98450123456789",
] as const;

/** lead.ts's phone rule, reached through the schema that owns it. */
const leadAcceptsPhone = (value: string) =>
  leadSchema.safeParse({
    name: "A Visitor",
    phone: value,
    consent: true,
    leadId: "11111111-1111-4111-8111-111111111111",
    conversationId: "22222222-2222-4222-8222-222222222222",
    pagePath: "/visit",
    transcript: [],
  }).success;

describe("the site-visit enquiry", () => {
  it("accepts exactly the numbers Arka's form accepts", () => {
    for (const number of NUMBERS) {
      assert.equal(
        phoneLooksReal(number),
        leadAcceptsPhone(number),
        `disagreed about ${JSON.stringify(number)}`,
      );
    }
  });

  it("takes a ten-digit mobile, an STD-code landline and an international number", () => {
    assert.ok(phoneLooksReal("9845012345"));
    assert.ok(phoneLooksReal("08212345678"));
    assert.ok(phoneLooksReal("+442079460958"));
  });

  it("refuses a number nobody could ring", () => {
    assert.equal(phoneLooksReal("12345"), false);
    assert.equal(phoneLooksReal(""), false);
    assert.equal(phoneLooksReal("not a number"), false);
  });

  it("wants an at sign and a domain in an address", () => {
    assert.ok(emailLooksReal("someone@example.com"));
    assert.equal(emailLooksReal("someone@example"), false);
    assert.equal(emailLooksReal("someone.example.com"), false);
    assert.equal(emailLooksReal(""), false);
  });

  it("writes every detail the team needs into the message", () => {
    const message = visitMessage({
      name: "  A Visitor ",
      phone: " 9845012345 ",
      email: "visitor@example.com",
      project: { slug: "curve", name: "Curve", place: "Vijayanagar" },
      note: " Weekends suit us ",
    });

    assert.match(message, /^Hello .+ — I'd like to arrange a site visit\./);
    assert.match(message, /Name: A Visitor$/m);
    assert.match(message, /Phone: 9845012345$/m);
    assert.match(message, /Email: visitor@example\.com$/m);
    assert.match(message, /Project: Curve, Vijayanagar$/m);
    assert.match(message, /Note: Weekends suit us$/m);
  });

  it("says so rather than going quiet when no development was chosen", () => {
    const message = visitMessage({
      name: "A Visitor",
      phone: "9845012345",
      email: "visitor@example.com",
      project: undefined,
      note: "",
    });
    assert.match(message, /Project: Not decided yet$/m);
    assert.doesNotMatch(message, /Note:/);
  });
});
