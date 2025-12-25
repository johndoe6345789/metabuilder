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
4. Check for scoped rules in nested `AGENTS.md` files (e.g. `dbal/AGENTS.md`) before editing those areas.

## Where Work Lives
- Next.js app: `frontends/nextjs/` (source in `src/`, E2E in `e2e/`, local scripts in `scripts/`).
- Component packages: `packages/` (seed JSON under `packages/*/seed/`, schema checks in `packages/*/tests/`).
- DBAL: `dbal/` (TypeScript library in `dbal/ts/`).
- Prisma schema/migrations: `prisma/` (`schema.prisma`, `migrations/`).
- Shared config: `config/` (symlinked into `frontends/nextjs/`).

## Common Commands
Run app workflows from `frontends/nextjs/`:
- Install: `npm ci` (or `npm install`)
- Dev: `npm run dev`
- Build/serve: `npm run build` / `npm run start`
- Lint: `npm run lint` / `npm run lint:fix`
- Typecheck: `npm run typecheck`
- Unit: `npm run test:unit` / `npm run test:coverage`
- E2E: `npm run test:e2e`
- Prisma: `npm run db:generate` / `npm run db:push` / `npm run db:migrate`

DBAL workflows live in `dbal/ts/` (`npm run build`, `npm run test:unit`).

## Source + Tests
- TypeScript + ESM. Prefer `@/…` imports inside `frontends/nextjs/src/`.
- React components: `PascalCase.tsx`; hooks: `useThing.ts`; tests: `*.test.ts(x)`.
- Prefer one focused function (“lambda”) per file; use classes only as containers for related functions (see `.github/prompts/LAMBDA_PROMPT.md`).
- Keep tests deterministic (no network, stable clocks/IDs), and parameterize where it improves coverage (`it.each()`); keep source↔test naming aligned.
- Leave TODOs only when you’re explicitly deferring follow-up work.

## Git Hygiene
- Commit as you go with descriptive (Conventional Commit-style) messages; default to trunk-based work on `main` unless a PR flow is required.
- If multiple agents are working, merge/rebase carefully and avoid overwriting each other’s changes.

## Architecture Guardrails
- Route data access through DBAL / the `Database` wrapper; don’t bypass it.
- UI uses Material UI (`@mui/*`) and SCSS/modules as needed; don’t introduce Radix UI or Tailwind. See `docs/RADIX_TO_MUI_MIGRATION.md` and `UI_STANDARDS.md`.
- Package metadata: keep `packages/*/seed/metadata.json` `packageId` in `snake_case` and versions semver (e.g. `1.2.3`).

## CI / Workflows
- Use `act` to reproduce and debug GitHub Actions locally (see `npm run act`, `npm run act:diagnose`).

If you find nothing wrong with the repository, stop what you are doing right away.

