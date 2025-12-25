# GitHub Actions Testing - Quick Reference

## Prerequisites
- [ ] Docker installed and running
- [ ] Act installed (`act --version`)
- [ ] Node modules installed (`npm install`)

## Quick Commands

### Diagnostics (No Docker Required)
```bash
./scripts/diagnose-workflows.sh
```
Checks for missing files, dependencies, and configuration issues.

### Interactive Testing
```bash
./scripts/test-workflows.sh
```
Menu-driven interface for testing workflows.

### Direct Act Commands

| Command | Purpose |
|---------|---------|
| `act -l` | List all available jobs |
| `act -n` | Dry run (show what would execute) |
| `act push` | Run CI pipeline (lint, build, test) |
| `act pull_request` | Run PR workflows |
| `act -j lint` | Test linting only |
| `act -j build` | Test build only |
| `act -j test-e2e` | Test E2E tests only |
| `act -j prisma-check` | Test Prisma setup only |
| `act -v` | Verbose output |

## Common Fixes

| Issue | Fix |
|-------|-----|
| Missing dependencies | `npm install` |
| Missing Prisma | `npm install @prisma/client prisma` |
| Missing Playwright | `npm install -D @playwright/test` |
| No Prisma schema | `npx prisma init` |
| No migrations | `npx prisma migrate dev --name init` |
| Outdated lockfile | `npm install` then commit |
| Missing scripts | Add to `package.json` scripts |
| Docker out of memory | Increase Docker memory to 8GB+ |

## Test Before Push Checklist

```bash
# 1. Run diagnostics
./scripts/diagnose-workflows.sh

# 2. Fix any issues found

# 3. Test locally
npm run lint
npm run build
npm run test:e2e

# 4. Test workflows
act -j lint
act -j build

# 5. Commit and push
git add .
git commit -m "Your message"
git push
```

## Workflow Status Indicators

| Symbol | Meaning | Action |
|--------|---------|--------|
| ✓ Green | Pass | No action needed |
| ⚠ Yellow | Warning | Consider fixing |
| ✗ Red | Error | Must fix |

## Files to Check

- `package.json` - Scripts: lint, build, test:e2e
- `package-lock.json` - Should exist and be up to date
- `prisma/schema.prisma` - Prisma schema
- `playwright.config.ts` - Playwright config
- `.github/workflows/*.yml` - Workflow definitions
- `node_modules/` - Dependencies installed

## Getting Help

1. Run diagnostic: `./scripts/diagnose-workflows.sh`
2. Check logs: `/tmp/act_output_*.log`
3. Verbose mode: `act -j <job> -v`
4. Read docs: `docs/ACT_TESTING.md`
5. Check act docs: https://github.com/nektos/act

## Pro Tips

- Use smaller images: `act -P ubuntu-latest=catthehacker/ubuntu:act-latest`
- Create `~/.actrc` for default settings
- Add `.secrets` file for environment variables (don't commit!)
- Run specific jobs to save time
- Check `npm run` scripts match workflow expectations

## Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias act-lint="act -j lint"
alias act-build="act -j build"
alias act-test="act -j test-e2e"
alias act-ci="act push"
alias act-pr="act pull_request"
alias act-list="act -l"
alias act-dry="act -n"
```

## Emergency Fixes

### Workflow failing on GitHub but passes locally?
1. Ensure `package-lock.json` is committed
2. Check Node version matches (20)
3. Clear npm cache: `npm cache clean --force`
4. Test with act to simulate CI environment

### Can't install act?
1. Run diagnostics: `./scripts/diagnose-workflows.sh`
2. Fix reported issues
3. Test commands manually: `npm run lint`, `npm run build`
4. Push and check GitHub Actions logs

### Docker issues?
1. Restart Docker Desktop
2. Increase memory allocation (8GB+)
3. Clear Docker cache: `docker system prune -a`
4. Use smaller act images

---

**📖 Full Documentation:** `docs/ACT_TESTING.md`
**🔧 Workflows README:** `.github/workflows/README.md`
