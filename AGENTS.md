# Repository Guidelines

## Project Structure & Module Organization

- `frontends/nextjs/`: primary Next.js app (source in `src/`, E2E in `e2e/`, local helper scripts in `scripts/`).
- `packages/`: JSON-driven component packages (`seed/*.json`, optional `static_content/`, and `tests/` for schema/structure checks).
- `dbal/`: database abstraction layer (TypeScript library in `dbal/ts/`; additional tooling/docs under `dbal/`).
- `prisma/`: Prisma schema and migrations (`schema.prisma`, `migrations/`).
- `config/`: shared config (Playwright/Vite/TS/ESLint) symlinked into `frontends/nextjs/`.
- `tools/`: repo utilities (quality checks, workflow helpers, code analysis).

## Build, Test, and Development Commands

Run app workflows from `frontends/nextjs/`:

- `npm install` (or `npm ci`): install dependencies.
- `npm run dev`: start local dev server.
- `npm run build` / `npm run start`: production build and serve.
- `npm run lint` / `npm run lint:fix`: lint (and auto-fix where safe).
- `npm run typecheck`: TypeScript checking (`tsc --noEmit`).
- `npm run test:unit` / `npm run test:coverage`: Vitest unit tests (coverage output to `frontends/nextjs/coverage/`).
- `npm run test:e2e`: Playwright E2E tests.
- `npm run db:generate` / `npm run db:push` / `npm run db:migrate`: Prisma client + schema/migrations.

DBAL library workflows live in `dbal/ts/` (`npm run build`, `npm run test:unit`).

## Coding Style & Naming Conventions

- TypeScript + ESM. Prefer `@/…` imports inside `frontends/nextjs/src/`.
- React components: `PascalCase.tsx`; hooks: `useThing.ts`; tests: `*.test.ts(x)`.
- UI: use Material UI (`@mui/*`) and SCSS/modules as needed; do not introduce Radix UI or Tailwind (see `UI_STANDARDS.md`).
- Package metadata: keep `packages/*/seed/metadata.json` `packageId` in `snake_case` and versions semver (e.g. `1.2.3`).

## Testing Guidelines

- Unit: Vitest (`frontends/nextjs/src/**/*.test.ts(x)` and `packages/*/tests/*.test.ts`).
- E2E: Playwright (`frontends/nextjs/e2e/`).
- Add/adjust tests with behavior changes; keep tests deterministic (no network, stable clocks/IDs).

## Commit & Pull Request Guidelines

- Commits generally follow Conventional Commits (examples in history: `feat: …`, `fix: …`, `docs: …`, `refactor: …`, `chore: …`).
- PRs should include: what/why, linked issue (if any), screenshots for UI changes, and notes on DB/schema changes.
- Before opening a PR, run `npm run lint`, `npm run typecheck`, and the relevant tests.

## Agent-Specific Notes

- Check for scoped rules in nested `AGENTS.md` files (e.g., `dbal/AGENTS.md`) before editing those areas.
- Keep changes focused, avoid dependency churn, and follow existing patterns/config in `config/` and `frontends/nextjs/`.
