import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseConfig } from "@/lib/chatbot/env";

describe("parseConfig", () => {
  it("defaults to Hugging Face with a pinned model", () => {
    const c = parseConfig({ HF_TOKEN: "hf_x" });
    assert.equal(c.provider, "huggingface");
    assert.equal(c.ossBaseUrl, "https://router.huggingface.co/v1");
    assert.equal(c.ossKey, "hf_x");
    assert.match(c.model, /:[a-z-]+$/, "the provider suffix pins the host");
    assert.equal(c.ready, true);
  });

  it("falls back to the same model on another host", () => {
    const c = parseConfig({ HF_TOKEN: "hf_x" });
    const [mainModel] = c.model.split(":");
    assert.ok(c.fallbackModel);
    assert.equal(c.fallbackModel.split(":")[0], mainModel, "same weights");
    assert.notEqual(c.fallbackModel, c.model, "different host");
  });

  it("drops the default fallback when the main model is changed", () => {
    const c = parseConfig({ HF_TOKEN: "hf_x", ARKA_MODEL: "Qwen/Qwen3-8B:nscale" });
    assert.equal(c.fallbackModel, undefined);
  });

  it("can turn the fallback off", () => {
    assert.equal(parseConfig({ HF_TOKEN: "hf_x", ARKA_FALLBACK_MODEL: "off" }).fallbackModel, undefined);
  });

  it("is not ready without a token, so the widget hands off", () => {
    assert.equal(parseConfig({}).ready, false);
  });

  it("lets the model be overridden", () => {
    const c = parseConfig({ HF_TOKEN: "hf_x", ARKA_MODEL: "Qwen/Qwen3-8B:nscale" });
    assert.equal(c.model, "Qwen/Qwen3-8B:nscale");
  });

  it("still switches to Claude with one variable", () => {
    const c = parseConfig({ ARKA_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "k" });
    assert.equal(c.model, "claude-haiku-4-5");
    assert.equal(c.ready, true);
  });

  it("is off unless switched on", () => {
    assert.equal(parseConfig({ HF_TOKEN: "hf_x" }).enabled, false);
    assert.equal(parseConfig({ ARKA_ENABLED: "true" }).enabled, true);
    assert.equal(parseConfig({ ARKA_ENABLED: "false" }).enabled, false);
  });

  it("names a bad variable without echoing it", () => {
    assert.throws(
      () => parseConfig({ ARKA_PROVIDER: "secret-value" }),
      (e: Error) => /ARKA_PROVIDER/.test(e.message) && !e.message.includes("secret-value"),
    );
  });

  it("treats an empty value as unset", () => {
    assert.equal(parseConfig({ HF_TOKEN: "" }).ready, false);
  });
});
