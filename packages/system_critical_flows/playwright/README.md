# Playwright Tests: System Critical Flows

**24 end-to-end tests proving critical MetaBuilder functionality works.**

## Test Coverage

### Flow 1: Public Discovery & Login (3 tests)
- Hero page loads with marketing content
- Features section displays
- Navigation to login from CTA button

### Flow 2: Authentication & Session (4 tests)
- Login page renders with form elements
- Empty form validation rejects submission
- Login with test credentials succeeds
- Session persists on page reload

### Flow 3: User Dashboard (3 tests)
- Dashboard displays user profile
- Dashboard shows available packages
- Navigation menu displays with logout option

### Flow 4: Admin User Management (3 tests)
- Admin can access user management page
- User list displays with pagination
- Admin can view role management page

### Flow 5: Package Management (3 tests)
- Package manager page is accessible
- Available packages are listed
- Package action buttons are interactive

### Flow 6: Navigation & Discovery (3 tests)
- Header navigation works on home page
- Footer displays with links
- Mobile responsive navigation (375px viewport)

### Flow 7: Error Handling (2 tests)
- 404 page displays for invalid routes
- Page loads within acceptable time (<6s)

## Test Files

- `tests.json` - All 24 test definitions in declarative JSON format
- `metadata.json` - Entity metadata
- `README.md` - This file

## Execution

```bash
# All tests
npm run test:e2e

# By tag
npm run test:e2e -- --grep "@smoke"
npm run test:e2e -- --grep "@critical"
npm run test:e2e -- --grep "@auth"
npm run test:e2e -- --grep "@admin"

# Specific flow
npm run test:e2e -- --grep "Flow 1"
npm run test:e2e -- --grep "Flow 2"
```

## Implementation Notes

- All tests use declarative JSON (no hardcoded code)
- Follows `playwright.schema.json` specification
- Auto-discovered by unified test runner
- Executed with database seeding via `global.setup.ts`
- Uses Playwright's built-in test configuration

## Test Characteristics

| Aspect | Details |
|--------|---------|
| Format | JSON (declarative) |
| Tests | 24 total |
| Flows | 10 categories |
| Tags | 12 filter categories |
| Timeouts | 10s default, 6s for performance tests |
| Actions | 15+ action types supported |
| Assertions | 20+ matcher types |
| Fixtures | Test user credentials |

## Architecture Pattern

This demonstrates the "JSON Interpreter Everywhere" pattern:

```
tests.json (Data)
    ↓
json-runner/playwright-json-runner.ts (Interpreter)
    ↓
Playwright (Executor)
    ↓
Results (Evidence)
```

- **95% configuration** (JSON test definitions)
- **5% code** (Playwright runner + interpreter)
- **Tests as data**, not code
