# Playwright Testing Plugin

Execute Playwright E2E tests as workflow nodes. Enables browser-based testing to be orchestrated through the workflow system.

## Features

- **Multi-browser support**: Chromium, Firefox, WebKit
- **Configuration**: Headless mode, timeout, retries
- **Test file support**: Run specific test files or tests
- **Base URL**: Configure target application URL
- **Results tracking**: Capture test results, screenshots, videos, logs

## Usage in Workflows

```json
{
  "id": "run_tests",
  "name": "Run E2E Tests",
  "type": "testing.playwright",
  "parameters": {
    "browser": "chromium",
    "baseUrl": "http://localhost:3000",
    "testFile": "e2e/tests/login.spec.ts",
    "headless": true
  }
}
```

## Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| browser | string | chromium | Browser to use: chromium, firefox, webkit |
| headless | boolean | true | Run in headless mode |
| baseUrl | string | - | Application base URL |
| testFile | string | - | Path to test file |
| testName | string | - | Specific test to run |
| timeout | number | 30000 | Test timeout in milliseconds |

## Example Workflow

See `e2e-testing-workflow.json` for a complete testing pipeline that:
1. Tests application with Chromium
2. Tests application with Firefox
3. Tests multi-tenant scenarios
4. Aggregates results
5. Notifies team on Slack

## Integration

Can be integrated with:
- Notification plugins (Slack, email)
- Git triggers (on push, PR)
- Scheduling (cron)
- Result aggregation
