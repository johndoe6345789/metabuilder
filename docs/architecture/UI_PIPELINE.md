# UI Rendering Pipeline

## Complete Data Flow: JSON → Database → Lua → TSX → User

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         METABUILDER UI PIPELINE                              │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: SEED DATA (JSON)
┌────────────────────────────────────────────┐
│ packages/ui_pages/seed/pages/login.json    │
│ {                                          │
│   "path": "/login",                        │
│   "title": "Login",                        │
│   "level": 1,                              │
│   "requiresAuth": false,                   │
│   "layout": {                              │
│     "type": "Card",                        │
│     "props": {...},                        │
│     "children": [...]                      │
│   }                                        │
│ }                                          │
└────────────────────────────────────────────┘
                    │
                    │ import-ui-pages.ts
                    ▼
Step 2: DATABASE
┌────────────────────────────────────────────┐
│ ui_page table                              │
│ ┌────────────────────────────────────────┐ │
│ │ id: uuid                               │ │
│ │ path: "/login"                         │ │
│ │ title: "Login"                         │ │
│ │ level: 1                               │ │
│ │ require_auth: false                    │ │
│ │ layout: JSON {...}                     │ │
│ │ actions: JSON {...}                    │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
                    │
                    │ load-page-from-db.ts
                    ▼
Step 3: LUA RUNTIME (Optional Transforms)
┌────────────────────────────────────────────┐
│ lua_script table                           │
│ ┌────────────────────────────────────────┐ │
│ │ name: "/login_transformer"             │ │
│ │ code: "return transform(layout)"       │ │
│ │ category: "ui_transform"               │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ Fengari Lua 5.3 Engine                    │
│ - Executes transforms                     │
│ - Runs action handlers                    │
│ - Security sandboxing                     │
└────────────────────────────────────────────┘
                    │
                    │ normalize-lua-structure.ts
                    ▼
Step 4: NORMALIZED JSON
┌────────────────────────────────────────────┐
│ UIPageData {                               │
│   path: "/login",                          │
│   title: "Login",                          │
│   layout: {                                │
│     type: "Card",                          │
│     children: [ {...}, {...} ]  // Arrays │
│   },                                       │
│   actions: {                               │
│     handleLogin: Function                  │
│   }                                        │
│ }                                          │
└────────────────────────────────────────────┘
                    │
                    │ UIPageRenderer.tsx
                    ▼
Step 5: TSX RENDERER
┌────────────────────────────────────────────┐
│ generateComponentTree()                    │
│ ┌────────────────────────────────────────┐ │
│ │ Component Registry:                    │ │
│ │ - Card → @mui/material/Card            │ │
│ │ - Button → @mui/material/Button        │ │
│ │ - Input → @mui/material/TextField      │ │
│ │ - Typography → @mui/material/Typography│ │
│ └────────────────────────────────────────┘ │
│                                            │
│ React.createElement() calls                │
└────────────────────────────────────────────┘
                    │
                    │ Next.js Server/Client Components
                    ▼
Step 6: REACT VIRTUAL DOM
┌────────────────────────────────────────────┐
│ <Card>                                     │
│   <CardHeader>                             │
│     <CardTitle>Welcome to MetaBuilder</CardTitle> │
│   </CardHeader>                            │
│   <CardContent>                            │
│     <Input name="username" ... />         │
│     <Button onClick={handleLogin}>        │
│       Sign In                              │
│     </Button>                              │
│   </CardContent>                           │
│ </Card>                                    │
└────────────────────────────────────────────┘
                    │
                    │ React Reconciliation
                    ▼
Step 7: USER SEES PAGE
┌────────────────────────────────────────────┐
│        Browser Renders UI                  │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │  Welcome to MetaBuilder            │   │
│  │                                    │   │
│  │  Username: [____________]          │   │
│  │  Password: [____________]          │   │
│  │                                    │   │
│  │  [ Sign In ]                       │   │
│  └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

## File Structure

### 1. Seed Data
```
packages/ui_pages/
├── seed/
│   ├── metadata.json          # Package metadata
│   └── pages/
│       ├── login.json         # Login page definition
│       ├── level1.json        # Level 1 home page
│       ├── level2.json        # Level 2 page
│       └── ...
```

### 2. Database Schema
```
dbal/shared/api/schema/entities/core/
└── ui_page.yaml               # UIPage entity definition
```

### 3. Importer
```
frontends/nextjs/src/lib/seed/
└── import-ui-pages.ts         # JSON → Database importer
```

### 4. Loader
```
frontends/nextjs/src/lib/ui-pages/
└── load-page-from-db.ts       # Database → Lua → Normalized JSON
```

### 5. Renderer
```
frontends/nextjs/src/components/ui-page-renderer/
├── UIPageRenderer.tsx         # TSX renderer component
└── index.ts                   # Barrel export
```

### 6. Route
```
frontends/nextjs/src/app/ui/[[...slug]]/
└── page.tsx                   # Generic dynamic route
```

### 7. Component Generator
```
frontends/nextjs/src/lib/lua/ui/
├── generate-component-tree.tsx  # JSON → React.createElement
└── normalize-lua-structure.ts   # Lua tables → JS arrays
```

## Usage

### Define a Page (JSON)
```json
{
  "path": "/dashboard",
  "title": "Dashboard",
  "level": 2,
  "requiresAuth": true,
  "layout": {
    "type": "Box",
    "children": [...]
  }
}
```

### Import to Database
```typescript
import { importUIPages } from '@/lib/seed/import-ui-pages'
await importUIPages(db)
```

### Access Page
```
Navigate to: /ui/dashboard
                │
                ├─→ app/ui/[[...slug]]/page.tsx
                ├─→ loadPageFromDB("/dashboard")
                ├─→ UIPageRenderer
                └─→ User sees rendered page
```

## Benefits

1. **No TSX Files Per Page** - Single generic renderer
2. **Database-Driven** - Pages stored in DB, modifiable at runtime
3. **Lua-Extensible** - Optional Lua transforms and actions
4. **Type-Safe** - Full TypeScript types throughout
5. **Hot-Reloadable** - Change JSON, refresh page (no rebuild)
6. **Version Controlled** - JSON seed data in git
7. **User-Editable** - Future: UI builder to modify pages

## Security

- **Lua Sandboxing** - Multi-layer security (scanner, environment replacement, runtime guards)
- **ACL** - Page-level access control (requiresAuth, requiredRole)
- **Type Safety** - TypeScript validation throughout pipeline
- **JSON Validation** - Schema validation on import

## Performance

- **Static Generation** - Can pre-render at build time via `generateStaticParams`
- **Database Caching** - Query optimization and caching
- **React Server Components** - Server-side rendering by default
- **Lazy Loading** - Components loaded on demand
