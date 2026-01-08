# Kickstart

Use this as the default workflow when starting work in this repo.

## Workflow
1. Skim `docs/START_HERE.md` (if new), `docs/INDEX.md`, and relevant items in `docs/todo/`.
2. Check for scoped rules in nested `AGENTS.md` files (e.g. `dbal/docs/AGENTS.md`) before editing those areas.
3. Use the prompts in `.github/prompts/` as needed:
   - Plan: `1-plan-feature.prompt.md`
   - Design: `2-design-component.prompt.md`
   - Implement: `3-impl-*.prompt.md`
   - Test: `4-test-*.prompt.md`
   - Review: `5-review-code.prompt.md`
   - Deploy: `6-deploy-*.prompt.md`
   - Maintain: `7-maintain-*.prompt.md`
   - Docs: `8-docs-feature.prompt.md`
4. Keep changes small and follow existing patterns; avoid dependency churn.

## Where Work Lives
- Next.js app: `frontends/nextjs/` (source in `src/`, E2E in `e2e/`, local scripts in `scripts/`).
- Component packages: `packages/` (seed JSON under `packages/*/seed/`, optional `static_content/`, schema checks in `packages/*/tests/`).
- DBAL: `dbal/` (TypeScript library in `dbal/development/`).
- Prisma schema/migrations: `prisma/` (`schema.prisma`, `migrations/`).
- Shared config: `config/` (symlinked into `frontends/nextjs/`).
- Repo utilities: `tools/` (quality checks, workflow helpers, code analysis).

## Common Commands
Run app workflows from `frontends/nextjs/`:
- Install: `npm ci` (or `npm install`)
- Dev: `npm run dev`
- Build/serve: `npm run build` / `npm run start`
- Lint: `npm run lint` / `npm run lint:fix`
- Typecheck: `npm run typecheck`
- Unit: `npm run test:unit` / `npm run test:coverage`
- Function coverage: `npm run test:check-functions`
- Coverage report: `npm run test:coverage:report`
- E2E: `npm run test:e2e`
- Prisma (schema in `prisma/schema.prisma`, config in `frontends/nextjs/prisma.config.ts`):
  - First-time setup: copy `.env.example` to `.env` (or ensure `DATABASE_URL` is set)
  - Commands: `npm run db:generate` / `npm run db:push` / `npm run db:migrate`
  - Validate: `npx prisma validate`
- Coverage output: `frontends/nextjs/coverage/`

DBAL workflows live in `dbal/development/` (`npm run build`, `npm run test:unit`).

## Source + Tests
- TypeScript + ESM. Prefer `@/…` imports inside `frontends/nextjs/src/`.
- React components: `PascalCase.tsx`; hooks: `useThing.ts`; tests: `*.test.ts(x)`.
- Unit tests: `frontends/nextjs/src/**/*.test.ts(x)` and `packages/*/tests/*.test.ts`; E2E: `frontends/nextjs/e2e/`.
- Prefer one focused function (“lambda”) per file; use classes only as containers for related functions (see `.github/prompts/LAMBDA_PROMPT.md`).
- Add/adjust tests with behavior changes; keep tests deterministic (no network, stable clocks/IDs), and parameterize where it improves coverage (`it.each()`); keep source↔test naming aligned.
- Leave TODOs only when you’re explicitly deferring follow-up work (and include the next step).

## Git Hygiene
- Commit as you go with descriptive (Conventional Commit-style) messages; default to trunk-based work on `main` unless a PR flow is required.
- If multiple agents are working, merge/rebase carefully and avoid overwriting each other’s changes.
- Before opening a PR, run `npm run lint`, `npm run typecheck`, and the relevant tests (from `frontends/nextjs/`).
- PRs should include: what/why, linked issue (if any), screenshots for UI changes, and notes on DB/schema changes.

## Architecture Guardrails
- Prefer data-driven config (JSON/Lua) over hard-coded TS/TSX; start with `packages/*/seed/` and `docs/architecture/data-driven-architecture.md`.
- Prefer declarative UI via `RenderComponent` / generic renderers (see `docs/architecture/generic-page-system.md`).
- Route data access through DBAL / the `Database` wrapper (`frontends/nextjs/src/lib/db/` or `@/lib/db`); don’t bypass it.
- Assume multi-tenancy: include `tenantId` filtering and isolate per-tenant data.
- UI uses Material UI (`@mui/*`) and SCSS/modules as needed; don’t introduce Radix UI or Tailwind. See `docs/RADIX_TO_MUI_MIGRATION.md` and `UI_STANDARDS.md`.
- Package metadata: keep `packages/*/seed/metadata.json` `packageId` in `snake_case` and versions semver (e.g. `1.2.3`).

## CI / Workflows
- Use `act` to reproduce and debug GitHub Actions locally (from `frontends/nextjs/`: `npm run act`, `npm run act:diagnose`; see `docs/guides/ACT_TESTING.md`).

If you get stuck, see `.github/prompts/EEK-STUCK.md`.
