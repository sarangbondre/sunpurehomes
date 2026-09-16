import Anthropic from "@anthropic-ai/sdk";
import type { ArkaConfig } from "@/lib/chatbot/env";

/**
 * The one place a model is called.
 *
 * Two adapters behind one function, chosen by ARKA_PROVIDER. Hugging Face
 * Inference Providers is the default and, like any other OpenAI-compatible
 * host, goes through the second adapter; Claude goes through the first. Switching is an
 * environment change, and evals/arka.json is how to decide whether it is safe
 * to — see docs/adr/0002-arka.md.
 *
 * Every call has a timeout and a bounded retry. The caller passes an
 * AbortSignal so a visitor closing the widget stops the spend.
 */

export type Turn = { role: "user" | "assistant"; content: string };

export type Usage = { inputTokens: number; outputTokens: number };

export type StreamArgs = {
  system: string;
  turns: readonly Turn[];
  signal: AbortSignal;
  /** Reported once, when the model finishes. */
  onUsage?: (usage: Usage) => void;
};

export class ProviderRefusal extends Error {}

/*
  US dollars per million tokens, for the cost line in the logs. Models not
  listed log a null cost rather than a guessed one; add a row when switching.
*/
const PRICES: Readonly<Record<string, { input: number; output: number }>> = {
  // Hugging Face passes hosts' prices through; these are as of 16 Sept 2026.
  "meta-llama/Llama-3.3-70B-Instruct:novita": { input: 0.135, output: 0.4 },
  "meta-llama/Llama-3.1-8B-Instruct:deepinfra": { input: 0.02, output: 0.05 },
  "meta-llama/Llama-3.1-8B-Instruct:novita": { input: 0.02, output: 0.05 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-opus-5": { input: 5, output: 25 },
};

export function estimateCostUsd(model: string, usage: Usage | undefined): number | null {
  const price = PRICES[model];
  if (!price || !usage) return null;
  const cost = (usage.inputTokens * price.input + usage.outputTokens * price.output) / 1e6;
  return Math.round(cost * 1e6) / 1e6;
}

let anthropic: Anthropic | undefined;

async function* fromAnthropic(
  config: ArkaConfig,
  args: StreamArgs,
): AsyncGenerator<string> {
  anthropic ??= new Anthropic({
    apiKey: config.anthropicKey,
    timeout: config.timeoutMs,
    maxRetries: 1,
  });

  const stream = anthropic.messages.stream(
    {
      model: config.model,
      max_tokens: config.maxTokens,
      system: args.system,
      messages: args.turns.map((t) => ({ role: t.role, content: t.content })),
    },
    { signal: args.signal },
  );

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }

  const final = await stream.finalMessage();
  args.onUsage?.({
    inputTokens: final.usage.input_tokens,
    outputTokens: final.usage.output_tokens,
  });
  if (final.stop_reason === "refusal") throw new ProviderRefusal();
}

/**
 * OpenAI-compatible chat completions, streamed as server-sent events. Plain
 * fetch rather than another SDK: the surface used is one endpoint, and every
 * host that offers it implements the same shape.
 */
async function* fromOpenAiCompatible(
  config: ArkaConfig,
  args: StreamArgs,
): AsyncGenerator<string> {
  const base = (config.ossBaseUrl ?? "").replace(/\/+$/, "");
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.ossKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      stream: true,
      stream_options: { include_usage: true },
      max_tokens: config.maxTokens,
      temperature: config.ossTemperature,
      messages: [{ role: "system", content: args.system }, ...args.turns],
    }),
    signal: AbortSignal.any([args.signal, AbortSignal.timeout(config.timeoutMs)]),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Model host returned ${response.status}`);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const data = line.startsWith("data:") ? line.slice(5).trim() : "";
      if (!data || data === "[DONE]") continue;

      let parsed: {
        choices?: { delta?: { content?: string } }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      try {
        parsed = JSON.parse(data);
      } catch {
        // A host sent a line that is not JSON. Skip it; the next one decides.
        continue;
      }
      const text = parsed.choices?.[0]?.delta?.content;
      if (text) yield text;
      if (parsed.usage) {
        args.onUsage?.({
          inputTokens: parsed.usage.prompt_tokens ?? 0,
          outputTokens: parsed.usage.completion_tokens ?? 0,
        });
      }
    }
  }
}

export function streamReply(
  config: ArkaConfig,
  args: StreamArgs,
): AsyncGenerator<string> {
  return config.provider === "anthropic"
    ? fromAnthropic(config, args)
    : fromOpenAiCompatible(config, args);
}
