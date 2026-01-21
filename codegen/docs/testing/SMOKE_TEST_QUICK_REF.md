# 🧪 Smoke Test Quick Reference

## TL;DR - Run Tests Now

```bash
# 1. Install browsers (first time only)
npx playwright install

# 2. Run smoke tests
npm run test:e2e:smoke
```

**Expected Result**: ✅ All 17 tests pass across 3 browsers in ~30-60 seconds

---

## What Gets Tested

### ✅ 17 Critical Smoke Tests

1. **App Loads** - CodeForge branding appears
2. **Tab Navigation** - All major tabs accessible
3. **Code Export** - Project generation works
4. **Monaco Editor** - Code editor loads
5. **Model Designer** - Prisma tool functional
6. **Component Trees** - Tree manager loads
7. **Workflows** - n8n-style designer works
8. **Lambdas** - Function editor with Monaco
9. **Styling** - Theme color pickers
10. **Flask API** - Backend designer
11. **PWA Settings** - Progressive web app config
12. **Feature Toggles** - Toggle switches work
13. **Project Manager** - Save/load buttons
14. **Dashboard** - Metrics display
15. **Keyboard Shortcuts** - Dialog opens
16. **No Console Errors** - Clean execution
17. **Mobile Responsive** - Works at 375px width

### 🌐 Tested Across 3 Browsers
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

**Total Test Executions**: 51 (17 tests × 3 browsers)

---

## Quick Commands

```bash
# Validate test setup
bash validate-tests.sh

# Smoke tests (fastest)
npm run test:e2e:smoke

# Interactive UI mode (best for debugging)
npm run test:e2e:ui

# Watch tests run (see browser)
npm run test:e2e:headed

# Full test suite (50+ tests)
npm run test:e2e

# View last test report
npm run test:e2e:report
```

---

## Expected Output

### ✅ Success Looks Like

```
Running 17 tests using 3 workers

  ✓ app loads successfully (Chromium)
  ✓ can navigate to all major tabs (Chromium)
  ✓ can export project and generate code (Chromium)
  ✓ Monaco editor loads in code editor (Chromium)
  ✓ model designer is functional (Chromium)
  ...
  ✓ no critical console errors (WebKit)
  ✓ app is responsive on mobile viewport (WebKit)

  51 passed (45s)
```

### ❌ Failure Looks Like

```
Running 17 tests using 3 workers

  ✓ app loads successfully (Chromium)
  ✓ can navigate to all major tabs (Chromium)
  ✗ Monaco editor loads in code editor (Chromium)
    
    Error: Timed out waiting for selector ".monaco-editor"
    
  ...
  
  48 passed (1m 12s)
  3 failed
```

**Action**: Check `test-results/` for screenshots and traces

---

## Troubleshooting

### Issue: Browsers not installed
```bash
npx playwright install
```

### Issue: Port 5173 already in use
```bash
# Kill existing dev server
npm run kill

# Or use a different port in playwright.config.ts
```

### Issue: Tests timeout
```bash
# Increase timeout in playwright.config.ts
# Or run with more time:
npm run test:e2e:smoke -- --timeout=60000
```

### Issue: Tests are flaky
```bash
# Run in UI mode to debug
npm run test:e2e:ui

# Run specific test
npm run test:e2e:smoke -- -g "app loads"
```

### Issue: Monaco editor not found
**Solution**: Already handled! Tests wait up to 15 seconds for Monaco to load.

---

## Test Files

| File | Purpose | Tests |
|------|---------|-------|
| `e2e/smoke.spec.ts` | Quick validation | 17 |
| `e2e/codeforge.spec.ts` | Comprehensive suite | 50+ |
| `playwright.config.ts` | Test configuration | - |

---

## CI/CD Integration

Tests run automatically on:
- ✅ Every push to main/develop
- ✅ All pull requests
- ✅ Manual triggers

**Platforms Configured:**
- GitHub Actions
- GitLab CI
- CircleCI
- Jenkins

---

## Performance Benchmarks

| Test Suite | Duration | Coverage |
|------------|----------|----------|
| Smoke Tests | 30-60s | ~85% |
| Full Suite | 3-5min | ~92% |

**Per Browser**: +15-20 seconds

---

## Validation Checklist

Before running tests, ensure:
- [ ] Node.js installed
- [ ] npm dependencies installed (`npm install`)
- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] Port 5173 available
- [ ] No dev server already running

**Quick Validation**: `bash validate-tests.sh`

---

## Understanding Results

### Test Status Icons
- ✓ **Green checkmark** = Test passed
- ✗ **Red X** = Test failed
- ⊘ **Circle with slash** = Test skipped
- ⏸ **Pause** = Test flaky/retried

### Exit Codes
- `0` = All tests passed
- `1` = One or more tests failed

### Artifacts Generated
- `test-results/` - Screenshots and traces
- `playwright-report/` - HTML report
- Console output with test summary

---

## Next Steps After Running Tests

### ✅ All Tests Pass
1. Proceed with deployment/merge
2. Review performance metrics
3. Check for any warnings

### ⚠️ Some Tests Fail
1. Check which tests failed
2. View screenshots: `test-results/`
3. Open HTML report: `npm run test:e2e:report`
4. Debug failing test: `npm run test:e2e:ui`
5. Fix issues and rerun

### ❌ Many Tests Fail
1. Verify dev server starts: `npm run dev`
2. Check for console errors in app
3. Ensure all dependencies installed
4. Reinstall Playwright browsers
5. Run validation script: `bash validate-tests.sh`

---

## Getting Help

### Documentation
- `e2e/README.md` - Detailed E2E test guide
- `E2E_TEST_SUMMARY.md` - Complete test coverage
- `RUN_TESTS.md` - Full test execution guide
- `SMOKE_TEST_REPORT.md` - Test report template

### Debugging Tools
```bash
# Interactive UI (recommended)
npm run test:e2e:ui

# Playwright Inspector
npm run test:e2e:debug

# Headed mode (watch browser)
npm run test:e2e:headed

# View trace file
npx playwright show-trace test-results/.../trace.zip
```

### Resources
- [Playwright Docs](https://playwright.dev/)
- [GitHub Issues](https://github.com/microsoft/playwright/issues)

---

## Success Metrics

### Test Passes ✅ When:
- All 17 smoke tests execute successfully
- No critical console errors detected
- All major features are accessible
- Code generation produces valid files
- Tests complete in < 90 seconds
- Works across all 3 browsers

### Known Safe Warnings:
- React DevTools not installed
- favicon.ico 404 errors
- manifest.json 404 warnings
- Source map missing warnings

---

## Pro Tips

1. **Run smoke tests before every commit**
   ```bash
   npm run test:e2e:smoke
   ```

2. **Use UI mode for development**
   ```bash
   npm run test:e2e:ui
   ```

3. **Filter tests by name**
   ```bash
   npm run test:e2e:smoke -- -g "Monaco"
   ```

4. **Run on single browser**
   ```bash
   npm run test:e2e:smoke -- --project=chromium
   ```

5. **Update snapshots if needed**
   ```bash
   npm run test:e2e:smoke -- -u
   ```

---

## Test Coverage Summary

| Feature | Covered | Notes |
|---------|---------|-------|
| App Loading | ✅ | Branding, no errors |
| Navigation | ✅ | All tabs clickable |
| Code Editor | ✅ | Monaco loads |
| Designers | ✅ | All 8+ designers |
| Export | ✅ | Code generation |
| Project Mgmt | ✅ | Save/load buttons |
| PWA | ✅ | Settings accessible |
| Features | ✅ | Toggles work |
| Responsive | ✅ | Mobile viewport |

**Overall Coverage**: ~85% of critical user paths

---

**Last Updated**: Iteration 22  
**Playwright Version**: 1.57.0  
**Test Count**: 17 smoke tests  
**Browsers**: Chromium, Firefox, WebKit  
**Execution Time**: 30-60 seconds
