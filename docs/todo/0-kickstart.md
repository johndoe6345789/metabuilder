# 0 - Kickstart (Start Here)

Use this file when you’re not sure what to do next, or you want a quick “make it green” loop before starting a larger task.

## The Default Workflow

- Start with the repo workflow prompt: [../../.github/prompts/0-kickstart.md](../../.github/prompts/0-kickstart.md)
- Skim: [../START_HERE.md](../START_HERE.md) and [../INDEX.md](../INDEX.md)
- Then pick the most relevant TODO file from [./README.md](README.md)

## 15-Minute Local Sanity Check (Frontend)

Run from `frontends/nextjs/`:

- [ ] `cd frontends/nextjs`
- [ ] `npm ci` (or `npm install`)
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:unit`
- [ ] `npm run build`

If CI/workflows are the goal, validate locally with `npm run act:diagnose` / `npm run act` (from `frontends/nextjs/`).

## If Something Fails, Start Here

- Build/config issues → [15-BUILD-FIXES-TODO.md](15-BUILD-FIXES-TODO.md)
- Next.js app issues → [5-FRONTEND-TODO.md](5-FRONTEND-TODO.md)
- Prisma/DB issues → [7-DATABASE-TODO.md](7-DATABASE-TODO.md)
- DBAL issues → [4-DBAL-TODO.md](4-DBAL-TODO.md)
- Test infrastructure issues → [8-TESTING-TODO.md](8-TESTING-TODO.md)
- Security concerns → [10-SECURITY-TODO.md](10-SECURITY-TODO.md)
- Workflow/SDLC issues → [1-TODO.md](1-TODO.md) and [21-SDLC-TODO.md](21-SDLC-TODO.md)

## Done Criteria (For Most PRs)

- [ ] The smallest relevant test suite is green (unit/E2E as appropriate)
- [ ] From `frontends/nextjs/`: `npm run lint` and `npm run typecheck` are green
- [ ] The TODO item(s) you addressed are marked `[x]` with a commit reference

If you get stuck, see [../../.github/prompts/EEK-STUCK.md](../../.github/prompts/EEK-STUCK.md).
