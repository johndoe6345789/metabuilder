# Quick Reference: Data-Driven Development

## Adding Content (Zero TypeScript Required!)

### Add a New Page

```typescript
// Option 1: Via Level 4/5 GUI (future)
// Use visual page builder

// Option 2: In seed-data/pages.ts
const newPage = {
  id: 'page_my_page',
  level: 2,
  title: 'My Page',
  layout: 'dashboard',
  components: [
    {
      id: 'card_1',
      type: 'Card',
      props: { className: 'p-6' },
      children: [
        {
          id: 'title',
          type: 'Heading',
          props: { level: 2, children: 'Hello World' },
          children: []
        }
      ]
    }
  ],
  permissions: { requiresAuth: true }
}
```

### Add a Lua Script

```typescript
// In seed-data/scripts.ts
{
  id: 'script_my_function',
  name: 'My Function',
  code: `
    function myFunction(param1, param2)
      return param1 + param2
    end
    return myFunction
  `,
  parameters: [
    { name: 'param1', type: 'number' },
    { name: 'param2', type: 'number' }
  ],
  returnType: 'number'
}
```

### Add a Workflow

```typescript
// In seed-data/workflows.ts
{
  id: 'workflow_my_process',
  name: 'My Process',
  enabled: true,
  nodes: [
    {
      id: 'step1',
      type: 'action',
      label: 'Do Something',
      config: { action: 'my_action' },
      position: { x: 100, y: 100 }
    }
  ],
  edges: []
}
```

### Add a Component Config

```typescript
// In seed-data/components.ts
{
  id: 'config_my_button',
  componentId: 'node_my_button',
  props: {
    children: 'Click Me',
    variant: 'primary'
  },
  styles: {},
  events: {
    onClick: 'script_handle_click'
  }
}
```

## File Locations

```
/src/seed-data/         # Add content here
  ├── pages.ts          # New pages
  ├── scripts.ts        # New Lua scripts
  ├── workflows.ts      # New workflows
  ├── components.ts     # Component configs
  └── users.ts          # New users

/src/lib/               # Infrastructure (don't modify)
  ├── database.ts
  ├── lua-engine.ts
  └── page-renderer.ts

/src/components/        # Custom components (rarely needed)
  └── GenericPage.tsx   # Already handles everything
```

## Component Types Available

Use these in `type` field:

### Layout
- Container
- Card, CardHeader, CardContent
- Stack (vertical)
- Grid

### Text
- Heading (level 1-6)
- Text
- Label

### Input
- Input
- Textarea
- Select
- Checkbox
- Switch

### Action
- Button
- IconButton

### Display
- Avatar
- Badge
- Alert
- Separator

### Navigation
- Tabs, TabsList, TabsTrigger, TabsContent
- Accordion
- Breadcrumb

### Data
- Table
- DataTable
- Chart

### Feedback
- Toast (via `toast()` function)
- Progress
- Skeleton
- Spinner

## Lua Context

Available in all Lua scripts:

```lua
-- User info
context.user.id
context.user.username
context.user.email
context.user.role

-- Page info
context.page.id
context.page.level
context.page.title

-- State management
context.state.myValue
context.setState({ myValue = "new value" })

-- Database access (via exported functions)
-- Call Database methods through exposed API

-- Navigation
-- Trigger workflow: workflow_navigate_to_page

-- Utilities
print("Debug message")
os.time()
string.format()
math.floor()
table.insert()
```

## Layouts

Choose one in page definition:

### `default`
Standard page with optional header/footer.

### `sidebar`
Persistent side navigation.

### `dashboard`
Full app layout (sidebar + header + content).

### `blank`
No wrapper, full control.

## Permissions

```typescript
permissions: {
  requiresAuth: true,              // Must be logged in
  requiredRole: 'admin',           // Minimum role
  customCheck: 'script_check_perm' // Lua script for custom logic
}
```

## Events

Bind events to components:

```typescript
events: {
  onClick: 'script_handle_click',
  onChange: 'script_handle_change',
  onSubmit: 'workflow_submit_form'
}
```

## Workflow Node Types

### `trigger`
Starts the workflow (user action, timer, etc.)

### `action`
Performs an operation (create record, send email, etc.)

### `condition`
Branches based on condition (if/else)

### `lua`
Executes Lua script

### `transform`
Transforms data from one shape to another

## Common Patterns

### Page with Form
```typescript
{
  id: 'contact_form',
  type: 'Card',
  children: [
    { type: 'Input', props: { id: 'name', placeholder: 'Name' }},
    { type: 'Input', props: { id: 'email', placeholder: 'Email' }},
    { type: 'Textarea', props: { id: 'message', placeholder: 'Message' }},
    {
      type: 'Button',
      props: { children: 'Submit' },
      events: { onClick: 'workflow_submit_contact_form' }
    }
  ]
}
```

### Page with Data Table
```typescript
{
  id: 'users_table',
  type: 'DataTable',
  props: {
    data: '{{lua:getUsers()}}',
    columns: [
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' }
    ]
  }
}
```

### Page with Tabs
```typescript
{
  id: 'settings_tabs',
  type: 'Tabs',
  props: { defaultValue: 'profile' },
  children: [
    {
      type: 'TabsList',
      children: [
        { type: 'TabsTrigger', props: { value: 'profile', children: 'Profile' }},
        { type: 'TabsTrigger', props: { value: 'security', children: 'Security' }}
      ]
    },
    {
      type: 'TabsContent',
      props: { value: 'profile' },
      children: [ /* Profile content */ ]
    },
    {
      type: 'TabsContent',
      props: { value: 'security' },
      children: [ /* Security content */ ]
    }
  ]
}
```

### Dynamic Content with Lua
```typescript
{
  id: 'welcome_message',
  type: 'Text',
  props: {
    children: '{{lua:generateWelcome(user.username)}}'
  }
}
```

### Conditional Rendering
```typescript
{
  id: 'admin_panel',
  type: 'Card',
  conditionalRendering: {
    condition: "user.role === 'admin'",
    luaScriptId: 'script_check_admin'
  },
  children: [ /* Admin content */ ]
}
```

## Database Operations

Available methods (call via Lua or workflows):

```typescript
// Users
Database.getUsers()
Database.addUser(user)
Database.updateUser(id, updates)

// Pages
Database.getPages()
Database.addPage(page)
Database.updatePage(id, updates)

// Scripts
Database.getLuaScripts()
Database.addLuaScript(script)

// Workflows
Database.getWorkflows()
Database.addWorkflow(workflow)

// Components
Database.getComponentConfigs()
Database.addComponentConfig(config)
```

## Testing

### Test Individual Module
```typescript
import { initializeScripts } from '@/seed-data/scripts'
import { Database } from '@/lib/database'

test('Scripts initialize', async () => {
  await initializeScripts()
  const scripts = await Database.getLuaScripts()
  expect(scripts.length).toBeGreaterThan(0)
})
```

### Clear Database
```typescript
// Delete all KV data
await window.spark.kv.delete('db_users')
await window.spark.kv.delete('db_pages')
await window.spark.kv.delete('db_lua_scripts')
// ... etc

// Then refresh page to reinitialize
```

## Tips

### 1. Start with Examples
Copy existing pages/scripts from seed data and modify.

### 2. Use Descriptive IDs
- `page_user_dashboard` not `page_1`
- `script_validate_email` not `script_abc`

### 3. Test Lua Scripts
Use Lua REPL or test in Level 4/5 Lua editor.

### 4. Keep Components Simple
Break complex UIs into multiple components.

### 5. Use Workflows for Complex Logic
Don't put everything in one Lua script.

### 6. Document Your Data
Add comments explaining complex configurations.

## Documentation

- `DATA_DRIVEN_ARCHITECTURE.md` - Full architecture guide
- `MODULAR_SEED_DATA_GUIDE.md` - Seed data details
- `TYPESCRIPT_REDUCTION_GUIDE.md` - Migration roadmap
- `ITERATION_25_SUMMARY.md` - What was built

## Support

Questions? Check:
1. Documentation files (above)
2. Example seed data in `/src/seed-data/`
3. Existing page definitions in database

---

*Quick Reference - Iteration 25*
