# Architecture and service boundaries

Applies to all source files.

## Layering

Use ports and adapters (hexagonal). Enforce the dependency rule: dependencies point
inward, toward the domain.

```
adapters (http, db, queue, vendor SDKs)  ->  application (use cases)  ->  domain (rules)
```

- `domain/` — entities, value objects, business rules. Zero framework or vendor imports.
- `application/` — use cases orchestrating domain objects; depends on ports (interfaces)
  it defines itself.
- `adapters/` — implements ports: repositories, HTTP clients, queue consumers, controllers.
- Composition root wires concrete adapters to ports at startup. This is the only place
  that knows about both.
- Enforce with an import-linter / dependency-cruiser rule in CI, not just convention.

## Service decomposition

- **Default to a modular monolith.** Extract a service only for an independent scaling
  profile, an independent release cadence, a hard isolation requirement, or a separate
  team's ownership. "It feels cleaner" is not a reason.
- One service = one bounded context = one team owner. Named in a service catalogue with
  owner, on-call, SLO, and runbook.
- **No shared database.** A service owns its schema exclusively. Cross-service reads go
  through an API or a replicated read model, never a direct table read.
- **No distributed transactions.** Use sagas with compensating actions, or the outbox
  pattern for atomic state-change-plus-publish.
- Prefer async events for cross-context communication; use synchronous calls only when
  the caller genuinely needs the result to respond. Every sync hop adds its latency and
  its failure probability to yours.
- Avoid chatty call chains. If A must call B must call C to serve one request, the
  boundaries are wrong.

## Events and messaging

- Events are facts in past tense (`OrderPlaced`), not commands. They describe what
  happened, not what the consumer should do.
- Schemas are explicit and versioned (Avro/Protobuf/JSON Schema) in a registry;
  compatibility is enforced in CI. Additive changes only.
- Every event carries: event id, event type + version, occurred-at, correlation id,
  producer, and tenant/partition key.
- **Consumers must be idempotent** — assume at-least-once delivery and duplicates.
- Partition key chosen for ordering guarantees you actually need; document it.
- Every consumer group has a dead letter queue plus an alert on DLQ depth and consumer lag.
- Poison messages are parked, not retried forever.

## State and coupling

- No shared mutable state between services except through owned APIs/events.
- Cache is an optimisation, never the source of truth. Every cache entry has a TTL and a
  documented invalidation path. Cache stampede protection on hot keys.
- Multi-tenancy: tenant id is part of every query, key, log line, and metric label.
  Isolation is enforced at the data-access layer, not in each handler.
- Feature flags decouple deploy from release; every flag has an owner and a removal date.

## Documenting decisions

- Any choice a future reader would question gets a short ADR in `docs/adr/` — context,
  options, decision, consequences. One page.
- Update the ADR when the decision is reversed; don't delete it.
