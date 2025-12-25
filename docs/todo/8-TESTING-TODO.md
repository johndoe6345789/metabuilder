# TODO 8 - Testing & Quality

## Unit Testing

- [x] Achieve 80%+ code coverage across all modules ✅ (91% achieved)
- [x] Add parameterized tests using `it.each()` pattern ✅ (576 tests across 83 files)
- [ ] Create test utilities for common setup/teardown
- [ ] Add snapshot tests for component rendering
- [ ] Implement property-based testing for validation logic

### Test Coverage Summary (Updated Dec 25, 2025)
- **Total Tests**: 576 passing
- **Test Files**: 83 files
- Tests updated to reflect MUI migration (removed Tailwind class merging expectations)

## Integration Testing

- [ ] Add API integration tests for all endpoints
- [ ] Create database integration tests with test fixtures
- [ ] Implement package system integration tests
- [ ] Add workflow engine integration tests
- [ ] Create DBAL integration tests (TypeScript ↔ C++)

## End-to-End Testing

- [ ] Expand Playwright test coverage
- [ ] Add critical user journey tests
- [ ] Implement visual regression testing
- [ ] Create accessibility (a11y) test suite
- [ ] Add cross-browser testing configuration

## Test Infrastructure

- [x] Set up parallel test execution ✅ (Vitest runs parallel by default)
- [ ] Add test result reporting to CI
- [x] Create test data factories ✅ (helper functions in tests)
- [ ] Implement test database isolation
- [ ] Add flaky test detection and reporting

## Quality Metrics

- [ ] Configure size limits for components and functions
- [ ] Add cyclomatic complexity checks
- [ ] Implement code duplication detection
- [ ] Create maintainability index tracking
- [ ] Add dependency vulnerability scanning

## Stub Detection

- [ ] Review and fix all detected stub implementations
- [x] Update TODO scan to include `.github` ✅ (`scan-project-todos.py` now uses `rg --hidden`)
- [ ] Convert TODO comments to GitHub issues (use `TODO_SCAN_REPORT.md` as input)
- [ ] Implement completeness scoring tracking over time
- [ ] Add stub detection to PR checks (blocking critical stubs)
- [ ] Create stub-to-implementation tracking dashboard

## Test Documentation

- [ ] Document testing conventions and patterns
- [ ] Create testing guide for contributors
- [ ] Add test coverage requirements to PR template
- [ ] Document test environment setup
