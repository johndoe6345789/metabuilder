# E2E Testing Guide

This directory contains comprehensive end-to-end tests for MetaBuilder using Playwright.

## 📋 Test Files

- **`smoke.spec.ts`** - Basic smoke tests verifying core functionality
- **`login.spec.ts`** - Tests for login functionality, authentication, and password changes
- **`crud.spec.ts`** - Tests for CRUD operations, data tables, and schema editing

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers (if not already installed)
npx playwright install chromium
```

### Running All Tests

```bash
npm run test:e2e
```

### Running Specific Test

```bash
npm run test:e2e -- login.spec.ts
```

### Running in UI Mode

```bash
npm run test:e2e:ui
```

Launches interactive Playwright Inspector with UI controls.

### Running in Headed Mode

```bash
npm run test:e2e:headed
```

Runs tests with visible browser window (useful for debugging).

### Debug Mode

```bash
npx playwright test --debug
```

Step through tests line by line with debugger.

## 🧪 Test Structure

Each test file follows this pattern:

```typescript
import { test, expect } from '@playwright/test';

test('user action description', async ({ page }) => {
  // 1. Navigate to page
  await page.goto('/');
  
  // 2. Interact with elements
  await page.fill('[data-testid="input"]', 'value');
  
  // 3. Assert results
  await expect(page.locator('text=expected')).toBeVisible();
});
```

### Key Test Patterns

**Login Test**
```typescript
test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
});
```

**CRUD Test**
```typescript
test('user can create item', async ({ page }) => {
  await page.goto('/items');
  await page.click('button:has-text("Create")');
  await page.fill('[name="title"]', 'New Item');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=New Item')).toBeVisible();
});
```

**Permission Test**
```typescript
test('unauthorized users cannot access admin', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/login|unauthorized/);
});
```

## 🔧 Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173`
- **Browsers**: Chromium, Firefox, WebKit
- **Timeout**: 30 seconds per test
- **Retries**: 2 attempts on failure
- **Headless**: true (set false to see browser)

## 📊 Test Coverage

Current tests verify:

- ✅ **Authentication** - Login with various credentials
- ✅ **Permission Levels** - User, Admin, God access control
- ✅ **CRUD Operations** - Create, Read, Update, Delete
- ✅ **Data Tables** - Sorting, filtering, pagination
- ✅ **Navigation** - Menu and route transitions
- ✅ **Error Handling** - Error messages and recovery
- ✅ **Schema Management** - Dynamic schema editing

## 🐛 Debugging Failed Tests

### Running Tests Locally

```bash
# Run all tests (headless)
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/login.spec.ts

# Run tests in debug mode
npx playwright test --debug
```

### Test Output

After running tests, you can view:
- **HTML Report**: `npx playwright show-report`
- **Test Results**: Located in `test-results/` directory
- **Screenshots**: Captured on test failures
- **Videos**: Recorded for failed tests (if enabled)

## Test Structure

### Login Tests (`login.spec.ts`)

Tests the authentication flow:
1. Display of login form on initial load
2. Error handling for invalid credentials
3. Successful login with valid credentials
4. Password change requirement on first login
5. Navigation after successful authentication

### CRUD Tests (`crud.spec.ts`)

Tests data management operations:
1. Display of data tables/lists
2. Create button visibility
3. Form opening and interaction
4. Input field validation
5. Schema editor access (admin users)

## Test Configuration

Configuration is in `playwright.config.ts`:
- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Browsers**: Chromium (can add Firefox, WebKit)
- **Retries**: 2 retries on CI, 0 locally
- **Timeout**: 120 seconds for web server startup
- **Screenshots**: Taken on failure
- **Traces**: Captured on first retry

## CI/CD Integration

Tests run automatically on:
- Every push to main/master/develop branches
- Every pull request
- Manual workflow dispatch

The CI workflow:
1. Installs dependencies
2. Installs Playwright browsers
3. Starts the dev server
4. Runs all tests
5. Uploads test results and reports as artifacts

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code (e.g., login)
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test code
    await page.click('button[type="submit"]');
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use descriptive test names** - Clear, action-oriented descriptions
2. **Keep tests isolated** - Each test should be independent
3. **Use page object patterns** - For complex pages, create page objects
4. **Wait appropriately** - Use `waitForLoadState`, `waitForTimeout` sparingly
5. **Use semantic locators** - Prefer `getByRole`, `getByLabel` over CSS selectors
6. **Test user flows** - Test complete user journeys, not just individual actions
7. **Handle async properly** - Always await async operations
8. **Clean up state** - Use `beforeEach`/`afterEach` for setup/teardown

### Common Patterns

```typescript
// Login helper
async function login(page, username, password) {
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /login/i }).click();
}

// Wait for navigation
await page.waitForLoadState('networkidle');

// Check visibility with timeout
await expect(page.locator('.element')).toBeVisible({ timeout: 10000 });

// Handle conditional elements
if (await page.locator('.dialog').isVisible()) {
  await page.getByRole('button', { name: /close/i }).click();
}
```

## Debugging Tests

### Visual Debugging

```bash
# Open Playwright Inspector
npx playwright test --debug

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode to see browser
npm run test:e2e:headed
```

### Tracing

```bash
# View trace for failed tests
npx playwright show-trace trace.zip
```

### Verbose Output

```bash
# Run with verbose logging
DEBUG=pw:api npx playwright test
```

## Known Issues & Limitations

1. **Test Credentials** - Tests use default seeded credentials
   - User: `user` / Password: `password123`
   - Admin: `admin` / Password: `admin123`

2. **Test Data** - Tests assume default seed data is present

3. **Timing** - Some tests may need adjustment for slower environments

4. **State Management** - Tests use isolated browser contexts but share the same database

## Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server starts: `npm run dev`
- Verify port 5173 is available

### Tests Fail Locally but Pass in CI
- Check Node.js version matches CI
- Clear browser cache: `npx playwright install --force`
- Delete `node_modules` and reinstall

### Screenshots/Videos Missing
- Check `playwright.config.ts` settings
- Ensure `test-results/` directory exists
- Verify sufficient disk space

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)
