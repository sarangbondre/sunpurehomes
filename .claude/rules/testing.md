---
paths:
  - "**/tests/**/*"
  - "**/test/**/*"
  - "**/*_test.*"
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/conftest.py"
---

# Testing

## Shape

- **Pyramid, not ice cream cone**: many fast unit tests on domain logic, a moderate layer
  of integration tests against real infrastructure (Testcontainers/docker-compose — real
  Postgres, real Redis), few end-to-end tests on critical journeys only.
- Unit tests cover business rules and edge cases with no I/O. If a "unit" test needs a
  database, the design has an inverted dependency — fix the design.
- Integration tests cover the adapters: repository queries, queue consumers, HTTP clients
  against a stub server.
- Contract tests between services so a producer can't break a consumer silently.

## Rules

- **Test behaviour, not implementation.** A refactor that preserves behaviour must not
  break tests. Don't assert on private methods or call counts unless the interaction *is*
  the requirement.
- One reason to fail per test. Arrange-Act-Assert, visibly separated.
- Test names state the scenario and expectation: `rejects_order_when_stock_is_zero`.
- **Don't mock what you don't own.** Wrap the vendor SDK in your own port and fake the
  port; test the real adapter separately.
- No shared mutable fixtures between tests. Each test builds its own data via builders or
  factories, and cleans up.
- Deterministic: inject the clock and the random source. No `sleep` — poll with a timeout.
  A flaky test is quarantined and fixed, not re-run.
- Every bug fix starts with a failing regression test.

## Coverage and beyond

- Coverage is a floor, not a goal. Aim high on domain logic, ignore generated code and
  DTOs. Don't write assertion-free tests to move the number.
- Property-based tests for parsers, validators, pricing, and anything with invariants.
- Load/soak tests for hot paths; chaos or fault injection on critical dependencies
  (kill the DB, add 2s latency) to verify timeouts and breakers actually work.
- Security tests: authz denial cases for every protected endpoint — the missing negative
  test is how authz bugs ship.
- Test the failure paths as thoroughly as the happy path: timeout, retry exhaustion,
  duplicate delivery, partial write.
