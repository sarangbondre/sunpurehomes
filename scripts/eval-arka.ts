/**
 * Scores Arka against evals/arka.json, through the same pipeline the site
 * uses: retrieval, system prompt, model, guards.
 *
 *   ANTHROPIC_API_KEY=… npm run eval:arka
 *   ARKA_PROVIDER=openai-compatible ARKA_OSS_BASE_URL=… ARKA_OSS_API_KEY=… \
 *     ARKA_MODEL=meta-llama/Llama-3.1-8B-Instruct npm run eval:arka
 *
 * Every run calls the model once per case and costs real money — on Claude
 * Haiku 4.5, about ₹5 for the whole file. Exits non-zero if any case fails.
 */
import { readFileSync } from "node:fs";
import { getBrief } from "@/lib/chatbot/corpus";
import { arkaConfig } from "@/lib/chatbot/env";
import { guardStream } from "@/lib/chatbot/guards";
import { systemPrompt } from "@/lib/chatbot/persona";
import { streamReply } from "@/lib/chatbot/provider";
import { retrieve } from "@/lib/chatbot/retrieve";

type Case = {
  id: string;
  page: string;
  ask: string;
  expect: "answer" | "handoff" | "lead" | "decline";
  mustInclude?: string[];
  mustNotInclude?: string[];
};

/** Case-insensitive, and "1,946" matches "1946". */
function norm(text: string): string {
  return text.toLowerCase().replace(/(\d),(?=\d)/g, "$1");
}

async function run(c: Case) {
  const config = arkaConfig();
  const slugs = retrieve({ question: c.ask, history: [], pagePath: c.page });
  const records = slugs.flatMap((s) => getBrief(s) ?? []);

  let text = "";
  let routed = false;
  let lead = false;
  let tokens = { input: 0, output: 0 };

  const events = guardStream(
    streamReply(config, {
      system: systemPrompt(records),
      turns: [{ role: "user", content: c.ask }],
      signal: AbortSignal.timeout(30_000),
      onUsage: (u) => (tokens = { input: u.inputTokens, output: u.outputTokens }),
    }),
  );
  for await (const e of events) {
    if (e.t === "text") text += e.v;
    if (e.t === "replace") text = e.v;
    if (e.t === "handoff") routed = true;
    if (e.t === "lead") lead = true;
  }

  const shown = norm(text);
  const problems: string[] = [];
  for (const needle of c.mustNotInclude ?? []) {
    if (shown.includes(norm(needle))) problems.push(`said "${needle}"`);
  }
  if (c.expect === "answer") {
    for (const needle of c.mustInclude ?? []) {
      if (!shown.includes(norm(needle))) problems.push(`missing "${needle}"`);
    }
  }
  if (c.expect === "handoff" && !routed && !lead) problems.push("did not route to a person");
  if (c.expect === "lead" && !lead) problems.push("did not offer the form");
  if (!text.trim()) problems.push("empty reply");

  return { id: c.id, pass: problems.length === 0, problems, text, slugs, tokens };
}

async function main() {
  const config = arkaConfig();
  if (!config.ready) {
    console.error(
      `Arka is not configured for provider "${config.provider}". Set the variables in .env.example.`,
    );
    process.exit(2);
  }

  const { cases } = JSON.parse(readFileSync("evals/arka.json", "utf8")) as { cases: Case[] };
  const only = process.argv[2];
  const selected = only ? cases.filter((c) => c.id === only) : cases;

  console.log(`${config.provider} · ${config.model} · ${selected.length} cases\n`);

  let passed = 0;
  const totals = { input: 0, output: 0 };
  // One at a time: small, and polite to a provider's rate limits.
  for (const c of selected) {
    try {
      const r = await run(c);
      totals.input += r.tokens.input;
      totals.output += r.tokens.output;
      if (r.pass) passed++;
      console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id.padEnd(24)} [${r.slugs.join(",") || "-"}]`);
      if (!r.pass) {
        console.log(`      ${r.problems.join("; ")}`);
        console.log(`      reply: ${r.text.replace(/\s+/g, " ").slice(0, 220)}`);
      }
    } catch (error) {
      console.log(`ERROR ${c.id.padEnd(24)} ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log(`\n${passed}/${selected.length} passed · ${totals.input} input + ${totals.output} output tokens`);
  process.exit(passed === selected.length ? 0 : 1);
}

void main();
