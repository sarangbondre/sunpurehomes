# Setup: installing these guardrails in Claude Code

## Why it's split into files

Claude Code loads `CLAUDE.md` into context at the start of **every** session. Anthropic's
guidance is to keep each file under ~200 lines, because longer files burn context and
adherence drops. A single 700-line standards document is the most common way teams get
worse results, not better.

So this bundle splits into two layers:

- **`CLAUDE.md`** — short, always loaded, only the rules that apply to literally every change.
- **`.claude/rules/*.md`** — topic files. Rules with a `paths:` frontmatter block load
  **only when Claude opens a matching file**, so the API rules aren't in context while
  you're editing Terraform.

Of the ten rule files, five load unconditionally (code quality, architecture, security,
reliability, observability) and five are path-scoped. If context starts feeling tight, add
`paths:` frontmatter to the unconditional ones too — scope them to `src/**` and `app/**`.

## 1. Install per repository

```bash
cd <your-repo>

cp /path/to/engineering-guardrails/CLAUDE.md ./CLAUDE.md
mkdir -p .claude/rules
cp /path/to/engineering-guardrails/rules/*.md .claude/rules/

git add CLAUDE.md .claude/rules
git commit -m "chore: add engineering guardrails for Claude Code"
```

Commit them. The whole point is that every engineer's Claude reads the same standards.

Then fill in the **Project context** and **Commands** sections at the top of `CLAUDE.md`.
Generic rules are worth maybe half of what stack-specific ones are worth — "run
`poetry run pytest -x`" beats "run the tests".

Two shortcuts worth knowing:

- `/init` generates a starting `CLAUDE.md` from your codebase — build commands, test
  commands, conventions it discovers. If one already exists it suggests improvements
  instead of overwriting. Useful for filling in the placeholders.
- `/doctor` proposes trims for a checked-in `CLAUDE.md`: it cuts what Claude can derive
  from the code anyway (directory layouts, dependency lists) and keeps the conventions and
  pitfalls. Run it after a few weeks of accretion.

## 2. Verify it actually loaded

```
/context     # lists the memory files loaded in this session
/memory      # browse and edit them
```

If a file isn't in `/context`, Claude cannot see it. This is the first thing to check when
a rule seems ignored.

## 3. Layer it correctly

Files are concatenated from broadest to most specific, so more specific wins on conflict:

| Scope | Location | Put here |
| --- | --- | --- |
| Org-wide | `/etc/claude-code/CLAUDE.md` (Linux/WSL), `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS) | Company security policy, compliance rules. Cannot be excluded by individuals — deploy via MDM/Ansible. |
| Personal, all projects | `~/.claude/CLAUDE.md`, `~/.claude/rules/` | Your own preferences: review style, how you like plans presented |
| Project (shared) | `./CLAUDE.md`, `./.claude/rules/` | **This bundle** |
| Personal, this project | `./CLAUDE.local.md` (gitignore it) | Your sandbox URLs, local test data |

For a monorepo: root `CLAUDE.md` holds the shared standards, and each service gets its own
nested `CLAUDE.md` with service-specific context. Nested files load on demand when Claude
reads files in that subtree.

To share one rule set across several repos without copy-paste drift, symlink it — the
`.claude/rules/` directory supports symlinks:

```bash
ln -s ~/company-standards/rules .claude/rules/shared
```

## 4. Make the critical ones enforced, not suggested

This is the part most teams skip, and it's what separates a guardrail from a wish.

CLAUDE.md is **context, not configuration**. Claude reads it and tries to follow it, but
there's no guarantee of compliance. For anything that must hold regardless of what Claude
decides, use the enforcement layers:

- **Hooks** (`.claude/settings.json`) — shell commands that run at fixed lifecycle events
  and apply no matter what. A `PreToolUse` hook can block an action outright; a
  `PostToolUse` hook can run your formatter and linter after every edit, so "run lint
  before done" stops being a rule Claude might forget.
- **`permissions.deny`** in settings — hard-block tools, commands, or paths (production
  credentials, `terraform apply`, `.env`).
- **CI** — the real backstop. Import-linter for the DIP layering rule, secret scanning,
  SAST, contract-compatibility checks, coverage thresholds. A rule that isn't checked in CI
  will decay whether a human or a model wrote the code.

Rule of thumb: **CLAUDE.md for judgement, hooks and CI for the non-negotiables.**

## 5. Adopt in order

Adding all ten files to a legacy codebase on day one produces a lot of noise, because
Claude will keep flagging pre-existing violations. Suggested sequence:

1. **Week 1** — `CLAUDE.md` + `security.md` + `code-quality.md`. Highest value, least
   friction.
2. **Week 2** — `reliability.md` + `observability.md`. Then add a `PostToolUse` lint hook.
3. **Week 3** — the path-scoped four (`api-contracts`, `data-and-migrations`, `testing`,
   `delivery-and-infra`).
4. **Week 4** — `architecture.md` and `ai-llm.md`, plus the CI enforcement for layering.

Add a line to `CLAUDE.md` while you're mid-adoption: *"This codebase predates these
standards. Apply them to new and modified code; do not refactor untouched code to comply."*

## 6. Keep it alive

- When a code review catches something Claude should have known, that's the signal to add
  a line. When you type the same correction twice, add a line.
- Conflicting rules are worse than missing ones — if two files disagree, Claude may pick
  either. Review quarterly and delete what's stale.
- Watch for rules nobody follows. A standard the team routinely overrides should be
  changed or deleted, not left in to be ignored.

## Reference

- Memory and CLAUDE.md: https://code.claude.com/docs/en/memory
- Hooks: https://code.claude.com/docs/en/hooks-guide
- Settings: https://code.claude.com/docs/en/settings
- Skills (for repeatable multi-step workflows that shouldn't sit in context): https://code.claude.com/docs/en/skills
