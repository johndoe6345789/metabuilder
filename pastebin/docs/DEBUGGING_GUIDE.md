# Playwright Test Debugging Guide

## Quick Debug Commands

### View test report after running
```bash
npx playwright show-report
```

### Run tests with browser visible (headed mode)
```bash
npx playwright test --headed
```

### Step through tests interactively
```bash
npx playwright test --debug
```

### View test execution with timeline
```bash
npx playwright test --headed --workers=1
```

### See trace of test execution
```bash
npx playwright test --trace on
```

### Run single test by name pattern
```bash
npx playwright test -g "button focus state"
```

### Run specific test file
```bash
npx playwright test tests/e2e/visual-regression.spec.ts
```

### Run specific test group
```bash
npx playwright test -g "Mobile Touch"
```

### Update snapshots (for visual regression)
```bash
npx playwright test --update-snapshots
```

## Debugging Failed Tests

### 1. Screenshot Inspection
Failed tests automatically capture screenshots in:
```
test-results/[test-name]/test-failed-1.png
```

### 2. Video Playback
Videos of failed tests are saved in:
```
test-results/[test-name]/video.webm
```

### 3. Trace Files
Debug traces are at:
```
test-results/[test-name]/trace.zip
```

Open with: `npx playwright show-trace test-results/[test-name]/trace.zip`

### 4. Console Output
View full output with:
```bash
npx playwright test --reporter=list
```

## Common Issues and Solutions

### Issue: Tests timeout on CI but work locally
**Solution**: Check network speed
```bash
# Run with slower network simulation
npx playwright test --headed --workers=1
```

### Issue: Intermittent test failures
**Solution**: Add more wait conditions
```typescript
await page.waitForLoadState('networkidle')
await page.waitForTimeout(500)
```

### Issue: Visual regression snapshot mismatch
**Solution**: Update baseline if changes are intentional
```bash
npx playwright test --update-snapshots
```

### Issue: Touch/mobile tests fail on desktop
**Solution**: Tests should skip appropriately. Check:
```typescript
test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")
```

### Issue: Memory leak detection
**Solution**: Run with memory profiling
```bash
npx playwright test --headed --workers=1
```

## Test Modification Tips

### Add debug logging to test
```typescript
test("my test", async ({ page }) => {
  console.log("Current URL:", page.url());
  console.log("Page title:", await page.title());
  
  // Add pause for inspection
  await page.pause(); // Browser will wait for you to continue
  
  // Your test...
});
```

### Inspect element in debug mode
```typescript
test("inspect element", async ({ page }) => {
  await page.goto("/");
  await page.pause();
  
  // Browser devtools will open, inspect the element
  const element = page.locator("button").first();
  console.log(await element.boundingBox());
});
```

### Check computed styles
```typescript
const styles = await element.evaluate(el => {
  const computed = window.getComputedStyle(el);
  return {
    color: computed.color,
    background: computed.backgroundColor,
    fontSize: computed.fontSize,
  };
});
console.log("Computed styles:", styles);
```

### Network interception for debugging
```typescript
// See all network requests
page.on("request", request => {
  console.log("Request:", request.url(), request.method());
});

page.on("response", response => {
  console.log("Response:", response.url(), response.status());
});
```

## Performance Profiling

### Check page metrics
```typescript
const metrics = await page.metrics();
console.log(`Memory: ${metrics.JSHeapUsedSize / 1048576 | 0} MB`);
console.log(`Layout count: ${metrics.LayoutCount}`);
console.log(`Recalc style count: ${metrics.RecalcStyleCount}`);
```

### Measure navigation timing
```typescript
const timing = await page.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  return {
    loadTime: nav.loadEventEnd - nav.loadEventStart,
    domReady: nav.domContentLoadedEventEnd - nav.loadEventStart,
    transfer: nav.responseEnd - nav.requestStart,
  };
});
console.log("Timing:", timing);
```

## Viewport and Device Testing

### Test specific resolution
```bash
# Run only on desktop
npx playwright test --project=chromium-desktop

# Run only on mobile
npx playwright test --project=chromium-mobile
```

### Test custom viewport
```typescript
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
});
```

## Accessibility Debugging

### Check ARIA attributes
```typescript
const role = await element.getAttribute("role");
const label = await element.getAttribute("aria-label");
const expanded = await element.getAttribute("aria-expanded");

console.log({ role, label, expanded });
```

### Verify keyboard navigation
```typescript
// Tab through elements
for (let i = 0; i < 10; i++) {
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  console.log(`Tab ${i}:`, focused);
}
```

## Test Report Customization

### Generate detailed JSON report
```bash
npx playwright test --reporter=json > report.json
```

### Generate HTML report
```bash
npx playwright test --reporter=html
```

### Custom report format
```bash
npx playwright test --reporter=junit
```

## Debugging Tips by Test Type

### Visual Regression Tests
1. Save baseline images locally
2. Compare pixel-by-pixel differences
3. Check for animation timing issues
4. Verify screenshot size matches viewport

### Functionality Tests
1. Check for console errors with `page.on("console")`
2. Monitor network requests for failures
3. Verify state changes after interactions
4. Check DOM mutations after actions

### Mobile Tests
1. Verify touch events register properly
2. Check viewport dimensions in browser
3. Test safe area and notch handling
4. Verify input type matches mobile keyboard

### Performance Tests
1. Check metrics before and after actions
2. Monitor heap size growth
3. Track layout recalculation count
4. Measure script execution time

## Useful Playwright Methods for Debugging

```typescript
// Get element information
await element.boundingBox();          // Position and size
await element.getAttribute("class");  // Class names
await element.isVisible();            // Visibility
await element.isEnabled();            // Enabled state

// Page inspection
await page.content();                 // Full HTML
await page.textContent();             // All text
await page.title();                   // Page title
await page.url();                     // Current URL

// Console/error monitoring
page.on("console", msg => console.log(msg));
page.on("pageerror", err => console.log(err));

// Performance data
await page.metrics();                 // Performance metrics
```

## Test Failure Checklist

When a test fails:
1. ✅ Check screenshot in test-results/
2. ✅ Watch video of test execution
3. ✅ Review trace file in Playwright inspector
4. ✅ Check console logs and errors
5. ✅ Verify element selectors are correct
6. ✅ Check for race conditions (use proper waits)
7. ✅ Verify viewport/device configuration
8. ✅ Check network conditions
9. ✅ Review recent code changes
10. ✅ Run test in isolation to confirm

## Getting Help

### Run with verbose logging
```bash
DEBUG=pw:api npx playwright test
```

### Check Playwright version
```bash
npx playwright --version
```

### Update Playwright
```bash
npm install @playwright/test@latest
```

### View full documentation
```bash
npx playwright test --help
```

---

**Happy Debugging! 🐛🔍**
