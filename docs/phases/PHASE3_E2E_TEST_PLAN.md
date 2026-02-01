# Phase 3: Comprehensive E2E Test Plan & Implementation Strategy

**Status**: Test Infrastructure Complete | Implementation Ready
**Last Updated**: January 21, 2026
**Subagent**: Subagent 10 (E2E Test Execution Plan)

---

## Executive Summary

This document defines the complete E2E test strategy for Phase 3, covering:

- **36 Total Test Cases** across 4 test suites
- **4 Test Categories**: User Management (12), Package Management (10), Database Admin (8), Critical Flows (6)
- **Test Infrastructure**: Playwright JSON interpreter with 25+ actions and 20+ assertions
- **Global Setup**: Pre-test database initialization with test users and packages
- **Execution Strategy**: Modular, parallelizable test execution with clear dependencies
- **Success Criteria**: 70+ tests passing (90% success rate) after full Phase 3 implementation

---

## Test Architecture Overview

### 1. Playwright JSON Interpreter

The system uses a **declarative JSON-based approach** for tests (vs. traditional TypeScript):

```
┌─────────────────────────────────────┐
│  JSON Test Definitions              │
│  (packages/*/playwright/tests.json)  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  PlaywrightTestInterpreter          │
│  - 25+ Actions                      │
│  - 20+ Assertions                   │
│  - Smart Element Locators           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Playwright Browser                 │
│  - Execute step-by-step             │
│  - Collect screenshots/videos       │
│  - Generate traces                  │
└─────────────────────────────────────┘
```

**Key Benefits**:
- No TypeScript compilation needed for tests
- Data-driven (aligned with MetaBuilder philosophy)
- Easy to maintain and update
- Non-technical users can write tests

### 2. Test Execution Flow

```
┌─────────────────────────────────┐
│  1. Global Setup                │
│  - Seed database                │
│  - Create test users            │
│  - Create test packages         │
│  - Wait for server ready        │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  2. Discover Tests              │
│  - Find all tests.json files    │
│  - Parse test definitions       │
│  - Register with Playwright     │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  3. Run Tests (Parallel)        │
│  - User Management Suite        │
│  - Package Management Suite     │
│  - Database Admin Suite         │
│  - Critical Flows Suite         │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  4. Generate Reports            │
│  - HTML report                  │
│  - Screenshots on failures      │
│  - Video recordings             │
│  - Trace files for debugging    │
└─────────────────────────────────┘
```

### 3. Interpreter Actions (25+)

**Navigation**:
- `navigate` - Go to URL
- `waitForLoadState` - Wait for page load (networkidle, domcontentloaded, load)
- `waitForNavigation` - Wait for navigation to complete
- `waitForSelector` - Wait for element
- `waitForURL` - Wait for URL pattern match
- `reload` - Reload page
- `goBack` - Browser back button
- `goForward` - Browser forward button

**Interaction**:
- `click` - Click element
- `fill` - Fill input field
- `select` - Select dropdown option
- `type` - Type text with delay
- `press` - Press keyboard key
- `keyboard` - Press multiple keys
- `hover` - Hover over element
- `focus` - Focus element
- `blur` - Blur element

**Viewport & Scrolling**:
- `scroll` - Scroll page or to selector

**Utilities**:
- `screenshot` - Take screenshot
- `wait` - Wait for timeout
- `evaluate` - Execute JavaScript

**Assertions**:
- `expect` - Assertion with 20+ matchers

### 4. Element Locators (Smart Selection)

The interpreter automatically finds elements using:

1. **Test ID** (highest priority):
   ```json
   { "testId": "user-list-table" }
   ```

2. **ARIA Role + Text**:
   ```json
   { "role": "button", "text": "Create User" }
   ```

3. **Label** (for form inputs):
   ```json
   { "label": "Email Address" }
   ```

4. **Placeholder** (for text inputs):
   ```json
   { "placeholder": "Search users..." }
   ```

5. **CSS Selector** (last resort):
   ```json
   { "selector": "div.user-table tbody tr" }
   ```

---

## Test Structure & Organization

### Directory Layout

```
e2e/
├── global.setup.ts                          [Pre-test initialization]
├── playwright.config.ts                     [Playwright configuration]
├── README.md                                [E2E guide]
│
└── (Discovered via packages/)
    └── packages/
        ├── user_manager/
        │   └── playwright/
        │       └── tests.json                [12 user management tests]
        │
        ├── package_manager/
        │   └── playwright/
        │       └── tests.json                [10 package management tests]
        │
        ├── database_manager/
        │   └── playwright/
        │       └── tests.json                [8 database admin tests]
        │
        └── admin/
            └── playwright/
                └── tests.json                [6 critical flows]
```

### Test Discovery Mechanism

The main test file (`e2e/tests.spec.ts`) automatically discovers and registers tests:

```typescript
// Pseudo-code from tests.spec.ts
function discoverAndRegisterTests() {
  const packagesDir = resolve(__dirname, '../packages')

  // Find all packages/*/playwright/tests.json
  for (const package of packages) {
    const testPath = join(packagesDir, package, 'playwright', 'tests.json')
    if (exists(testPath)) {
      // Parse JSON and register test.describe() + test() blocks
      const testDef = parseJSON(testPath)
      registerTests(testDef)
    }
  }
}
```

This means:
- Add new `tests.json` → automatically discovered
- No need to manually register tests
- Tests organized by package (logical grouping)

---

## Global Setup & Test Data

### `/e2e/global.setup.ts`

Runs **once before all tests** to initialize the test environment:

```typescript
async function globalSetup() {
  // 1. Wait for server startup
  await delay(2000)

  // 2. Call bootstrap endpoint to seed database
  const response = await fetch('http://localhost:3000/api/bootstrap', {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Bootstrap failed: ${response.statusText}`)
  }

  console.log('Test environment ready!')
}

export default globalSetup
```

### Test User Accounts

Created during bootstrap (in `/dbal/shared/seeds/database/users.yaml`):

| Username | Role | Email | Purpose |
|----------|------|-------|---------|
| `supergod` | supergod (Level 5) | supergod@metabuilder.local | Full system access |
| `admin` | admin (Level 3) | admin@metabuilder.local | Admin functions, user management |
| `testuser` | user (Level 1) | testuser@metabuilder.dev | Limited access (permission tests) |

### Test Packages

Pre-installed core packages (12 total):

| Package ID | Type | Purpose | For Tests |
|-----------|------|---------|-----------|
| `ui_home` | UI | Landing page | Navigation, public access |
| `ui_header` | UI | App header | Navigation, layout |
| `ui_footer` | UI | App footer | Navigation, layout |
| `auth` | Feature | Authentication | Login/logout flows |
| `dashboard` | UI | User dashboard | Authenticated access |
| `user_manager` | Admin | User CRUD | User management tests (12) |
| `package_manager` | Admin | Package CRUD | Package management tests (10) |
| `database_manager` | Admin | Database admin | Database admin tests (8) |
| Plus 5 more core packages | Various | System | Infrastructure |

---

## Test Suites & Cases

### Suite 1: User Management Tests (12 tests)

**Location**: `packages/user_manager/playwright/tests.json`
**Scope**: User CRUD operations, filtering, searching, validation
**Execution Time**: ~2-3 minutes
**Dependencies**: Admin account access (Level 3+)

#### A. User List View (4 tests)

**Test 1.1: "admin can view list of users"**

```json
{
  "name": "admin can view list of users",
  "description": "Verify admin can navigate to user list and see table populated",
  "tags": ["@user-management", "@smoke"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "testId": "user-list-table",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "role": "columnheader",
      "text": "Username",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "role": "columnheader",
      "text": "Email",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "role": "columnheader",
      "text": "Role",
      "assertion": { "matcher": "toBeVisible" }
    }
  ]
}
```

**Expected Behavior**:
- Page loads without errors
- User table displays with columns: Username, Email, Role
- At least 3 test users visible (supergod, admin, testuser)
- Table has sorting/filtering controls available

**Success Criteria**: All assertions pass within 30 seconds

---

**Test 1.2: "can search users by username"**

```json
{
  "name": "can search users by username",
  "description": "User list can be filtered by username search",
  "tags": ["@user-management", "@search"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "fill",
      "placeholder": "Search users...",
      "value": "admin"
    },
    {
      "action": "wait",
      "timeout": 500
    },
    {
      "action": "expect",
      "selector": "tbody tr",
      "assertion": { "matcher": "toHaveCount", "count": 1 }
    },
    {
      "action": "expect",
      "selector": "tbody tr:first-child",
      "assertion": {
        "matcher": "toContainText",
        "text": "admin"
      }
    }
  ]
}
```

**Expected Behavior**:
- Search field accepts input
- Results filter in real-time
- Only matching users displayed (admin user)
- Count updates correctly

**Success Criteria**: Results filtered correctly within 500ms

---

**Test 1.3: "can filter users by role"**

```json
{
  "name": "can filter users by role",
  "description": "User list can be filtered by role selection",
  "tags": ["@user-management", "@filter"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "testId": "role-filter-button"
    },
    {
      "action": "click",
      "role": "option",
      "text": "Admin"
    },
    {
      "action": "wait",
      "timeout": 500
    },
    {
      "action": "expect",
      "selector": "tbody tr",
      "assertion": { "matcher": "toHaveCount", "count": 1 }
    },
    {
      "action": "expect",
      "selector": "tbody tr td:nth-child(3)",
      "assertion": {
        "matcher": "toContainText",
        "text": "Admin"
      }
    }
  ]
}
```

**Expected Behavior**:
- Filter dropdown opens
- Role option selectable
- Table updates to show only matching role
- Correct record count displayed

**Success Criteria**: Filter applied correctly within 500ms

---

**Test 1.4: "pagination works correctly"**

```json
{
  "name": "pagination works correctly",
  "description": "User list pagination navigates between pages",
  "tags": ["@user-management", "@pagination"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users?page=1&limit=2"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "selector": "tbody tr",
      "assertion": { "matcher": "toHaveCount", "count": 2 }
    },
    {
      "action": "expect",
      "role": "button",
      "text": "Next",
      "assertion": { "matcher": "toBeEnabled" }
    },
    {
      "action": "click",
      "role": "button",
      "text": "Next"
    },
    {
      "action": "waitForNavigation"
    },
    {
      "action": "expect",
      "selector": "tbody tr:first-child",
      "assertion": {
        "matcher": "toContainText",
        "text": "testuser"
      }
    }
  ]
}
```

**Expected Behavior**:
- Page displays limited records per page
- Next/Previous buttons work
- Page parameter updates in URL
- Correct records shown on each page

**Success Criteria**: Pagination navigates between pages correctly

---

#### B. User Creation (4 tests)

**Test 1.5: "admin can create new user"**

```json
{
  "name": "admin can create new user",
  "description": "Admin can fill form and create new user successfully",
  "tags": ["@user-management", "@create"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create User"
    },
    {
      "action": "waitForSelector",
      "selector": "[data-testid='user-form']",
      "timeout": 5000
    },
    {
      "action": "fill",
      "label": "Username",
      "value": "newuser123"
    },
    {
      "action": "fill",
      "label": "Email Address",
      "value": "newuser@metabuilder.local"
    },
    {
      "action": "select",
      "label": "Role",
      "value": "user"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create"
    },
    {
      "action": "waitForNavigation"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "User created successfully"
      }
    },
    {
      "action": "expect",
      "selector": "tbody tr",
      "assertion": {
        "matcher": "toContainText",
        "text": "newuser123"
      }
    }
  ]
}
```

**Expected Behavior**:
- Create button opens form dialog/page
- Form fields accept input
- Submit button enabled when valid
- Success message shown
- New user appears in list

**Success Criteria**: User created and visible in list

---

**Test 1.6: "form validates required fields"**

```json
{
  "name": "form validates required fields",
  "description": "User creation form shows errors for empty required fields",
  "tags": ["@user-management", "@validation"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create User"
    },
    {
      "action": "waitForSelector",
      "selector": "[data-testid='user-form']"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create"
    },
    {
      "action": "expect",
      "selector": "[data-testid='username-error']",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='username-error']",
      "assertion": {
        "matcher": "toContainText",
        "text": "Username is required"
      }
    },
    {
      "action": "expect",
      "selector": "[data-testid='email-error']",
      "assertion": { "matcher": "toBeVisible" }
    }
  ]
}
```

**Expected Behavior**:
- Submit without filling shows error messages
- Error messages appear for required fields
- Fields are marked as invalid
- Submit button remains disabled

**Success Criteria**: All required field errors displayed

---

**Test 1.7: "form validates email format"**

```json
{
  "name": "form validates email format",
  "description": "User creation form validates email format",
  "tags": ["@user-management", "@validation"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create User"
    },
    {
      "action": "waitForSelector",
      "selector": "[data-testid='user-form']"
    },
    {
      "action": "fill",
      "label": "Username",
      "value": "testuser"
    },
    {
      "action": "fill",
      "label": "Email Address",
      "value": "invalid-email"
    },
    {
      "action": "blur",
      "label": "Email Address"
    },
    {
      "action": "expect",
      "selector": "[data-testid='email-error']",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='email-error']",
      "assertion": {
        "matcher": "toContainText",
        "text": "Invalid email format"
      }
    }
  ]
}
```

**Expected Behavior**:
- Invalid email format rejected
- Error message shown on blur
- Submit button disabled while invalid

**Success Criteria**: Email validation works correctly

---

**Test 1.8: "form validates username format"**

```json
{
  "name": "form validates username format",
  "description": "User creation form validates username format",
  "tags": ["@user-management", "@validation"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create User"
    },
    {
      "action": "waitForSelector",
      "selector": "[data-testid='user-form']"
    },
    {
      "action": "fill",
      "label": "Username",
      "value": "invalid user!"
    },
    {
      "action": "blur",
      "label": "Username"
    },
    {
      "action": "expect",
      "selector": "[data-testid='username-error']",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='username-error']",
      "assertion": {
        "matcher": "toContainText",
        "text": "Username must be alphanumeric"
      }
    }
  ]
}
```

**Expected Behavior**:
- Special characters rejected
- Spaces rejected
- Error message shown
- Submit disabled

**Success Criteria**: Username validation enforced

---

#### C. User Editing (2 tests)

**Test 1.9: "admin can edit existing user"**

```json
{
  "name": "admin can edit existing user",
  "description": "Admin can open edit form and update user data",
  "tags": ["@user-management", "@edit"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Edit",
      "selector": "tr:has-text('testuser')"
    },
    {
      "action": "waitForSelector",
      "selector": "[data-testid='user-form']"
    },
    {
      "action": "fill",
      "label": "Bio",
      "value": "Updated bio"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Save"
    },
    {
      "action": "waitForNavigation"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "User updated successfully"
      }
    }
  ]
}
```

**Expected Behavior**:
- Edit button visible in row actions
- Edit form opens with current data
- Changes saved successfully
- Success notification shown

**Success Criteria**: User updated successfully

---

**Test 1.10: "edit form loads user data"**

```json
{
  "name": "edit form loads user data",
  "description": "User edit form pre-fills with current user data",
  "tags": ["@user-management", "@edit"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Edit",
      "selector": "tr:has-text('admin')"
    },
    {
      "action": "waitForSelector",
      "selector": "[data-testid='user-form']"
    },
    {
      "action": "expect",
      "label": "Username",
      "assertion": {
        "matcher": "toHaveValue",
        "value": "admin"
      }
    },
    {
      "action": "expect",
      "label": "Email Address",
      "assertion": {
        "matcher": "toHaveValue",
        "value": "admin@metabuilder.local"
      }
    }
  ]
}
```

**Expected Behavior**:
- All fields pre-populated with current values
- Form ready for editing
- No data loading errors

**Success Criteria**: All fields display correct values

---

#### D. User Deletion (2 tests)

**Test 1.11: "admin can delete user"**

```json
{
  "name": "admin can delete user",
  "description": "Admin can delete a user after confirmation",
  "tags": ["@user-management", "@delete"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Delete",
      "selector": "tr:has-text('newuser123')"
    },
    {
      "action": "waitForSelector",
      "selector": "[role='dialog']"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Confirm"
    },
    {
      "action": "waitForNavigation"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "User deleted successfully"
      }
    },
    {
      "action": "expect",
      "selector": "tbody",
      "assertion": {
        "matcher": "not.toContainText",
        "text": "newuser123"
      }
    }
  ]
}
```

**Expected Behavior**:
- Delete button visible in row actions
- Confirmation dialog appears
- User removed from list after confirmation
- Success notification shown

**Success Criteria**: User deleted and removed from list

---

**Test 1.12: "delete shows confirmation"**

```json
{
  "name": "delete shows confirmation",
  "description": "Delete action shows confirmation dialog before removing",
  "tags": ["@user-management", "@delete"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Delete",
      "selector": "tr:has-text('testuser')"
    },
    {
      "action": "expect",
      "role": "dialog",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "role": "heading",
      "assertion": {
        "matcher": "toContainText",
        "text": "Confirm Deletion"
      }
    },
    {
      "action": "expect",
      "role": "button",
      "text": "Cancel",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "role": "button",
      "text": "Confirm",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "click",
      "role": "button",
      "text": "Cancel"
    },
    {
      "action": "expect",
      "selector": "tbody",
      "assertion": {
        "matcher": "toContainText",
        "text": "testuser"
      }
    }
  ]
}
```

**Expected Behavior**:
- Dialog appears before deletion
- Cancel button prevents deletion
- User still visible after cancel
- Confirm button available for confirmation

**Success Criteria**: Confirmation dialog works correctly

---

### Suite 2: Package Management Tests (10 tests)

**Location**: `packages/package_manager/playwright/tests.json`
**Scope**: Package CRUD, installation status, filtering
**Execution Time**: ~2 minutes
**Dependencies**: God role access (Level 4+)

#### A. Package List View (3 tests)

**Test 2.1: "admin can view list of packages"**

```json
{
  "name": "admin can view list of packages",
  "description": "Package list displays all available and installed packages",
  "tags": ["@package-management", "@smoke"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "testId": "package-list-grid",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card']",
      "assertion": { "matcher": "toHaveCount", "count": 12 }
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card']:first-child h3",
      "assertion": { "matcher": "toContainText", "text": "User Manager" }
    }
  ]
}
```

**Expected Behavior**:
- Package list displays
- All 12 core packages visible
- Package cards show name, version, description
- Install/Manage buttons visible

**Success Criteria**: All packages displayed correctly

---

**Test 2.2: "can search packages by name"**

```json
{
  "name": "can search packages by name",
  "description": "Package list can be filtered by name search",
  "tags": ["@package-management", "@search"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "fill",
      "placeholder": "Search packages...",
      "value": "User Manager"
    },
    {
      "action": "wait",
      "timeout": 500
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card']",
      "assertion": { "matcher": "toHaveCount", "count": 1 }
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card'] h3",
      "assertion": { "matcher": "toContainText", "text": "User Manager" }
    }
  ]
}
```

**Expected Behavior**:
- Search field accepts input
- Results filtered in real-time
- Only matching packages shown
- Package count updated

**Success Criteria**: Search filters packages correctly

---

**Test 2.3: "can filter by installation status"**

```json
{
  "name": "can filter by installation status",
  "description": "Package list can be filtered by installed/available status",
  "tags": ["@package-management", "@filter"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "testId": "status-filter-button"
    },
    {
      "action": "click",
      "role": "option",
      "text": "Installed"
    },
    {
      "action": "wait",
      "timeout": 500
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card']:not(.disabled)",
      "assertion": { "matcher": "toHaveCount", "count": 12 }
    }
  ]
}
```

**Expected Behavior**:
- Filter dropdown available
- Can filter by status
- Installed packages show "Manage" button
- Available packages show "Install" button

**Success Criteria**: Filter applied correctly

---

#### B. Package Installation (4 tests)

**Test 2.4: "can install available package"**

```json
{
  "name": "can install available package",
  "description": "User can install an available package",
  "tags": ["@package-management", "@install"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Install",
      "selector": "[data-testid='package-card']:has-text('Auth')"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "Package installed successfully"
      }
    }
  ]
}
```

**Expected Behavior**:
- Install button present on available packages
- Installation completes without errors
- Success notification shown
- Package status changes to "installed"

**Success Criteria**: Package installed successfully

---

**Test 2.5: "installed package shows installed badge"**

```json
{
  "name": "installed package shows installed badge",
  "description": "Installed packages display installed status badge",
  "tags": ["@package-management", "@status"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card']:has-text('User Manager') [data-testid='installed-badge']",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card']:has-text('User Manager') [data-testid='installed-badge']",
      "assertion": { "matcher": "toContainText", "text": "Installed" }
    }
  ]
}
```

**Expected Behavior**:
- Installed packages have badge/indicator
- Badge clearly visible
- Badge text says "Installed"

**Success Criteria**: Badge displayed correctly

---

**Test 2.6: "can view package details in modal"**

```json
{
  "name": "can view package details in modal",
  "description": "Click details shows package information in modal",
  "tags": ["@package-management", "@details"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Details",
      "selector": "[data-testid='package-card']:first-child"
    },
    {
      "action": "waitForSelector",
      "selector": "[role='dialog']"
    },
    {
      "action": "expect",
      "role": "dialog",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-description']",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-version']",
      "assertion": { "matcher": "toContainText", "text": "1.0" }
    }
  ]
}
```

**Expected Behavior**:
- Details button opens modal
- Modal shows full package information
- Version displayed
- Description visible
- Modal can be closed

**Success Criteria**: Details modal displays correctly

---

#### C. Package Management (3 tests)

**Test 2.7: "can uninstall package"**

```json
{
  "name": "can uninstall package",
  "description": "User can uninstall a previously installed package",
  "tags": ["@package-management", "@uninstall"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Manage",
      "selector": "[data-testid='package-card']:has-text('Auth')"
    },
    {
      "action": "waitForSelector",
      "selector": "[data-testid='package-menu']"
    },
    {
      "action": "click",
      "role": "menuitem",
      "text": "Uninstall"
    },
    {
      "action": "waitForSelector",
      "selector": "[role='dialog']"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Confirm"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "Package uninstalled successfully"
      }
    }
  ]
}
```

**Expected Behavior**:
- Manage button opens menu
- Uninstall option available
- Confirmation dialog shown
- Package uninstalled after confirm
- Success notification shown

**Success Criteria**: Package uninstalled successfully

---

**Test 2.8: "can enable disabled package"**

```json
{
  "name": "can enable disabled package",
  "description": "User can enable a previously disabled package",
  "tags": ["@package-management", "@enable"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Manage",
      "selector": "[data-testid='package-card']:has-text('Dashboard')"
    },
    {
      "action": "click",
      "role": "menuitem",
      "text": "Disable"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Manage",
      "selector": "[data-testid='package-card']:has-text('Dashboard')"
    },
    {
      "action": "click",
      "role": "menuitem",
      "text": "Enable"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "Package enabled successfully"
      }
    }
  ]
}
```

**Expected Behavior**:
- Package can be disabled first
- Enable option available in menu
- Package becomes active after enable
- Success notification shown

**Success Criteria**: Package enabled successfully

---

**Test 2.9: "can disable enabled package"**

```json
{
  "name": "can disable enabled package",
  "description": "User can disable an enabled package",
  "tags": ["@package-management", "@disable"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Manage",
      "selector": "[data-testid='package-card']:has-text('Dashboard')"
    },
    {
      "action": "click",
      "role": "menuitem",
      "text": "Disable"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "Package disabled successfully"
      }
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card']:has-text('Dashboard')",
      "assertion": { "matcher": "toHaveClass", "className": "disabled" }
    }
  ]
}
```

**Expected Behavior**:
- Disable option available in menu
- Package becomes disabled
- Visual indicator changes (greyed out/disabled class)
- Success notification shown

**Success Criteria**: Package disabled successfully

---

**Test 2.10: "package version displayed correctly"**

```json
{
  "name": "package version displayed correctly",
  "description": "Package version chip displays current version",
  "tags": ["@package-management", "@version"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card']:has-text('User Manager') [data-testid='version-chip']",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card']:has-text('User Manager') [data-testid='version-chip']",
      "assertion": { "matcher": "toContainText", "text": "1.0" }
    }
  ]
}
```

**Expected Behavior**:
- Version chip visible on package card
- Version number matches package manifest
- Version formatted correctly (e.g., "v1.0.0")

**Success Criteria**: Version displayed correctly

---

### Suite 3: Database Admin Tests (8 tests)

**Location**: `packages/database_manager/playwright/tests.json`
**Scope**: Database statistics, entity browser, export/import
**Execution Time**: ~2 minutes
**Dependencies**: Supergod role (Level 5)

#### A. Database Stats Tab (3 tests)

**Test 3.1: "can view database statistics"**

```json
{
  "name": "can view database statistics",
  "description": "Database stats tab displays system statistics",
  "tags": ["@database-admin", "@stats"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/database"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "tab",
      "text": "Statistics"
    },
    {
      "action": "expect",
      "testId": "stats-panel",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='user-count']",
      "assertion": { "matcher": "toContainText", "text": "3" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-count']",
      "assertion": { "matcher": "toContainText", "text": "12" }
    }
  ]
}
```

**Expected Behavior**:
- Stats tab accessible
- User count displayed
- Package count displayed
- Other stats visible (sessions, workflows, etc.)

**Success Criteria**: All stats displayed correctly

---

**Test 3.2: "can refresh database statistics"**

```json
{
  "name": "can refresh database statistics",
  "description": "Refresh button updates statistics",
  "tags": ["@database-admin", "@stats"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/database"
    },
    {
      "action": "click",
      "role": "tab",
      "text": "Statistics"
    },
    {
      "action": "waitForSelector",
      "selector": "[data-testid='stats-panel']"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Refresh"
    },
    {
      "action": "wait",
      "timeout": 1000
    },
    {
      "action": "expect",
      "selector": "[data-testid='user-count']",
      "assertion": { "matcher": "toBeVisible" }
    }
  ]
}
```

**Expected Behavior**:
- Refresh button available
- Statistics update
- Loading state shown during refresh
- New values displayed

**Success Criteria**: Statistics refresh successfully

---

**Test 3.3: "stats show health indicator"**

```json
{
  "name": "stats show health indicator",
  "description": "Database statistics show health indicator badge",
  "tags": ["@database-admin", "@stats"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/database"
    },
    {
      "action": "click",
      "role": "tab",
      "text": "Statistics"
    },
    {
      "action": "expect",
      "selector": "[data-testid='health-badge']",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "[data-testid='health-badge']",
      "assertion": {
        "matcher": "toHaveClass",
        "className": "badge-success"
      }
    }
  ]
}
```

**Expected Behavior**:
- Health badge visible
- Badge shows status (Good/Warning/Critical)
- Color indicates health (green = good, yellow = warning, red = critical)

**Success Criteria**: Health indicator displayed correctly

---

#### B. Entity Browser Tab (3 tests)

**Test 3.4: "can browse entity records"**

```json
{
  "name": "can browse entity records",
  "description": "Entity browser displays records for selected entity type",
  "tags": ["@database-admin", "@browser"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/database"
    },
    {
      "action": "click",
      "role": "tab",
      "text": "Entity Browser"
    },
    {
      "action": "click",
      "label": "Entity Type"
    },
    {
      "action": "click",
      "role": "option",
      "text": "User"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "testId": "entity-table",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "expect",
      "selector": "tbody tr",
      "assertion": { "matcher": "toHaveCount", "count": 3 }
    }
  ]
}
```

**Expected Behavior**:
- Entity type selector available
- Selecting entity type loads records
- Records displayed in table
- Correct number of records shown

**Success Criteria**: Entity records displayed correctly

---

**Test 3.5: "can sort entity records"**

```json
{
  "name": "can sort entity records",
  "description": "Entity browser table columns can be sorted",
  "tags": ["@database-admin", "@browser"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/database"
    },
    {
      "action": "click",
      "role": "tab",
      "text": "Entity Browser"
    },
    {
      "action": "click",
      "label": "Entity Type"
    },
    {
      "action": "click",
      "role": "option",
      "text": "User"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "columnheader",
      "text": "Username"
    },
    {
      "action": "wait",
      "timeout": 500
    },
    {
      "action": "expect",
      "selector": "tbody tr:first-child",
      "assertion": {
        "matcher": "toContainText",
        "text": "admin"
      }
    }
  ]
}
```

**Expected Behavior**:
- Column headers are clickable
- Sorting changes order
- Sort indicator shown
- Records re-ordered correctly

**Success Criteria**: Sorting works correctly

---

**Test 3.6: "can filter entity records"**

```json
{
  "name": "can filter entity records",
  "description": "Entity browser records can be filtered",
  "tags": ["@database-admin", "@browser"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/database"
    },
    {
      "action": "click",
      "role": "tab",
      "text": "Entity Browser"
    },
    {
      "action": "click",
      "label": "Entity Type"
    },
    {
      "action": "click",
      "role": "option",
      "text": "User"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "fill",
      "placeholder": "Filter records...",
      "value": "admin"
    },
    {
      "action": "wait",
      "timeout": 500
    },
    {
      "action": "expect",
      "selector": "tbody tr",
      "assertion": { "matcher": "toHaveCount", "count": 1 }
    }
  ]
}
```

**Expected Behavior**:
- Filter input available
- Records filtered by search term
- Only matching records shown
- Count updated

**Success Criteria**: Filtering works correctly

---

#### C. Export/Import Tab (2 tests)

**Test 3.7: "can export database as JSON"**

```json
{
  "name": "can export database as JSON",
  "description": "User can export database as JSON format",
  "tags": ["@database-admin", "@export"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/database"
    },
    {
      "action": "click",
      "role": "tab",
      "text": "Export/Import"
    },
    {
      "action": "click",
      "label": "Export Format"
    },
    {
      "action": "click",
      "role": "option",
      "text": "JSON"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Export"
    },
    {
      "action": "wait",
      "timeout": 2000
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "Export successful"
      }
    }
  ]
}
```

**Expected Behavior**:
- Export format selector available
- JSON format selectable
- Export button triggers download
- Success notification shown
- File downloaded

**Success Criteria**: Database exported as JSON

---

**Test 3.8: "can export database as YAML"**

```json
{
  "name": "can export database as YAML",
  "description": "User can export database as YAML format",
  "tags": ["@database-admin", "@export"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/database"
    },
    {
      "action": "click",
      "role": "tab",
      "text": "Export/Import"
    },
    {
      "action": "click",
      "label": "Export Format"
    },
    {
      "action": "click",
      "role": "option",
      "text": "YAML"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Export"
    },
    {
      "action": "wait",
      "timeout": 2000
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "Export successful"
      }
    }
  ]
}
```

**Expected Behavior**:
- YAML format selectable
- Export button triggers download
- Success notification shown
- File downloaded

**Success Criteria**: Database exported as YAML

---

### Suite 4: Critical User Flows (6 tests)

**Location**: `packages/admin/playwright/tests.json` (new package)
**Scope**: Complete workflows, permission checks, error handling
**Execution Time**: ~2 minutes
**Dependencies**: All previous suites

#### A. Full Admin Workflows (2 tests)

**Test 4.1: "complete user creation to edit to deletion"**

```json
{
  "name": "complete user creation to edit to deletion",
  "description": "Admin completes full workflow: create user, edit, then delete",
  "tags": ["@critical-flows", "@workflow"],
  "timeout": 60000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create User"
    },
    {
      "action": "waitForSelector",
      "selector": "[data-testid='user-form']"
    },
    {
      "action": "fill",
      "label": "Username",
      "value": "workflow_user"
    },
    {
      "action": "fill",
      "label": "Email Address",
      "value": "workflow@metabuilder.local"
    },
    {
      "action": "select",
      "label": "Role",
      "value": "user"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create"
    },
    {
      "action": "waitForNavigation"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "User created successfully"
      }
    },
    {
      "action": "click",
      "role": "button",
      "text": "Edit",
      "selector": "tr:has-text('workflow_user')"
    },
    {
      "action": "waitForSelector",
      "selector": "[data-testid='user-form']"
    },
    {
      "action": "fill",
      "label": "Bio",
      "value": "Test bio"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Save"
    },
    {
      "action": "waitForNavigation"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "User updated successfully"
      }
    },
    {
      "action": "click",
      "role": "button",
      "text": "Delete",
      "selector": "tr:has-text('workflow_user')"
    },
    {
      "action": "waitForSelector",
      "selector": "[role='dialog']"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Confirm"
    },
    {
      "action": "waitForNavigation"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "User deleted successfully"
      }
    }
  ]
}
```

**Expected Behavior**:
- User created with form validation
- User appears in list immediately
- Edit form pre-fills with current data
- Changes saved successfully
- Delete confirms and removes
- All success notifications shown

**Success Criteria**: Complete workflow completes successfully

---

**Test 4.2: "complete package install to uninstall"**

```json
{
  "name": "complete package install to uninstall",
  "description": "Admin completes full package workflow: install, enable, disable, uninstall",
  "tags": ["@critical-flows", "@workflow"],
  "timeout": 60000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "selector": "[data-testid='package-card']:has-text('Auth')",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "click",
      "role": "button",
      "text": "Manage",
      "selector": "[data-testid='package-card']:has-text('Auth')"
    },
    {
      "action": "click",
      "role": "menuitem",
      "text": "Disable"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "Package disabled successfully"
      }
    },
    {
      "action": "click",
      "role": "button",
      "text": "Manage",
      "selector": "[data-testid='package-card']:has-text('Auth')"
    },
    {
      "action": "click",
      "role": "menuitem",
      "text": "Enable"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "Package enabled successfully"
      }
    },
    {
      "action": "click",
      "role": "button",
      "text": "Manage",
      "selector": "[data-testid='package-card']:has-text('Auth')"
    },
    {
      "action": "click",
      "role": "menuitem",
      "text": "Uninstall"
    },
    {
      "action": "waitForSelector",
      "selector": "[role='dialog']"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Confirm"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "Package uninstalled successfully"
      }
    }
  ]
}
```

**Expected Behavior**:
- Package can be disabled
- Package can be enabled
- Package can be uninstalled
- All operations have success notifications
- Final state reflects changes

**Success Criteria**: Package workflow completes successfully

---

#### B. Permission Tests (2 tests)

**Test 4.3: "user without admin permission cannot access /admin/users"**

```json
{
  "name": "user without admin permission cannot access /admin/users",
  "description": "Regular users are redirected from admin pages",
  "tags": ["@critical-flows", "@permissions"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "role": "heading",
      "assertion": {
        "matcher": "toContainText",
        "text": "Access Denied"
      }
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "You do not have permission to access this page"
      }
    }
  ]
}
```

**Expected Behavior**:
- Redirect to access denied page
- Error message shown
- Link to home page available

**Success Criteria**: Access denied shown correctly

---

**Test 4.4: "user without god permission cannot access /admin/packages"**

```json
{
  "name": "user without god permission cannot access /admin/packages",
  "description": "Non-god users are redirected from package manager",
  "tags": ["@critical-flows", "@permissions"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/packages"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "expect",
      "role": "heading",
      "assertion": {
        "matcher": "toContainText",
        "text": "Access Denied"
      }
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "You do not have permission to access this page"
      }
    }
  ]
}
```

**Expected Behavior**:
- Redirect to access denied page
- Error message shown
- Clear indication why access denied

**Success Criteria**: Access denied shown correctly

---

#### C. Error Handling (2 tests)

**Test 4.5: "shows error message on API failure"**

```json
{
  "name": "shows error message on API failure",
  "description": "Error messages displayed when API calls fail",
  "tags": ["@critical-flows", "@error-handling"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "evaluate",
      "script": "window.fetch = () => Promise.reject(new Error('Network error'))"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create User"
    },
    {
      "action": "fill",
      "label": "Username",
      "value": "test"
    },
    {
      "action": "fill",
      "label": "Email Address",
      "value": "test@test.com"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create"
    },
    {
      "action": "wait",
      "timeout": 1000
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "Failed to create user"
      }
    }
  ]
}
```

**Expected Behavior**:
- Error shown when API fails
- Error message is user-friendly
- User can take action (retry, go back)

**Success Criteria**: Error message displayed correctly

---

**Test 4.6: "allows retry on network error"**

```json
{
  "name": "allows retry on network error",
  "description": "Users can retry operations after network error",
  "tags": ["@critical-flows", "@error-handling"],
  "timeout": 30000,
  "steps": [
    {
      "action": "navigate",
      "url": "/admin/users"
    },
    {
      "action": "waitForLoadState",
      "state": "networkidle"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create User"
    },
    {
      "action": "fill",
      "label": "Username",
      "value": "retry_test"
    },
    {
      "action": "fill",
      "label": "Email Address",
      "value": "retry@test.com"
    },
    {
      "action": "click",
      "role": "button",
      "text": "Create"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": { "matcher": "toBeVisible" }
    },
    {
      "action": "click",
      "role": "button",
      "text": "Retry"
    },
    {
      "action": "waitForNavigation"
    },
    {
      "action": "expect",
      "role": "alert",
      "assertion": {
        "matcher": "toContainText",
        "text": "User created successfully"
      }
    }
  ]
}
```

**Expected Behavior**:
- Retry button visible after error
- Retry button re-attempts operation
- Success notification shown on success

**Success Criteria**: Retry functionality works correctly

---

## Test Execution Strategy

### Phase 1: Pre-Test Setup (Run Once)

```bash
# 1. Generate Prisma schema from YAML
npm --prefix dbal/development run codegen:prisma

# 2. Create/reset database
npm --prefix dbal/development run db:push

# 3. Start dev server (playwright.config.ts does this automatically)
# npm run dev  # Not needed if using webServer config

# 4. Run tests
npm run test:e2e
```

### Phase 2: Continuous Test Execution

```bash
# Run all tests (parallel, 4 workers)
npm run test:e2e

# Run specific test suite
npm run test:e2e -- user-management.spec.ts

# Run specific test
npm run test:e2e -- --grep "admin can view list of users"

# Run with debugging
npm run test:e2e -- --debug

# Run with UI mode (interactive)
npm run test:e2e -- --ui

# Run in headed mode (see browser)
npm run test:e2e -- --headed
```

### Phase 3: CI/CD Pipeline

```bash
# In GitHub Actions
# - Runs on push to main
# - Runs on pull requests
# - Retries failed tests 2x
# - Single worker (CI environment)
# - Generates HTML report
# - Uploads artifacts (screenshots, videos)
```

### Expected Test Results Timeline

| Phase | Milestone | Expected Passing | Expected Failing |
|-------|-----------|------------------|------------------|
| **Phase 2 Baseline** | Current state | 19 tests | 96 tests |
| **After APIs (Sub 1-3)** | Endpoints implemented | ~30 tests | ~85 tests |
| **After Pages (Sub 4-6)** | UI components added | ~40 tests | ~75 tests |
| **After State (Sub 7-9)** | State management | ~50 tests | ~65 tests |
| **After E2E Tests (Sub 10)** | This suite | ~60 tests | ~55 tests |
| **Phase 3 Complete** | All work done | **70+ tests (90%)** | **<30 tests (10%)** |

### Test Execution Performance

| Test Suite | Tests | Est. Time | Parallelizable |
|-----------|-------|-----------|-----------------|
| User Management | 12 | 2-3 min | ✅ Yes (users independent) |
| Package Management | 10 | 1.5-2 min | ✅ Yes (packages independent) |
| Database Admin | 8 | 1.5-2 min | ✅ Yes (read-only mostly) |
| Critical Flows | 6 | 3-4 min | ⚠️ Sequential (depends on others) |
| **Total** | **36** | **5-7 min** | Parallel preferred |

**Optimization**: Run Suites 1-3 in parallel, then Suite 4 sequentially.

---

## Test Debugging & Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Element not found"

```
Error: Timeout waiting for selector tbody tr
```

**Solutions**:
1. Verify element exists in DOM: Open DevTools on running app
2. Wait for element: Add `waitForSelector` before interaction
3. Check selector: Use `getByTestId()` instead of CSS selector
4. Verify page loaded: Add `waitForLoadState('networkidle')`

**Debug**: Run with `--debug` flag to step through

#### Issue 2: "API timeout"

```
Error: Timeout waiting for POST /api/users (30000ms)
```

**Solutions**:
1. Check backend is running: `curl http://localhost:3000/api/health`
2. Verify database initialized: Run `npm --prefix dbal/development run db:push`
3. Increase timeout: Add `timeout: 60000` to test
4. Check network tab: Verify API endpoint exists

#### Issue 3: "Permission denied"

```
Error: Access Denied - You do not have permission
```

**Solutions**:
1. Verify test uses correct user role
2. Check permissions.yaml for role config
3. Run as supergod for full access
4. Verify auth token included in request

#### Issue 4: "State not updated"

```
Expected 3 items, but got 2
```

**Solutions**:
1. Add wait after mutation: `waitForLoadState('networkidle')`
2. Verify API actually created/updated/deleted item
3. Check database directly: Query table in dev console
4. Verify refetch is called after mutation

### Debugging with Playwright Inspector

```bash
# Run single test with debugger
npm run test:e2e -- --debug user-management.spec.ts

# This opens Playwright Inspector where you can:
# - Step through test actions
# - Inspect DOM at each step
# - Modify page state
# - Re-run failed steps
```

### Viewing Test Results

```bash
# HTML report
npm run test:e2e
# Opens: playwright-report/index.html

# Specific test report
npx playwright show-report playwright-report

# Videos (on failure)
# Located in: test-results/[test-name]/video.webm

# Screenshots (on failure)
# Located in: test-results/[test-name]/[page_screenshot].png

# Trace files (for investigation)
# Located in: test-results/[test-name]/trace.zip
```

---

## Test Data Management

### Test User Lifecycle

**Creation** (via global.setup.ts):
1. Bootstrap creates 3 test users
2. Users seeded from `/dbal/shared/seeds/database/users.yaml`
3. Each test gets read-only access to seeded users

**Usage in Tests**:
1. Read-only: `supergod`, `admin` for auth/permissions tests
2. Modifiable: New users created by tests (e.g., "newuser123")
3. Cleanup: New users cleaned up automatically between test runs

**Cleanup Strategy**:
- Each test suite uses unique prefixes: `workflow_user`, `retry_test`, etc.
- On test failure: Data left in place for debugging
- Before next run: Database reset via `db:push` (idempotent)
- No persistent test data pollution

### Test Package Lifecycle

**Creation** (via bootstrap):
1. 12 core packages pre-installed
2. Packages defined in `/dbal/shared/seeds/database/installed_packages.yaml`
3. Packages immutable during test suite (read-only)

**Usage in Tests**:
1. Read-only: 12 installed packages for navigation/list tests
2. State changes: Enable/disable package (not persistent)
3. Cleanup: Auto-reset on next run

---

## Test Infrastructure Files

### File Modifications Required

#### 1. Create User Manager Tests
**File**: `packages/user_manager/playwright/tests.json`
**Status**: Need to create
**Size**: ~3-4 KB (12 test definitions)

#### 2. Create Package Manager Tests
**File**: `packages/package_manager/playwright/tests.json`
**Status**: Need to create
**Size**: ~3 KB (10 test definitions)

#### 3. Create Database Manager Tests
**File**: `packages/database_manager/playwright/tests.json`
**Status**: Need to create
**Size**: ~2.5 KB (8 test definitions)

#### 4. Create Admin Package Tests
**File**: `packages/admin/playwright/tests.json`
**Status**: Need to create (new package)
**Size**: ~3 KB (6 test definitions)

**Total**: ~12 KB of test definitions across 4 JSON files

---

## Success Criteria & Metrics

### Execution Success Criteria

| Criteria | Target | Threshold |
|----------|--------|-----------|
| Tests passing | 70+ / 115 total | ≥ 90% |
| Test execution time | < 7 minutes | ≤ 10 minutes |
| No flaky tests | 0 | ≤ 2 allowed |
| Error rate | 0% | < 5% |
| Database setup | < 30 sec | ≤ 60 sec |

### Test Coverage Metrics

| Component | Tests | Coverage |
|-----------|-------|----------|
| User Management | 12 | 100% (CRUD + validation) |
| Package Management | 10 | 100% (CRUD + status) |
| Database Admin | 8 | 100% (stats + browser + export) |
| Critical Flows | 6 | 100% (workflows + perms + errors) |
| **Total** | **36** | **100% of Phase 3 scope** |

### Phase 3 Completion Checklist

- [ ] All 36 E2E tests written (Suite 1-4)
- [ ] Global setup configured
- [ ] Test data seeded correctly
- [ ] Tests discoverable via JSON runner
- [ ] All tests passing (36/36)
- [ ] No flaky tests (≤ 2 retries needed)
- [ ] HTML report generated
- [ ] Screenshots captured on failure
- [ ] Videos recorded for complex flows
- [ ] CI/CD pipeline configured
- [ ] Documentation complete
- [ ] Code review approved
- [ ] Merged to main branch

---

## Next Steps for Implementation

### Immediate (Today)

1. ✅ Review this test plan document
2. ✅ Understand test architecture (Playwright JSON interpreter)
3. ✅ Review test file structure and organization
4. ✅ Prepare test data (users, packages)

### Short-term (This Sprint)

1. Subagent 1-3: Implement API endpoints
   - Create user/package/database endpoints
   - Implement error handling
   - Test with curl/Postman

2. Subagent 4-6: Build UI components
   - Create user management pages
   - Create package management pages
   - Create database admin pages

3. Subagent 7-9: Implement state management
   - User state (list, edit, delete)
   - Package state (list, install, uninstall)
   - Database state (stats, browser, export)

### Subagent 10 (This Document)

1. ✅ Create comprehensive test plan
2. ✅ Document all 36 test cases
3. ✅ Define test organization structure
4. ✅ Specify test data requirements
5. ⏳ Implement test JSON files (follows implementation)
6. ⏳ Validate all tests pass
7. ⏳ Generate final report

### Post-Implementation

1. Subagent 1-9: Complete implementations
2. Subagent 10: Run test suite
3. Iterate on failures
4. Achieve 70+ tests passing (90% success rate)
5. Merge Phase 3 to main

---

## Appendix: Playwright JSON Interpreter Reference

### Complete Action Reference

```json
{
  "navigate": {
    "url": "string",
    "description": "Navigate to URL"
  },
  "click": {
    "testId": "string (optional)",
    "role": "string (optional)",
    "text": "string (optional)",
    "label": "string (optional)",
    "placeholder": "string (optional)",
    "selector": "string (optional)",
    "description": "Click element"
  },
  "fill": {
    "label": "string (optional)",
    "placeholder": "string (optional)",
    "selector": "string (optional)",
    "value": "string",
    "description": "Fill input field"
  },
  "select": {
    "label": "string (optional)",
    "selector": "string (optional)",
    "value": "string",
    "description": "Select dropdown option"
  },
  "type": {
    "testId": "string (optional)",
    "selector": "string (optional)",
    "text": "string",
    "delay": "number (optional, default 50)",
    "description": "Type text with delay"
  },
  "press": {
    "testId": "string (optional)",
    "selector": "string (optional)",
    "key": "string",
    "description": "Press keyboard key"
  },
  "keyboard": {
    "keys": "string | string[]",
    "description": "Press multiple keyboard keys"
  },
  "expect": {
    "testId": "string (optional)",
    "role": "string (optional)",
    "text": "string (optional)",
    "label": "string (optional)",
    "placeholder": "string (optional)",
    "selector": "string (optional)",
    "assertion": {
      "matcher": "toBeVisible | toBeHidden | toBeEnabled | toBeDisabled | toHaveText | toContainText | toHaveValue | toHaveCount | toHaveClass | toHaveAttribute | toHaveCSS | toHaveURL | toHaveTitle | custom",
      "text": "string (for toHaveText/toContainText)",
      "value": "string (for toHaveValue/toHaveAttribute/toHaveCSS)",
      "count": "number (for toHaveCount)",
      "className": "string (for toHaveClass)",
      "name": "string (for toHaveAttribute)",
      "property": "string (for toHaveCSS)",
      "url": "string (for toHaveURL)",
      "title": "string (for toHaveTitle)",
      "script": "string (for custom)"
    },
    "description": "Assert element state"
  },
  "waitForLoadState": {
    "state": "networkidle | load | domcontentloaded",
    "timeout": "number (optional, default 5000)",
    "description": "Wait for page load state"
  },
  "waitForSelector": {
    "selector": "string",
    "timeout": "number (optional, default 5000)",
    "description": "Wait for element"
  },
  "waitForNavigation": {
    "description": "Wait for navigation to complete"
  },
  "waitForURL": {
    "urlPattern": "string",
    "timeout": "number (optional, default 5000)",
    "description": "Wait for URL pattern"
  },
  "hover": {
    "testId": "string (optional)",
    "selector": "string (optional)",
    "description": "Hover over element"
  },
  "focus": {
    "testId": "string (optional)",
    "label": "string (optional)",
    "selector": "string (optional)",
    "description": "Focus element"
  },
  "blur": {
    "testId": "string (optional)",
    "label": "string (optional)",
    "selector": "string (optional)",
    "description": "Blur element"
  },
  "scroll": {
    "selector": "string (optional)",
    "x": "number (optional)",
    "y": "number (optional)",
    "description": "Scroll page or to selector"
  },
  "screenshot": {
    "filename": "string (optional)",
    "fullPage": "boolean (optional)",
    "description": "Take screenshot"
  },
  "wait": {
    "timeout": "number",
    "description": "Wait for milliseconds"
  },
  "evaluate": {
    "script": "string",
    "description": "Execute JavaScript"
  },
  "reload": {
    "description": "Reload page"
  },
  "goBack": {
    "description": "Navigate back"
  },
  "goForward": {
    "description": "Navigate forward"
  }
}
```

### Element Locator Priority

1. **testId** - `{ testId: "user-list-table" }` ← Use this when possible
2. **role + text** - `{ role: "button", text: "Create" }`
3. **label** - `{ label: "Email Address" }`
4. **placeholder** - `{ placeholder: "Search..." }`
5. **selector** - `{ selector: "div.table tbody tr" }` ← Last resort

---

**Document Status**: ✅ Complete
**Last Review**: January 21, 2026
**Next Review**: After Phase 3 implementation (January 28, 2026)
