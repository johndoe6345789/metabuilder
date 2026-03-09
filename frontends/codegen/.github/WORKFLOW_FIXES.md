# GitHub Actions Workflow Fixes

## Summary of Changes

### 1. Fixed ci.yml (Lines 236 & 261)
**Problem**: Unrecognized named-value 'secrets' in conditional expressions
```yaml
# ❌ BEFORE (Invalid)
if: always() && secrets.SLACK_WEBHOOK_URL != ''

# ✅ AFTER (Valid)
if: always() && env.SLACK_WEBHOOK_URL != ''
```

**Explanation**: Secrets cannot be directly referenced in conditional expressions. They must be assigned to environment variables first, then checked via `env.VARIABLE_NAME`.

### 2. Fixed e2e-tests.yml
**Problems**:
- Used `npm install --workspaces` which isn't appropriate for this project structure
- Missing check for test existence before running
- Timeout issues (180s was too long)
- Missing individual step timeouts

**Changes**:
- Replaced `npm install --workspaces --legacy-peer-deps` with `npm install`
- Added test existence check before running E2E tests
- Added skip step when no tests are configured
- Reduced webServer timeout from 180s to 120s
- Added 30-minute job timeout
- Added 20-minute step timeout for test execution
- Only install chromium browser (not all browsers)

### 3. Updated Playwright Configuration
**Changes**:
- Reduced test timeout from 60s to 30s
- Reduced expect timeout from 15s to 10s
- Reduced action timeout from 15s to 10s
- Reduced navigation timeout from 30s to 20s
- Reduced webServer startup timeout from 180s to 120s

### 4. Replaced `npm ci` with `npm install`
**Reason**: The package.json uses `file:` protocol for local packages which sometimes causes issues with `npm ci` when package-lock.json is out of sync. Using `npm install` is more forgiving and works better with the local package setup.

**Jobs Updated**:
- lint
- test
- build
- e2e-tests
- security-scan

## Remaining Issues to Address

### Docker Build
The Docker build still fails due to workspace protocol. The Dockerfile already uses `npm install --legacy-peer-deps` which should work, but ensure:
1. The packages directories are properly copied before npm install
2. Consider using a .dockerignore file to exclude unnecessary files

### E2E Test Stability
To improve E2E test reliability:
1. Add retry logic for flaky tests
2. Use `wait-on` package to ensure dev server is fully ready
3. Consider adding health check endpoint
4. Add individual test timeouts to catch hanging tests

### Security Scan Permissions
If security scan upload fails, ensure the repository has:
- Security events write permission enabled
- Code scanning enabled in repository settings

## Testing the Fixes

Run workflows manually to test:
```bash
# Test lint job
gh workflow run ci.yml --ref main

# Test E2E specifically
gh workflow run e2e-tests.yml --ref main
```

## Future Improvements

1. **Caching**: Add npm cache to speed up builds
2. **Matrix Testing**: Test on multiple Node versions
3. **Conditional Jobs**: Skip Docker build on PR
4. **Slack Integration**: Set up SLACK_WEBHOOK_URL secret for notifications
5. **Test Reporting**: Add test result annotations to PRs
