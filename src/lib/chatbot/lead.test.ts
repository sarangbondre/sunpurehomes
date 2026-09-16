import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  campaignOf,
  composeLeadEmail,
  externalReferrer,
  leadSchema,
} from "@/lib/chatbot/lead";

const base = {
  leadId: "7c0b0a1e-2f4a-4a8e-9b6b-0d1a2b3c4d5e",
  conversationId: "1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b",
  name: "Asha Rao",
  phone: "99169 00511",
  consent: true,
  pagePath: "/projects/curve",
  transcript: [],
};

describe("leadSchema", () => {
  it("normalises Indian mobiles in the forms people type them", () => {
    for (const phone of ["9916900511", "+91 99169 00511", "91 9916900511", "(99169) 00-511"]) {
      const r = leadSchema.safeParse({ ...base, phone });
      assert.equal(r.success && r.data.phone, "9916900511", phone);
    }
  });

  it("keeps a leading 0 rather than guessing what the number was", () => {
    // A Mysuru landline and a trunk-prefixed mobile look identical in digits.
    // Stripping the 0 turned the landline into a mobile that does not exist.
    for (const [typed, kept] of [
      ["0821 2345678", "08212345678"],
      ["099169-00511", "09916900511"],
    ]) {
      const r = leadSchema.safeParse({ ...base, phone: typed });
      assert.equal(r.success && r.data.phone, kept, typed);
    }
  });

  it("accepts an international number, for buyers abroad", () => {
    const r = leadSchema.safeParse({ ...base, phone: "+44 7700 900123" });
    assert.equal(r.success && r.data.phone, "+447700900123");
  });

  it("rejects things that are not a callable number", () => {
    for (const phone of ["12345", "5555555555", "0821234", "not a number"]) {
      assert.equal(leadSchema.safeParse({ ...base, phone }).success, false, phone);
    }
  });

  it("requires consent", () => {
    assert.equal(leadSchema.safeParse({ ...base, consent: false }).success, false);
  });

  it("treats a blank email as no email", () => {
    const r = leadSchema.safeParse({ ...base, email: "  " });
    assert.equal(r.success && r.data.email, undefined);
  });

  it("fails the honeypot", () => {
    const r = leadSchema.safeParse({ ...base, website: "spam.example" });
    assert.equal(r.success, false);
  });

  it("rejects fields it does not know", () => {
    assert.equal(leadSchema.safeParse({ ...base, admin: true }).success, false);
  });
});

describe("composeLeadEmail", () => {
  const lead = leadSchema.parse({
    ...base,
    project: "curve",
    email: "asha@example.com",
    note: "Weekend visit\nplease",
    source: {
      referrer: "https://www.instagram.com/p/abc?igsh=secret",
      landing: "/?utm_source=instagram&utm_medium=paid&utm_campaign=diwali&token=xyz",
    },
    transcript: [
      { role: "user", content: "Is there a gym?" },
      { role: "assistant", content: "Yes, Curve has a gymnasium." },
    ],
  });
  const { subject, text } = composeLeadEmail(lead, {
    origin: "https://sunpurehomes.com",
    userAgent: "Mozilla/5.0 (Linux; Android 14)",
    receivedAt: new Date("2026-09-16T09:00:00Z"),
  });

  it("names the project in the subject", () => {
    assert.equal(subject, "New enquiry — Curve — via Arka");
  });

  it("says where the lead came from", () => {
    assert.match(text, /Asked on\s+https:\/\/sunpurehomes\.com\/projects\/curve/);
    assert.match(text, /Arrived from\s+https:\/\/www\.instagram\.com\/p\/abc\n/);
    assert.match(text, /Campaign\s+instagram \/ paid \/ diwali/);
    assert.match(text, /16 Sept? 2026, 2:30\s?pm IST/i);
    assert.match(text, /Conversation\s+1b2c3d4e/);
  });

  it("keeps no query parameters that are not campaign tags", () => {
    assert.doesNotMatch(text, /igsh|secret|token|xyz/);
    assert.match(text, /Landing page\s+https:\/\/sunpurehomes\.com\/\?utm_source=instagram/);
  });

  it("carries the transcript and flattens visitor line breaks", () => {
    assert.match(text, /Visitor: Is there a gym\?\nArka: Yes, Curve has a gymnasium\./);
    assert.match(text, /Note\s+Weekend visit please/);
  });

  it("falls back to General for an unknown project", () => {
    const other = composeLeadEmail({ ...lead, project: "nope", source: undefined }, {
      origin: "https://sunpurehomes.com",
      userAgent: null,
      receivedAt: new Date(),
    });
    assert.equal(other.subject, "New enquiry — General — via Arka");
    assert.match(other.text, /Arrived from\s+Not recorded/);
    assert.doesNotMatch(other.text, /Campaign|Landing page/);
  });
});

describe("externalReferrer", () => {
  const origin = "https://sunpurehomes.com";
  it("names an outside site, without its query string", () => {
    assert.equal(
      externalReferrer("https://www.google.com/search?q=villas+mysuru", origin),
      "https://www.google.com/search",
    );
  });
  it("treats the site's own pages and empty values as not a source", () => {
    assert.equal(externalReferrer("https://sunpurehomes.com/projects", origin), null);
    assert.equal(externalReferrer("", origin), null);
    assert.equal(externalReferrer("javascript:alert(1)", origin), null);
    assert.equal(externalReferrer("not a url", origin), null);
  });
});

describe("campaignOf", () => {
  it("summarises UTM tags and ad click ids", () => {
    assert.deepEqual(campaignOf("/projects/curve?utm_source=google&gclid=abc"), {
      landing: "/projects/curve?utm_source=google",
      campaign: "google / Google Ads ad click",
    });
  });
  it("returns nothing for a plain arrival or a value that is not a path", () => {
    assert.deepEqual(campaignOf("/about"), { landing: "/about", campaign: null });
    assert.deepEqual(campaignOf("https://evil.example/"), { landing: null, campaign: null });
    assert.deepEqual(campaignOf(undefined), { landing: null, campaign: null });
  });
});
