# Lua UI Migration Strategy

## Vision
Transform MetaBuilder into a **lean framework that loads Lua code** by migrating UI boilerplate from React/TypeScript to Lua packages.

## Current State Analysis

### Statistics
- **401 React components** in the codebase
- **0 Lua UI definition files** currently
- **UI already defined in packages** (TypeScript schemas)
- **Lua engine operational** with Fengari runtime

### Existing Architecture
```
packages/
  └── core/
      └── package-definitions/
          ├── set-a/ (forum, guestbook, spotify, youtube)
          └── set-b/ (ecommerce, irc-webchat, retro-games)
              └── irc-webchat/
                  ├── schema/layout.ts (UI config)
                  ├── actions/commands.ts
                  ├── actions/events.ts
                  └── validation.ts
```

Currently UI is defined in TypeScript but **already structured for package-based loading**.

## Migration Strategy

### Phase 1: Create Lua UI Definition Format (Weeks 1-2)

#### 1.1 Define Lua UI Schema
Create a Lua DSL for defining UI components:

```lua
-- packages/ui/irc-webchat.lua
return {
  metadata = {
    id = "irc-webchat",
    version = "1.0.0",
    name = "IRC Webchat",
    description = "Real-time chat interface"
  },

  pages = {
    {
      id = "page_chat",
      path = "/chat",
      title = "IRC Webchat",
      level = 2,
      requiresAuth = true,
      requiredRole = "user",

      components = {
        {
          id = "comp_chat_root",
          type = "IRCWebchat",
          props = {
            channelName = "general",
            maxMessages = 100,
            enableEmoji = true
          }
        }
      }
    }
  },

  components = {
    IRCWebchat = {
      defaultProps = {
        channelName = "general",
        theme = "dark"
      },
      validation = {
        channelName = { type = "string", required = true },
        maxMessages = { type = "number", min = 1, max = 1000 }
      }
    }
  }
}
```

#### 1.2 Create Lua-to-React Bridge
**New:** `src/lib/lua/ui/lua-ui-loader.ts`

```typescript
import { executeLuaScript } from '@/lib/lua/engine/execute'
import type { PackageContent } from '@/lib/packages/package-types'

export async function loadLuaUIPackage(
  luaSource: string
): Promise<Pick<PackageContent, 'pages' | 'componentConfigs'>> {
  // Execute Lua and convert to TypeScript types
  const result = await executeLuaScript(luaSource, {
    sandbox: true,
    timeout: 5000
  })

  return convertLuaToUISchema(result)
}
```

#### 1.3 TypeScript Type Definitions for Lua UI
**New:** `src/lib/lua/ui/types.ts`

```typescript
export interface LuaUIMetadata {
  id: string
  version: string
  name: string
  description: string
}

export interface LuaUIPage {
  id: string
  path: string
  title: string
  level: number
  requiresAuth?: boolean
  requiredRole?: string
  components: LuaUIComponent[]
}

export interface LuaUIComponent {
  id: string
  type: string
  props: Record<string, unknown>
  children?: LuaUIComponent[]
}
```

### Phase 2: Package Storage System (Weeks 2-3)

#### 2.1 Lua Package Store in Database
Add Lua packages to the database schema:

```typescript
// New table in Prisma schema
model LuaPackage {
  id          String   @id @default(uuid())
  packageId   String   @unique
  version     String
  name        String
  category    String   // 'ui', 'action', 'validation'
  luaSource   String   @db.Text  // Lua code
  metadata    Json

  tenantId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId, category])
}
```

#### 2.2 Package Installation Flow
```typescript
// src/lib/packages/lua/install-lua-package.ts
export async function installLuaPackage(params: {
  packageId: string
  luaSource: string
  category: 'ui' | 'action' | 'validation'
  tenantId: string
}) {
  // 1. Validate Lua syntax
  await validateLuaSyntax(params.luaSource)

  // 2. Execute in sandbox to extract metadata
  const metadata = await extractPackageMetadata(params.luaSource)

  // 3. Store in database
  await db.luaPackage.create({
    data: {
      packageId: params.packageId,
      luaSource: params.luaSource,
      category: params.category,
      metadata,
      tenantId: params.tenantId,
      version: metadata.version,
      name: metadata.name
    }
  })
}
```

### Phase 3: Migration of Existing Packages (Weeks 3-5)

#### Priority Order

**Tier 1: Simple UI Packages (Week 3)**
- Guestbook Retro
- Forum Classic
- Spotify Clone UI

**Tier 2: Medium Complexity (Week 4)**
- IRC Webchat
- YouTube Clone
- Ecommerce Basic

**Tier 3: Complex Packages (Week 5)**
- Retro Games
- Package Manager UI
- Nerd Mode IDE

#### Migration Template

For each package:
1. Create `packages/lua-ui/{package-name}.lua`
2. Convert TypeScript UI schema to Lua DSL
3. Write migration tests
4. Update package loader to support both formats
5. Gradually deprecate TypeScript version

### Phase 4: Component Abstraction Layer (Weeks 5-6)

#### 4.1 Core React Components Become "Primitives"

Keep minimal React components as building blocks:
- Form controls (Input, Button, Select)
- Layout containers (Box, Stack, Grid)
- Data display (Table, List, Card)

All composition defined in Lua.

#### 4.2 Component Registry
```lua
-- Lua can reference registered React components
local form = Component.create("Form", {
  children = {
    Component.create("Input", { name = "username", label = "Username" }),
    Component.create("Button", { type = "submit", text = "Login" })
  }
})
```

Maps to React component registry:
```typescript
const ComponentRegistry = {
  Form: FormPrimitive,
  Input: InputPrimitive,
  Button: ButtonPrimitive,
  // ... primitives only
}
```

### Phase 5: Runtime Package Loading (Weeks 6-7)

#### 5.1 Dynamic Package Loader
```typescript
// src/lib/packages/lua/runtime-loader.ts
export async function loadPackageAtRuntime(packageId: string) {
  // 1. Fetch from database or cache
  const luaPackage = await fetchLuaPackage(packageId)

  // 2. Execute Lua to get UI definition
  const uiDef = await loadLuaUIPackage(luaPackage.luaSource)

  // 3. Generate React components on-the-fly
  return generateComponentTree(uiDef)
}
```

#### 5.2 Hot Reload Support
Lua packages can be updated without rebuilding the framework:
- Update Lua code in database
- Invalidate cache
- UI automatically reflects changes

### Phase 6: Developer Experience (Weeks 7-8)

#### 6.1 Lua Package Development Environment
- **Lua Editor** with syntax highlighting (Monaco)
- **Live Preview** of UI changes
- **Validation** feedback
- **Version Control** for packages

#### 6.2 Package Publishing Flow
1. Write Lua UI package in browser
2. Test in sandbox
3. Publish to tenant
4. Package becomes available to all users

## Benefits

### 1. **Radical Reduction in Build Artifacts**
- From 401 React components → ~20-30 primitive components
- UI defined in database, not compiled code
- Faster builds, smaller bundles

### 2. **Runtime Flexibility**
- Update UI without deploying
- Per-tenant customization
- A/B testing at the package level

### 3. **User Empowerment**
- Advanced users can create packages
- Share packages across tenants
- Package marketplace potential

### 4. **True Multi-Tenancy**
- Each tenant can have different package versions
- Custom branding via Lua
- Isolated package updates

### 5. **Simplified Architecture**
```
BEFORE:
TypeScript Components → Build → Bundle → Deploy

AFTER:
Lua Packages → Database → Runtime Load → Render
```

## Implementation Checklist

### Foundation
- [ ] Create Lua UI DSL specification
- [ ] Implement Lua-to-React bridge
- [ ] Add LuaPackage database model
- [ ] Create package validation system

### Core Functionality
- [ ] Implement runtime package loader
- [ ] Create component registry system
- [ ] Build package installation API
- [ ] Add package version management

### Migration
- [ ] Migrate 3 simple packages (Tier 1)
- [ ] Migrate 3 medium packages (Tier 2)
- [ ] Migrate complex packages (Tier 3)
- [ ] Remove deprecated TypeScript packages

### Developer Experience
- [ ] Lua package editor UI
- [ ] Live preview system
- [ ] Package testing framework
- [ ] Documentation & examples

### Production Readiness
- [ ] Performance optimization
- [ ] Caching strategy
- [ ] Error handling & recovery
- [ ] Security review & sandboxing

## Success Metrics

1. **Code Reduction:** 401 → 30 components (-92%)
2. **Package Count:** 8 packages successfully running from Lua
3. **Build Time:** Reduce by >50%
4. **Bundle Size:** Reduce by >60%
5. **Deploy Frequency:** UI updates without deploy

## Timeline

**8 weeks total** for full migration:
- Weeks 1-2: Foundation & DSL
- Weeks 3-5: Package migration
- Weeks 6-7: Runtime & hot reload
- Week 8: DX & polish

## Risk Mitigation

1. **Gradual Migration:** Both systems run in parallel
2. **Feature Flags:** Toggle Lua/TypeScript per package
3. **Rollback Plan:** Keep TypeScript packages until Lua proven
4. **Testing:** Comprehensive e2e tests for each migrated package
5. **Performance:** Monitor Lua execution times, add caching

## Next Steps

1. Get approval for Lua UI DSL spec
2. Implement proof-of-concept with IRC Webchat
3. Measure performance & user experience
4. Decide on full migration vs. hybrid approach
