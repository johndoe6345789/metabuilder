# E2E Test Optimization Strategy

## Current State Analysis

### Test Suite Metrics
- **Total Tests**: 121 tests (7 spec files)
- **Test Projects**: 2 (chromium-desktop, chromium-mobile)
- **Configuration**: `fullyParallel: true` (all tests run in parallel)
- **Total Test Code**: ~2,572 lines

### Test File Breakdown
| File | Lines | Tests | Category |
|------|-------|-------|----------|
| cross-platform.spec.ts | 663 | 21 | Platform consistency |
| css-styling.spec.ts | 533 | 21 | CSS/styling validation |
| functionality.spec.ts | 472 | 22 | Core functionality |
| components.spec.ts | 469 | 21 | Component behavior |
| visual-regression.spec.ts | 426 | 17 | Visual snapshots |
| mobile-responsive.spec.ts | 409 | 17 | Mobile interactions |
| home.spec.ts | 44 | 2 | Home page |

### Current Performance Issues Identified

#### Issue 1: Redundant Multi-Context Tests (cross-platform.spec.ts)
```typescript
// PROBLEM: Creates multiple browser contexts within single test
test("navigation works identically on desktop and mobile", async ({ browser }) => {
  const desktopContext = await browser.newContext({ viewport: {...} })
  // ... test desktop
  await desktopContext.close()

  const mobileContext = await browser.newContext({ viewport: {...} })
  // ... test mobile
  await mobileContext.close()
})
```
**Impact**: Each test blocks until all contexts complete; wastes parallelization opportunity
**Estimated overhead**: 30-50% slower than necessary per test

#### Issue 2: Excessive `waitForTimeout()` Calls
```typescript
// Appears in components.spec.ts (4+ times per test file)
await page.waitForTimeout(1000)  // Hardcoded 1-second waits
await page.waitForTimeout(100)   // Additional arbitrary waits
```
**Impact**: 121 tests × avg 2 waits = 242 unnecessary seconds
**Estimated overhead**: 15-20% of total execution time

#### Issue 3: Visual Regression Tests with Snapshots
```typescript
// visual-regression.spec.ts (17 tests)
// Each snapshot creates/compares full-page screenshots
expect(await page.screenshot()).toMatchSnapshot()
```
**Impact**: Screenshot generation is I/O intensive; 17 tests × 2 projects = 34 snapshots
**Estimated overhead**: 20-30% of total execution time

#### Issue 4: Inefficient Console Error Collection
```typescript
// Multiple tests manually collect console errors
const errors: string[] = []
page.on("console", (msg) => {
  if (msg.type() === "error") {
    errors.push(msg.text())
  }
})
// Often never checked until end of test
```
**Impact**: Adds event listener overhead without early-exit optimization
**Estimated overhead**: 5-10% overhead

---

## **APPROACH 1: Test Batching/Sharding Strategy**

### 1.1 Implement Custom Sharding by Test Category

Split tests into focused batches that can run independently in CI/CD:

**Batch 1: Core Functionality (Fast)**
- `home.spec.ts` (2 tests)
- `functionality.spec.ts` (22 tests)
- Total: 24 tests, ~5 minutes
- Desktop only (mobile tests duplicate coverage)

**Batch 2: Component Tests (Medium)**
- `components.spec.ts` (21 tests)
- Total: 21 tests, ~4 minutes
- Desktop only

**Batch 3: Responsive & Mobile (Medium)**
- `mobile-responsive.spec.ts` (17 tests)
- `cross-platform.spec.ts` (21 tests) ← Needs optimization first
- Total: 38 tests, ~8 minutes
- Mobile-focused tests

**Batch 4: Visual & Styling (Slow)**
- `css-styling.spec.ts` (21 tests)
- `visual-regression.spec.ts` (17 tests)
- Total: 38 tests, ~12 minutes
- Desktop only; snapshot generation is slow

### 1.2 Implementation: Create Playwright Projects for Each Batch

**Modified `playwright.config.ts`:**

```typescript
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,

  // Single project - batch determined by env var or test selection
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1400, height: 900 } },
      grep: process.env.BATCH === "mobile" ? /@mobile|responsive/ : /@desktop|^(?!.*mobile)/,
    },
  ],

  webServer: {
    command: "npm run dev -- -p 3002 -H 0.0.0.0",
    port: 3002,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

**Alternative: Test File-Based Sharding (Simpler)**

```bash
# CI/CD Script for parallel batch execution
# .github/workflows/e2e-sharded.yml

jobs:
  test-batch-1:
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test tests/e2e/home.spec.ts tests/e2e/functionality.spec.ts

  test-batch-2:
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test tests/e2e/components.spec.ts

  test-batch-3:
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test tests/e2e/mobile-responsive.spec.ts tests/e2e/cross-platform.spec.ts

  test-batch-4:
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test tests/e2e/css-styling.spec.ts tests/e2e/visual-regression.spec.ts
```

### 1.3 Expected Impact

| Batch | Tests | Est. Time | Speedup |
|-------|-------|-----------|---------|
| Serial (Current) | 121 | 25-30 min | 1x |
| Parallel Batch 1 | 24 | 5 min | 5-6x |
| Parallel Batch 2 | 21 | 4 min | 6-7x |
| Parallel Batch 3 | 38 | 8 min | 3-4x |
| Parallel Batch 4 | 38 | 12 min | 2-3x |
| **Total (4 parallel jobs)** | 121 | **~12 min** | **2-2.5x** |

**CI/CD Efficiency**: 4 jobs running in parallel ≈ 50% wall-clock reduction

---

## **APPROACH 2: Optimize Existing E2E Tests**

### 2.1 Remove Redundant Multi-Context Tests

**Problem**: `cross-platform.spec.ts` creates multiple browser contexts within single tests

**Solution**: Split cross-platform tests into separate desktop/mobile tests

**Before**:
```typescript
test("navigation works identically on desktop and mobile", async ({ browser }) => {
  // Creates 2 contexts, blocks until both complete
  const desktopContext = await browser.newContext({...})
  // ... test desktop
  await desktopContext.close()

  const mobileContext = await browser.newContext({...})
  // ... test mobile
  await mobileContext.close()
})
```

**After**:
```typescript
test("navigation works on desktop", async ({ page }) => {
  // Uses fixture-provided page (desktop context)
  await page.goto("/")
  // ... test desktop only
})

test("navigation works on mobile", async ({ page }) => {
  // Set mobile viewport, runs in parallel
  await page.setViewportSize({ width: 393, height: 851 })
  await page.goto("/")
  // ... test mobile only
})
```

**Impact**:
- Removes blocking operations
- Each test runs independently in parallel
- Estimated: **30-40% speedup** in cross-platform tests

### 2.2 Replace `waitForTimeout()` with Targeted Waits

**Problem**: Hardcoded arbitrary waits block execution unnecessarily

**Solution**: Replace with element-specific waits

**Before**:
```typescript
await page.goto("/")
await page.waitForLoadState("networkidle")
await page.waitForTimeout(1000)  // Why? Unknown

const grid = page.locator("[data-testid='snippet-grid']")
await expect(grid).toBeVisible()
```

**After**:
```typescript
await page.goto("/")
await page.waitForLoadState("networkidle")
// No arbitrary timeout

const grid = page.locator("[data-testid='snippet-grid']")
await expect(grid).toBeVisible()  // Built-in retries + timeout
```

**Refactoring Template**:
```typescript
// Replace this pattern:
await page.waitForTimeout(1000)
await page.waitForLoadState("networkidle")

// With this:
await page.waitForLoadState("networkidle")  // Playwright waits for network idle automatically
// Remove the timeout entirely if element appears immediately after navigation
```

**Impact**:
- Remove ~2-3 arbitrary waits per test
- 121 tests × 2 sec savings = **240 seconds saved**
- Estimated: **15-20% speedup**

### 2.3 Optimize Visual Regression Tests

**Problem**: Snapshot generation is I/O intensive; running same tests on 2 projects doubles work

**Solution**:
1. Run visual tests on desktop only (mobile visual regressions covered by responsive tests)
2. Use `--update-snapshots` in CI only when needed
3. Add `@slow` tag for skip in fast test runs

**Before**:
```typescript
test("full page snapshot", async ({ page }) => {
  await page.goto("/")
  expect(await page.screenshot()).toMatchSnapshot()  // Runs on BOTH desktop & mobile
})
```

**After**:
```typescript
test("@slow full page snapshot - desktop only", async ({ page }) => {
  // Add skip condition if not in visual regression batch
  test.skip(process.env.TEST_BATCH !== "visual", "Slow test")

  await page.goto("/")
  expect(await page.screenshot()).toMatchSnapshot()  // Desktop only
})
```

**Configuration**:
```typescript
// playwright.config.ts
projects: [
  {
    name: "chromium-desktop",
    use: {...},
    grep: /(?!@slow)/,  // Skip @slow tests by default
  },
  {
    name: "chromium-desktop-visual",
    use: {...},
    grep: /@slow/,  // Only run @slow tests
    fullyParallel: false,  // Reduce parallelization for snapshots
  },
]
```

**Impact**:
- Reduce snapshot generation by 50% (mobile → desktop only)
- Estimated: **20-25% speedup** in visual regression tests

### 2.4 Optimize Console Error Tracking

**Problem**: Manual console error collection adds overhead; no early exit

**Solution**: Use Playwright's built-in page error handling

**Before**:
```typescript
const errors: string[] = []
page.on("console", (msg) => {
  if (msg.type() === "error") {
    errors.push(msg.text())
  }
})

// ... test proceeds
// ... error array checked at end
expect(errors.filter(e => e.includes("hydration"))).toHaveLength(0)
```

**After**:
```typescript
// Option 1: Use page.on("error") for uncaught errors
const errors: string[] = []
page.on("pageerror", (error) => {
  errors.push(error.message)
})

// Option 2: Create helper fixture (reusable)
// fixtures.ts
export const test = base.extend({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    await use(errors)
  },
})

// In tests:
test("component renders", async ({ page, consoleErrors }) => {
  await page.goto("/")
  expect(consoleErrors).toHaveLength(0)
})
```

**Impact**:
- Centralize error tracking logic
- Reduce code duplication across 20+ tests
- Estimated: **5-10% speedup** (less event listener overhead)

### 2.5 Consolidate Redundant Tests

**Analysis**: Some tests appear duplicated across spec files:
- Navigation testing in `functionality.spec.ts` + `cross-platform.spec.ts`
- Rendering validation in `components.spec.ts` + `functionality.spec.ts`

**Action**: Identify and remove duplicate test coverage

```bash
# Identify similar tests
grep -r "test(\"" tests/e2e/*.spec.ts | \
  sed 's/.*test("\([^"]*\).*/\1/' | \
  sort | uniq -d
```

**Impact**:
- Remove 5-10 duplicate tests
- Estimated: **5% speedup**

---

## **RECOMMENDED STRATEGY: Hybrid Approach**

### Phase 1: Quick Wins (1-2 hours)
Implement Approach 2 optimizations first - they reduce execution time immediately:

1. **Remove `waitForTimeout()` calls** (30 min)
   - Replace with element waits or remove entirely
   - Expected impact: 15-20% speedup

2. **Fix cross-platform test blocking** (30 min)
   - Split multi-context tests into single-context tests
   - Expected impact: 30-40% in those tests

3. **Create console error helper** (20 min)
   - Centralize error collection
   - Expected impact: 5% speedup

**Total Phase 1 Impact**: ~30-40% speedup (bring 25-30 min → 18-20 min)

### Phase 2: Scale with Sharding (1 hour)
Implement Approach 1 for CI/CD:

1. **Create GitHub Actions workflow with 4 parallel batches** (45 min)
   - Run independently in CI
   - No duplicate web server startup overhead

2. **Update local test runner script** (15 min)
   - Document batch execution
   - Add quick-test vs. full-test commands

**Phase 2 Impact**:
- Local execution: 30-40% faster (from Phase 1)
- CI/CD execution: 2-2.5x faster (parallel batches)
- Wall-clock time: ~12 min instead of 25-30 min

---

## **Implementation Roadmap**

### If you want **immediate speedup** (next 30 min):
1. Remove `waitForTimeout()` calls in components.spec.ts
2. Split cross-platform multi-context tests

### If you want **CI/CD optimization** (next 2 hours):
1. Complete all Phase 1 optimizations
2. Add GitHub Actions workflow with sharding
3. Update local npm scripts

### If you want **maximum parallelization** (comprehensive):
1. Do Phase 1 + Phase 2
2. Further split slow test files (css-styling.spec.ts)
3. Consider running visual regression async/on-demand

---

## **Code Examples for Implementation**

### Example 1: Fixing `components.spec.ts`

**Remove arbitrary waits**:
```diff
  test("snippet manager renders without errors", async ({ page }) => {
    // ... error tracking setup
    await page.goto("/")
    await page.waitForLoadState("networkidle")
-   await page.waitForTimeout(1000) // Remove this

    expect(errors.filter((e) => e.toLowerCase().includes("hydration"))).toHaveLength(0)
  })
```

### Example 2: Fixing `cross-platform.spec.ts`

```typescript
// BEFORE: Single test with 2 contexts (blocking)
test("navigation works on both platforms", async ({ browser }) => {
  const desktopContext = await browser.newContext({...})
  const desktopPage = await desktopContext.newPage()
  // ...
  await desktopContext.close()

  const mobileContext = await browser.newContext({...})
  const mobilePage = await mobileContext.newPage()
  // ...
  await mobileContext.close()
})

// AFTER: Two tests running in parallel
test("navigation works on desktop", async ({ page }) => {
  // page is desktop context from fixture
  await page.goto("/")
  // ... test
})

test("navigation works on mobile", async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 393, height: 851 })
  await page.goto("/")
  // ... test
})
```

### Example 3: CI/CD Batching

**`.github/workflows/e2e.yml`**:
```yaml
name: E2E Tests (Parallel Batches)

on: [push, pull_request]

jobs:
  test-fast:
    runs-on: ubuntu-latest
    name: Core Functionality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npx playwright install
      - run: npx playwright test tests/e2e/home.spec.ts tests/e2e/functionality.spec.ts tests/e2e/components.spec.ts
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report-fast
          path: playwright-report/

  test-responsive:
    runs-on: ubuntu-latest
    name: Responsive & Mobile
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npx playwright install
      - run: npx playwright test tests/e2e/mobile-responsive.spec.ts tests/e2e/cross-platform.spec.ts
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report-responsive
          path: playwright-report/

  test-visual:
    runs-on: ubuntu-latest
    name: Visual Regression & Styling
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npx playwright install
      - run: npx playwright test tests/e2e/css-styling.spec.ts tests/e2e/visual-regression.spec.ts
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report-visual
          path: playwright-report/
```

---

## **Monitoring & Validation**

### Commands to Measure Improvement

```bash
# Measure baseline
time npm run test:e2e

# Measure Phase 1 improvements
time npm run test:e2e

# Run specific batch (after implementation)
npx playwright test tests/e2e/functionality.spec.ts tests/e2e/components.spec.ts --project=chromium-desktop

# Generate performance report
npx playwright test --reporter=json > test-results.json
```

### Success Criteria

- **Phase 1**: 30-40% improvement (25-30 min → 18-20 min)
- **Phase 2**: Additional 2x improvement in CI (12 min parallel vs. 25+ min serial)
- **Overall**: <2 min per batch, <12 min total CI execution

---

## Summary Table

| Optimization | Approach | Impact | Effort | When |
|--------------|----------|--------|--------|------|
| Remove `waitForTimeout()` | 2.2 | 15-20% | 30 min | Now |
| Split cross-platform tests | 2.1 | 30-40% | 30 min | Now |
| Console error helper | 2.4 | 5% | 20 min | Now |
| Visual test optimization | 2.3 | 20-25% | 20 min | Phase 1 |
| CI/CD sharding (4 batches) | 1.2 | 2-2.5x wall-clock | 45 min | Phase 2 |

