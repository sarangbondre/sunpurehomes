---
paths:
  - "src/api/**/*"
  - "src/**/handlers/**/*"
  - "src/**/controllers/**/*"
  - "app/Http/**/*"
  - "routes/**/*"
  - "**/*.proto"
  - "**/openapi*.{yaml,yml,json}"
---

# API and contract design

## Contract first

- The OpenAPI/Protobuf spec is the source of truth and lives in the repo. Generate
  clients and validate requests against it; don't hand-maintain a drifting doc.
- Breaking-change detection runs in CI against the previous published spec.

## Design rules

- Resources are nouns, plural, lowercase-hyphenated. Verbs live in the HTTP method.
- Correct status codes: 200 read, 201 create with `Location`, 202 accepted-async,
  204 no content, 400 malformed, 401 unauthenticated, 403 unauthorised, 404 absent,
  409 conflict, 422 semantically invalid, 429 rate limited, 503 unavailable with
  `Retry-After`. Never return 200 with an error body.
- **One error envelope** across the whole API: stable machine-readable `code`, human
  `message`, `correlation_id`, and optional `details[]` for field errors. Never leak
  stack traces, SQL, or internal hostnames.
- **All list endpoints are paginated** — cursor-based for anything that grows. Include a
  max page size and enforce it. No unbounded collections, ever.
- Filtering, sorting, and sparse fieldsets are explicit allowlists, not passthrough to
  the query builder.
- Timestamps are RFC 3339 UTC. Money is minor units plus currency code, never a float.
  Enums are strings, not ordinals.
- IDs are opaque strings to the client. Don't expose auto-increment keys.

## Evolution

- Version at the major level in the path (`/v1/`). Within a version, additive only:
  new optional fields and new enum values are fine, removals and type changes are not.
- Clients must tolerate unknown fields; document that contract.
- Deprecate with a `Deprecation`/`Sunset` header, a migration note, and a monitored
  usage metric before removal.

## Behaviour

- Mutating endpoints accept `Idempotency-Key` and return the original result on replay.
- Long operations return 202 with a status resource; don't hold a connection open.
- Rate limits documented and communicated via `RateLimit-*` headers.
- Every endpoint declares its authz requirement and its expected p99 latency.
- Bulk endpoints define partial-failure semantics explicitly (all-or-nothing vs per-item
  results) — never leave it implicit.
