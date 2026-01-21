# Playwright Test Interpreter Guide

## Overview

The Playwright Test Interpreter (`e2e/tests.spec.ts`) is a production-grade, feature-complete implementation that converts JSON test definitions into executable Playwright tests. It supports 25+ actions and 20+ assertions with multiple locator strategies including test IDs, ARIA roles, and complex CSS selectors.

## Locator Strategies

The interpreter tries locator strategies in priority order:

### 1. Test ID (Recommended)
```json
{
  "action": "click",
  "testId": "submit-button"
}
```
Uses `page.getByTestId()` - most reliable for testing.

### 2. ARIA Role + Name (Accessibility-First)
```json
{
  "action": "click",
  "role": "button",
  "text": "Submit"
}
```
Uses `page.getByRole()` - finds elements by accessible role and name.

### 3. Label
```json
{
  "action": "fill",
  "label": "Email"
}
```
Uses `page.getByLabel()` - finds form inputs by label text.

### 4. Placeholder
```json
{
  "action": "fill",
  "placeholder": "Enter email"
}
```
Uses `page.getByPlaceholder()` - finds inputs by placeholder text.

### 5. Alt Text
```json
{
  "action": "expect",
  "alt": "Profile picture",
  "assertion": { "matcher": "toBeVisible" }
}
```
Uses `page.getByAltText()` - finds images by alt text.

### 6. Title
```json
{
  "action": "hover",
  "title": "Tooltip text"
}
```
Uses `page.getByTitle()` - finds elements by title attribute.

### 7. Text Content
```json
{
  "action": "click",
  "text": "Save Changes"
}
```
Uses `page.getByText()` - finds elements by visible text.

### 8. CSS Selector (Fallback)
```json
{
  "action": "click",
  "selector": ".submit-btn[data-status='active']"
}
```
Uses `page.locator()` - CSS selector fallback.

## Actions

### Navigation

#### Navigate
```json
{
  "action": "navigate",
  "url": "/dashboard",
  "waitUntil": "networkidle"
}
```
Options: `"domcontentloaded"`, `"load"`, `"networkidle"`

#### Wait for Load State
```json
{
  "action": "waitForLoadState",
  "state": "networkidle"
}
```

#### Reload
```json
{
  "action": "reload"
}
```

#### Go Back
```json
{
  "action": "goBack"
}
```

#### Go Forward
```json
{
  "action": "goForward"
}
```

### User Interactions

#### Click
```json
{
  "action": "click",
  "testId": "submit-btn",
  "button": "left",
  "clickCount": 1,
  "delay": 0
}
```

#### Fill (Clear & Type)
```json
{
  "action": "fill",
  "testId": "email-input",
  "value": "user@example.com"
}
```

#### Type (Character by Character)
```json
{
  "action": "type",
  "testId": "search-input",
  "text": "search term",
  "delay": 50
}
```

#### Select (Dropdown)
```json
{
  "action": "select",
  "selector": "select[name='country']",
  "value": ["option1", "option2"]
}
```

#### Hover
```json
{
  "action": "hover",
  "role": "button",
  "text": "Options"
}
```

#### Focus
```json
{
  "action": "focus",
  "testId": "email-input"
}
```

#### Blur
```json
{
  "action": "blur",
  "testId": "email-input"
}
```

#### Press Key
```json
{
  "action": "press",
  "testId": "search-input",
  "key": "Enter"
}
```

#### Keyboard Shortcut
```json
{
  "action": "keyboard",
  "keys": ["Control", "A"]
}
```
Or single key: `"keys": "Escape"`

### Waiting

#### Wait for Navigation
```json
{
  "action": "waitForNavigation"
}
```

#### Wait for Selector
```json
{
  "action": "waitForSelector",
  "selector": ".data-loaded",
  "timeout": 5000
}
```

#### Wait for URL
```json
{
  "action": "waitForURL",
  "urlPattern": "**/dashboard",
  "timeout": 5000
}
```

#### Wait (Time)
```json
{
  "action": "wait",
  "timeout": 2000
}
```

### Scrolling

#### Scroll to Element
```json
{
  "action": "scroll",
  "selector": "#footer"
}
```

#### Scroll by Coordinates
```json
{
  "action": "scroll",
  "x": 0,
  "y": 500
}
```

### Screenshots

#### Take Screenshot
```json
{
  "action": "screenshot",
  "filename": "page.png",
  "fullPage": true
}
```

### JavaScript Execution

#### Evaluate
```json
{
  "action": "evaluate",
  "script": "window.localStorage.getItem('token')"
}
```

## Assertions

### Visibility

#### To Be Visible
```json
{
  "action": "expect",
  "testId": "submit-btn",
  "assertion": { "matcher": "toBeVisible" }
}
```

#### To Be Hidden
```json
{
  "action": "expect",
  "testId": "loading",
  "assertion": { "matcher": "toBeHidden" }
}
```

### State

#### To Be Enabled
```json
{
  "action": "expect",
  "testId": "submit-btn",
  "assertion": { "matcher": "toBeEnabled" }
}
```

#### To Be Disabled
```json
{
  "action": "expect",
  "testId": "submit-btn",
  "assertion": { "matcher": "toBeDisabled" }
}
```

#### To Be Checked
```json
{
  "action": "expect",
  "testId": "accept-terms",
  "assertion": { "matcher": "toBeChecked" }
}
```

#### To Be Empty
```json
{
  "action": "expect",
  "testId": "message-list",
  "assertion": { "matcher": "toBeEmpty" }
}
```

#### To Be Editable
```json
{
  "action": "expect",
  "testId": "email-input",
  "assertion": { "matcher": "toBeEditable" }
}
```

### Content

#### Contain Text
```json
{
  "action": "expect",
  "testId": "error-message",
  "assertion": {
    "matcher": "toContainText",
    "text": "required field"
  }
}
```

#### Have Text (Exact)
```json
{
  "action": "expect",
  "role": "heading",
  "assertion": {
    "matcher": "toHaveText",
    "text": "Welcome"
  }
}
```

### Attributes

#### Have Attribute
```json
{
  "action": "expect",
  "testId": "profile-link",
  "assertion": {
    "matcher": "toHaveAttribute",
    "name": "href",
    "value": "/profile"
  }
}
```

#### Have Class
```json
{
  "action": "expect",
  "testId": "status-badge",
  "assertion": {
    "matcher": "toHaveClass",
    "className": "active"
  }
}
```

#### Have Value
```json
{
  "action": "expect",
  "testId": "email-input",
  "assertion": {
    "matcher": "toHaveValue",
    "value": "user@example.com"
  }
}
```

#### Have Count
```json
{
  "action": "expect",
  "role": "listitem",
  "assertion": {
    "matcher": "toHaveCount",
    "count": 5
  }
}
```

### Styling (Complex Checks)

#### Have CSS
```json
{
  "action": "expect",
  "testId": "header",
  "assertion": {
    "matcher": "toHaveCSS",
    "property": "background-color",
    "value": "rgb(255, 0, 0)"
  }
}
```

### Visual

#### Have Screenshot
```json
{
  "action": "expect",
  "testId": "login-form",
  "assertion": {
    "matcher": "toHaveScreenshot",
    "name": "login-form.png"
  }
}
```

#### In Viewport
```json
{
  "action": "expect",
  "testId": "footer",
  "assertion": { "matcher": "toBeInViewport" }
}
```

### Page-Level

#### Have URL
```json
{
  "action": "expect",
  "assertion": {
    "matcher": "toHaveURL",
    "url": "**/dashboard"
  }
}
```

#### Have Title
```json
{
  "action": "expect",
  "assertion": {
    "matcher": "toHaveTitle",
    "title": "Dashboard - MyApp"
  }
}
```

### Custom

#### Custom JavaScript
```json
{
  "action": "expect",
  "assertion": {
    "matcher": "custom",
    "script": "window.localStorage.getItem('token') !== null"
  }
}
```

## Complete Example Test

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-playwright.schema.json",
  "package": "example",
  "tests": [
    {
      "name": "Login flow with validation",
      "timeout": 10000,
      "steps": [
        {
          "action": "navigate",
          "url": "/login",
          "waitUntil": "domcontentloaded"
        },
        {
          "action": "waitForLoadState",
          "state": "networkidle"
        },
        {
          "action": "expect",
          "role": "heading",
          "assertion": { "matcher": "toBeVisible" }
        },
        {
          "action": "fill",
          "label": "Email",
          "value": "user@example.com"
        },
        {
          "action": "fill",
          "label": "Password",
          "value": "SecurePassword123!"
        },
        {
          "action": "click",
          "role": "button",
          "text": "Login"
        },
        {
          "action": "waitForURL",
          "urlPattern": "**/dashboard",
          "timeout": 5000
        },
        {
          "action": "expect",
          "testId": "user-profile",
          "assertion": { "matcher": "toBeVisible" }
        },
        {
          "action": "expect",
          "testId": "sidebar",
          "assertion": {
            "matcher": "toHaveClass",
            "className": "expanded"
          }
        },
        {
          "action": "screenshot",
          "filename": "dashboard.png",
          "fullPage": true
        }
      ]
    }
  ]
}
```

## Best Practices

### 1. Use Test IDs First
```json
// ✅ BEST - Most reliable
{"action": "click", "testId": "submit-btn"}

// ✅ GOOD - Accessible
{"action": "click", "role": "button", "text": "Submit"}

// ⚠️ FRAGILE - Can break with styling changes
{"action": "click", "selector": ".submit-btn"}
```

### 2. Accessibility-First
Use ARIA roles to encourage accessible UI:
```json
{
  "action": "expect",
  "role": "button",
  "text": "Save",
  "assertion": { "matcher": "toBeVisible" }
}
```

### 3. Wait for State, Not Time
```json
// ✅ GOOD - Waits for actual condition
{"action": "waitForLoadState", "state": "networkidle"}

// ⚠️ FLAKY - Time-based waits can fail
{"action": "wait", "timeout": 2000}
```

### 4. Explicit Selectors
```json
// ✅ GOOD - Clear intent
{
  "action": "click",
  "testId": "delete-confirm-btn",
  "button": "left"
}

// ⚠️ AMBIGUOUS - Unclear behavior
{"action": "click", "selector": "button"}
```

### 5. Comprehensive Assertions
```json
// ✅ GOOD - Multiple checks
[
  {"action": "expect", "testId": "form", "assertion": {"matcher": "toBeVisible"}},
  {"action": "expect", "testId": "submit", "assertion": {"matcher": "toBeEnabled"}},
  {"action": "expect", "testId": "error", "assertion": {"matcher": "toBeHidden"}}
]

// ⚠️ MINIMAL - Might miss issues
[
  {"action": "expect", "testId": "form", "assertion": {"matcher": "toBeVisible"}}
]
```

## Error Handling

The interpreter provides detailed error messages:

```
Failed step in test "Login flow": fill - No locator strategy provided in step
```

This includes:
- Test name
- Action that failed
- Reason for failure
- Suggestions for fixes

## Performance Tips

1. **Use `waitForLoadState` correctly**:
   - `"domcontentloaded"` - Page DOM ready (fastest)
   - `"load"` - All resources loaded
   - `"networkidle"` - Network activity stopped (slowest)

2. **Parallel execution**: Playwright runs tests in parallel by default
   - Each test runs in its own browser context
   - No shared state between tests

3. **Timeouts**: Set appropriate timeouts:
   ```json
   {
     "name": "Long operation",
     "timeout": 30000,
     "steps": [...]
   }
   ```

## Advanced Features

### Skip Tests
```json
{
  "name": "Feature under development",
  "skip": true,
  "steps": [...]
}
```

### Focus on Specific Test
```json
{
  "name": "Critical path",
  "only": true,
  "steps": [...]
}
```

### Test Description
```json
{
  "name": "Should validate email format",
  "description": "Verifies email field only accepts valid emails",
  "steps": [...]
}
```

## Troubleshooting

### Test Times Out
1. Check network conditions (use `waitForLoadState`)
2. Verify locator strategy is correct
3. Increase timeout if needed

### Locator Not Found
1. Verify test ID exists in HTML
2. Check ARIA role and text match
3. Use browser DevTools to inspect elements

### Flaky Tests
1. Avoid time-based waits
2. Use state-based waits (`waitForLoadState`)
3. Ensure proper element visibility before interaction

## Schema Validation

All tests must conform to `https://metabuilder.dev/schemas/package-playwright.schema.json`

Test the schema with:
```bash
jq '.tests[0].steps[0]' packages/*/playwright/tests.json
```

---

This interpreter proves that **declarative E2E tests work at production scale** with full feature support and zero boilerplate.
