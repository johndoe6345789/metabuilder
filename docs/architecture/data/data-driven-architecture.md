# MetaBuilder Data-Driven Architecture

## Overview

MetaBuilder is designed to minimize TypeScript dependencies by making everything procedurally generated from JSON configurations and Lua scripts. This document explains the architecture and how to extend it.

## Core Principle

**Code should only exist for infrastructure. Content is data.**

```
Infrastructure Layer (TypeScript):
- App.tsx
- GenericPage.tsx
- RenderComponent.tsx
- Database.ts
- LuaEngine.ts
- Shadcn components

Content Layer (JSON + Lua):
- Pages
- Components
- Workflows
- Scripts
- Users
- Permissions
```

## Architecture Layers

### Layer 1: Data Storage (`/src/seed-data/`)

Modular seed data modules that initialize the database:

```typescript
/src/seed-data/
├── index.ts          // Orchestrates initialization
├── users.ts          // User accounts & auth
├── components.ts     // Component configurations
├── scripts.ts        // Lua script library
├── workflows.ts      // Process definitions
├── pages.ts          // Page structures
└── packages.ts       // Package system
```

**Each module:**
- Checks if data already exists
- Returns early if already initialized
- Adds data to database via Database API
- Can be selectively enabled/disabled

### Layer 2: Data Persistence (`/src/lib/database.ts`)

The `Database` class provides a unified KV-store interface:

```typescript
// Users
await Database.addUser(user)
await Database.getUsers()
await Database.updateUser(id, updates)

// Components
await Database.addComponentConfig(config)
await Database.getComponentConfigs()

// Pages
await Database.addPage(page)
await Database.getPages()

// Scripts
await Database.addLuaScript(script)
await Database.getLuaScripts()

// Workflows
await Database.addWorkflow(workflow)
await Database.getWorkflows()
```

### Layer 3: Logic Layer (Lua)

All business logic is written in Lua and stored as data:

```lua
-- scripts.ts
{
  id: 'script_welcome_message',
  name: 'Welcome Message Generator',
  code: `
    function generateWelcome(username)
      return "Welcome back, " .. username .. "!"
    end
    return generateWelcome
  `,
  parameters: [{ name: 'username', type: 'string' }],
  returnType: 'string'
}
```

**Benefits:**
- Scripts stored in database
- Can be edited via UI
- Sandboxed execution
- No recompilation needed

### Layer 4: Workflow Layer

Workflows define multi-step processes as node graphs:

```typescript
{
  id: 'workflow_user_registration',
  name: 'User Registration Flow',
  nodes: [
    {
      id: 'validate',
      type: 'condition',
      label: 'Validate Input',
      config: { luaScriptId: 'script_validate_email' }
    },
    {
      id: 'create',
      type: 'action',
      label: 'Create User',
      config: { action: 'create_user' }
    }
  ],
  edges: [
    { source: 'validate', target: 'create', label: 'valid' }
  ]
}
```

**Benefits:**
- Visual workflow editor possible
- Complex logic without code
- Reusable node types
- Clear process flow

### Layer 5: Page Layer

Pages combine components, scripts, and workflows:

```typescript
{
  id: 'page_dashboard',
  title: 'User Dashboard',
  level: 2,
  layout: 'dashboard',
  components: [/* component tree */],
  luaScripts: {
    onLoad: 'script_page_analytics',
    onUnload: 'script_save_state'
  },
  permissions: {
    requiresAuth: true,
    customCheck: 'script_permission_check'
  }
}
```

**Rendered by:**
```tsx
<GenericPage 
  pageId="page_dashboard"
  user={currentUser}
  level={2}
  onNavigate={handleNavigate}
/>
```

### Layer 6: Presentation Layer

Generic TSX components render from definitions:

```tsx
// GenericPage.tsx
// Reads PageDefinition from database
// Renders layout based on page.layout
// Executes onLoad scripts
// Renders component tree via RenderComponent

// RenderComponent.tsx
// Recursive component renderer
// Maps type string to actual component
// Passes props from configuration
// Handles children recursively
```

## Data Flow

### Page Load Flow

```
1. User navigates to page
   ↓
2. App.tsx determines level
   ↓
3. GenericPage loads PageDefinition from Database
   ↓
4. Permission check (role + custom Lua)
   ↓
5. Execute onLoad Lua script
   ↓
6. Render layout (default/sidebar/dashboard/blank)
   ↓
7. RenderComponent processes component tree
   ↓
8. Components render (shadcn + custom)
   ↓
9. User interacts
   ↓
10. Event handlers execute (Lua scripts)
   ↓
11. User leaves
   ↓
12. Execute onUnload Lua script
```

### Component Rendering Flow

```
ComponentInstance (JSON)
  ↓
RenderComponent.tsx
  ↓
Type Lookup (Registry)
  ↓
Shadcn Component / Custom Component
  ↓
Props Applied
  ↓
Children Recursively Rendered
  ↓
Events Bound (Lua scripts)
  ↓
Final DOM
```

### Lua Script Execution Flow

```
User Action
  ↓
Event Handler Triggered
  ↓
Lookup Script ID in Database
  ↓
Load Script Code
  ↓
Prepare Context (user, page, data)
  ↓
LuaEngine.execute(code, context)
  ↓
Sandboxed Lua VM
  ↓
Return Result
  ↓
Update UI / Navigate / Show Toast
```

## Adding New Content

### Add a New Page

```typescript
// In seed-data/pages.ts or via Level 4/5 GUI

const newPage: PageDefinition = {
  id: 'page_my_feature',
  level: 2,
  title: 'My Feature',
  layout: 'dashboard',
  components: [
    {
      id: 'card_1',
      type: 'Card',
      props: { className: 'p-6' },
      children: [
        {
          id: 'heading_1',
          type: 'Heading',
          props: { level: 2, children: 'My Feature' },
          children: []
        }
      ]
    }
  ],
  permissions: { requiresAuth: true }
}

await Database.addPage(newPage)
```

### Add a New Lua Script

```typescript
// In seed-data/scripts.ts

const newScript: LuaScript = {
  id: 'script_my_logic',
  name: 'My Custom Logic',
  description: 'Does something useful',
  code: `
    function processData(input)
      -- Your Lua logic here
      return result
    end
    return processData
  `,
  parameters: [{ name: 'input', type: 'string' }],
  returnType: 'string'
}

await Database.addLuaScript(newScript)
```

### Add a New Workflow

```typescript
// In seed-data/workflows.ts

const newWorkflow: Workflow = {
  id: 'workflow_my_process',
  name: 'My Process',
  description: 'Multi-step process',
  enabled: true,
  nodes: [
    {
      id: 'start',
      type: 'trigger',
      label: 'Start',
      config: {},
      position: { x: 100, y: 100 }
    },
    {
      id: 'process',
      type: 'lua',
      label: 'Process Data',
      config: {
        scriptId: 'script_my_logic',
        retry: { maxAttempts: 3, delayMs: 250, backoffMultiplier: 2 }
      },
      position: { x: 100, y: 200 }
    }
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'process' }
  ]
}

await Database.addWorkflow(newWorkflow)
```

Note: Workflow nodes can include an optional `retry` config block to automatically retry failed nodes. Supported fields are `maxAttempts`, `delayMs`, `backoffMultiplier`, and `jitterMs`.

### Add a New Component Configuration

```typescript
// In seed-data/components.ts

const newConfig: ComponentConfig = {
  id: 'config_my_button',
  componentId: 'node_my_button',
  props: {
    children: 'Click Me',
    variant: 'primary',
    size: 'lg'
  },
  styles: {},
  events: {
    onClick: 'script_button_handler'
  }
}

await Database.addComponentConfig(newConfig)
```

## Packages

Packages are self-contained collections of:
- Pages
- Components
- Scripts
- Workflows
- Assets

```
forum-package/
├── package.json
├── seed-data/
│   ├── pages.ts       // Forum pages
│   ├── components.ts  // Forum components
│   ├── scripts.ts     // Forum logic
│   └── workflows.ts   // Moderation workflows
├── assets/
│   └── images/
└── README.md
```

Install a package:
```typescript
await PackageManager.install('forum-package')
```

The package's seed data automatically merges with the main application.

## Extending the System

### Add a New Node Type for Workflows

```typescript
// In workflow-engine.ts

export class WorkflowEngine {
  async executeNode(node: WorkflowNode, context: any) {
    switch (node.type) {
      case 'trigger':
        return this.executeTrigger(node, context)
      case 'action':
        return this.executeAction(node, context)
      case 'condition':
        return this.executeCondition(node, context)
      case 'lua':
        return this.executeLuaScript(node, context)
      
      // Add your new type here
      case 'http_request':
        return this.executeHttpRequest(node, context)
      
      default:
        throw new Error(`Unknown node type: ${node.type}`)
    }
  }
  
  async executeHttpRequest(node: WorkflowNode, context: any) {
    const { url, method, body } = node.config
    const response = await fetch(url, { method, body })
    return await response.json()
  }
}
```

### Add a New Layout Type

```typescript
// In GenericPage.tsx

const renderLayout = () => {
  switch (page.layout) {
    case 'default':
      return <DefaultLayout>{content}</DefaultLayout>
    case 'sidebar':
      return <SidebarLayout>{content}</SidebarLayout>
    case 'dashboard':
      return <DashboardLayout>{content}</DashboardLayout>
    case 'blank':
      return <>{content}</>
    
    // Add your new layout
    case 'split':
      return <SplitLayout>{content}</SplitLayout>
    
    default:
      return <>{content}</>
  }
}
```

### Add a New Permission Check

```typescript
// Create Lua script in seed-data/scripts.ts

{
  id: 'script_custom_permission',
  name: 'Custom Permission Check',
  code: `
    function checkCustomPermission(user, resource)
      -- Your custom logic
      if user.role == 'admin' then
        return true
      end
      
      if resource.owner == user.id then
        return true
      end
      
      return false
    end
    return checkCustomPermission
  `,
  parameters: [
    { name: 'user', type: 'table' },
    { name: 'resource', type: 'table' }
  ],
  returnType: 'boolean'
}
```

Then use in page definition:
```typescript
{
  id: 'page_protected',
  permissions: {
    requiresAuth: true,
    customCheck: 'script_custom_permission'
  }
}
```

## Best Practices

### 1. Keep Infrastructure Minimal
Only create TSX files for:
- Generic renderers (GenericPage, RenderComponent)
- Core systems (Database, LuaEngine)
- UI components library (Shadcn)

### 2. Store Content as Data
Pages, workflows, scripts should be in database, not hardcoded.

### 3. Use Lua for Logic
Business logic belongs in Lua scripts, not TypeScript.

### 4. Modular Seed Data
Split large seed datasets across multiple files in `/src/seed-data/`.

### 5. Package Organization
Group related functionality into packages for distribution.

### 6. Type Safety
Use TypeScript types for infrastructure, but keep content flexible.

## Current Status

### Infrastructure (TypeScript - Must Keep)
- ✅ App.tsx
- ✅ GenericPage.tsx
- ✅ RenderComponent.tsx
- ✅ Database.ts
- ✅ LuaEngine.ts
- ✅ Shadcn components (~40 files)

### Content (Can Be Pure Data)
- ⚠️ Level1.tsx (to be replaced by GenericPage)
- ⚠️ Level2.tsx (to be replaced by GenericPage)
- ⚠️ Level3.tsx (to be replaced by GenericPage)
- ✅ All pages (via PageDefinitionBuilder)
- ✅ All scripts (Lua in database)
- ✅ All workflows (JSON in database)
- ✅ All components (configs in database)

## Roadmap

### Phase 3: Remove TSX Content Files
- [ ] Update App.tsx to use GenericPage for all levels
- [ ] Test Level 1/2/3 functionality in GenericPage
- [ ] Delete Level1.tsx, Level2.tsx, Level3.tsx
- [ ] Update documentation

### Phase 4: GUI Builders
- [ ] Visual page builder
- [ ] Workflow diagram editor
- [ ] Lua script IDE
- [ ] Component property editor
- [ ] Theme customizer

### Phase 5: Marketplace
- [ ] Package repository
- [ ] Community packages
- [ ] Version management
- [ ] Dependency resolution

## Conclusion

MetaBuilder's architecture is designed for maximum flexibility with minimal code dependencies. By storing everything as data and using generic renderers, the platform can grow infinitely without adding more TypeScript files.

**The goal: 95% data-driven, 5% infrastructure.**

---

*Last updated: Iteration 25*
