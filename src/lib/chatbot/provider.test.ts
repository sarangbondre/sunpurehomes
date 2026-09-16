import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import { parseConfig } from "@/lib/chatbot/env";
import { ProviderHttpError, streamReply } from "@/lib/chatbot/provider";

/**
 * Answers each request with the next scripted status, or by model name when
 * given a map; 200 streams "Hello from <model>."
 */
function host(script: number[] | Record<string, number>) {
  let calls = 0;
  const models: string[] = [];
  const server: Server = createServer(async (req, res) => {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const model = (JSON.parse(raw) as { model: string }).model;
    models.push(model);
    const status = Array.isArray(script)
      ? script[Math.min(calls, script.length - 1)]
      : (script[model] ?? 500);
    calls++;
    if (status !== 200) {
      // A tiny Retry-After keeps the test fast; the parser accepts decimals.
      res.writeHead(status, { "retry-after": "0.01" }).end("{}");
      return;
    }
    res.writeHead(200, { "content-type": "text/event-stream" });
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: `Hello from ${model}.` } }] })}\n\n`);
    res.end("data: [DONE]\n\n");
  });
  return { server, calls: () => calls, models: () => models };
}

async function run(url: string, fallback?: string): Promise<{ text: string; served?: string }> {
  const config = parseConfig({
    ARKA_PROVIDER: "openai-compatible",
    ARKA_OSS_BASE_URL: url,
    ARKA_OSS_API_KEY: "test",
    ARKA_MODEL: "main",
    ARKA_FALLBACK_MODEL: fallback,
  });
  let text = "";
  let served: string | undefined;
  for await (const piece of streamReply(config, {
    system: "s",
    turns: [{ role: "user", content: "q" }],
    signal: new AbortController().signal,
    onServed: (m) => (served = m),
  })) {
    text += piece;
  }
  return { text, served };
}

function listen(server: Server): Promise<string> {
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () =>
      resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`),
    ),
  );
}

describe("openai-compatible retries", () => {
  const throttled = host([429, 200]);
  const broken = host([503, 503, 503, 503]);
  const refused = host([400, 200]);
  const overloaded = host({ main: 429, backup: 200 });
  const bothDown = host({ main: 503, backup: 503 });
  const urls: Record<string, string> = {};

  before(async () => {
    urls.throttled = await listen(throttled.server);
    urls.broken = await listen(broken.server);
    urls.refused = await listen(refused.server);
    urls.overloaded = await listen(overloaded.server);
    urls.bothDown = await listen(bothDown.server);
  });
  after(() => {
    for (const h of [throttled, broken, refused, overloaded, bothDown]) h.server.close();
  });

  it("retries a brief throttle and then streams", async () => {
    const r = await run(urls.throttled);
    assert.equal(r.text, "Hello from main.");
    assert.equal(r.served, "main");
    assert.equal(throttled.calls(), 2);
  });

  it("gives up after one retry with no fallback, keeping the status", async () => {
    await assert.rejects(run(urls.broken), (e) => e instanceof ProviderHttpError && e.status === 503);
    assert.equal(broken.calls(), 2);
  });

  it("moves to the fallback host when the main one stays overloaded", async () => {
    const r = await run(urls.overloaded, "backup");
    assert.equal(r.text, "Hello from backup.");
    assert.equal(r.served, "backup");
    assert.deepEqual(overloaded.models(), ["main", "main", "backup"]);
  });

  it("fails cleanly when both hosts are down", async () => {
    await assert.rejects(run(urls.bothDown, "backup"), (e) => e instanceof ProviderHttpError && e.status === 503);
    assert.deepEqual(bothDown.models(), ["main", "main", "backup", "backup"]);
  });

  it("does not retry a request the host rejected as invalid", async () => {
    await assert.rejects(run(urls.refused), (e) => e instanceof ProviderHttpError && e.status === 400);
    assert.equal(refused.calls(), 1);
  });
});
