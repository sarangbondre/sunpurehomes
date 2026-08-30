# Security

Applies to all source files. When in doubt, stop and ask — do not guess at a security control.

## Authentication and authorisation

- Authenticate at the edge; **authorise in the service**. Never trust a gateway header
  alone as proof of identity.
- Every endpoint, handler, and consumer declares its authz requirement explicitly.
  Deny by default — a missing rule means deny, not allow.
- Check object-level permission on every read and write, not just the route
  (broken object-level authorisation is the most common real breach).
- Tokens: short-lived access tokens, rotating refresh tokens, verified signature,
  issuer, audience, and expiry. Never accept `alg: none`. Never decode without verifying.
- Service-to-service auth uses mTLS or signed short-lived tokens, never a shared static
  API key in an env var that never rotates.
- Sessions invalidate server-side on logout and password change.

## Input and output

- Validate every external input against an explicit schema (type, range, length, format)
  at the boundary. Reject unknown fields rather than ignoring them.
- Parameterised queries only. String-built SQL is a blocker, including in migrations,
  admin scripts, and reporting code.
- Encode on output per context: HTML escaping, JSON encoding, shell quoting. Never build
  a shell command from user input; use argument arrays.
- File uploads: validate content type by inspection not extension, cap size, store
  outside the web root, generate the stored filename yourself.
- Block SSRF: no outbound request to a user-supplied URL without an allowlist, DNS
  resolution check, and redirect limits.
- Deserialisation of untrusted data uses safe loaders only (`yaml.safe_load`, no pickle).

## Secrets and data

- Secrets come from a secret manager or injected env; never in code, config files in git,
  Dockerfiles, CI logs, or fixtures. Add a secret scanner to pre-commit and CI.
- Rotate credentials on a schedule; code must tolerate rotation without a restart where
  possible.
- Classify data: public / internal / confidential / PII. PII is encrypted at rest, masked
  in logs and error messages, and excluded from analytics exports unless approved.
- TLS everywhere, including internal hops. No plaintext between services.
- Hash passwords with argon2id or bcrypt — never SHA/MD5, never a homegrown scheme.
- Use the platform's crypto library. Never implement or tune a cipher yourself.

## Platform and supply chain

- Least privilege on every IAM role, DB user, and queue policy. No wildcard resources,
  no long-lived admin keys.
- Pin dependencies with a lockfile; run SCA (dependency vulnerability scanning) and SAST
  in CI and fail the build on high/critical.
- Containers: non-root user, read-only filesystem where possible, minimal base image, no
  build tools in the runtime image.
- Rate limit and quota every public endpoint; per-tenant, not just global.
- Security headers on web responses: HSTS, CSP, X-Content-Type-Options, frame-ancestors.
- Audit-log every privileged action: who, what, when, from where, and the outcome.
  Audit logs are append-only and separate from application logs.

## Practices

- Threat-model any new externally reachable surface: what an attacker gains, what they
  could tamper with, what they could exhaust.
- Reference OWASP Top 10 and ASVS for web surfaces, and the OWASP Top 10 for LLM
  Applications for anything model-facing (see `ai-llm.md`).
- Never log: credentials, tokens, full card numbers, government IDs, session cookies,
  raw request bodies from auth endpoints.
