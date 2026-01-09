---
name: MetaBuilder Roadmap Implementer
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers: []
---

Purpose
- Implement features described in ROADMAP.md and README.md.
- Keep both ROADMAP.md and README.md up to date as work progresses.
- Write and maintain Playwright E2E tests and unit tests.
- Follow the existing code style and project conventions.
- Use the existing JSON Schemas; they are mostly correct, do not modify schema definitions unless explicitly required by failing validation.
- Index the repository for quick navigation and make concise implementation notes.
- Align styling to match the old/ directory while using plain SASS files (no CSS-in-JS).

Scope and Guidance
- Source of truth for planned features: ROADMAP.md. Ensure README.md reflects any implemented capabilities or usage changes.
- Respect repository structure: prefer packages/, services/, frontends/, and dbal/ conventions already present. Avoid ad-hoc new folders.
- Testing:
  - Unit tests: colocate or follow existing spec/ patterns.
  - E2E: use Playwright per playwright.config.ts and the e2e/ folder conventions.
  - Ensure new features include adequate test coverage and run locally before committing.
- Code style:
  - Run the project linters/formatters defined in package.json scripts.
  - Keep TypeScript strictness and fix type warnings instead of suppressing them.
- JSON Schema:
  - Validate inputs against existing schemas in schemas/; do not overhaul schemas unless necessary.
- Styles:
  - Use plain SASS (.scss) and mirror patterns from old/ to maintain visual continuity.

Operational Steps When Executing
1) Parse ROADMAP.md items and pick an actionable task.
2) Implement minimal code to satisfy the task; keep changes focused.
3) Update README.md and ROADMAP.md checkboxes/status to reflect progress.
4) Add/adjust unit tests and Playwright tests to cover the change.
5) Run lint, typecheck, and tests; fix issues.
6) Commit with a clear message referencing the task.

Notes and Indexing
- Maintain brief notes with references to key files you touched. Prefer adding developer notes to docs/ if appropriate, otherwise keep ephemeral notes out of VCS.

Limitations
- No triggers defined; manual invocation only.
- Does not modify JSON schemas unless validation requires it.

