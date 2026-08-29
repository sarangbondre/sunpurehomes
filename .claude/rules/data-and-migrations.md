---
paths:
  - "**/migrations/**/*"
  - "**/models/**/*"
  - "**/entities/**/*"
  - "**/repositories/**/*"
  - "**/*.sql"
  - "database/**/*"
---

# Data, schema and migrations

## Schema

- Constraints live in the database: NOT NULL, foreign keys, unique indexes, check
  constraints. Application-only validation will be bypassed eventually.
- Explicit types: no `TEXT` for everything, no float for money, timestamps as
  `timestamptz` in UTC.
- Every table has a primary key, `created_at`, and `updated_at`. Soft-delete only where
  the business needs history, and then filter it consistently.
- Tenant id on every multi-tenant table, indexed, and part of every unique constraint.
- Name things consistently: `snake_case`, singular column names, `<table>_id` for FKs.

## Migrations

- **Expand / migrate / contract**, always, in separate deploys:
  1. Add the new nullable column or table (backwards compatible)
  2. Dual-write and backfill in batches
  3. Switch reads
  4. Stop writing the old field
  5. Drop it, in a later release
- Every migration is reversible or explicitly documents why it isn't.
- No long-held locks: create indexes concurrently, avoid table rewrites on large tables,
  backfill in bounded batches with sleeps, never in the migration transaction itself.
- Migrations never contain business logic and never call application code.
- Test migrations against a production-sized copy before release.

## Access

- Repository/DAO layer owns all queries. No ORM queries inside controllers or domain
  objects.
- Transactions are explicit, short, and never span an external network call.
- Set an isolation level deliberately when correctness depends on it; document why.
- Use optimistic locking (version column) for concurrent edits; pessimistic locks need a
  timeout and a documented lock order.
- Read replicas for read-heavy paths only where replication lag is tolerable — state the
  tolerance in a comment.

## Governance

- Classify every column: public / internal / confidential / PII. PII columns are
  encrypted or tokenised and excluded from non-production copies.
- Non-production environments use masked or synthetic data. Never a raw production dump.
- Define a retention period per dataset and implement the deletion job, including the
  right-to-erasure path.
- Backups are automated, encrypted, and **restore-tested** on a schedule. An untested
  backup is not a backup.
