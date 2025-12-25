# GitHub Workflows Failure Diagnosis

**Date:** December 24, 2024  
**Status:** 🔍 Analysis Complete

## Most Likely Causes of Workflow Failures

### 1. ❌ Prisma Migration Failing (High Probability)

**Workflow:** `ci.yml` - `prisma-check` job

**Issue:** The workflow tries to run `prisma migrate deploy` without a `.env` file or proper `DATABASE_URL`.

```yaml
- name: Apply Prisma migrations
  run: npx prisma migrate deploy --schema prisma/schema.prisma
  env:
    DATABASE_URL: file:./dev.db
```

**Problem:**
- The `DATABASE_URL` is set to `file:./dev.db` but the database file doesn't exist in the CI environment
- `prisma migrate deploy` expects existing migrations to apply, but a fresh database needs `prisma migrate dev` or seeding
- No `.env` file exists in CI with proper configuration

**Fix Needed:**
1. Change `migrate deploy` to `migrate dev` for CI, OR
2. Add a setup step to create the database first, OR
3. Use in-memory database or test fixture

---

### 2. ❌ Missing Prisma Client Generation (High Probability)

**Issue:** The workflow generates Prisma client, but subsequent jobs (lint, build) don't regenerate it.

**In `ci.yml`:**
- `prisma-check` job generates the client
- `lint` and `build` jobs run `npm ci` which installs deps but doesn't regenerate Prisma client
- Code imports `@prisma/client` which may not exist

**Fix Needed:**
Add `npx prisma generate` to each job that needs the Prisma client:

```yaml
- name: Install dependencies
  run: npm ci

- name: Generate Prisma Client
  run: npx prisma generate
```

---

### 3. ⚠️ npm ci Failing Due to Package Lock Issues (Medium Probability)

**Issue:** Running `npm ci` may fail if:
- `package-lock.json` is out of sync with `package.json`
- Missing packages in npm registry
- Version conflicts

**Evidence from npm list output:**
```
npm error missing: @playwright/test@^1.57.0, required by spark-template@0.0.0
npm error missing: @prisma/client@^6.3.1, required by spark-template@0.0.0
npm error missing: prisma@^6.3.1, required by spark-template@0.0.0
```

**Fix Needed:**
1. Run `npm install` locally to regenerate `package-lock.json`
2. Commit updated lock file
3. OR use `npm install` instead of `npm ci` in workflows (slower but more forgiving)

---

### 4. ⚠️ Build Failing Due to TypeScript Errors (Medium Probability)

**Workflow:** `ci.yml` - `build` job

**Issue:** The build command uses `tsc -b --noCheck`:

```json
"build": "tsc -b --noCheck && vite build"
```

**Problem:**
- `--noCheck` is not a valid TypeScript flag (should be `--noEmit` or `--skipLibCheck`)
- This causes `tsc` to fail immediately

**Fix Needed:**
Change in `package.json`:
```json
"build": "tsc -b && vite build"
```
OR
```json
"build": "vite build"
```

---

### 5. ⚠️ ESLint Failing on Code Quality (Medium Probability)

**Workflow:** `ci.yml` - `lint` job

**Likely Issues:**
- Console.log statements in code
- TypeScript `any` types
- Unused variables
- Missing React dependencies

**Fix Needed:**
1. Run `npm run lint` locally to see errors
2. Run `npm run lint:fix` to auto-fix
3. Manually fix remaining issues

---

### 6. ⚠️ Playwright Tests Failing (Medium Probability)

**Workflow:** `ci.yml` - `test-e2e` job

**Likely Issues:**
- Database not seeded in test environment
- Default credentials don't exist
- App fails to start due to missing Prisma client
- Tests expect data that doesn't exist

**Fix Needed:**
1. Ensure database is properly seeded before tests
2. Add database setup step before Playwright tests
3. Mock or stub database calls in tests

---

### 7. ❌ Auto-Merge Workflow Incorrect Event Handling (Low Probability)

**Workflow:** `auto-merge.yml`

**Issue:** The workflow tries to extract PR number from `workflow_run` event, but the logic may fail if:
- No PRs exist for the branch
- Event payload structure is different

**Not Blocking:** This won't cause CI to fail, but auto-merge won't work.

---

### 8. ⚠️ Code Review Workflow JSON Parsing (Low Probability)

**Workflow:** `code-review.yml`

**Issue:** The workflow uses `fromJSON()` to parse step outputs:

```yaml
if: steps.analyze.outputs.result && !fromJSON(steps.analyze.outputs.result).hasBlockingIssues
```

**Potential Problem:**
- If the output isn't valid JSON, this fails
- If the script errors, output is empty

**Fix Needed:**
Add error handling in the github-script action

---

## Priority Fix List

### 🚨 Critical (Must Fix for Workflows to Pass)

1. **Fix Prisma setup in CI**
   - Add Prisma client generation to all jobs
   - Fix database initialization
   - Use proper migration strategy

2. **Fix package-lock.json**
   - Regenerate with `npm install`
   - Commit changes

3. **Fix build script**
   - Remove invalid `--noCheck` flag
   - Use proper TypeScript build

### ⚠️ Important (Will Cause Failures)

4. **Fix ESLint errors**
   - Run `npm run lint:fix`
   - Fix remaining manual errors

5. **Fix E2E tests**
   - Ensure database seeding works in CI
   - Verify test credentials

### 📝 Nice to Have (Won't Block CI)

6. **Improve auto-merge workflow**
   - Add better error handling
   - Add more logging

7. **Improve code review workflow**
   - Add JSON validation
   - Add fallback for errors

---

## How to Diagnose Locally

### 1. Check if Prisma works:
```bash
export DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma migrate dev
```

### 2. Check if build works:
```bash
npm run build
```

### 3. Check if lint works:
```bash
npm run lint
```

### 4. Check if tests work:
```bash
npm run test:e2e
```

### 5. Simulate CI locally:
```bash
# Clean install like CI does
rm -rf node_modules
npm ci
npx prisma generate
npm run lint
npm run build
npm run test:e2e
```

---

## Using 'act' to Test Workflows Locally

The project includes scripts to test workflows locally using `act`:

```bash
# Run full CI pipeline
npm run act

# Run specific jobs
npm run act:lint
npm run act:e2e

# Run custom workflow
bash scripts/run-act.sh -w ci.yml -j build
```

**Note:** You need to install `act` first:
```bash
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

---

## Recommended Action Plan

### Step 1: Fix Local Environment
```bash
# Regenerate lock file
npm install

# Generate Prisma client
npx prisma generate

# Try to build
npm run build

# Try to lint
npm run lint:fix
npm run lint

# Try tests
npm run test:e2e
```

### Step 2: Update CI Workflow

Add Prisma generation to each job in `.github/workflows/ci.yml`:

```yaml
- name: Install dependencies
  run: npm ci

- name: Generate Prisma Client
  run: npx prisma generate
  env:
    DATABASE_URL: file:./dev.db
```

### Step 3: Fix package.json Build Script

```json
"build": "tsc && vite build"
```

### Step 4: Commit and Push

```bash
git add package-lock.json package.json .github/workflows/ci.yml
git commit -m "Fix CI workflow issues"
git push
```

### Step 5: Monitor Workflow

Check GitHub Actions tab to see if workflows pass.

If you're inside the app, the GitHub Actions Monitor (Level 1) can fetch run logs,
download them locally, and surface common error signals. For private repos or higher
rate limits, set `GITHUB_TOKEN`.

---

## Summary

**Most Likely Root Causes:**
1. ✅ Prisma client not generated in CI jobs
2. ✅ Database not properly initialized
3. ✅ Invalid TypeScript build flag (`--noCheck`)
4. ✅ Package lock file issues

**Quick Test:**
```bash
rm -rf node_modules dist
npm ci
npx prisma generate
npm run build
npm run lint
```

If the above succeeds locally, the workflows should pass after adding Prisma generation to CI jobs.
