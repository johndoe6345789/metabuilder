# Modular Seed Data System Guide

## Overview

The modular seed data system allows you to organize massive amounts of initialization data into maintainable, focused modules. Each module handles one concern and can be developed, tested, and maintained independently.

## Directory Structure

```
/src/seed-data/
├── index.ts           # Central orchestrator - exports all modules
├── users.ts           # User accounts, roles, and authentication
├── components.ts      # Component configurations and props
├── scripts.ts         # Lua scripts library
├── workflows.ts       # Workflow definitions
├── pages.ts           # Page structure definitions
└── packages.ts        # Package system initialization
```

## Module Pattern

Each module follows a consistent pattern:

```typescript
import { Database } from '@/lib/database'
import type { YourType } from '@/lib/level-types'

export async function initializeYourModule() {
  // 1. Check if data already exists
  const existing = await Database.getYourData()
  if (existing.length > 0) {
    return // Already initialized
  }

  // 2. Define seed data
  const data: YourType[] = [
    // ... your data
  ]

  // 3. Add to database
  for (const item of data) {
    await Database.addYourData(item)
  }
}
```

## Module Details

### `index.ts` - Orchestrator

Controls initialization order and re-exports everything:

```typescript
export * from './pages'
export * from './components'
export * from './workflows'
export * from './scripts'
export * from './users'
export * from './packages'

export async function initializeAllSeedData() {
  await initializeUsers()        // Foundation
  await initializeComponents()   // UI building blocks
  await initializeScripts()      // Logic
  await initializeWorkflows()    // Processes
  await initializePages()        // Assembled pages
  await initializePackages()     // Ecosystem
}
```

**Why this order?**
- Users first (authentication required by everything)
- Components next (building blocks for pages)
- Scripts (logic used by pages and workflows)
- Workflows (processes that connect everything)
- Pages (assemble components, scripts, workflows)
- Packages (bring in external functionality)

### `users.ts` - User Management

```typescript
import { Database, hashPassword } from '@/lib/database'
import type { User } from '@/lib/level-types'
import { getScrambledPassword } from '@/lib/auth'

export async function initializeUsers() {
  const existingUsers = await Database.getUsers()
  if (existingUsers.length > 0) {
    return
  }

  const users: User[] = [
    {
      id: 'user_supergod',
      username: 'supergod',
      email: 'supergod@metabuilder.local',
      role: 'supergod',
      createdAt: Date.now(),
      isInstanceOwner: true,
    },
    {
      id: 'user_admin',
      username: 'admin',
      email: 'admin@metabuilder.local',
      role: 'admin',
      createdAt: Date.now(),
    },
    // Add more users...
  ]

  for (const user of users) {
    const scrambledPassword = getScrambledPassword(user.username)
    const passwordHash = await hashPassword(scrambledPassword)
    await Database.setCredential(user.username, passwordHash)
    await Database.setFirstLoginFlag(user.username, true)
    await Database.addUser(user)
  }

  // Set credentials expiry
  await Database.setGodCredentialsExpiry(Date.now() + 60 * 60 * 1000)
}
```

**What it handles:**
- User accounts (supergod, god, admin, users)
- Password hashing
- First-login flags
- Credentials expiry

### `components.ts` - Component Configurations

```typescript
import { Database } from '@/lib/database'
import type { ComponentConfig } from '@/lib/database'

export async function initializeComponents() {
  const existingConfigs = await Database.getComponentConfigs()
  if (Object.keys(existingConfigs).length > 0) {
    return
  }

  const componentConfigs: ComponentConfig[] = [
    {
      id: 'config_hero_heading',
      componentId: 'node_hero_heading',
      props: {
        level: 1,
        children: 'Welcome to MetaBuilder',
        className: 'text-6xl font-bold mb-4',
      },
      styles: {},
      events: {},
    },
    {
      id: 'config_cta_button',
      componentId: 'node_cta_button',
      props: {
        children: 'Get Started',
        variant: 'primary',
        size: 'lg',
      },
      styles: {},
      events: {
        onClick: 'script_navigate_dashboard'
      },
    },
    // Add more configs...
  ]

  for (const config of componentConfigs) {
    await Database.addComponentConfig(config)
  }
}
```

**What it handles:**
- Component props
- Styling configuration
- Event handlers
- Conditional rendering rules

### `scripts.ts` - Lua Scripts

```typescript
import { Database } from '@/lib/database'
import type { LuaScript } from '@/lib/level-types'

export async function initializeScripts() {
  const existingScripts = await Database.getLuaScripts()
  if (existingScripts.length > 0) {
    return
  }

  const scripts: LuaScript[] = [
    {
      id: 'script_welcome_message',
      name: 'Welcome Message Generator',
      description: 'Generates personalized welcome message',
      code: `
function generateWelcome(username)
  return "Welcome back, " .. username .. "!"
end

return generateWelcome
      `,
      parameters: [
        { name: 'username', type: 'string' }
      ],
      returnType: 'string',
    },
    {
      id: 'script_validate_email',
      name: 'Email Validator',
      description: 'Validates email format',
      code: `
function validateEmail(email)
  if not email then return false end
  local pattern = "^[%w%._%%-]+@[%w%._%%-]+%.%w+$"
  return string.match(email, pattern) ~= nil
end

return validateEmail
      `,
      parameters: [
        { name: 'email', type: 'string' }
      ],
      returnType: 'boolean',
    },
    // Add more scripts...
  ]

  for (const script of scripts) {
    await Database.addLuaScript(script)
  }
}
```

**What it handles:**
- Business logic (Lua functions)
- Validation rules
- Data transformations
- Permission checks
- Analytics tracking
- Custom calculations

### `workflows.ts` - Process Definitions

```typescript
import { Database } from '@/lib/database'
import type { Workflow } from '@/lib/level-types'

export async function initializeWorkflows() {
  const existingWorkflows = await Database.getWorkflows()
  if (existingWorkflows.length > 0) {
    return
  }

  const workflows: Workflow[] = [
    {
      id: 'workflow_user_registration',
      name: 'User Registration Flow',
      description: 'Handles new user registration',
      enabled: true,
      nodes: [
        {
          id: 'validate',
          type: 'condition',
          label: 'Validate Input',
          config: { scriptId: 'script_validate_email' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'create',
          type: 'action',
          label: 'Create User',
          config: { action: 'create_user' },
          position: { x: 100, y: 200 }
        },
        {
          id: 'notify',
          type: 'action',
          label: 'Send Welcome Email',
          config: { action: 'send_email' },
          position: { x: 100, y: 300 }
        }
      ],
      edges: [
        { id: 'e1', source: 'validate', target: 'create', label: 'valid' },
        { id: 'e2', source: 'create', target: 'notify', label: 'success' }
      ]
    },
    // Add more workflows...
  ]

  for (const workflow of workflows) {
    await Database.addWorkflow(workflow)
  }
}
```

**What it handles:**
- Multi-step processes
- Conditional logic flows
- Error handling paths
- Integration points
- State machines

### `pages.ts` - Page Definitions

```typescript
import { Database } from '@/lib/database'
import { getPageDefinitionBuilder } from '@/lib/page-definition-builder'

export async function initializePages() {
  const existingPages = await Database.getPages()
  if (existingPages.length > 0) {
    return
  }

  // Use the builder to create default pages
  const builder = getPageDefinitionBuilder()
  await builder.initializeDefaultPages()
  
  // Or add custom pages directly
  /*
  const customPages: PageDefinition[] = [
    {
      id: 'page_custom',
      level: 2,
      title: 'Custom Page',
      layout: 'dashboard',
      components: [ /* component tree *\/ ],
      permissions: { requiresAuth: true }
    }
  ]
  
  for (const page of customPages) {
    await Database.addPage(page)
  }
  */
}
```

**What it handles:**
- Page structures
- Layout selection
- Component trees
- Permission requirements
- Lua script bindings

### `packages.ts` - Package System

```typescript
import { initializePackageSystem } from '@/lib/package-loader'

export async function initializePackages() {
  // Initialize the package system
  await initializePackageSystem()
  
  // Optionally auto-install default packages
  /*
  const defaultPackages = [
    'irc-webchat',
    'forum',
    'blog'
  ]
  
  for (const pkg of defaultPackages) {
    await PackageManager.install(pkg)
  }
  */
}
```

**What it handles:**
- Package system initialization
- Auto-install default packages
- Package dependency resolution

## Scaling to Large Datasets

### Strategy 1: Split by Category

```
/src/seed-data/
├── index.ts
├── users/
│   ├── index.ts
│   ├── admins.ts      # Admin users
│   ├── moderators.ts  # Mod users
│   └── regular.ts     # Regular users
├── scripts/
│   ├── index.ts
│   ├── validation.ts  # Validation scripts
│   ├── business.ts    # Business logic
│   └── utilities.ts   # Utility functions
└── pages/
    ├── index.ts
    ├── level1.ts      # Level 1 pages
    ├── level2.ts      # Level 2 pages
    └── level3.ts      # Level 3 pages
```

### Strategy 2: Split by Feature

```
/src/seed-data/
├── index.ts
├── features/
│   ├── forum/
│   │   ├── pages.ts
│   │   ├── components.ts
│   │   └── scripts.ts
│   ├── blog/
│   │   ├── pages.ts
│   │   ├── components.ts
│   │   └── scripts.ts
│   └── chat/
│       ├── pages.ts
│       ├── components.ts
│       └── scripts.ts
```

### Strategy 3: Split by Size

When a file gets too large (>500 lines), split it:

```typescript
// scripts.ts gets big, so split it:

// scripts/index.ts
export * from './validation'
export * from './business'
export * from './utilities'

export async function initializeScripts() {
  await initializeValidationScripts()
  await initializeBusinessScripts()
  await initializeUtilityScripts()
}

// scripts/validation.ts
export async function initializeValidationScripts() {
  // 20 validation scripts
}

// scripts/business.ts
export async function initializeBusinessScripts() {
  // 30 business logic scripts
}

// scripts/utilities.ts
export async function initializeUtilityScripts() {
  // 25 utility scripts
}
```

## Testing Modules

Each module can be tested independently:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { initializeUsers } from '@/seed-data/users'
import { Database } from '@/lib/database'

describe('User Seed Data', () => {
  beforeEach(async () => {
    // Clear database
    await Database.setUsers([])
  })

  it('should initialize users', async () => {
    await initializeUsers()
    const users = await Database.getUsers()
    
    expect(users).toHaveLength(5)
    expect(users[0].username).toBe('supergod')
    expect(users[0].role).toBe('supergod')
  })

  it('should not reinitialize if users exist', async () => {
    await initializeUsers()
    const firstUsers = await Database.getUsers()
    
    await initializeUsers() // Call again
    const secondUsers = await Database.getUsers()
    
    expect(secondUsers).toEqual(firstUsers)
  })
})
```

## Development Workflow

### Adding New Seed Data

1. **Choose the right module** (or create new one)
2. **Add your data** to the array
3. **Test locally** - delete KV data and refresh
4. **Commit** with descriptive message

### Modifying Existing Data

1. **Find the data** in appropriate module
2. **Update the definition**
3. **Clear database** (or increment version)
4. **Test** to ensure it works

### Creating New Module

1. **Create file** in `/src/seed-data/`
2. **Follow the pattern**:
   ```typescript
   export async function initializeYourFeature() {
     // Check if exists
     // Define data
     // Add to database
   }
   ```
3. **Add to index.ts**:
   ```typescript
   export * from './your-feature'
   
   export async function initializeAllSeedData() {
     // ... existing modules
     await initializeYourFeature()
   }
   ```
4. **Test** independently

## Best Practices

### 1. Keep Modules Focused
Each module should handle one concern only.

❌ Bad:
```typescript
// users.ts
export async function initializeUsers() {
  // Initialize users
  // Initialize pages
  // Initialize scripts
  // Everything mixed together
}
```

✅ Good:
```typescript
// users.ts
export async function initializeUsers() {
  // Only user-related initialization
}
```

### 2. Check Before Adding
Always check if data exists to avoid duplicates.

```typescript
const existing = await Database.getUsers()
if (existing.length > 0) {
  return // Already initialized
}
```

### 3. Use Descriptive IDs
Make IDs self-documenting:

❌ Bad: `'script_1'`, `'page_abc'`
✅ Good: `'script_validate_email'`, `'page_user_dashboard'`

### 4. Add Comments
Explain complex logic:

```typescript
const scripts: LuaScript[] = [
  {
    id: 'script_complex_calculation',
    name: 'Complex Calculation',
    description: 'Calculates X using Y algorithm',
    // This script implements the Z algorithm from paper ABC
    // Input: array of numbers
    // Output: weighted average with outlier removal
    code: `
      -- Implementation details
    `,
    // ...
  }
]
```

### 5. Version Your Data
Add version fields for migrations:

```typescript
{
  id: 'page_dashboard',
  version: 2, // Incremented when structure changes
  title: 'Dashboard',
  // ...
}
```

## Common Patterns

### Pattern: Conditional Initialization

```typescript
export async function initializeUsers() {
  const existing = await Database.getUsers()
  
  // Always add supergod if missing
  const hasSuperGod = existing.some(u => u.role === 'supergod')
  if (!hasSuperGod) {
    await Database.addUser({
      id: 'user_supergod',
      username: 'supergod',
      role: 'supergod',
      // ...
    })
  }
  
  // Add demo users only in development
  if (process.env.NODE_ENV === 'development') {
    await addDemoUsers()
  }
}
```

### Pattern: Reference Other Data

```typescript
export async function initializePages() {
  // Load scripts first
  const scripts = await Database.getLuaScripts()
  const welcomeScript = scripts.find(s => s.id === 'script_welcome_message')
  
  // Reference in page
  const pages: PageDefinition[] = [
    {
      id: 'page_dashboard',
      luaScripts: {
        onLoad: welcomeScript?.id
      },
      // ...
    }
  ]
}
```

### Pattern: Generated Data

```typescript
export async function initializeUsers() {
  // Generate 100 test users
  const users: User[] = []
  
  for (let i = 1; i <= 100; i++) {
    users.push({
      id: `user_test_${i}`,
      username: `testuser${i}`,
      email: `test${i}@example.com`,
      role: 'user',
      createdAt: Date.now(),
    })
  }
  
  for (const user of users) {
    await Database.addUser(user)
  }
}
```

## Troubleshooting

### Data Not Appearing
1. Check if initialization runs: add `console.log()` in module
2. Verify database is clear: check KV store
3. Ensure correct order: dependencies initialized first

### Duplicate Data
1. Check early return: `if (existing.length > 0) return`
2. Clear database: delete all KV keys
3. Use unique IDs: ensure no ID conflicts

### Performance Issues
1. Batch operations: use transactions if available
2. Lazy load: don't load everything at once
3. Split modules: break large files into smaller ones

## Conclusion

The modular seed data system provides:
- ✅ Clear organization
- ✅ Easy maintenance
- ✅ Independent testing
- ✅ Scalable to massive datasets
- ✅ Feature-based isolation

Follow these patterns and your seed data will stay maintainable even as it grows to thousands of lines.

---

*Last updated: Iteration 25*
