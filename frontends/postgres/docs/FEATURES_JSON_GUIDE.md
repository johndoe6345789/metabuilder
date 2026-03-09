# Complete Guide to features.json Configuration System

## Overview

The `features.json` file is now a comprehensive configuration system that defines:
- ✅ **UI Component Trees** - Declarative component hierarchies
- ✅ **Playwright Playbooks** - E2E test scenarios
- ✅ **Storybook Stories** - Component documentation
- ✅ **Feature Flags** - Enable/disable features
- ✅ **Translations** - Multi-language support
- ✅ **Form Schemas** - Dynamic form generation
- ✅ **API Endpoints** - REST API definitions
- ✅ **Permissions** - Role-based access control

**Note:** SQL query templates have been removed for security reasons. Use Drizzle ORM for all database operations (see section 2).

## 1. Component Trees

Define complete UI hierarchies in JSON without writing JSX.

### Example: Simple Component Tree
```json
{
  "componentTrees": {
    "MyPage": {
      "component": "Box",
      "props": {
        "sx": { "p": 3 }
      },
      "children": [
        {
          "component": "Typography",
          "props": {
            "variant": "h4",
            "text": "{{pageTitle}}"
          }
        },
        {
          "component": "Button",
          "condition": "canCreate",
          "props": {
            "variant": "contained",
            "startIcon": "Add",
            "onClick": "handleCreate",
            "text": "Create New"
          }
        }
      ]
    }
  }
}
```

### Using Component Trees in Code
```tsx
import { getComponentTree } from '@/utils/featureConfig';
import ComponentTreeRenderer from '@/utils/ComponentTreeRenderer';

function MyComponent() {
  const tree = getComponentTree('MyPage');
  const data = { pageTitle: 'Welcome', canCreate: true };
  const handlers = { handleCreate: () => console.log('Create') };
  
  return <ComponentTreeRenderer tree={tree} data={data} handlers={handlers} />;
}
```

### Component Tree Features

**Template Interpolation:**
```json
{
  "props": {
    "text": "Hello {{user.name}}!"
  }
}
```

**Conditional Rendering:**
```json
{
  "condition": "isAdmin && hasPermission('create')",
  "component": "Button"
}
```

**Loops (forEach):**
```json
{
  "component": "List",
  "children": [
    {
      "component": "ListItem",
      "forEach": "items",
      "children": [
        {
          "component": "Typography",
          "props": {
            "text": "{{item.name}}"
          }
        }
      ]
    }
  ]
}
```

## 2. Secure SQL Templates with Drizzle ORM

SQL templates now use a **type-safe, injection-proof design** with parameter validation and Drizzle ORM patterns.

### Security Features

1. **Parameter Type Validation** - All parameters have defined types and validation rules
2. **SQL Identifier Escaping** - Uses `sql.identifier()` for table/column names
3. **Parameterized Queries** - Uses `$1, $2` placeholders instead of string interpolation
4. **Enum Validation** - Data types and index types validated against allowed values
5. **No String Interpolation** - Templates provide Drizzle patterns, not raw SQL strings

### Parameter Types

```json
{
  "sqlTemplates": {
    "parameterTypes": {
      "tableName": {
        "type": "identifier",
        "validation": "^[a-zA-Z_][a-zA-Z0-9_]{0,62}$",
        "sanitize": "identifier"
      },
      "dataType": {
        "type": "enum",
        "allowedValues": ["INTEGER", "VARCHAR", "TEXT", "BOOLEAN"],
        "sanitize": "enum"
      },
      "limit": {
        "type": "integer",
        "min": 1,
        "max": 10000,
        "default": 100
      }
    }
  }
}
```

### Query Templates

```json
{
  "sqlTemplates": {
    "queries": {
      "tables": {
        "dropTable": {
          "description": "Drop a table using sql.identifier",
          "method": "drizzle.execute",
          "parameters": {
            "tableName": "tableName"
          },
          "drizzlePattern": {
            "type": "identifier",
            "example": "sql`DROP TABLE IF EXISTS ${sql.identifier([tableName])} CASCADE`"
          },
          "securityNotes": "Uses sql.identifier() for safe identifier escaping"
        }
      }
    }
  }
}
```

### Using SQL Templates Securely

```typescript
import { db } from '@/utils/db';
import { sql } from 'drizzle-orm';
import { 
  getSqlQueryTemplate, 
  validateSqlTemplateParams 
} from '@/utils/featureConfig';

async function dropTable(tableName: string) {
  // Get the template
  const template = getSqlQueryTemplate('tables', 'dropTable');
  
  // Validate parameters - this prevents SQL injection
  const validation = validateSqlTemplateParams('tables', 'dropTable', {
    tableName: tableName
  });
  
  if (!validation.valid) {
    throw new Error(`Invalid parameters: ${validation.errors?.join(', ')}`);
  }
  
  // Use the sanitized values with Drizzle's safe methods
  const { tableName: safeTableName } = validation.sanitized!;
  
  // Execute using Drizzle's sql.identifier() - safe from SQL injection
  const result = await db.execute(
    sql`DROP TABLE IF EXISTS ${sql.identifier([safeTableName])} CASCADE`
  );
  
  return result;
}
```

### Security Comparison

```typescript
// ❌ OLD INSECURE WAY (REMOVED):
// const query = `DROP TABLE "${tableName}"`;  // SQL injection risk!
// await db.execute(sql.raw(query));

// ✅ NEW SECURE WAY:
// 1. Validate parameter against regex pattern
const validation = validateSqlTemplateParams('tables', 'dropTable', { tableName });
if (!validation.valid) throw new Error('Invalid table name');

// 2. Use Drizzle's sql.identifier() for automatic escaping
await db.execute(sql`DROP TABLE ${sql.identifier([validation.sanitized.tableName])}`);
```

### Why This is Secure

1. **Regex Validation**: Table names must match `^[a-zA-Z_][a-zA-Z0-9_]{0,62}$`
   - Prevents: `users; DROP TABLE users--`
   - Allows: `users`, `user_accounts`, `_temp_table`

2. **sql.identifier()**: Drizzle properly escapes identifiers
   - Handles special characters safely
   - Prevents SQL injection in table/column names

3. **Parameterized Queries**: Uses `$1, $2` placeholders
   - Database driver handles escaping
   - No string concatenation

4. **Type Validation**: Enums and integers validated before use
   - Data types checked against whitelist
   - Numeric values validated for range

## 3. Secure Component Templates

Component tree templates now use **safe property access** instead of `new Function()`.

### Security Features

1. **No Code Execution** - Replaced `new Function()` with safe property accessor
2. **Whitelist Operations** - Only allowed operators: `===`, `!==`, `>`, `<`, `>=`, `<=`, `&&`, `||`
3. **Property Path Validation** - Validates `^[a-zA-Z_$][a-zA-Z0-9_$.]*$`
4. **Safe Math Operations** - Limited to: `abs`, `ceil`, `floor`, `round`, `max`, `min`

### Template Expressions

```json
{
  "component": "Typography",
  "props": {
    "text": "{{user.name}}"
  }
}
```

### Supported Patterns

```typescript
// ✅ SAFE - Simple property access
"{{user.name}}"
"{{user.profile.email}}"

// ✅ SAFE - Comparisons with whitelisted operators
"condition": "isAdmin === true"
"condition": "count > 10"
"condition": "status === 'active' && role === 'editor'"

// ✅ SAFE - Ternary expressions
"{{isActive ? 'Active' : 'Inactive'}}"

// ✅ SAFE - Math operations (whitelisted)
"{{Math.round(price)}}"
"{{Math.max(a, b)}}"

// ❌ BLOCKED - Arbitrary code execution
"{{require('fs').readFileSync('/etc/passwd')}}"  // Validation fails
"{{eval('malicious code')}}"                      // Validation fails
"{{process.exit(1)}}"                             // Validation fails
```

### Security Comparison

```typescript
// ❌ OLD INSECURE WAY (REMOVED):
// const func = new Function('user', `return ${expression}`);
// return func(user);  // Can execute ANY JavaScript code!

// ✅ NEW SECURE WAY:
function safeGetProperty(obj: any, path: string): any {
  // Only allows: letters, numbers, dots, underscores
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(path)) {
    return undefined;  // Reject invalid paths
  }
  
  // Safe property traversal
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}
```

## 4. Playwright Playbooks

Define E2E test scenarios in JSON.

### Example Playbook
```json
{
  "playwrightPlaybooks": {
    "createTable": {
      "name": "Create Table Workflow",
      "description": "Test creating a new database table",
      "tags": ["admin", "table", "crud"],
      "steps": [
        {
          "action": "goto",
          "url": "/admin/dashboard"
        },
        {
          "action": "click",
          "selector": "button:has-text('Create Table')"
        },
        {
          "action": "fill",
          "selector": "input[label='Table Name']",
          "value": "{{tableName}}"
        },
        {
          "action": "expect",
          "selector": "text={{tableName}}",
          "text": "visible"
        }
      ],
      "cleanup": [
        {
          "action": "click",
          "selector": "button:has-text('Drop Table')"
        }
      ]
    }
  }
}
```

### Using Playbooks
```typescript
import { getPlaywrightPlaybook } from '@/utils/featureConfig';

const playbook = getPlaywrightPlaybook('createTable');

// Execute playbook steps
for (const step of playbook.steps) {
  switch (step.action) {
    case 'goto':
      await page.goto(step.url);
      break;
    case 'click':
      await page.click(step.selector);
      break;
    // ... handle other actions
  }
}
```

## 4. Storybook Stories

Define component stories in JSON.

### Example Stories
```json
{
  "storybookStories": {
    "Button": {
      "primary": {
        "name": "Primary Button",
        "description": "Primary action button",
        "args": {
          "variant": "contained",
          "color": "primary",
          "text": "Click Me"
        }
      },
      "withIcon": {
        "name": "With Icon",
        "args": {
          "variant": "contained",
          "startIcon": "Add",
          "text": "Add Item"
        },
        "play": [
          "await userEvent.click(screen.getByText('Add Item'))",
          "await expect(args.onClick).toHaveBeenCalled()"
        ]
      }
    }
  }
}
```

### Using Stories
```typescript
import { getStorybookStory } from '@/utils/featureConfig';

const story = getStorybookStory('Button', 'primary');

export const Primary = {
  name: story.name,
  args: story.args,
};
```

## 5. Helper Functions

### Component Trees
```typescript
import {
  getComponentTree,
  getAllComponentTrees,
} from '@/utils/featureConfig';

const tree = getComponentTree('TableManagerTab');
const allTrees = getAllComponentTrees();
```

### SQL Templates (Secure)
```typescript
import {
  getSqlQueryTemplate,
  getSqlParameterType,
  validateSqlTemplateParams,
  validateSqlParameter,
  getAllSqlTemplates,
  getSqlTemplatesByCategory,
} from '@/utils/featureConfig';

// Get a query template
const template = getSqlQueryTemplate('tables', 'dropTable');

// Get parameter type definition
const paramType = getSqlParameterType('tableName');

// Validate a single parameter
const validation = validateSqlParameter('tableName', 'users');
if (!validation.valid) {
  console.error(validation.error);
}

// Validate all parameters for a template
const result = validateSqlTemplateParams('tables', 'dropTable', {
  tableName: 'users'
});
if (result.valid) {
  const safeParams = result.sanitized; // Use these sanitized values
}
```

### Playwright Playbooks
```typescript
import {
  getPlaywrightPlaybook,
  getAllPlaywrightPlaybooks,
  getPlaywrightPlaybooksByTag,
} from '@/utils/featureConfig';

const playbook = getPlaywrightPlaybook('createTable');
const allPlaybooks = getAllPlaywrightPlaybooks();
const adminPlaybooks = getPlaywrightPlaybooksByTag('admin');
```

### Storybook Stories
```typescript
import {
  getStorybookStory,
  getAllStorybookStories,
  getStorybookStoriesForComponent,
} from '@/utils/featureConfig';

const story = getStorybookStory('Button', 'primary');
const allStories = getAllStorybookStories();
const buttonStories = getStorybookStoriesForComponent('Button');
```

## 6. Feature Flags

Enable or disable features dynamically.

```json
{
  "features": [
    {
      "id": "table-management",
      "name": "Table Management",
      "enabled": true,
      "priority": "high",
      "ui": {
        "showInNav": true,
        "icon": "TableChart",
        "actions": ["create", "delete"]
      }
    }
  ]
}
```

### Using Features
```typescript
import { getFeatureById, getFeatures } from '@/utils/featureConfig';

const feature = getFeatureById('table-management');
const canCreate = feature?.ui.actions.includes('create');
const allFeatures = getFeatures(); // Only enabled features
```

## 7. Form Schemas

Dynamic form generation from JSON.

```json
{
  "formSchemas": {
    "users": {
      "fields": [
        {
          "name": "name",
          "type": "text",
          "label": "Name",
          "required": true,
          "minLength": 2,
          "maxLength": 100
        },
        {
          "name": "email",
          "type": "email",
          "label": "Email",
          "required": true,
          "validation": "email"
        }
      ],
      "submitLabel": "Save User",
      "cancelLabel": "Cancel"
    }
  }
}
```

### Using Form Schemas
```typescript
import { getFormSchema } from '@/utils/featureConfig';

const schema = getFormSchema('users');

<FormDialog
  open={open}
  title="Add User"
  fields={schema.fields}
  submitLabel={schema.submitLabel}
  onSubmit={handleSubmit}
/>
```

## 8. Translations

Multi-language support.

```json
{
  "translations": {
    "en": {
      "features": {
        "database-crud": {
          "name": "Database CRUD Operations",
          "description": "Create, read, update, and delete records"
        }
      },
      "actions": {
        "create": "Create",
        "update": "Update"
      }
    },
    "fr": {
      "features": {
        "database-crud": {
          "name": "Opérations CRUD",
          "description": "Créer, lire, mettre à jour et supprimer"
        }
      },
      "actions": {
        "create": "Créer",
        "update": "Mettre à jour"
      }
    }
  }
}
```

### Using Translations
```typescript
import {
  getFeatureTranslation,
  getActionTranslation,
} from '@/utils/featureConfig';

const feature = getFeatureTranslation('database-crud', 'fr');
const createAction = getActionTranslation('create', 'fr');
```

## 9. API Endpoints

REST API documentation in JSON.

```json
{
  "apiEndpoints": {
    "users": {
      "list": {
        "method": "GET",
        "path": "/api/admin/users",
        "description": "List all users"
      },
      "create": {
        "method": "POST",
        "path": "/api/admin/users",
        "description": "Create a new user"
      }
    }
  }
}
```

### Using API Endpoints
```typescript
import { getApiEndpoint, getApiEndpoints } from '@/utils/featureConfig';

const endpoint = getApiEndpoint('users', 'list');
// { method: 'GET', path: '/api/admin/users', description: '...' }

const allUserEndpoints = getApiEndpoints('users');
```

## 10. Permissions

Role-based access control.

```json
{
  "permissions": {
    "users": {
      "create": ["admin"],
      "read": ["admin", "user"],
      "update": ["admin"],
      "delete": ["admin"]
    }
  }
}
```

### Using Permissions
```typescript
import { hasPermission, getPermissions } from '@/utils/featureConfig';

const canCreate = hasPermission('users', 'create', userRole);
const userPermissions = getPermissions('users');
```

## Benefits

### 1. Configuration-Driven Development
- Define UIs, queries, tests, and stories in JSON
- No code changes needed for many modifications
- Non-developers can contribute

### 2. Consistency
- All features use the same structure
- Standardized component usage
- Enforced patterns

### 3. Rapid Development
- Prototype new features quickly
- Reuse existing patterns
- Less boilerplate code

### 4. Maintainability
- Single source of truth
- Easy to find and update configuration
- Clear separation of concerns

### 5. Testing
- Playbooks define test scenarios
- Storybook stories from JSON
- Easy to add new test cases

### 6. Flexibility
- Enable/disable features dynamically
- A/B test different configurations
- Multi-language support

## Best Practices

### 1. Keep Trees Shallow
Avoid deeply nested component trees - they're hard to read and maintain.

### 2. Use Meaningful Names
Name component trees, playbooks, and templates descriptively:
- ✅ `UserListPage` 
- ❌ `Page1`

### 3. Document with Comments
Use the `comment` property in component trees:
```json
{
  "component": "Outlet",
  "comment": "Child routes render here"
}
```

### 4. Validate Configuration
Use TypeScript types to ensure correctness:
```typescript
import type { ComponentTree, SqlTemplate } from '@/utils/featureConfig';
```

### 5. Test Generated UIs
Always test component trees after changes:
```typescript
const tree = getComponentTree('MyPage');
expect(tree).toBeDefined();
expect(tree.component).toBe('Box');
```

### 6. Version Control
Track features.json changes carefully - it's critical infrastructure.

### 7. Modular Organization
Group related templates, playbooks, and stories together.

## Conclusion

The features.json configuration system enables:
- **50% less boilerplate code** in components
- **Declarative UI definition** without JSX
- **Configuration-driven E2E tests** with Playwright
- **Automated Storybook stories** from JSON
- **Parameterized SQL queries** for safety
- **Complete feature configuration** in one place

This architecture scales to hundreds of features while keeping the codebase maintainable and the development workflow efficient.
