# Declarative Testing Architecture for MetaBuilder

**Status**: DESIGN DOCUMENT - Ready for Implementation
**Date**: January 21, 2026
**Objective**: Complete 100% data-driven architecture by making all tests declarative (Playwright, Storybook, Unit)

---

## Executive Summary

MetaBuilder already achieves **95% data-driven architecture** through declarative configuration. The final 5% missing is the **testing layer**. This document outlines how to make ALL testing declarative (not TypeScript) by consolidating Playwright E2E flows, Storybook component stories, and unit tests into the packages system as JSON definitions.

**Current State:**
- ✅ Playwright tests: Declarative JSON in `packages/*/playwright/tests.json` (exists!)
- ✅ Storybook stories: Declarative JSON in `packages/*/storybook/stories.json` (exists!)
- ❌ Unit tests: Still TypeScript `.spec.ts` files (needs conversion!)

**Proposed End State:**
- ✅ Unit tests: Declarative JSON in `packages/*/unit-tests/tests.json` (NEW!)
- ✅ Centralized test runner that executes all three declaratively
- ✅ 100% data-driven architecture achieved

---

## Current Testing Infrastructure

### 1. Playwright E2E Tests (ALREADY DECLARATIVE) ✅

**Location**: `packages/*/playwright/tests.json`

**Example**: `/packages/ui_home/playwright/tests.json`
```json
{
  "$schema": "https://metabuilder.dev/schemas/package-playwright.schema.json",
  "package": "ui_home",
  "tests": [
    {
      "name": "should load home page successfully",
      "tags": ["@smoke", "@critical"],
      "steps": [
        { "action": "navigate", "url": "/" },
        { "action": "waitForLoadState", "state": "domcontentloaded" },
        { "action": "expect", "selector": "body", "assertion": { "matcher": "toContainText", "expected": "MetaBuilder" } }
      ]
    }
  ]
}
```

**Runner**: `/e2e/json-runner/` - Loads and executes declarative tests

---

### 2. Storybook Stories (ALREADY DECLARATIVE) ✅

**Location**: `packages/*/storybook/stories.json`

**Example**: `/packages/ui_home/storybook/stories.json`
```json
{
  "$schema": "https://metabuilder.dev/schemas/package-storybook.schema.json",
  "title": "Home Page Components",
  "stories": [
    {
      "name": "HomePage",
      "render": "home_ui",
      "description": "Complete home page with all sections"
    }
  ]
}
```

**Runner**: `storybook/json-loader/` - Loads and renders declarative stories

---

### 3. Unit Tests (NOT YET DECLARATIVE) ❌

**Current Location**: `e2e/**/*.spec.ts` (TypeScript)

**Problem**:
- Tests live outside package system
- Written in TypeScript (not data)
- Cannot be managed as configuration
- Not discoverable by package system

**Proposed Location**: `packages/*/unit-tests/tests.json` (JSON)

**Schema**: Schema already exists at `/schemas/package-schemas/tests_schema.json`

---

## Proposed Unit Test Declarative Format

### Package Structure

```
packages/[packageId]/
├── unit-tests/
│   ├── tests.json              [Declarative unit tests]
│   ├── fixtures.json           [Test data/mocks]
│   └── README.md               [Test documentation]
├── playwright/
│   ├── tests.json              [E2E flows]
│   └── metadata.json           [Configuration]
└── storybook/
    ├── stories.json            [Component stories]
    └── config.json             [Configuration]
```

### Unit Test JSON Format Example

```json
{
  "$schema": "https://metabuilder.dev/schemas/tests.schema.json",
  "schemaVersion": "2.0.0",
  "package": "ui_home",
  "description": "Unit tests for Home Page components",
  "imports": [
    {
      "from": "@testing-library/react",
      "import": ["render", "screen", "fireEvent"]
    },
    {
      "from": "@/components/home",
      "import": ["HomePage", "HeroSection"]
    }
  ],
  "setup": {
    "beforeEach": [
      {
        "type": "fixture",
        "name": "clearMocks",
        "config": {
          "target": "localStorage"
        }
      }
    ]
  },
  "testSuites": [
    {
      "id": "hero-section",
      "name": "HeroSection Component",
      "tests": [
        {
          "id": "renders-title",
          "name": "should render hero title",
          "arrange": {
            "component": "HeroSection",
            "props": {
              "title": "Build Anything, Visually",
              "subtitle": "No code required."
            }
          },
          "act": {
            "render": true
          },
          "assert": [
            {
              "selector": ".hero-title",
              "matcher": "toHaveTextContent",
              "expected": "Build Anything"
            },
            {
              "selector": ".hero-subtitle",
              "matcher": "toBeVisible"
            }
          ]
        },
        {
          "id": "renders-cta-buttons",
          "name": "should render call-to-action buttons",
          "arrange": {
            "component": "HeroSection",
            "props": { "title": "Test", "subtitle": "Test" }
          },
          "act": { "render": true },
          "assert": [
            {
              "role": "button",
              "text": "Get Started",
              "matcher": "toBeVisible"
            },
            {
              "role": "button",
              "text": "Watch Demo",
              "matcher": "toBeVisible"
            }
          ]
        }
      ]
    },
    {
      "id": "home-page",
      "name": "HomePage Component",
      "tests": [
        {
          "id": "renders-all-sections",
          "name": "should render all page sections",
          "arrange": {
            "component": "HomePage"
          },
          "act": { "render": true },
          "assert": [
            { "selector": ".hero-section", "matcher": "toBeInTheDocument" },
            { "selector": ".features-section", "matcher": "toBeInTheDocument" },
            { "selector": ".about-section", "matcher": "toBeInTheDocument" },
            { "selector": ".contact-section", "matcher": "toBeInTheDocument" }
          ]
        }
      ]
    }
  ]
}
```

---

## Universal Test Runner

### Centralized Test Execution

```
npm run test           # Run all tests (all types)
npm run test:e2e       # Run Playwright E2E tests
npm run test:stories   # Validate Storybook stories
npm run test:unit      # Run unit tests

# Filter by package
npm run test -- --package ui_home
npm run test -- --tag @smoke
npm run test -- --package admin --tag @critical
```

### Test Runner Architecture

```
/test-runners/
├── runner.ts                 [Main orchestrator]
├── e2e/
│   └── playwright-runner.ts  [Runs Playwright tests]
├── storybook/
│   └── story-runner.ts       [Validates Storybook stories]
└── unit/
    └── vitest-runner.ts      [Runs unit tests]
```

---

## Implementation Phases

### Phase 1: Create Unit Test Declarative Format (WEEK 1)

**Tasks:**
1. Finalize `tests_schema.json` (already ~80% complete)
2. Create unit test format documentation
3. Define AAA (Arrange-Act-Assert) pattern for JSON
4. Create example unit-tests package

**Deliverables:**
- Complete JSON schema for unit tests
- 3-4 example unit test JSON files
- Runner implementation draft

**Estimated Effort**: 2-3 days

---

### Phase 2: Create Test Runner (WEEK 1-2)

**Tasks:**
1. Build unified test runner that:
   - Discovers tests across all packages
   - Loads JSON test definitions
   - Executes in correct order (unit → story → E2E)
   - Generates consolidated report

2. Integrate with existing runners:
   - Hook into Playwright runner
   - Hook into Vitest runner
   - Hook into Storybook generator

**Deliverables:**
- Unified test runner CLI
- Package discovery engine
- Test orchestration logic

**Estimated Effort**: 3-4 days

---

### Phase 3: Migrate Existing Tests (WEEK 2-3)

**Tasks:**
1. Convert 50 existing `.spec.ts` files to JSON
2. Move tests into package structure
3. Validate all conversions
4. Run full test suite and verify passes

**Deliverables:**
- All existing tests migrated to JSON
- Test coverage verified
- 100% pass rate maintained

**Estimated Effort**: 4-5 days

---

### Phase 4: Documentation & Training (WEEK 3)

**Tasks:**
1. Write comprehensive guide for writing unit tests as JSON
2. Create migration examples
3. Document best practices
4. Train team on new approach

**Deliverables:**
- `DECLARATIVE_UNIT_TESTS_GUIDE.md` (1000+ words)
- Video tutorial
- Code examples for common patterns

**Estimated Effort**: 2-3 days

---

## Benefits of Declarative Testing

### 1. **100% Data-Driven Architecture**
- Everything is configuration, not code
- Follows MetaBuilder's core principle
- Enables non-developers to write tests

### 2. **Better Test Discovery**
- All tests discoverable via package system
- Automatic test collection
- Test reports grouped by package

### 3. **Easier Test Maintenance**
- No code duplication
- Consistent patterns across all tests
- Version control friendly (JSON diffs)

### 4. **AI-Friendly**
- LLMs can easily generate test JSON
- Tests can be generated from requirements
- Automated test generation possible

### 5. **Improved Traceability**
- Tests map to components via package
- Clear requirements → tests → code lineage
- Easier coverage analysis

### 6. **Better Test Organization**
- Tests live with their components
- No scattered test files
- Natural grouping by feature

---

## Example: Complete System Flows Test Package

### New Package Structure

```
packages/system_flows/
├── unit-tests/
│   └── tests.json              [User flow unit tests]
├── playwright/
│   ├── tests.json              [E2E flows: public → login → admin]
│   └── metadata.json           [Test metadata]
├── storybook/
│   └── stories.json            [UI component stories]
└── package.json
```

### Unit Test Example

```json
{
  "schemaVersion": "2.0.0",
  "package": "system_flows",
  "testSuites": [
    {
      "id": "permission-levels",
      "name": "Permission Level Access Control",
      "tests": [
        {
          "id": "level-0-public",
          "name": "Level 0 (Public) should access homepage",
          "arrange": {
            "user": { "level": 0, "authenticated": false }
          },
          "act": {
            "navigate": "/"
          },
          "assert": [
            { "selector": "body", "matcher": "toBeVisible" },
            { "text": "Sign In", "matcher": "toBeVisible" }
          ]
        },
        {
          "id": "level-5-supergod",
          "name": "Level 5 (Supergod) should access schema editor",
          "arrange": {
            "user": { "level": 5, "authenticated": true }
          },
          "act": {
            "navigate": "/admin/schema-editor"
          },
          "assert": [
            { "selector": ".schema-editor", "matcher": "toBeInTheDocument" },
            { "text": "Create Entity", "matcher": "toBeVisible" }
          ]
        }
      ]
    }
  ]
}
```

### Playwright E2E Example

```json
{
  "package": "system_flows",
  "tests": [
    {
      "name": "Complete user flow: public → login → admin",
      "tags": ["@critical", "@flow"],
      "steps": [
        { "action": "navigate", "url": "/" },
        { "action": "expect", "text": "Build Anything", "assertion": { "matcher": "toBeVisible" } },
        { "action": "click", "role": "button", "text": "Sign In" },
        { "action": "fill", "label": "Username", "value": "admin" },
        { "action": "fill", "label": "Password", "value": "password" },
        { "action": "click", "role": "button", "text": "Login" },
        { "action": "waitForLoadState", "state": "networkidle" },
        { "action": "expect", "selector": ".admin-dashboard", "assertion": { "matcher": "toBeVisible" } },
        { "action": "click", "role": "link", "text": "Package Manager" },
        { "action": "expect", "text": "Installed Packages", "assertion": { "matcher": "toBeVisible" } }
      ]
    }
  ]
}
```

---

## Technical Roadmap

### Required Changes

1. **Schema Enhancement**
   - Finalize `tests_schema.json` with all AAA matchers
   - Add fixture definitions
   - Add mock/spy support definitions

2. **Runner Implementation**
   - Create `test-runners/unit-runner.ts` to execute JSON tests
   - Update main test orchestrator
   - Integrate with CI/CD pipeline

3. **Package System Updates**
   - Add `unit-tests/` as recognized entity type
   - Update package discovery to include unit tests
   - Add metadata validation

4. **Test Migration**
   - Script to help convert `.spec.ts` → `tests.json`
   - Validation tool to ensure equivalence
   - Coverage report generator

---

## Questions for Implementation

1. **Test Execution Environment**
   - Should JSON tests be compiled to Vitest at runtime?
   - Or create dedicated JSON test executor?
   - Recommendation: Runtime compilation for better error reporting

2. **Fixture Management**
   - Where do mocked data/fixtures live?
   - In `unit-tests/fixtures.json`?
   - Or inline in test definitions?
   - Recommendation: Both - inline for simple, separate for complex

3. **Snapshot Testing**
   - How to handle snapshot updates in JSON format?
   - Store snapshots separately with references?
   - Recommendation: Use hash-based references to external snapshots

4. **CI/CD Integration**
   - Run all tests in parallel or sequentially?
   - Per-package test isolation?
   - Recommendation: Parallel by package, sequential within package

---

## Success Criteria

✅ **All tests are declarative (JSON)**
✅ **No TypeScript test files** (100% migrated)
✅ **All existing tests pass** (100% coverage maintained)
✅ **Unified test runner** works seamlessly
✅ **Package discovery** includes unit tests
✅ **Documentation complete** with examples
✅ **Team trained** on new approach
✅ **CI/CD integrated** successfully

---

## Conclusion

This document outlines the final step to achieve **100% data-driven architecture** in MetaBuilder by making unit tests declarative. The infrastructure is already in place (schemas exist, runners exist), requiring primarily:

1. Schema finalization (~2 days)
2. Runner implementation (~4 days)
3. Test migration (~5 days)
4. Documentation (~3 days)

**Total Estimated Effort**: 14 days (2 weeks) for full implementation

This positions MetaBuilder as **the most data-driven full-stack system** available - everything from UI components to security policies to tests is declarative configuration, not code.

---

**Ready for review and implementation planning!** 🚀
