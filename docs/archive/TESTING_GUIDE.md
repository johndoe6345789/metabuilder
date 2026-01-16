# MetaBuilder Testing Guide

> **Comprehensive guide to testing practices, TDD methodology, and Playwright E2E testing**

**Version:** 1.0.0  
**Last Updated:** January 8, 2026  
**Status:** 📘 Complete Testing Reference

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test-Driven Development (TDD)](#test-driven-development-tdd)
3. [Testing Pyramid](#testing-pyramid)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [E2E Testing with Playwright](#e2e-testing-with-playwright)
7. [Running Tests](#running-tests)
8. [Best Practices](#best-practices)
9. [CI/CD Integration](#cicd-integration)
10. [Troubleshooting](#troubleshooting)

---

## Testing Philosophy

MetaBuilder emphasizes **quality through testing** with these core principles:

1. **Test First** - Write tests before implementation (TDD)
2. **Fast Feedback** - Tests should run quickly and provide immediate feedback
3. **Comprehensive Coverage** - Aim for >80% code coverage
4. **Maintainable Tests** - Tests should be as maintainable as production code
5. **Realistic Scenarios** - Tests should reflect real-world usage

### Why We Test

- **Confidence** - Deploy with confidence knowing nothing broke
- **Documentation** - Tests serve as living documentation
- **Design** - TDD drives better software design
- **Refactoring** - Tests enable safe refactoring
- **Regression Prevention** - Catch bugs before they reach production

---

## Test-Driven Development (TDD)

TDD is our primary development methodology. Every feature starts with a test.

### The Red-Green-Refactor Cycle

```
┌─────────────────────────────────────┐
│  1. 🔴 RED: Write a failing test    │
│     - Think about the API first     │
│     - Write test that fails         │
│     - Run test to verify it fails   │
└──────────────┬──────────────────────┘
               ↓
┌──────────────▼──────────────────────┐
│  2. 🟢 GREEN: Make the test pass    │
│     - Write minimal code            │
│     - Make test pass quickly        │
│     - Don't worry about perfection  │
└──────────────┬──────────────────────┘
               ↓
┌──────────────▼──────────────────────┐
│  3. 🔵 REFACTOR: Improve the code   │
│     - Clean up implementation       │
│     - Remove duplication            │
│     - Improve naming                │
│     - Keep tests passing            │
└──────────────┬──────────────────────┘
               ↓
┌──────────────▼──────────────────────┐
│  4. ♻️  REPEAT: Next feature        │
│     - Move to next requirement      │
│     - Start cycle again             │
└─────────────────────────────────────┘
```

### TDD Example: Password Validation

#### Step 1: RED 🔴 - Write the failing test

```typescript
// src/lib/auth/validate-password.test.ts
import { describe, it, expect } from 'vitest'
import { validatePassword } from './validate-password'

describe('validatePassword', () => {
  it.each([
    {
      password: 'short',
      expected: { valid: false, error: 'Password must be at least 8 characters' }
    },
    {
      password: 'validpass123',
      expected: { valid: true, error: null }
    },
    {
      password: 'NoNumbers',
      expected: { valid: false, error: 'Password must contain at least one number' }
    },
    {
      password: '12345678',
      expected: { valid: false, error: 'Password must contain at least one letter' }
    },
    {
      password: 'ValidPass123',
      expected: { valid: true, error: null }
    },
  ])('should validate "$password"', ({ password, expected }) => {
    const result = validatePassword(password)
    expect(result).toEqual(expected)
  })
})
```

Run test: `npm test validate-password.test.ts`  
**Result:** ❌ FAIL - Function doesn't exist yet

#### Step 2: GREEN 🟢 - Write minimal code to pass

```typescript
// src/lib/auth/validate-password.ts
export interface ValidationResult {
  valid: boolean
  error: string | null
}

export function validatePassword(password: string): ValidationResult {
  // Check length
  if (password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters'
    }
  }
  
  // Check for numbers
  if (!/\d/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one number'
    }
  }
  
  // Check for letters
  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one letter'
    }
  }
  
  return { valid: true, error: null }
}
```

Run test: `npm test validate-password.test.ts`  
**Result:** ✅ PASS - All tests passing!

#### Step 3: REFACTOR 🔵 - Improve the code

```typescript
// src/lib/auth/validate-password.ts
export interface ValidationResult {
  valid: boolean
  error: string | null
}

interface ValidationRule {
  test: (password: string) => boolean
  message: string
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    test: (pwd) => pwd.length >= 8,
    message: 'Password must be at least 8 characters'
  },
  {
    test: (pwd) => /\d/.test(pwd),
    message: 'Password must contain at least one number'
  },
  {
    test: (pwd) => /[a-zA-Z]/.test(pwd),
    message: 'Password must contain at least one letter'
  },
]

export function validatePassword(password: string): ValidationResult {
  for (const rule of VALIDATION_RULES) {
    if (!rule.test(password)) {
      return { valid: false, error: rule.message }
    }
  }
  
  return { valid: true, error: null }
}
```

Run test: `npm test validate-password.test.ts`  
**Result:** ✅ PASS - Tests still passing after refactor!

#### Step 4: REPEAT ♻️ - Add more requirements

Now we can easily add more rules:

```typescript
const VALIDATION_RULES: ValidationRule[] = [
  {
    test: (pwd) => pwd.length >= 8,
    message: 'Password must be at least 8 characters'
  },
  {
    test: (pwd) => /\d/.test(pwd),
    message: 'Password must contain at least one number'
  },
  {
    test: (pwd) => /[a-zA-Z]/.test(pwd),
    message: 'Password must contain at least one letter'
  },
  {
    test: (pwd) => /[!@#$%^&*]/.test(pwd),
    message: 'Password must contain at least one special character'
  },
]
```

And add corresponding test cases!

### TDD Benefits in This Example

1. **API Design** - We designed the function interface before implementation
2. **Comprehensive Cases** - Tests cover all edge cases upfront
3. **Confidence** - We know exactly what the function should do
4. **Easy Refactoring** - We refactored with confidence because tests passed
5. **Documentation** - Tests document expected behavior clearly

---

## Testing Pyramid

MetaBuilder follows the testing pyramid strategy:

```
              /\
             /  \
            /E2E \       Few, Slow, Expensive
           /------\      Test critical user flows
          /        \
         /Integration\   More, Medium Speed
        /------------\   Test components working together
       /              \
      /   Unit Tests   \  Many, Fast, Cheap
     /------------------\ Test individual functions
```

### Test Distribution

| Type | Percentage | Example Count | Avg Duration |
|------|-----------|---------------|--------------|
| Unit | 70% | 150+ tests | <100ms each |
| Integration | 20% | 40+ tests | <500ms each |
| E2E | 10% | 20+ tests | <30s each |

**Total Test Suite:** Should run in <5 minutes

---

## Unit Testing

Unit tests focus on testing individual functions in isolation.

### File Naming Convention

```
Source file:  get-user-by-id.ts
Test file:    get-user-by-id.test.ts
```

Always place test files next to source files for easy discovery.

### Test Structure: AAA Pattern

```typescript
it('should calculate total with tax', () => {
  // ARRANGE: Set up test data
  const items = [
    { name: 'Item 1', price: 10 },
    { name: 'Item 2', price: 20 },
  ]
  const taxRate = 0.1
  
  // ACT: Execute the function under test
  const total = calculateTotal(items, taxRate)
  
  // ASSERT: Verify the result
  expect(total).toBe(33) // (10 + 20) * 1.1 = 33
})
```

### Parameterized Tests with it.each()

**✅ GOOD: Use parameterized tests**

```typescript
import { it, expect, describe } from 'vitest'
import { uppercase } from './uppercase'

describe('uppercase', () => {
  it.each([
    { input: 'hello', expected: 'HELLO' },
    { input: 'world', expected: 'WORLD' },
    { input: '', expected: '' },
    { input: 'MiXeD', expected: 'MIXED' },
    { input: '123', expected: '123' },
  ])('should convert "$input" to "$expected"', ({ input, expected }) => {
    expect(uppercase(input)).toBe(expected)
  })
})
```

**Benefits:**
- Covers multiple cases with single test definition
- Easy to add new test cases
- Clear input/output mapping
- Reduces code duplication

**❌ BAD: Repetitive individual tests**

```typescript
it('should uppercase hello', () => {
  expect(uppercase('hello')).toBe('HELLO')
})

it('should uppercase world', () => {
  expect(uppercase('world')).toBe('WORLD')
})

it('should handle empty string', () => {
  expect(uppercase('')).toBe('')
})
// ... repetitive!
```

### Mocking Dependencies

Use Vitest's mocking capabilities to isolate units:

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { getUserProfile } from './get-user-profile'
import { Database } from '@/lib/database'

// Mock the database module
vi.mock('@/lib/database', () => ({
  Database: {
    getUser: vi.fn(),
    getSessions: vi.fn(),
  }
}))

describe('getUserProfile', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })
  
  it('should fetch user and their sessions', async () => {
    // Arrange: Set up mock responses
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
    const mockSessions = [
      { id: 's1', userId: '1', createdAt: new Date() }
    ]
    
    vi.mocked(Database.getUser).mockResolvedValue(mockUser)
    vi.mocked(Database.getSessions).mockResolvedValue(mockSessions)
    
    // Act: Call the function
    const profile = await getUserProfile('1')
    
    // Assert: Verify the result
    expect(Database.getUser).toHaveBeenCalledWith('1')
    expect(Database.getSessions).toHaveBeenCalledWith({ userId: '1' })
    expect(profile).toEqual({
      user: mockUser,
      sessions: mockSessions,
      sessionCount: 1,
    })
  })
  
  it('should handle user not found', async () => {
    // Arrange
    vi.mocked(Database.getUser).mockResolvedValue(null)
    
    // Act & Assert
    await expect(getUserProfile('nonexistent')).rejects.toThrow('User not found')
  })
})
```

### Testing Async Functions

```typescript
describe('fetchUserData', () => {
  it('should fetch and parse user data', async () => {
    const userId = 'user-123'
    
    const data = await fetchUserData(userId)
    
    expect(data.id).toBe(userId)
    expect(data.name).toBeDefined()
  })
  
  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
    
    await expect(fetchUserData('user-123')).rejects.toThrow('Network error')
  })
})
```

### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })
  
  it('should call onSubmit with form data', async () => {
    const handleSubmit = vi.fn()
    render(<LoginForm onSubmit={handleSubmit} />)
    
    // Fill in form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))
    
    // Verify callback was called with correct data
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })
  
  it('should show validation error for invalid email', async () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid-email' }
    })
    fireEvent.blur(screen.getByLabelText('Email'))
    
    expect(await screen.findByText('Invalid email address')).toBeInTheDocument()
  })
})
```

---

## Integration Testing

Integration tests verify that multiple units work together correctly.

### Database Integration Tests

```typescript
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { Database } from '@/lib/database'
import { createTestDb, resetTestDb, cleanupTestDb } from '@/lib/db/test-utils'

describe('User Management Integration', () => {
  beforeEach(async () => {
    await resetTestDb()
  })
  
  afterAll(async () => {
    await cleanupTestDb()
  })

  it('should create user, session, and verify auth flow', async () => {
    // Create user
    const user = await Database.createUser({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    })
    
    expect(user.id).toBeDefined()
    expect(user.level).toBe(1) // Default user level
    
    // Create session
    const session = await Database.createSession({
      userId: user.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
    })
    
    expect(session.userId).toBe(user.id)
    expect(session.token).toBeDefined()
    
    // Verify user can be retrieved by session
    const retrievedUser = await Database.getUserBySession(session.token)
    expect(retrievedUser.id).toBe(user.id)
    expect(retrievedUser.email).toBe('test@example.com')
    
    // Verify session is active
    const isValid = await Database.isSessionValid(session.token)
    expect(isValid).toBe(true)
    
    // Delete session
    await Database.deleteSession(session.token)
    
    // Verify session is no longer valid
    const isStillValid = await Database.isSessionValid(session.token)
    expect(isStillValid).toBe(false)
  })
  
  it('should handle permission level upgrades', async () => {
    // Create regular user
    const user = await Database.createUser({
      email: 'user@example.com',
      name: 'Regular User',
      level: 1,
    })
    
    expect(user.level).toBe(1)
    
    // Upgrade to admin
    await Database.updateUserLevel(user.id, 3)
    
    // Verify level was updated
    const updated = await Database.getUser(user.id)
    expect(updated.level).toBe(3)
    
    // Verify admin can access admin resources
    const canAccess = await Database.checkPermission(user.id, 'admin_panel')
    expect(canAccess).toBe(true)
  })
})
```

### API Integration Tests

```typescript
import { describe, it, expect } from 'vitest'
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/users/route'

describe('GET /api/users', () => {
  it('should return list of users', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { page: '1', limit: '10' },
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(200)
    
    const data = JSON.parse(res._getData())
    expect(data.users).toBeInstanceOf(Array)
    expect(data.total).toBeGreaterThan(0)
    expect(data.page).toBe(1)
  })
  
  it('should require authentication', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {}, // No auth token
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(401)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Unauthorized'
    })
  })
})
```

---

## E2E Testing with Playwright

End-to-end tests simulate real user interactions in actual browsers.

### Why Playwright?

- **Cross-browser** - Test in Chromium, Firefox, and WebKit
- **Fast and reliable** - Auto-waiting, retry-ability, built-in
- **Rich API** - Powerful selectors and assertions
- **Debugging tools** - UI mode, trace viewer, screenshots
- **CI/CD ready** - Great CI integration

### Playwright Setup

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Install system dependencies (Linux)
npx playwright install-deps
```

### Playwright Configuration

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

### Basic E2E Test

```typescript
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/')
    
    // Check page loaded
    await expect(page).toHaveTitle(/MetaBuilder/)
    
    // Check for key elements
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
  })
  
  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    expect(errors).toEqual([])
  })
})
```

### Authentication Flow Test

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Fill in credentials
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForURL(/\/dashboard/)
    
    // Verify logged in
    await expect(page.locator('text=Welcome, Admin')).toBeVisible()
    
    // Verify session persists
    await page.reload()
    await expect(page).toHaveURL(/\/dashboard/)
  })
  
  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Verify error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
    
    // Verify still on login page
    await expect(page).toHaveURL(/\/login/)
  })
  
  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
    
    // Logout
    await page.click('button:has-text("Logout")')
    
    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/)
    
    // Verify cannot access protected pages
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
```

### CRUD Operations Test

```typescript
// e2e/crud/users.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
    
    // Navigate to users page
    await page.goto('/admin/users')
  })
  
  test('should create new user', async ({ page }) => {
    // Click create button
    await page.click('button:has-text("Create User")')
    
    // Fill form
    await page.fill('input[name="name"]', 'New User')
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.selectOption('select[name="level"]', '1')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page.locator('text=User created successfully')).toBeVisible()
    
    // Verify user in list
    await expect(page.locator('text=newuser@example.com')).toBeVisible()
  })
  
  test('should edit existing user', async ({ page }) => {
    // Find user row
    const userRow = page.locator('tr:has-text("newuser@example.com")')
    
    // Click edit
    await userRow.locator('button:has-text("Edit")').click()
    
    // Update name
    await page.fill('input[name="name"]', 'Updated User Name')
    
    // Save
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page.locator('text=User updated successfully')).toBeVisible()
    
    // Verify updated name
    await expect(page.locator('text=Updated User Name')).toBeVisible()
  })
  
  test('should delete user', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('tbody tr').count()
    
    // Find user and click delete
    const userRow = page.locator('tr:has-text("newuser@example.com")')
    await userRow.locator('button:has-text("Delete")').click()
    
    // Confirm deletion in dialog
    await page.locator('button:has-text("Confirm")').click()
    
    // Verify success
    await expect(page.locator('text=User deleted successfully')).toBeVisible()
    
    // Verify count decreased
    const newCount = await page.locator('tbody tr').count()
    expect(newCount).toBe(initialCount - 1)
    
    // Verify user not in list
    await expect(page.locator('text=newuser@example.com')).not.toBeVisible()
  })
})
```

### Page Object Model (POM)

```typescript
// e2e/pages/login-page.ts
import { Page, expect } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email)
    await this.page.fill('input[name="password"]', password)
    await this.page.click('button[type="submit"]')
  }

  async expectLoginSuccess() {
    await this.page.waitForURL(/\/dashboard/)
    await expect(this.page.locator('text=Welcome')).toBeVisible()
  }

  async expectLoginError(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible()
  }
}

// Usage in test
test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('admin@example.com', 'password123')
  await loginPage.expectLoginSuccess()
})
```

### Test Fixtures

```typescript
// e2e/fixtures/auth-fixture.ts
import { test as base, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('admin@example.com', 'password123')
    await loginPage.expectLoginSuccess()
    
    await use(page)
    
    // Cleanup: logout
    await page.click('button:has-text("Logout")')
  },
})

export { expect }

// Usage
import { test, expect } from './fixtures/auth-fixture'

test('should access admin panel', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/admin')
  await expect(authenticatedPage.locator('h1')).toHaveText('Admin Panel')
})
```

---

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test src/lib/users/get-user.test.ts

# Run tests matching pattern
npm test -- --grep="user authentication"

# Check function coverage
npm run test:check-functions

# Generate coverage report
npm run test:coverage:report
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/auth/login.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Run in UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Debug specific test
npx playwright test --debug e2e/auth/login.spec.ts

# Run only failed tests
npx playwright test --last-failed

# View HTML report
npx playwright show-report

# Update snapshots
npx playwright test --update-snapshots
```

### Continuous Integration

```bash
# CI-friendly command (no watch, exit on failure)
npm run test:ci

# Run all tests including E2E
npm run test:all
```

---

## Best Practices

### General Testing Best Practices

1. **Write Tests First (TDD)** - Design your API through tests
2. **Keep Tests Focused** - One test should test one thing
3. **Make Tests Independent** - Tests should not depend on each other
4. **Use Descriptive Names** - Test names should describe what they test
5. **Follow AAA Pattern** - Arrange, Act, Assert
6. **Avoid Test Logic** - Tests should be simple and straightforward
7. **Use Parameterized Tests** - Test multiple cases efficiently
8. **Keep Tests Fast** - Slow tests won't be run frequently
9. **Mock External Dependencies** - Isolate units under test
10. **Clean Up After Tests** - Reset state in afterEach/afterAll

### Unit Test Best Practices

```typescript
// ✅ GOOD: Focused, descriptive, parameterized
describe('calculateDiscount', () => {
  it.each([
    { price: 100, discount: 0.1, expected: 90 },
    { price: 50, discount: 0.2, expected: 40 },
    { price: 200, discount: 0, expected: 200 },
  ])('should calculate $expected for price=$price with discount=$discount', 
    ({ price, discount, expected }) => {
      expect(calculateDiscount(price, discount)).toBe(expected)
    }
  )
})

// ❌ BAD: Vague name, not parameterized
describe('discount', () => {
  it('works', () => {
    expect(calculateDiscount(100, 0.1)).toBe(90)
  })
})
```

### Playwright Best Practices

1. **Use Data-testid for Stability**
   ```typescript
   // Component
   <button data-testid="submit-button">Submit</button>
   
   // Test
   await page.click('[data-testid="submit-button"]')
   ```

2. **Wait for Network Idle**
   ```typescript
   await page.goto('/dashboard', { waitUntil: 'networkidle' })
   ```

3. **Use Built-in Auto-waiting**
   ```typescript
   // Playwright automatically waits for element to be visible and actionable
   await page.click('button')
   await page.fill('input', 'value')
   ```

4. **Take Screenshots for Debugging**
   ```typescript
   test('complex flow', async ({ page }) => {
     await page.goto('/dashboard')
     await page.screenshot({ path: 'dashboard-before.png' })
     
     // ... perform actions ...
     
     await page.screenshot({ path: 'dashboard-after.png' })
   })
   ```

5. **Use Trace for Debugging**
   ```typescript
   // In playwright.config.ts
   use: {
     trace: 'on-first-retry', // or 'on', 'off', 'retain-on-failure'
   }
   
   // View trace
   // npx playwright show-trace trace.zip
   ```

6. **Test Multiple Viewports**
   ```typescript
   test('should work on mobile', async ({ page }) => {
     await page.setViewportSize({ width: 375, height: 667 })
     await page.goto('/')
     // ... test mobile layout
   })
   ```

### Common Pitfalls to Avoid

❌ **Don't test implementation details**
```typescript
// BAD: Testing internal state
expect(component.state.isLoading).toBe(true)

// GOOD: Testing observable behavior
expect(screen.getByText('Loading...')).toBeVisible()
```

❌ **Don't use sleeps/arbitrary waits**
```typescript
// BAD
await page.waitForTimeout(5000)

// GOOD
await page.waitForSelector('[data-testid="loaded"]')
await expect(page.locator('text=Data loaded')).toBeVisible()
```

❌ **Don't depend on test execution order**
```typescript
// BAD: Tests depend on each other
test('create user', () => { /* creates user */ })
test('update user', () => { /* assumes user exists */ })

// GOOD: Each test is independent
test('update user', () => {
  // Create user in this test
  const user = createTestUser()
  // Now update it
  updateUser(user.id)
})
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run typecheck
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
  
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
      
      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: test-results/
          retention-days: 7
```

---

## Troubleshooting

### Common Issues

#### Playwright Tests Timing Out

**Problem:** Tests hang or timeout
```
Error: Test timeout of 30000ms exceeded
```

**Solution:**
1. Increase timeout in config
   ```typescript
   // playwright.config.ts
   timeout: 60 * 1000, // 60 seconds
   ```

2. Wait for specific conditions
   ```typescript
   await page.waitForLoadState('networkidle')
   await page.waitForSelector('[data-testid="loaded"]')
   ```

#### Tests Failing in CI but Passing Locally

**Problem:** "Flaky" tests that pass locally but fail in CI

**Solutions:**
1. Wait for network idle
   ```typescript
   await page.goto('/', { waitUntil: 'networkidle' })
   ```

2. Increase timeouts for CI
   ```typescript
   retries: process.env.CI ? 2 : 0
   ```

3. Take screenshots on failure
   ```typescript
   screenshot: 'only-on-failure'
   ```

#### Cannot Find Element

**Problem:**
```
Error: Element not found: button:has-text("Submit")
```

**Solutions:**
1. Wait for element to be visible
   ```typescript
   await expect(page.locator('button:has-text("Submit")')).toBeVisible()
   ```

2. Use more specific selectors
   ```typescript
   await page.click('[data-testid="submit-button"]')
   ```

3. Check if element is in a frame
   ```typescript
   const frame = page.frame({ name: 'my-frame' })
   await frame?.click('button')
   ```

### Debugging Tips

#### Playwright Debug Mode

```bash
# Run single test in debug mode
npx playwright test --debug e2e/auth/login.spec.ts

# Debug from specific line
npx playwright test --debug e2e/auth/login.spec.ts:10
```

#### Playwright UI Mode

```bash
# Interactive test runner
npx playwright test --ui
```

#### View Test Traces

```bash
# View trace of failed test
npx playwright show-trace test-results/path-to-trace.zip
```

#### Console Logging

```typescript
test('debug test', async ({ page }) => {
  // Listen to console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()))
  
  // Listen to page errors
  page.on('pageerror', error => console.log('PAGE ERROR:', error))
  
  await page.goto('/')
})
```

---

## Summary

MetaBuilder's testing strategy ensures high quality through:

1. **TDD Methodology** - Write tests first, implement second
2. **Testing Pyramid** - Right balance of unit, integration, and E2E tests
3. **Playwright E2E** - Reliable cross-browser testing
4. **High Coverage** - >80% code coverage goal
5. **Fast Feedback** - Tests run quickly and provide immediate feedback
6. **CI Integration** - Automated testing on every commit

### Quick Reference

| Task | Command |
|------|---------|
| Run unit tests | `npm test` |
| Run with coverage | `npm run test:coverage` |
| Run E2E tests | `npx playwright test` |
| Debug E2E test | `npx playwright test --debug` |
| View E2E report | `npx playwright show-report` |
| Run in UI mode | `npx playwright test --ui` |

### Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [TDD by Martin Fowler](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Document Status:** 📘 Complete Testing Guide  
**Version:** 1.0.0  
**Last Updated:** January 8, 2026

*This guide is a living document. Please update it as testing practices evolve.*
