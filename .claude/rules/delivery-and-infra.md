---
paths:
  - ".github/**/*"
  - ".gitlab-ci.yml"
  - "**/*.tf"
  - "**/Dockerfile*"
  - "**/docker-compose*.{yml,yaml}"
  - "**/k8s/**/*"
  - "**/helm/**/*"
  - "infra/**/*"
  - "deploy/**/*"
---

# Delivery, config and infrastructure

## Twelve-factor baseline

- Config from environment; one codebase, many deploys. No `if env == "prod"` branches in
  business logic.
- Strict dev/prod parity: same image, same dependency versions, same backing service
  types. Differences are config only.
- Processes are stateless and disposable; state lives in the datastore or object storage.
- Logs go to stdout as a stream; the platform handles shipping and rotation.
- Admin tasks run as one-off processes from the same image, not by SSHing to a box.

## Pipeline

Every commit runs, and the build fails on any of them:

1. Lint + format check
2. Type check
3. Unit tests
4. Integration tests
5. SAST + dependency vulnerability scan + secret scan
6. Build image, generate SBOM, sign it
7. Contract/schema compatibility check

- Trunk-based with short-lived branches. Anything unfinished sits behind a feature flag,
  not a long-lived branch.
- Builds are reproducible and artifacts immutable — promote the same image through
  environments; never rebuild per environment.
- Deploy progressively: canary or blue/green with automated rollback triggered by SLO
  burn, not by someone watching a dashboard.
- Migrations run as a separate, verified step before the app deploy, and are backwards
  compatible with the running version.

## Infrastructure

- All infrastructure is code and version controlled. No console changes — drift detection
  runs on a schedule and reports.
- Terraform: remote state with locking, environments separated by workspace or directory,
  modules versioned, `plan` reviewed in the PR.
- Least-privilege IAM per service. No shared roles, no wildcard actions or resources.
- Everything is tagged: owner, service, environment, cost centre.
- Set resource requests/limits and autoscaling policy explicitly; unbounded scaling is a
  billing incident waiting to happen.
- Network default-deny; open only the paths that are needed, and document why.

## Release discipline

- Every deploy is traceable to a commit and visible on dashboards.
- Feature flags: owner, default value, and an expiry date. Stale flags are removed —
  treat them as tech debt with a ticket.
- Runbook and rollback procedure exist before the first production deploy, not after the
  first incident.
- Cost is a design constraint: state the expected monthly cost of new infrastructure in
  the PR description.
