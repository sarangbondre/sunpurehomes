# Engineering Guardrails

<!-- Keep this file under ~200 lines. Detailed standards live in .claude/rules/ and load
     only when Claude touches matching files. Edit the PROJECT CONTEXT section per repo. -->

## Project context

- **Product**: <one line — what this system does and for whom>
- **Runtime**: <e.g. Python 3.12 / FastAPI, PHP 8.3 / Laravel>
- **Datastores**: <e.g. PostgreSQL 16 (primary), Redis 7 (cache + locks), Kafka (events)>
- **Deploy target**: <e.g. AWS ECS Fargate, ap-south-1, Terraform-managed>
- **Layout**: <e.g. `src/api` handlers, `src/domain` business logic, `src/adapters` I/O>

## Commands

```
install:  <cmd>
run:      <cmd>
test:     <cmd>
lint:     <cmd>
typecheck:<cmd>
migrate:  <cmd>
```

Run `lint` and `typecheck` before declaring any task complete. Never skip a failing test
to make a task pass — fix it or stop and report.

## Non-negotiables

These apply to every change, in every file, without exception.

1. **Read before you write.** Never invent a function, config key, env var, table, or
   library API. Grep the codebase and confirm it exists. If it doesn't, say so.
2. **No secrets anywhere.** Not in source, fixtures, logs, error messages, prompts,
   commit messages, or test data. Config comes from environment or the secret manager.
3. **Every I/O boundary has a timeout.** Every HTTP call, DB query, queue consume, and
   LLM call gets an explicit timeout plus a defined failure behaviour. No unbounded waits.
4. **Every request carries a correlation ID** propagated through logs, traces, and
   downstream calls.
5. **Contracts change additively.** HTTP responses, event payloads, and DB columns are
   append-only by default. Removals and renames require a version and a deprecation window.
6. **All input from outside the process is untrusted** — HTTP bodies, query params, queue
   messages, third-party responses, file uploads, and LLM output. Validate at the edge
   against an explicit schema.
7. **Nothing ships without a rollback path.** Migrations reverse, flags toggle off,
   deploys roll back.
8. **Stay in scope.** Don't refactor, reformat, upgrade dependencies, or "clean up" code
   outside the task. Note the issue and move on.

## Working agreement

- **Plan first** for anything touching more than two files, any public contract, any
  migration, or any auth/security path. Present the plan and wait for approval.
- **Vertical slices.** A change should be shippable on its own: schema + logic + API +
  tests + telemetry, not a layer at a time.
- **Ask before adding** a new dependency, service, datastore, queue, or cloud resource.
  State what it costs (money, ops burden, failure modes) and what it replaces.
- **Prefer deletion.** Removing code, config, or a dependency is a valid solution and the
  preferred one when it works.
- **Match the codebase**, not your defaults. Follow the patterns, naming, and error
  handling already in use. If they're inconsistent, follow the newest module and say so.
- **Surface uncertainty.** If two designs are defensible, present both with tradeoffs
  instead of silently picking one.

## Definition of done

A change is not complete until all of these are true:

- [ ] Behaviour covered by tests at the right level (see `rules/testing.md`)
- [ ] `lint` and `typecheck` pass; no new warnings suppressed
- [ ] Errors handled explicitly — no bare catch-and-continue, no swallowed exceptions
- [ ] Structured logs at boundaries; metrics for rate, errors, duration
- [ ] Input validated; authz checked on every new endpoint or handler
- [ ] Migration is expand/contract and reversible
- [ ] Public contract change is versioned and documented
- [ ] Config is externalised; no hardcoded URLs, IDs, limits, or credentials
- [ ] Docs/ADR updated if a decision was made that a future reader would question

## Stop and ask

Halt and get a human decision before:

- Changing authentication, authorisation, encryption, or session handling
- Dropping or renaming a column, table, topic, or API field
- Deleting data, or writing a script that does
- Touching payment, billing, or PII-handling code
- Modifying CI/CD, IaC, or IAM policy
- Anything where the blast radius is unclear to you

## Detailed standards

Topic rules live in `.claude/rules/` and load automatically — globally or when matching
files are opened:

| File | Covers |
| --- | --- |
| `code-quality.md` | SOLID, DIP, functions, errors, naming |
| `architecture.md` | Boundaries, services, coupling, events, data ownership |
| `security.md` | AuthN/Z, input, secrets, supply chain, OWASP |
| `reliability.md` | Timeouts, retries, circuit breakers, backpressure, idempotency |
| `observability.md` | Logs, metrics, traces, SLOs, alerting |
| `api-contracts.md` | REST/gRPC design, versioning, errors, pagination |
| `data-and-migrations.md` | Schema, migrations, transactions, PII, retention |
| `testing.md` | Test pyramid, contract tests, fixtures, what not to mock |
| `delivery-and-infra.md` | CI/CD, IaC, config, feature flags, releases |
| `ai-llm.md` | Prompts, evals, cost/latency budgets, LLM-specific security |
