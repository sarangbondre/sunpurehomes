# Observability and monitoring

Applies to all source files. If you can't answer "is it working, and if not where" from
telemetry alone, the change isn't done.

## The three signals

Instrument with OpenTelemetry as the vendor-neutral layer; export to whatever backend the
platform uses. Don't scatter vendor SDK calls through business logic — wrap them.

### Logs

- **Structured JSON only.** No `print`, no string-concatenated messages, no multi-line
  stack traces as the primary signal.
- Every line carries: timestamp, level, service, version, environment, `trace_id`,
  `span_id`, `correlation_id`, `tenant_id`, `user_id` (pseudonymous).
- Levels mean something: ERROR = a human must act; WARN = degraded but handled; INFO =
  business-significant events; DEBUG = off in production.
- Log at boundaries (request in, call out, event consumed/published) plus decision points.
  Don't log inside tight loops.
- Never log secrets, tokens, PII values, or full request bodies. Redact at the logger, not
  at each call site.
- One log line per event with fields — not five lines that must be correlated by eye.

### Metrics

- **RED for every service**: Rate, Errors, Duration (histogram, not average) per endpoint
  and per consumer.
- **USE for every resource**: Utilisation, Saturation, Errors for CPU, memory, connection
  pools, queues, thread pools.
- Business metrics alongside technical ones: orders placed, messages processed, cache hit
  ratio, queue lag, retries, circuit-breaker state.
- **Watch cardinality.** Never use user id, request id, email, URL with ids, or raw error
  message as a label. Bounded label sets only.
- Use histograms for latency and report p50/p95/p99. Averages hide the failure.

### Traces

- Trace every request end to end, including async hops — propagate W3C `traceparent`
  through HTTP headers *and* message headers.
- Span per meaningful unit of work with attributes for the key identifiers and the
  outcome. Record exceptions on the span.
- Sample intelligently: keep all errors and slow requests, sample the rest.

## SLOs and alerting

- Every user-facing service has an SLO (availability and latency) with an error budget.
- **Alert on symptoms, not causes** — burn rate against SLO, not "CPU > 80%".
- Every alert is actionable and links to a runbook with: what it means, how to confirm,
  how to mitigate, how to escalate. An alert nobody acts on gets deleted.
- Multi-window burn-rate alerts (fast burn pages, slow burn tickets) to avoid noise.
- Dashboard per service: RED, saturation, dependency health, deploy markers.

## Operational hygiene

- Correlation id is generated at the edge if absent and returned to the client in the
  response header.
- Deploys emit an event visible on dashboards so regressions are attributable.
- Post-incident: blameless review, and every action item becomes a ticket. Add the missing
  signal that made the incident hard to diagnose.
