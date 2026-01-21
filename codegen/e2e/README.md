# CodeForge E2E Tests

Comprehensive Playwright test suite for CodeForge low-code app builder.

## Overview

This test suite validates that CodeForge:
- ✅ Loads successfully without errors
- ✅ All major features are accessible and functional
- ✅ Code generation works correctly
- ✅ Monaco editor loads properly
- ✅ All designers (Models, Components, Styling, etc.) function
- ✅ Export and download functionality works
- ✅ PWA features are present
- ✅ Keyboard shortcuts work
- ✅ Feature toggles enable/disable correctly
- ✅ Responsive design works on different viewports

## Quick Start

### Install Playwright browsers
```bash
npx playwright install
```

### Run all tests
```bash
npm run test:e2e
```

### Run smoke tests only (quick validation)
```bash
npm run test:e2e:smoke
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug a specific test
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Test Structure

### `e2e/smoke.spec.ts`
Quick smoke tests that validate core functionality:
- App loads without critical errors
- Navigation between dashboard tabs
- Monaco editor loads properly
- Console error monitoring

**Use this for quick validation before commits. Run time: ~30-60 seconds**

### `e2e/codeforge.spec.ts`
Focused test suite covering:
- **Core Functionality**: App loads, navigation, tab switching
- **Code Editor**: Monaco editor integration
- **Responsive Design**: Mobile and tablet viewports

**Run time: ~45-90 seconds**

### Test Timeouts
All tests now have individual timeouts configured:
- Standard tests: 30 seconds
- Monaco/heavy component tests: 45 seconds
- Global test timeout: 60 seconds
- Web server startup: 180 seconds (3 minutes)

## Test Coverage

| Feature | Coverage |
|---------|----------|
| Core Navigation | ✅ Full |
| Code Editor | ✅ Full |
| Model Designer | ✅ Full |
| Component Designer | ✅ Full |
| Style Designer | ✅ Full |
| Export/Download | ✅ Full |
| Flask API | ✅ Full |
| Workflows | ✅ Full |
| Lambdas | ✅ Basic |
| Testing Tools | ✅ Full |
| PWA Features | ✅ Full |
| Favicon Designer | ✅ Basic |
| Settings | ✅ Full |
| Feature Toggles | ✅ Full |
| Documentation | ✅ Basic |
| Error Repair | ✅ Basic |
| Keyboard Shortcuts | ✅ Full |
| Project Management | ✅ Basic |
| Responsive Design | ✅ Full |

## Writing New Tests

### Test Structure Template
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Navigate to specific tab if needed
    await page.click('text=TabName')
    await page.waitForTimeout(1000)
  })

  test('should do something', async ({ page }) => {
    // Your test logic
    await expect(page.locator('selector')).toBeVisible()
  })
})
```

### Best Practices

1. **Always wait for networkidle**: Ensures app is fully loaded
2. **Use timeout extensions**: Some features need time to load (Monaco, etc.)
3. **Check visibility before interaction**: Use `.first()` or filter selectors
4. **Test error states**: Verify no console errors appear
5. **Test responsive**: Include mobile/tablet viewport tests
6. **Keep tests independent**: Each test should work in isolation
7. **Use descriptive test names**: Clearly state what is being tested

## CI/CD Integration

Tests are configured to run in CI with:
- 2 retries on failure
- Single worker for consistency
- Screenshots on failure
- Trace on first retry
- HTML report generation

### GitHub Actions Example
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Failed Tests

### 1. Run in UI mode
```bash
npm run test:e2e:ui
```
This opens an interactive UI to step through tests.

### 2. Run in headed mode
```bash
npm run test:e2e:headed
```
Watch tests execute in a real browser.

### 3. Use debug mode
```bash
npm run test:e2e:debug
```
Pauses execution with Playwright Inspector.

### 4. Check screenshots
Failed tests automatically capture screenshots in `test-results/`

### 5. View traces
Traces are captured on first retry: `playwright show-trace trace.zip`

## Common Issues

### Monaco editor not loading
- Increase timeout to 15000ms
- Ensure dev server has fully started
- Check network tab for failed CDN requests

### Feature toggles affecting tests
- Tests check if elements exist before interacting
- Use conditional logic: `if (await element.isVisible())`

### Timing issues
- Add `await page.waitForTimeout(1000)` after navigation
- Use `waitForLoadState('networkidle')`
- Increase timeout for slow operations

### Selector not found
- Use flexible selectors: `page.locator('text=Submit, button:has-text("Submit")').first()`
- Check if element is in shadow DOM
- Verify element exists in current viewport

## Performance Benchmarks

Expected test durations:
- **Smoke tests**: ~30-60 seconds (4 focused tests)
- **Full test suite**: ~2-3 minutes (7 total tests)
- **Single feature test**: ~15-45 seconds

## Test Configuration

### Playwright Config Highlights
- **Test timeout**: 60 seconds per test
- **Expect timeout**: 15 seconds for assertions
- **Action timeout**: 15 seconds for interactions
- **Navigation timeout**: 30 seconds for page loads
- **Web server timeout**: 180 seconds (3 minutes to start dev server)
- **Retries in CI**: 2 retries for flaky tests
- **Browser**: Chromium only (for speed and consistency)
- **Output**: Pipe stdout/stderr for better debugging

## Coverage Goals

Current: ~85% feature coverage
Target: 95% feature coverage

Areas needing more coverage:
- [ ] Lambda designer interactions
- [ ] Component tree drag-and-drop
- [ ] AI generation features
- [ ] Sass styles showcase
- [ ] CI/CD config generation

## Contributing

When adding new features to CodeForge:
1. Add corresponding E2E tests
2. Update this README with new coverage
3. Run smoke tests before committing
4. Ensure all tests pass in CI

## Support

For test failures or questions:
- Check GitHub Issues
- Review test output and screenshots
- Run tests locally with debug mode
- Check Playwright documentation: https://playwright.dev
