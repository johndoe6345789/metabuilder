# Playwright Playbook Testing

This project uses Playwright for end-to-end testing with test playbooks defined in `features.json` for reusable test scenarios.

## Getting Started

### Running Playwright Tests

```bash
# Run all tests
npm run test:e2e

# Run in UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/Playbooks.e2e.ts

# Run tests in headed mode (see browser)
npx playwright test --headed
```

## Playbook Runner Utility

The playbook runner (`tests/utils/playbookRunner.ts`) executes test scenarios defined in the `playwrightPlaybooks` section of `features.json`.

### Why Use Playbooks?

- **Reusability** - Define common workflows once, use in multiple tests
- **Consistency** - Ensure tests follow the same patterns
- **Maintainability** - Update test steps in one place
- **Documentation** - Playbooks serve as living documentation
- **Configuration-driven** - Non-developers can update test scenarios

### Using the Playbook Runner

#### Basic Usage

```typescript
import { test } from '@playwright/test';
import { runPlaybook } from '../utils/playbookRunner';

test('should execute login workflow', async ({ page }) => {
  await runPlaybook(page, 'adminLogin', {
    username: 'admin',
    password: 'password123',
  });
});
```

#### With Variables

Playbooks support variable substitution using `{{variableName}}` syntax:

```typescript
await runPlaybook(page, 'createTable', {
  tableName: 'users',
  columnName: 'id',
  dataType: 'INTEGER',
});
```

#### With Cleanup

Some playbooks include cleanup steps:

```typescript
await runPlaybook(page, 'createTable', 
  { tableName: 'test_table' },
  { runCleanup: true }  // Runs cleanup steps after main steps
);
```

### Available Utilities

#### `runPlaybook(page, playbookName, variables?, options?)`
Executes a complete playbook from features.json.

**Parameters:**
- `page` - Playwright Page object
- `playbookName` - Name of the playbook in features.json
- `variables` - Object with variable values for substitution
- `options.runCleanup` - Whether to run cleanup steps

#### `executeStep(page, step, variables?)`
Executes a single playbook step.

#### `getPlaybooksByTag(tag)`
Returns all playbooks with a specific tag.

```typescript
const adminPlaybooks = getPlaybooksByTag('admin');
```

#### `listPlaybooks()`
Returns names of all available playbooks.

```typescript
const playbooks = listPlaybooks();
console.log('Available playbooks:', playbooks);
```

## Defining Playbooks in features.json

Playbooks are defined in the `playwrightPlaybooks` section:

```json
{
  "playwrightPlaybooks": {
    "playbookName": {
      "name": "Human-Readable Name",
      "description": "What this playbook does",
      "tags": ["admin", "crud"],
      "steps": [
        {
          "action": "goto",
          "url": "/admin/dashboard"
        },
        {
          "action": "click",
          "selector": "button:has-text('Create')"
        },
        {
          "action": "fill",
          "selector": "input[name='name']",
          "value": "{{name}}"
        },
        {
          "action": "expect",
          "selector": "text={{name}}",
          "text": "visible"
        }
      ],
      "cleanup": [
        {
          "action": "click",
          "selector": "button:has-text('Delete')"
        }
      ]
    }
  }
}
```

### Supported Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `goto` | Navigate to URL | `url` |
| `click` | Click element | `selector` |
| `fill` | Fill input | `selector`, `value` |
| `select` | Select dropdown option | `selector`, `value` |
| `wait` | Wait for timeout | `timeout` (ms) |
| `expect` | Assert condition | `selector`, `text` or `url` |
| `screenshot` | Take screenshot | `selector` (optional) |

### Variable Substitution

Use `{{variableName}}` in any string field:

```json
{
  "action": "fill",
  "selector": "input[name='{{fieldName}}']",
  "value": "{{fieldValue}}"
}
```

When running the playbook:

```typescript
await runPlaybook(page, 'myPlaybook', {
  fieldName: 'username',
  fieldValue: 'admin',
});
```

## Pre-defined Playbooks

The following playbooks are available in features.json:

### adminLogin
Complete admin login flow.
- **Tags:** admin, auth, login
- **Variables:** username, password

### createTable
Create a new database table through UI.
- **Tags:** admin, table, crud
- **Variables:** tableName
- **Cleanup:** Yes (drops the table)

### addColumn
Add a column to an existing table.
- **Tags:** admin, column, crud
- **Variables:** tableName, columnName, dataType

### createIndex
Create a database index.
- **Tags:** admin, index, performance
- **Variables:** tableName, indexName, columnName

### queryBuilder
Build and execute a query.
- **Tags:** admin, query, select
- **Variables:** tableName, columnName

### securityCheck
Verify API endpoints require authentication.
- **Tags:** security, api, auth
- **Variables:** None

## Best Practices

### 1. Tag Your Playbooks

Use tags for organization and filtering:

```json
{
  "tags": ["admin", "crud", "table"]
}
```

### 2. Use Meaningful Names

Make playbook names descriptive:
- ✅ `createUserAndVerifyEmail`
- ❌ `test1`

### 3. Add Cleanup Steps

Clean up test data to keep tests independent:

```json
{
  "cleanup": [
    {
      "action": "click",
      "selector": "button:has-text('Delete')"
    }
  ]
}
```

### 4. Make Playbooks Composable

Break complex workflows into smaller playbooks:

```typescript
// Login first
await runPlaybook(page, 'adminLogin', { username, password });

// Then run specific test
await runPlaybook(page, 'createTable', { tableName });
```

### 5. Use Descriptive Selectors

Prefer text selectors and test IDs:
- ✅ `button:has-text('Create')`
- ✅ `[data-testid="create-button"]`
- ❌ `.btn-primary`

## Example Tests

### Simple Playbook Test

```typescript
import { test } from '@playwright/test';
import { runPlaybook } from '../utils/playbookRunner';

test('create and delete table', async ({ page }) => {
  const tableName = `test_${Date.now()}`;
  
  await runPlaybook(page, 'createTable', 
    { tableName },
    { runCleanup: true }
  );
});
```

### Multiple Playbooks

```typescript
test('complete workflow', async ({ page }) => {
  // Step 1: Login
  await runPlaybook(page, 'adminLogin', {
    username: 'admin',
    password: 'password',
  });
  
  // Step 2: Create table
  const tableName = 'users';
  await runPlaybook(page, 'createTable', { tableName });
  
  // Step 3: Add column
  await runPlaybook(page, 'addColumn', {
    tableName,
    columnName: 'email',
    dataType: 'VARCHAR',
  });
  
  // Step 4: Create index
  await runPlaybook(page, 'createIndex', {
    tableName,
    indexName: 'idx_email',
    columnName: 'email',
  });
});
```

### Tag-based Testing

```typescript
import { getPlaybooksByTag } from '../utils/playbookRunner';

test.describe('Admin CRUD operations', () => {
  const crudPlaybooks = getPlaybooksByTag('crud');
  
  for (const [name, playbook] of Object.entries(crudPlaybooks)) {
    test(playbook.name, async ({ page }) => {
      // Run each CRUD playbook
      await runPlaybook(page, name, {
        /* variables */
      });
    });
  }
});
```

## Debugging

### View Test Results

```bash
# Show test report
npx playwright show-report

# Open trace viewer
npx playwright show-trace trace.zip
```

### Debug Mode

```bash
# Run in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test tests/e2e/Playbooks.e2e.ts --debug
```

### Screenshots

Playbooks can take screenshots:

```json
{
  "action": "screenshot",
  "selector": ".query-results"
}
```

Screenshots are saved to `screenshots/` directory.

## Continuous Integration

In CI environments, tests run automatically:

```yaml
# .github/workflows/test.yml
- name: Run Playwright tests
  run: npm run test:e2e
```

The playwright.config.ts is configured to:
- Use different settings for CI vs local
- Record videos on failure
- Generate test reports

## Troubleshooting

### Playbook not found

Make sure the playbook name matches exactly in features.json:

```typescript
const playbooks = listPlaybooks();
console.log('Available:', playbooks);
```

### Timeout errors

Increase wait times in playbook steps:

```json
{
  "action": "wait",
  "timeout": 5000
}
```

Or configure global timeout in playwright.config.ts.

### Variable substitution not working

Check variable names match exactly:

```typescript
// In features.json: {{tableName}}
// In test:
await runPlaybook(page, 'createTable', {
  tableName: 'users',  // Must match: tableName
});
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Examples](/tests/e2e/)
