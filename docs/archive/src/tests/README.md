# Testing

## Overview
Test suites for unit testing, integration testing, and end-to-end testing.

## Location
[/src/tests/](/src/tests/)

## Related E2E Tests
End-to-end tests are located in [/e2e/](/e2e/) directory.

## Test Configuration
- Vitest configuration: `vitest.config.ts`
- Playwright E2E configuration: `playwright.config.ts`

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# Linting
npm run lint
npm run lint:fix
```

## Test Files in /src/tests/
Unit and integration tests for source code modules.

## Test Files in /e2e/
End-to-end tests:
- `smoke.spec.ts` - Smoke tests
- `login.spec.ts` - Authentication tests
- `crud.spec.ts` - CRUD operation tests

## Related Documentation
- [Development Guide](/docs/development)
- [Testing Guide](/docs/development/testing.md)
