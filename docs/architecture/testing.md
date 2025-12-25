# Testing Guide

Comprehensive testing strategy for MetaBuilder covering unit, integration, and end-to-end tests.

## 🧪 Testing Pyramid

```
          E2E Tests (few)
              /\
             /  \
        Integration (some)
           /      \
       Unit Tests (many)
      /          \
```

## 📊 Test Coverage

Current test coverage:

- **Unit Tests**: Utilities, hooks, utilities
- **Integration Tests**: API routes, database operations
- **E2E Tests**: Full user flows

## 🏃 Running Tests

### Unit Tests

```bash
# Run once
npm run test:unit

# Watch mode (rerun on file changes)
npm run test:unit:watch

# With UI
npm run test:unit:ui

# Coverage report
npm run test:unit:coverage
```

### End-to-End Tests

```bash
# Run all tests
npm run test:e2e

# Run specific file
npm run test:e2e -- login.spec.ts

# Interactive UI
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npx playwright test --debug
```

### All Tests

```bash
npm run test:all
```

## 📁 Test Structure

### Unit Tests

Location: `src/**/*.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### E2E Tests

Location: `e2e/**/*.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  // ... interactions and assertions
  await expect(page).toHaveURL('/');
});
```

## ✅ Test Patterns

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

it('increments counter', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

it('renders content', () => {
  render(<MyComponent title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Testing API Routes

```typescript
it('POST /api/users returns 201', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name: 'John' })
  });
  
  expect(response.status).toBe(201);
});
```

### Testing Permissions

```typescript
it('admin can access admin panel', async ({ page }) => {
  await loginAs('admin'); // Helper function
  await page.goto('/admin');
  await expect(page).toHaveURL('/admin');
});

it('user cannot access admin panel', async ({ page }) => {
  await loginAs('user');
  await page.goto('/admin');
  await expect(page).not.toHaveURL('/admin');
});
```

## 🎯 Test Categories

### Critical Paths (Must Test)

- ✅ Authentication & login
- ✅ Permission checks
- ✅ CRUD operations
- ✅ Data validation
- ✅ Error handling
- ✅ Multi-tenancy isolation

### Important (Should Test)

- ✅ Navigation
- ✅ Form submission
- ✅ Data filtering/sorting
- ✅ Complex workflows
- ✅ Integration between components

### Nice-to-Have (Can Skip)

- Visual regression tests
- Performance benchmarks
- Accessibility tests
- Browser compatibility

## 🐛 Debugging Tests

### View Test UI

```bash
npm run test:unit:ui
```

### See Browser During E2E

```bash
npm run test:e2e:headed
```

### Debug Single Test

```bash
npx playwright test login.spec.ts --debug
```

### Add Console Logs

```typescript
test('my test', async ({ page }) => {
  console.log('About to navigate');
  await page.goto('/');
  console.log('Navigation complete');
});
```

## 📈 Coverage Goals

| Type | Current | Target |
|------|---------|--------|
| Unit Test | 60% | 75% |
| E2E Tests | 8 tests | 15 tests |
| Critical Paths | ✅ Full | ✅ Full |
| Integration | 40% | 60% |

## 🚀 CI/CD Integration

Tests run automatically on:

- **Push to main** - All tests must pass
- **Pull requests** - Code review blocks merge
- **Before deploy** - Production deployment verified

See `.github/workflows/` for configuration.

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Test Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🔗 Related

- [E2E Tests Directory](../../e2e/README.md)
- [Development Guide](../guides/api-development.md)
- [Getting Started](../guides/getting-started.md)
