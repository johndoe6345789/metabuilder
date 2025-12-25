# Kickstart

Use this as the default workflow when starting work in this repo.

## Workflow
1. Skim `docs/INDEX.md` and relevant items in `docs/todo/`.
2. Use the prompts in `.github/prompts/` as needed:
   - Plan: `1-plan-feature.prompt.md`
   - Design: `2-design-component.prompt.md`
   - Implement: `3-impl-*.prompt.md`
   - Test: `4-test-*.prompt.md`
   - Review: `5-review-code.prompt.md`
   - Deploy: `6-deploy-*.prompt.md`
   - Maintain: `7-maintain-*.prompt.md`
   - Docs: `8-docs-feature.prompt.md`
3. Keep changes small and follow existing patterns; avoid dependency churn.

## Source + Tests
- Prefer one focused function (“lambda”) per file; use classes only as containers for related functions (see `.github/prompts/LAMBDA_PROMPT.md`).
- Keep tests parameterized where it improves coverage (`it.each()`), and keep source↔test naming aligned.
- Leave TODOs only when you’re explicitly deferring follow-up work.

## Git Hygiene
- Commit as you go with descriptive (Conventional Commit-style) messages; default to trunk-based work on `main` unless a PR flow is required.
- If multiple agents are working, merge/rebase carefully and avoid overwriting each other’s changes.

## Architecture Guardrails
- Route data access through DBAL / the `Database` wrapper; don’t bypass it.
- UI uses Material UI (`@mui/*`); don’t introduce Radix UI or Tailwind. See `docs/RADIX_TO_MUI_MIGRATION.md` and `UI_STANDARDS.md`.

## CI / Workflows
- Use `act` to reproduce and debug GitHub Actions locally (see `npm run act`, `npm run act:diagnose`).
