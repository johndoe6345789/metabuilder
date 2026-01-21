# Testing Guide for Table Manager and Column Manager Features

This document describes the test coverage for the newly implemented Table Manager and Column Manager features in the PostgreSQL Admin Panel.

## Test Files

### Integration Tests (Playwright API Tests)

#### 1. `tests/integration/TableManager.spec.ts`
Tests for the Table Management API endpoints (`/api/admin/table-manage`):

**Create Table Tests:**
- ✅ Creates new table with proper column definitions
- ✅ Validates table name is required
- ✅ Validates at least one column is required
- ✅ Rejects invalid table names (SQL injection prevention)
- ✅ Requires authentication for all operations

**Drop Table Tests:**
- ✅ Validates table name is required
- ✅ Rejects invalid table names
- ✅ Requires authentication

**Test Coverage:**
- Input validation
- SQL injection prevention
- Authentication/authorization
- Error handling

#### 2. `tests/integration/ColumnManager.spec.ts`
Tests for the Column Management API endpoints (`/api/admin/column-manage`):

**Add Column Tests:**
- ✅ Requires authentication
- ✅ Validates all required fields (tableName, columnName, dataType)
- ✅ Rejects invalid table names
- ✅ Rejects invalid column names
- ✅ Accepts columns with NOT NULL constraint
- ✅ Accepts columns with DEFAULT values
- ✅ Accepts columns with both DEFAULT and NOT NULL

**Modify Column Tests:**
- ✅ Requires authentication
- ✅ Validates required fields
- ✅ Rejects invalid identifiers
- ✅ Accepts setting NOT NULL constraint
- ✅ Accepts dropping NOT NULL constraint

**Drop Column Tests:**
- ✅ Requires authentication
- ✅ Validates required fields
- ✅ Rejects invalid identifiers

**Test Coverage:**
- Input validation
- SQL injection prevention
- Authentication/authorization
- Error handling for all CRUD operations

### End-to-End Tests (Playwright UI Tests)

#### 3. `tests/e2e/AdminDashboard.e2e.ts`
Tests for the admin dashboard UI and user flows:

**Navigation Tests:**
- ✅ Redirects to login when not authenticated
- ✅ Displays login page with proper form elements

**Table Manager UI Tests:**
- 🔄 Display Table Manager tab (requires auth - skipped)
- 🔄 Open create table dialog (requires auth - skipped)

**Column Manager UI Tests:**
- 🔄 Display Column Manager tab (requires auth - skipped)
- 🔄 Show table selector (requires auth - skipped)

**Security Tests:**
- ✅ Blocks admin API access without authentication
- ✅ Blocks table management without authentication
- ✅ Blocks column management without authentication

**Note:** Some UI tests are skipped because they require an authenticated session. These can be enabled when a test authentication mechanism is implemented.

## Feature: Record CRUD Operations Tests

### Integration Tests (Playwright API Tests)

#### 1. `tests/integration/RecordCRUD.spec.ts`
Tests for the Record CRUD API endpoints (`/api/admin/record`):

**Create Record Tests:**
- ✅ Rejects create without authentication
- ✅ Rejects create without table name
- ✅ Rejects create with invalid table name
- ✅ Rejects create without data

**Update Record Tests:**
- ✅ Rejects update without authentication
- ✅ Rejects update without required fields
- ✅ Rejects update with invalid table name

**Delete Record Tests:**
- ✅ Rejects delete without authentication
- ✅ Rejects delete without required fields
- ✅ Rejects delete with invalid table name

**Test Coverage:**
- Input validation
- SQL injection prevention
- Authentication/authorization
- Error handling for all CRUD operations

## Feature: SQL Query Interface Tests

### Integration Tests (Playwright API Tests)

#### 2. `tests/integration/QueryInterface.spec.ts`
Tests for the SQL Query API endpoint (`/api/admin/query`):

**Query Execution Tests:**
- ✅ Rejects query without authentication
- ✅ Rejects query without query text
- ✅ Rejects non-SELECT queries (DELETE, INSERT, UPDATE, DROP, ALTER, CREATE)
- ✅ Rejects queries with SQL injection attempts
- ✅ Accepts valid SELECT queries

**Test Coverage:**
- Input validation
- SQL injection prevention (only SELECT allowed)
- Authentication/authorization
- Security validation for dangerous SQL operations

## Feature: Table Data and Schema Tests

### Integration Tests (Playwright API Tests)

#### 3. `tests/integration/TableDataSchema.spec.ts`
Tests for Table Data and Schema API endpoints:

**List Tables Tests:**
- ✅ Rejects list tables without authentication

**Get Table Data Tests:**
- ✅ Rejects get table data without authentication
- ✅ Rejects get table data without table name
- ✅ Rejects get table data with invalid table name
- ✅ Accepts pagination parameters

**Get Table Schema Tests:**
- ✅ Rejects get table schema without authentication
- ✅ Rejects get table schema without table name
- ✅ Rejects get table schema with invalid table name
- ✅ Accepts valid table name format

**Test Coverage:**
- Input validation
- SQL injection prevention
- Authentication/authorization
- Pagination support validation

**Note:** Some UI tests are skipped because they require an authenticated session. These can be enabled when a test authentication mechanism is implemented.

## Running Tests

### Run All Tests
```bash
npm test              # Run Vitest unit tests
npm run test:e2e      # Run Playwright E2E tests
```

### Run Specific Test Files
```bash
# Run integration tests only
npx playwright test tests/integration/

# Run specific test file
npx playwright test tests/integration/TableManager.spec.ts

# Run e2e tests only
npx playwright test tests/e2e/
```

### Run Tests in Watch Mode
```bash
npm run test -- --watch        # Vitest watch mode
```

### Run Tests with UI
```bash
npx playwright test --ui       # Playwright UI mode
```

## Test Structure

### Integration Tests Pattern
```typescript
test.describe('Feature Name', () => {
  test.describe('Specific Functionality', () => {
    test('should do something specific', async ({ page }) => {
      const response = await page.request.post('/api/endpoint', {
        data: { /* test data */ },
      });
      
      expect(response.status()).toBe(expectedStatus);
    });
  });
});
```

### E2E Tests Pattern
```typescript
test.describe('UI Feature', () => {
  test('should display correct elements', async ({ page }) => {
    await page.goto('/path');
    
    await expect(page.getByRole('button', { name: /action/i })).toBeVisible();
  });
});
```

## Security Testing

All tests verify that:
1. **Authentication is required** for admin operations
2. **Input validation** prevents SQL injection
3. **Invalid identifiers** are rejected (table/column names)
4. **Error messages** don't leak sensitive information

## Test Coverage Summary

| Feature | API Tests | UI Tests | Security Tests | Unit Tests | Total Tests |
|---------|-----------|----------|----------------|------------|-------------|
| Feature Config | - | - | - | 40 | 40 |
| Table Manager | 7 | 2 (2 skipped) | 3 | - | 12 |
| Column Manager | 12 | 2 (2 skipped) | 3 | - | 17 |
| Constraint Manager | 15 | 3 (3 skipped) | 4 | 5 | 27 |
| Record CRUD | 9 | - | 3 | - | 12 |
| Query Interface | 10 | - | 1 | - | 11 |
| Query Builder | 20 | - | 4 | - | 24 |
| Index Management | 27 | - | 4 | - | 31 |
| Table Data/Schema | 7 | - | 3 | - | 10 |
| Admin Dashboard | - | 3 | 3 | - | 6 |
| **Total** | **107** | **10** | **28** | **45** | **190** |

## Feature: Constraint Management Tests

### Integration Tests (Playwright API Tests)

#### 1. `tests/integration/ConstraintManager.spec.ts`
Tests for the Constraint Management API endpoints (`/api/admin/constraints`):

**List Constraints Tests:**
- ✅ Rejects list without authentication
- ✅ Rejects list without table name
- ✅ Rejects list with invalid table name

**Add Constraint Tests:**
- ✅ Rejects add without authentication
- ✅ Rejects add without required fields
- ✅ Rejects add with invalid table name
- ✅ Rejects PRIMARY KEY constraint without column name
- ✅ Rejects UNIQUE constraint without column name
- ✅ Rejects CHECK constraint without expression
- ✅ Rejects CHECK constraint with dangerous expression (SQL injection prevention)
- ✅ Rejects unsupported constraint types

**Drop Constraint Tests:**
- ✅ Rejects drop without authentication
- ✅ Rejects drop without required fields
- ✅ Rejects drop with invalid identifiers

**Test Coverage:**
- Input validation
- SQL injection prevention
- Authentication/authorization
- Error handling for all CRUD operations
- Support for PRIMARY KEY, UNIQUE and CHECK constraints

### End-to-End Tests (Playwright UI Tests)

#### 2. `tests/e2e/AdminDashboard.e2e.ts` - Constraints Manager UI

**UI Tests:**
- 🔄 Display Constraints tab (requires auth - skipped)
- 🔄 Show table selector in Constraints Manager (requires auth - skipped)
- 🔄 Open add constraint dialog (requires auth - skipped)

**Security Tests:**
- ✅ Blocks constraint API access without authentication

**Note:** UI tests are skipped because they require an authenticated session. These can be enabled when a test authentication mechanism is implemented.

## Feature: Query Builder Tests

### Integration Tests (Playwright API Tests)

#### `tests/integration/QueryBuilder.spec.ts`
Tests for the Query Builder API endpoint (`/api/admin/query-builder`):

**Authentication Tests:**
- ✅ Rejects query builder without authentication

**Input Validation Tests:**
- ✅ Rejects query without table name
- ✅ Rejects query with invalid table name
- ✅ Rejects query with invalid column name
- ✅ Rejects query with invalid operator
- ✅ Rejects IN operator without array value
- ✅ Rejects operator requiring value without value
- ✅ Rejects invalid LIMIT value
- ✅ Rejects invalid OFFSET value

**Query Building Tests:**
- ✅ Accepts valid table name
- ✅ Accepts query with column selection
- ✅ Accepts query with WHERE conditions
- ✅ Accepts IS NULL operator without value
- ✅ Accepts IS NOT NULL operator without value
- ✅ Accepts IN operator with array value
- ✅ Accepts query with ORDER BY
- ✅ Accepts query with LIMIT
- ✅ Accepts query with OFFSET
- ✅ Accepts comprehensive query (all features combined)

**SQL Injection Prevention Tests:**
- ✅ Rejects SQL injection in table name
- ✅ Rejects SQL injection in column name
- ✅ Rejects SQL injection in WHERE column
- ✅ Rejects SQL injection in ORDER BY column

**Test Coverage:**
- Visual query builder with table/column selection
- WHERE clause conditions with multiple operators
- ORDER BY with ASC/DESC direction
- LIMIT and OFFSET for pagination
- SQL injection prevention
- Authentication/authorization
- Comprehensive input validation

## Feature: Index Management Tests

### Integration Tests (Playwright API Tests)

#### `tests/integration/IndexManagement.spec.ts`
Tests for the Index Management API endpoint (`/api/admin/indexes`):

**Authentication Tests:**
- ✅ Rejects list indexes without authentication
- ✅ Rejects create index without authentication
- ✅ Rejects delete index without authentication

**Input Validation - List Indexes:**
- ✅ Rejects list without table name
- ✅ Rejects list with invalid table name

**Input Validation - Create Index:**
- ✅ Rejects create without table name
- ✅ Rejects create without index name
- ✅ Rejects create without columns
- ✅ Rejects create with empty columns array
- ✅ Rejects create with invalid table name
- ✅ Rejects create with invalid index name
- ✅ Rejects create with invalid column name
- ✅ Rejects create with invalid index type

**Input Validation - Delete Index:**
- ✅ Rejects delete without index name
- ✅ Rejects delete with invalid index name

**Valid Requests:**
- ✅ Accepts valid list request
- ✅ Accepts valid create request with single column
- ✅ Accepts valid create request with multiple columns
- ✅ Accepts create request with unique flag
- ✅ Accepts create request with HASH index type
- ✅ Accepts create request with GIN index type
- ✅ Accepts create request with GIST index type
- ✅ Accepts create request with BRIN index type
- ✅ Accepts valid delete request

**SQL Injection Prevention Tests:**
- ✅ Rejects SQL injection in table name
- ✅ Rejects SQL injection in index name (create)
- ✅ Rejects SQL injection in column name
- ✅ Rejects SQL injection in index name (delete)

**Test Coverage:**
- Index listing for tables
- Index creation (single and multi-column)
- Index type selection (BTREE, HASH, GIN, GIST, BRIN)
- Unique index creation
- Index deletion
- SQL injection prevention
- Authentication/authorization
- Comprehensive input validation

**Note:** UI tests are skipped because they require an authenticated session. These can be enabled when a test authentication mechanism is implemented.

**Components Implemented:**
- ✅ `ConstraintManagerTab.tsx` - Main UI component for managing constraints
- ✅ `ConstraintDialog.tsx` - Reusable dialog for add/delete constraint operations
- ✅ Integration with admin dashboard navigation and handlers

### Unit Tests

#### 2. `src/utils/featureConfig.test.ts`
Tests for the constraint types configuration:

**Constraint Types Tests:**
- ✅ Returns array of constraint types
- ✅ Validates constraint type properties
- ✅ Includes PRIMARY KEY constraint type with correct flags
- ✅ Includes UNIQUE constraint type with correct flags
- ✅ Includes CHECK constraint type with correct flags

## Future Test Improvements

### Short Term
- [ ] Add authenticated session fixture for UI tests
- [ ] Enable skipped UI tests with proper authentication
- [ ] Add tests for success scenarios with valid credentials
- [ ] Test visual column builder interactions
- [ ] Test schema refresh after operations

### Medium Term
- [ ] Add performance tests for large table operations
- [ ] Add accessibility tests (a11y)
- [ ] Add visual regression tests
- [ ] Test error recovery and rollback scenarios
- [ ] Add tests for concurrent operations

### Long Term
- [ ] Integration tests with real PostgreSQL database
- [ ] Load testing for multiple simultaneous users
- [ ] Cross-browser compatibility tests
- [ ] Mobile responsiveness tests

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example CI configuration
- name: Run Integration Tests
  run: npm run test:e2e -- tests/integration/

- name: Run E2E Tests
  run: npm run test:e2e -- tests/e2e/
```

## Test Data Management

- Tests use **faker** library for generating random test data
- Each test run creates unique table names to avoid conflicts
- Tests validate authentication is required, so they expect 401 responses when not authenticated
- No database cleanup is required for API validation tests

## Debugging Tests

### View Test Results
```bash
npx playwright show-report     # View HTML report
```

### Debug Specific Test
```bash
npx playwright test --debug tests/integration/TableManager.spec.ts
```

### View Test Traces
```bash
npx playwright show-trace trace.zip
```

## Contributing

When adding new features:
1. Add integration tests for new API endpoints
2. Add E2E tests for new UI components
3. Ensure security tests cover authentication
4. Update this documentation with new test coverage
5. Run all tests before submitting PR

---

**Last Updated:** January 2026
**Test Framework:** Playwright + Vitest
**Coverage Status:** ✅ API Validation | 🔄 UI Tests (partial - needs auth) | ✅ Constraint Manager UI Complete | ✅ Comprehensive CRUD and Query Tests
