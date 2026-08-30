---
paths:
  - "**/llm/**/*"
  - "**/ai/**/*"
  - "**/agents/**/*"
  - "**/prompts/**/*"
  - "**/*prompt*.{py,ts,js,php,md,yaml,yml}"
  - "**/rag/**/*"
  - "**/evals/**/*"
---

# AI and LLM systems

Treat the model as an unreliable, non-deterministic, expensive network dependency that
returns untrusted data.

## Structure

- Prompts are versioned artifacts in the repo (or a registry), never inline string
  literals scattered through handlers. Each has an id, version, owner, and changelog.
- One port for model access (`LLMClient`); providers are adapters behind it. Business
  logic never imports a vendor SDK — this is what makes a model swap or a router change
  a one-line config decision.
- Model choice, temperature, max tokens, and timeouts are config, not hardcoded.
- Separate the retrieval layer, the prompt assembly layer, and the orchestration layer so
  each can be tested and evaluated independently.

## Correctness

- **No feature ships without an eval set.** A golden dataset of inputs plus graded
  expected behaviour, run in CI. Regressions block the merge the same way a failing unit
  test does.
- Track quality metrics per prompt version: accuracy/pass rate, refusal rate, hallucinated
  citation rate, and task-specific business metrics.
- Require structured output (JSON schema / tool calls) wherever the output is consumed by
  code, and **validate it** — schema validation, range checks, referential checks against
  your own data. Never `eval` or trust a model-produced identifier, URL, SQL, or path.
- Define the fallback for invalid output: repair prompt (bounded attempts), then a
  deterministic fallback, then a clean user-facing failure.
- Log prompt id + version, model, token counts, latency, and cost per call.

## Cost, latency, caching

- Every AI feature has an explicit budget: p95 latency target and cost per request/tenant.
  Alert on breach and on anomalous spend.
- Cache aggressively and deliberately: exact-match and semantic caches with a stated
  similarity threshold, TTL, and tenant-scoped keys. Cache keys include the prompt
  version and model — never serve output from a superseded prompt.
- Route to the cheapest model that passes the eval bar for that task; measure, don't
  assume. Record which model served each request for later analysis.
- Stream responses for anything user-facing over ~1 second.
- Rate limit and quota per tenant. Set a hard spend ceiling with automatic cutoff.

## Security (OWASP Top 10 for LLM Applications)

- **Model output is untrusted input.** It never becomes a shell command, SQL query, file
  path, or HTTP target without validation against an allowlist.
- **Prompt injection is assumed, not prevented.** Any retrieved document, web page, email,
  or user file may contain instructions. Mitigate with privilege separation, not clever
  prompting: the agent's tools are scoped to what the *user* is allowed to do, and
  irreversible actions require explicit human confirmation.
- Isolate system instructions from user content structurally; never concatenate untrusted
  text into the system role.
- Redact PII and secrets before they reach a third-party model. Document what data leaves
  your boundary, to which vendor, in which region, and with what retention.
- Enforce tenant isolation in retrieval: every vector/document query is filtered by tenant
  and by the caller's document-level permissions before the model sees anything.
- Guardrail both directions — input classification and output moderation — with the
  decision logged.

## Agents specifically

- Every tool has a typed schema, an authz check, and a documented blast radius.
- Bound the loop: max steps, max wall-clock, max spend per task. No unbounded agent runs.
- Full trace of every step (thought, tool call, arguments, result) for replay and audit.
- Destructive or externally visible actions (send, publish, pay, delete) require explicit
  confirmation unless pre-authorised for that specific action type.
- Human-in-the-loop escalation path for low-confidence outcomes, and a metric on how often
  it triggers.
