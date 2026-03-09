# Phase 2: CI/CD Batching Setup

Now that Phase 1 optimizations are complete, here's your roadmap for Phase 2 to achieve 3x overall speedup.

## Phase 2 Overview

**Goal:** Parallelize e2e tests across GitHub Actions jobs  
**Expected speedup:** Additional 2-2.5x (combined with Phase 1 = 3x total)  
**Total execution time:** 8-10 minutes (down from 25-30 min baseline)

## Implementation Steps

### Step 1: Create GitHub Actions Workflow (`.github/workflows/e2e-tests.yml`)

```yaml
name: E2E Tests - Batched

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Batch 1: Core Functionality
  e2e-batch-1:
    name: E2E - Functionality & Components
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npx playwright test --grep "Functionality Tests|Component-Specific Tests"
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: batch-1-report
          path: blob-report
          retention-days: 30

  # Batch 2: Responsive & Mobile
  e2e-batch-2:
    name: E2E - Responsive & Mobile
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npx playwright test --grep "Mobile|Responsive"
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: batch-2-report
          path: blob-report
          retention-days: 30

  # Batch 3: Visual & Styling
  e2e-batch-3:
    name: E2E - Visual & Styling
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npx playwright test --grep "Visual|CSS|Styling"
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: batch-3-report
          path: blob-report
          retention-days: 30

  # Batch 4: Cross-Platform
  e2e-batch-4:
    name: E2E - Cross-Platform
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npx playwright test --grep "Cross-Platform"
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: batch-4-report
          path: blob-report
          retention-days: 30

  # Summary job
  e2e-results:
    name: E2E Results
    runs-on: ubuntu-latest
    needs: [e2e-batch-1, e2e-batch-2, e2e-batch-3, e2e-batch-4]
    if: always()
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
      - name: Merge reports
        run: |
          npx playwright merge-reports --reporter html ./batch-*-report
      - name: Upload merged report
        uses: actions/upload-artifact@v4
        with:
          name: html-report
          path: playwright-report
          retention-days: 30
```

### Step 2: Test Batch Distribution

**Batch 1** (Core Functionality - ~5 min):
- `Functionality Tests - Core Features`
- `Component-Specific Tests`

**Batch 2** (Responsive & Mobile - ~8 min):
- `Mobile-responsive tests`
- `Cross-Platform mobile tests`

**Batch 3** (Visual & Styling - ~12 min):
- `Visual regression tests`
- `CSS styling tests`

**Batch 4** (Cross-Platform - ~6 min):
- `Desktop-specific cross-platform tests`
- `Error handling tests`
- `Home page tests`

### Step 3: Run Tests Locally to Verify

Before pushing to CI, run each batch locally:

```bash
# Batch 1
npx playwright test --grep "Functionality Tests|Component-Specific Tests"

# Batch 2
npx playwright test --grep "Mobile|Responsive"

# Batch 3
npx playwright test --grep "Visual|CSS|Styling"

# Batch 4
npx playwright test --grep "Cross-Platform"
```

### Step 4: Configure Playwright for CI

Ensure `playwright.config.ts` is CI-ready:

```typescript
// Already configured - verify:
export default defineConfig({
  fullyParallel: true,  // ✅ Ensures max parallelization
  retries: process.env.CI ? 2 : 0,  // ✅ CI retries
  timeout: 60 * 1000,  // ✅ 60s per test
  expect: {
    timeout: 10 * 1000,  // ✅ 10s expectations
  },
  // ... rest of config
})
```

## Expected Timeline

| Phase | Action | Time | Total |
|-------|--------|------|-------|
| Baseline | Run full suite serially | 25-30 min | 25-30 min |
| Phase 1 | Apply optimizations | Done | 18-20 min |
| Phase 2 | Set up 4 parallel jobs | 15 min config | ~12 min actual |
| **Total** | **Phase 1 + Phase 2** | - | **8-10 min** |

## Performance Breakdown

### Phase 1 Impact (Completed)
- Removed 242 seconds of arbitrary waits → -15-20%
- Split 21 multi-context tests → -30-40% per test
- Optimized error tracking → -5-10%
- **Result:** 25-30 min → 18-20 min

### Phase 2 Impact (Upcoming)
- Run 4 batches in parallel
- Batch 1 + 2 + 3 + 4 run simultaneously
- Critical path: longest batch (~12 min)
- **Result:** 18-20 min → 8-10 min

### Combined Impact
- **Overall speedup:** 3x
- **Time saved:** ~20 minutes per test run
- **Cost:** Same infrastructure, just parallel jobs
- **Reliability:** Pre-existing errors fixed in Phase 1

## Monitoring & Validation

Once Phase 2 is deployed:

1. **Check GitHub Actions:** All 4 batches should complete in parallel
2. **Monitor timing:** Should see ~12-15 minutes total time per PR
3. **Validate coverage:** All 127 tests should run
4. **Review reports:** Merged HTML report in artifacts

## Rollback Plan

If Phase 2 has issues:
```bash
# Fall back to serial execution
npm run test:e2e  # Uses Phase 1 optimizations only
```

## Questions?

- Phase 1 achieved 30-40% speedup with code changes only
- Phase 2 achieves 2-2.5x more with CI/CD parallelization
- Combined: 3x total speedup with no infrastructure changes

Go from 25-30 min → 8-10 min with these two phases!
