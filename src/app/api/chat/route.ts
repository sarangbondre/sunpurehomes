import { z } from "zod";
import { getBrief } from "@/lib/chatbot/corpus";
import { arkaConfig } from "@/lib/chatbot/env";
import { guardStream, scrubContacts, type ArkaEvent } from "@/lib/chatbot/guards";
import { log } from "@/lib/chatbot/log";
import { PROMPT_VERSION, systemPrompt } from "@/lib/chatbot/persona";
import {
  ProviderHttpError,
  ProviderRefusal,
  estimateCostUsd,
  streamReply,
  type Usage,
} from "@/lib/chatbot/provider";
import { allow, clientKey } from "@/lib/chatbot/rate-limit";
import { slugFromPath } from "@/lib/chatbot/paths";
import { retrieve } from "@/lib/chatbot/retrieve";

/**
 * POST /api/chat — one turn with Arka, streamed back as newline-delimited
 * JSON events (see ArkaEvent in lib/chatbot/guards.ts).
 *
 * Node runtime: the corpus is read from disk through lib/content.ts.
 *
 * Failure behaviour is the same everywhere: the visitor gets an event that
 * makes the widget show the sales contact buttons. There is no state in which
 * Arka is broken and the visitor has nowhere to go.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** How much of the conversation is sent to the model. */
const HISTORY = 12;
const MAX_QUESTION = 600;

const PER_VISITOR = { limit: 30, windowMs: 10 * 60_000 };
const PER_CONVERSATION = { limit: 40, windowMs: 60 * 60_000 };

const bodySchema = z
  .object({
    conversationId: z.string().uuid(),
    pagePath: z.string().startsWith("/").max(200),
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(2_000),
        }),
      )
      .min(1)
      .max(40),
  })
  .strict();

const encoder = new TextEncoder();

function line(event: ArkaEvent): Uint8Array {
  return encoder.encode(`${JSON.stringify(event)}\n`);
}

/** A complete response made of fixed events, for every early exit. */
function events(
  requestId: string,
  status: number,
  list: readonly ArkaEvent[],
): Response {
  return new Response(list.map((e) => JSON.stringify(e)).join("\n") + "\n", {
    status,
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-request-id": requestId,
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const started = Date.now();

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    log("warn", "chat.invalid", { requestId });
    return events(requestId, 400, [{ t: "error", code: "invalid" }]);
  }

  const last = body.messages.at(-1);
  if (last?.role !== "user" || last.content.length > MAX_QUESTION) {
    log("warn", "chat.invalid", { requestId, reason: "last-turn" });
    return events(requestId, 400, [{ t: "error", code: "invalid" }]);
  }

  const visitor = clientKey(request.headers);
  if (
    !allow(`v:${visitor}`, PER_VISITOR.limit, PER_VISITOR.windowMs) ||
    !allow(`c:${body.conversationId}`, PER_CONVERSATION.limit, PER_CONVERSATION.windowMs)
  ) {
    log("warn", "chat.limited", { requestId, conversationId: body.conversationId });
    return events(requestId, 429, [
      { t: "error", code: "limited" },
      { t: "handoff", reason: "unavailable" },
      { t: "done" },
    ]);
  }

  const config = arkaConfig();
  if (!config.ready) {
    log("warn", "chat.unconfigured", { requestId, provider: config.provider });
    return events(requestId, 503, [
      { t: "error", code: "unavailable" },
      { t: "handoff", reason: "unavailable" },
      { t: "done" },
    ]);
  }

  // The API wants the conversation to open with the visitor.
  const recent = body.messages.slice(-HISTORY);
  const firstUser = recent.findIndex((m) => m.role === "user");

  /*
    A visitor who types their number into the chat has not asked for it to go
    to a model provider. The form is where contact details belong; here they
    are removed before anything leaves the site.
  */
  let inputScrubbed = false;
  const turns = recent.slice(firstUser).map((m) => {
    if (m.role !== "user") return m;
    const clean = scrubContacts(m.content, "[contact detail removed]");
    if (clean.scrubbed) inputScrubbed = true;
    return clean.scrubbed ? { ...m, content: clean.text } : m;
  });

  const slugs = retrieve({
    question: last.content,
    history: turns.slice(0, -1).filter((m) => m.role === "user").map((m) => m.content),
    pagePath: body.pagePath,
  });
  const records = slugs.flatMap((s) => getBrief(s) ?? []);
  const onPage = getBrief(slugFromPath(body.pagePath) ?? "")?.name;

  const upstream = new AbortController();
  request.signal.addEventListener("abort", () => upstream.abort(), { once: true });

  let usage: Usage | undefined;
  let servedBy = config.model;
  const replies = guardStream(
    streamReply(config, {
      system: systemPrompt(records, onPage),
      turns,
      signal: upstream.signal,
      onUsage: (u) => (usage = u),
      onServed: (m) => (servedBy = m),
    }),
  );

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let outcome = "answered";
      try {
        for await (const event of replies) {
          controller.enqueue(line(event));
          if (event.t === "handoff") outcome = `handoff:${event.reason}`;
          if (event.t === "lead") outcome = "lead-offered";
        }
      } catch (error) {
        const aborted = upstream.signal.aborted;
        outcome = error instanceof ProviderRefusal ? "refused" : aborted ? "aborted" : "failed";
        if (!aborted) {
          controller.enqueue(line({ t: "error", code: "failed" }));
          controller.enqueue(line({ t: "handoff", reason: "unavailable" }));
          controller.enqueue(line({ t: "done" }));
        }
        if (outcome === "failed") {
          log("error", "chat.failed", {
            requestId,
            provider: config.provider,
            model: config.model,
            // The class name and status only: errors can carry request details.
            error: error instanceof Error ? error.constructor.name : "unknown",
            status: error instanceof ProviderHttpError ? error.status : null,
          });
        }
      } finally {
        // A price guard ends the reply early; stop paying for the rest.
        upstream.abort();
        controller.close();
        log("info", "chat.turn", {
          requestId,
          conversationId: body.conversationId,
          page: body.pagePath,
          retrieved: slugs,
          outcome,
          prompt: PROMPT_VERSION,
          model: config.model,
          servedBy,
          inputScrubbed,
          inputTokens: usage?.inputTokens,
          outputTokens: usage?.outputTokens,
          costUsd: estimateCostUsd(servedBy, usage),
          ms: Date.now() - started,
        });
      }
    },
    cancel() {
      upstream.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-request-id": requestId,
    },
  });
}
