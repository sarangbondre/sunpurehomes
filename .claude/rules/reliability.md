# Reliability and resilience

Applies to all source files. Assume every dependency will be slow, then unavailable.

## Every remote call

Each outbound call (HTTP, DB, cache, queue, LLM) must specify, explicitly and in code:

1. **Timeout** — connect and read, set below the caller's own budget. Never rely on a
   library default.
2. **Retry policy** — only for retryable errors (timeouts, 429, 5xx, connection reset).
   Never retry a non-idempotent write without an idempotency key. Exponential backoff
   with full jitter, capped attempts, and a total time budget.
3. **Failure behaviour** — fail fast, degrade, use a cached/default value, or queue for
   later. Choose deliberately and document it.

## Patterns

- **Circuit breaker** on any dependency that can brown out: open on error-rate threshold,
  half-open probe, and a metric per state transition.
- **Bulkheads** — separate connection pools/thread pools per dependency so one slow
  downstream can't exhaust the whole service.
- **Timeout budget** — a request's total budget is divided among its hops; propagate the
  remaining deadline. A downstream call must never have a longer timeout than its caller.
- **Backpressure** — bounded queues and bounded concurrency. Shed load with 429/503 and
  `Retry-After` rather than accepting work you can't complete.
- **Idempotency** — every mutating public endpoint accepts an idempotency key and stores
  the result keyed by it. Every queue consumer dedupes on event id.
- **Graceful degradation** — define which features are load-shedable. A failure in a
  non-critical path (recommendations, enrichment, analytics) must never fail the request.

## Lifecycle

- Health endpoints: `/livez` (is the process healthy) and `/readyz` (can it serve, are
  dependencies reachable). Readiness failure removes from the load balancer; liveness
  failure restarts. Don't conflate them.
- Graceful shutdown: stop accepting new work, drain in-flight with a deadline, commit
  offsets, close pools.
- Startup must not require dependencies to be up in a specific order; retry and report.
- Set explicit resource limits (memory, connections, goroutines/workers) and alert on
  saturation, not just failure.

## Data safety

- Long-running jobs are resumable and checkpointed; never "restart from the top".
- Batch jobs are idempotent and safe to run twice.
- Anything that deletes or bulk-mutates data runs in dry-run mode first and logs a
  reversible record of what it will change.

## Capacity and performance

- Know the expected QPS, payload size, and p99 target for every new endpoint before
  building it.
- No unbounded queries: every list query is paginated and has a max limit.
- No N+1 queries; batch or join. Verify with query logs under a realistic dataset, not 10 rows.
- Index any column used in a WHERE, JOIN, or ORDER BY on a table expected to exceed
  ~100k rows. Check the query plan.
- Load test any change to a hot path before release.
