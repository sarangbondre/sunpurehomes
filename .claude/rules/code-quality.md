# Code quality and design

Applies to all source files.

## SOLID, applied concretely

- **SRP** — a class/module changes for one reason. If you can't name its job without
  "and", split it. Practical smell: a file importing both an HTTP client and an ORM model.
- **OCP** — extend behaviour by adding a type/handler/strategy, not by adding another
  branch to a growing `if/elif` on a type code. Third branch is the trigger to refactor.
- **LSP** — a subclass must not tighten preconditions, weaken postconditions, or throw
  new exception types the caller doesn't expect. If an override raises
  `NotImplementedError`, the hierarchy is wrong.
- **ISP** — many small interfaces over one fat one. Don't force implementers to stub
  methods they don't need.
- **DIP** — high-level policy must not import low-level detail. Domain code depends on an
  interface/protocol it owns; the adapter implements it. Concretely: `domain/` imports
  nothing from `adapters/`, `db/`, `http/`, or any vendor SDK. Dependencies are injected
  at the composition root (app startup), never constructed inside business logic.

## Other principles that earn their keep

- **Composition over inheritance.** Inheritance only for genuine is-a with shared
  invariants. Depth beyond two levels needs justification.
- **Law of Demeter.** No `a.b().c().d()` chains across module boundaries.
- **YAGNI.** No abstraction, config flag, or plugin point for a requirement that doesn't
  exist yet. Two concrete cases before you generalise.
- **DRY, carefully.** Duplicated *knowledge* is a bug; duplicated *code* that happens to
  look alike is fine. Don't couple two domains to share ten lines.
- **Command/query separation.** A function either changes state or returns a value.
- **Fail fast.** Validate at construction; make invalid states unrepresentable with value
  objects and enums rather than validating the same string in five places.

## Functions and modules

- Functions do one thing; extract when a comment is needed to explain a block.
- Max 3 positional params — beyond that pass a typed object.
- No boolean trap params (`process(order, True)`); use an enum or two functions.
- Pure functions for business rules; push I/O to the edges.
- No mutable module-level state, no singletons holding request state.
- Explicit is better than implicit: no metaprogramming or dynamic attribute magic in
  business logic.

## Errors

- Define domain exceptions; never leak vendor exceptions (`psycopg2.Error`, `HTTPError`)
  past an adapter boundary.
- Catch only what you can handle. `except Exception: pass` is never acceptable; if you
  must swallow, log with reason and increment a metric.
- Error messages state what failed, what was expected, and the identifier involved —
  never the credential or the PII value.
- Return typed results or raise; don't signal failure with `None`, `-1`, or empty string.

## Naming and comments

- Names say intent: `retry_after_seconds`, not `t` or `flag2`.
- No abbreviations beyond established domain terms; be consistent across the codebase.
- Comments explain *why*, never *what*. Delete commented-out code; git has it.
- No TODOs without a ticket reference.

## Concurrency

- No shared mutable state across threads/tasks without an explicit lock or queue.
- Every lock has a timeout and a documented ordering to prevent deadlock.
- Async code never blocks the event loop — no sync DB drivers or `time.sleep` inside
  coroutines.
