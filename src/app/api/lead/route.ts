import { arkaConfig, arkaEnabled } from "@/lib/chatbot/env";
import { leadSchema, sendLead } from "@/lib/chatbot/lead";
import { log } from "@/lib/chatbot/log";
import { allow, clientKey } from "@/lib/chatbot/rate-limit";

/**
 * POST /api/lead — an enquiry from the Arka widget, emailed to sales.
 *
 * Responds with JSON: { ok: true } or { ok: false, code, fields? }. Every
 * failure tells the widget to fall back to WhatsApp, so an email that does not
 * go out never silently loses someone who asked to be called.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PER_VISITOR = { limit: 5, windowMs: 60 * 60_000 };

function json(requestId: string, status: number, body: object): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store", "x-request-id": requestId },
  });
}

export async function POST(request: Request): Promise<Response> {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  // Switched off: as if the route did not exist. See ARKA_ENABLED.
  if (!arkaEnabled()) {
    log("info", "lead.disabled", { requestId });
    return json(requestId, 404, { ok: false, code: "disabled" });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    log("warn", "lead.invalid", { requestId, reason: "json" });
    return json(requestId, 400, { ok: false, code: "invalid" });
  }

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    // Field names and our own messages only — never the submitted values.
    const fields = Object.fromEntries(
      parsed.error.issues.map((i) => [String(i.path[0] ?? "form"), i.message]),
    );
    // A filled honeypot is a bot. Tell it nothing useful.
    if ("website" in fields) {
      log("warn", "lead.honeypot", { requestId });
      return json(requestId, 200, { ok: true });
    }
    log("info", "lead.invalid", { requestId, fields: Object.keys(fields) });
    return json(requestId, 422, { ok: false, code: "invalid", fields });
  }
  const lead = parsed.data;

  if (!allow(`lead:${clientKey(request.headers)}`, PER_VISITOR.limit, PER_VISITOR.windowMs)) {
    log("warn", "lead.limited", { requestId, conversationId: lead.conversationId });
    return json(requestId, 429, { ok: false, code: "limited" });
  }

  const url = new URL(request.url);
  const result = await sendLead(arkaConfig(), lead, {
    origin: url.origin,
    userAgent: request.headers.get("user-agent"),
    receivedAt: new Date(),
  });

  log(result.ok ? "info" : "error", result.ok ? "lead.sent" : "lead.failed", {
    requestId,
    leadId: lead.leadId,
    conversationId: lead.conversationId,
    project: lead.project ?? null,
    page: lead.pagePath,
    code: result.ok ? null : result.code,
    emailId: result.ok ? result.emailId : null,
  });

  return result.ok
    ? json(requestId, 200, { ok: true })
    : json(requestId, result.code === "unconfigured" ? 503 : 502, {
        ok: false,
        code: result.code,
      });
}
