# Kickstart (TODOs)

Use this file to pick your next task from `docs/todo/` and get to a clean “green” baseline quickly.

## Read First (If New Here)

- Project overview: [`../START_HERE.md`](../START_HERE.md), [`../INDEX.md`](../INDEX.md)
- Agent workflow: [`../../.github/prompts/0-kickstart.md`](../../.github/prompts/0-kickstart.md)

## Suggested Order (Highest ROI First)

1. **Get the repo building**: [`15-BUILD-FIXES-TODO.md`](15-BUILD-FIXES-TODO.md)
2. **Fix frontend build/TS issues**: [`5-FRONTEND-TODO.md`](5-FRONTEND-TODO.md)
3. **Stabilize DB/Prisma workflows**: [`7-DATABASE-TODO.md`](7-DATABASE-TODO.md)
4. **Security fundamentals**: [`10-SECURITY-TODO.md`](10-SECURITY-TODO.md)
5. **Testing infrastructure**: [`8-TESTING-TODO.md`](8-TESTING-TODO.md), [`3-TODO.md`](3-TODO.md)
6. **Workflows/SDLC**: [`1-TODO.md`](1-TODO.md), [`21-SDLC-TODO.md`](21-SDLC-TODO.md)

## Definition Of Done (For Most Tasks)

- From `frontends/nextjs/`: `npm run lint`, `npm run typecheck`, and relevant tests pass.
- The relevant checkbox is marked `[x]` in the appropriate TODO file, with a commit hash or PR link.

## Quick Commands

Run app workflows from `frontends/nextjs/`:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`

If you need Prisma from `frontends/nextjs/`, the schema is at `../../prisma/schema.prisma` (see the Prisma notes in [`../../.github/prompts/0-kickstart.md`](../../.github/prompts/0-kickstart.md)).

