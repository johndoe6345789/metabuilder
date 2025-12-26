# MetaBuilder

A **data-driven, multi-tenant platform** where 95% of functionality lives in JSON/Lua, not TypeScript. Build enterprise applications declaratively with a 6-level permission system.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [6-Level Permission System](#6-level-permission-system)
4. [Package System](#package-system)
5. [Database](#database)
6. [Multi-Tenant System](#multi-tenant-system)
7. [Lua Scripting](#lua-scripting)
8. [API Reference](#api-reference)
9. [Testing](#testing)
10. [Development](#development)
11. [Security](#security)
12. [Deployment](#deployment)
13. [Contributing](#contributing)
14. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Clone and install
git clone <repo>
cd metabuilder/frontends/nextjs
npm install

# Set up database
npm run db:generate
npm run db:push

# Start development
npm run dev
```

Visit `http://localhost:3000`

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)

### 15-Minute Sanity Check

```bash
cd frontends/nextjs
npm ci
npm run typecheck
npm run lint
npm run test:unit -- --run
npm run build
```

---

## System Information

Captured from this machine to document the local development environment:

| Item | Detail |
| --- | --- |
| Repository path | `/Users/rmac/Documents/GitHub/metabuilder` |
| Operating system | `Darwin rmacs-MacBook-Pro.local 25.1.0` (arm64) |
| Default shell | `zsh` |
| Node.js | `v25.2.1` |
| npm | `11.6.2` |
| Commands used to collect data | `pwd`, `uname -a`, `node -v`, `npm -v` |

---

## Key Highlights

- **6-Level Permission System**: Each user level from Public to SuperGod maps to documented routes, policies, and role inheritance so you can reason about features before touching code ([`docs/architecture/security-docs/5-level-system.md`](./docs/architecture/security-docs/5-level-system.md)).
- **Multi-tenant data platform**: Prisma, tenant-aware storage, and quota management patterns keep all queries scoped by `tenantId` while keeping schema evolution safe ([`docs/architecture/database.md`](./docs/architecture/database.md)).
- **Declarative packages & Lua logic**: Modular `packages/*/seed` definitions let you ship UI/features via JSON/Lua, while the Lua sandbox protects the runtime ([`docs/architecture/packages.md`](./docs/architecture/packages.md), [`docs/lua/README.md`](./docs/lua/README.md)).
- **Type-safe + CI-ready workflow**: TypeScript tooling, Act local workflows, and targeted scripts keep linting, testing, and deploy checks consistent with the documentation hub ([`docs/README.md`](./docs/README.md)).

## Developer Persona

- **New contributors** follow the 2‑3 hour path in [`docs/getting-started/NEW_CONTRIBUTOR_PATH.md`](./docs/getting-started/NEW_CONTRIBUTOR_PATH.md), which guides them through overview → architecture → testing → practical tasks to build confidence quickly.
- **Core mindset**: favor declarative JSON/Lua configuration, filter every query by `tenantId`, keep components under 150 LOC, and rely on `RenderComponent` plus Prisma helpers instead of hardcoded UI/data layer logic.
- **Roles**: dashboards/authn (Level 2), admin control panels (Level 3), builder/IDE workflows (Level 4), and SuperGod tenant operations (Level 5) are the main focus areas when shaping experiences for developers, architects, and operators.

## TODO List

- The curated checklist at [`docs/todo/README.md`](./docs/todo/README.md) lists every area (architecture, frontend, DBAL, packages, security, deployment, docs, tooling, etc.) with numbered TODO files ordered by priority.
- Pick the list that matches your work, mark tasks with `[x]`, and consult the generated reports in `docs/todo/TODO_STATUS.md` and `docs/todo/22-TODO-SCAN.md` for repo-wide tracking.

## AI Prompts

- `.github/prompts/` stores curated prompts for planning, designing, implementing, testing, reviewing, deploying, and maintaining features; [`docs/todo/core/21-SDLC-TODO.md`](./docs/todo/core/21-SDLC-TODO.md) describes which prompts need review or updates.
- Keep `.github/copilot-instructions.md` aligned with architecture/docs changes so Copilot-based automation and review prompts stay accurate.

## Architecture

MetaBuilder combines:

- **Declarative Components**: Render UIs from JSON using `RenderComponent`
- **DBAL**: TypeScript SDK + C++ daemon, language-agnostic via YAML contracts
- **Package System**: Self-contained modules in `/packages/{name}/seed/`
- **Multi-Tenancy**: All queries filter by `tenantId`

### Project Structure

```
metabuilder/
├── frontends/nextjs/          # Next.js application
│   ├── src/
│   │   ├── app/               # App routes and pages
│   │   ├── components/        # React components (Atomic Design)
│   │   │   ├── atoms/         # Basic UI elements
│   │   │   ├── molecules/     # Simple composites (2-5 atoms)
│   │   │   ├── organisms/     # Complex features with business logic
│   │   │   └── Level1-5.tsx   # Page-level components
│   │   ├── lib/               # Core libraries
│   │   ├── hooks/             # Custom React hooks
│   │   └── seed-data/         # Database seeds
│   └── e2e/                   # Playwright E2E tests
├── packages/                  # Feature packages
├── dbal/                      # Database Abstraction Layer
│   ├── ts/                    # TypeScript implementation
│   ├── cpp/                   # C++ daemon (production)
│   └── api/schema/            # YAML contracts
├── prisma/                    # Database schema
├── config/                    # Shared config files
├── tools/                     # Repo utilities
└── deployment/                # Docker configs
```

### Component Architecture (Atomic Design)

| Layer | Examples | Rules |
|-------|----------|-------|
| **Atoms** | Button, Input, Badge | No custom dependencies |
| **Molecules** | AppHeader, ProfileCard | Can use Atoms only |
| **Organisms** | SchemaEditor, PackageManager | Can use Atoms, Molecules, other Organisms |
| **Pages** | Level1-5 | Can use all |

---

## 6-Level Permission System

Hierarchical access control where each level inherits all permissions from lower levels:

| Level | Role | Access | Route |
|-------|------|--------|-------|
| 1 | Public | Read-only, unauthenticated | `/` |
| 2 | User | Personal dashboard, content creation | `/dashboard` |
| 3 | Moderator | Moderation desk, flag review, report handling | `/moderator` |
| 4 | Admin | User management, system settings | `/admin` |
| 5 | God | Workflows, advanced scripting, packages | `/builder` |
| 6 | Supergod | Full system control, tenant management | `/supergod` |

### Permission Matrix

| Feature | L1 | L2 | L3 | L4 | L5 | L6 |
|---------|----|----|----|----|----|----|
| View Public Data | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Authenticate | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Content | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Moderate Content | | | ✓ | ✓ | ✓ | ✓ |
| Manage Users | | | | ✓ | ✓ | ✓ |
| Run Workflows | | | | | ✓ | ✓ |
| System Configuration | | | | | | ✓ |

### Usage

```typescript
import { canAccessLevel } from '@/lib/auth'
import { useAuth } from '@/hooks'

export const AdminPanel = () => {
  const { user } = useAuth()
  
  if (!canAccessLevel(user.level, 4)) {
    return <AccessDenied />
  }
  
  return <AdminContent />
}

// Multiple conditional features
const features = {
  basicDashboard: true,
  contentEditor: user.level >= 2,
  moderationDesk: user.level >= 3,
  userManagement: user.level >= 4,
  workflowEngine: user.level >= 5,
  systemConfig: user.level === 6,
}
```

### Backend Route Protection

```typescript
import { validateRequest } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await validateRequest(req)
  
  if (!canAccessLevel(user.level, 4)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return handleAdminOperation(req)
}
```

---

## Package System

Self-contained feature modules with seed data, components, and Lua scripts.

### Structure

```
packages/{name}/
├── seed/
│   ├── metadata.json      # Package info
│   ├── components.json    # Component definitions
│   ├── workflows.ts       # Workflow definitions
│   ├── schemas.ts         # Data schemas
│   └── scripts/           # Lua scripts
│       ├── initialize.lua
│       └── helpers.lua
├── src/                   # React components (optional)
│   ├── components/
│   ├── lib/
│   └── hooks/
├── styles/                # SCSS styles
└── static_content/        # Assets (images, templates)
```

### Package Metadata

```json
{
  "name": "@metabuilder/my-feature",
  "version": "1.0.0",
  "metabuilder": {
    "type": "feature",
    "minVersion": "1.0.0",
    "permissions": ["level3"],
    "components": [
      { "name": "MyComponent", "path": "src/components/MyComponent.tsx", "type": "widget" }
    ]
  }
}
```

### Available Packages

| Package | Description |
|---------|-------------|
| `admin_dialog` | Admin utilities |
| `arcade_lobby` | Games arcade |
| `codegen_studio` | Code generation tools |
| `dashboard` | Dashboard widgets |
| `data_table` | Data table component |
| `form_builder` | Form creation tools |
| `forum_forge` | Forum system |
| `nav_menu` | Navigation menus |
| `notification_center` | Notifications |
| `social_hub` | Social features |
| `spark-tools` | Development tools |
| `stream_cast` | Streaming features |

### Creating a Package

```bash
mkdir -p packages/my-feature/seed/scripts
mkdir -p packages/my-feature/src/{components,lib,hooks}
```

```typescript
// packages/my-feature/seed/index.ts
export const packageSeed = {
  name: '@metabuilder/my-feature',
  version: '1.0.0',
  components: [],
  workflows: [],
}
```

---

## Database

### Prisma ORM

Schema: `prisma/schema.prisma`

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Apply schema changes
npm run db:migrate    # Create migration
npm run db:studio     # Open database UI
npm run db:reset      # Reset database (destructive!)
```

### Schema Example

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  level     Int       // 1-5
  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  tenantId  String
  workflows Workflow[]
  
  @@unique([email, tenantId])
}

model Workflow {
  id        String   @id @default(cuid())
  name      String
  config    String   @db.Text
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  tenantId  String
}
```

### CRUD Operations

```typescript
// Create
const newUser = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashPassword('password'),
    level: 2,
    tenant: { connect: { id: tenantId } },
  },
})

// Read
const workflows = await prisma.workflow.findMany({
  where: { tenantId: user.tenantId, status: 'active' },
  orderBy: { createdAt: 'desc' },
  take: 10,
})

// Update
const updated = await prisma.user.update({
  where: { id: userId },
  data: { level: 3 },
})

// Delete
await prisma.user.delete({ where: { id: userId } })

// Transaction
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData })
  const workflow = await tx.workflow.create({
    data: { ...workflowData, userId: user.id }
  })
  return { user, workflow }
})
```

### DBAL (Database Abstraction Layer)

For complex operations:

- **TypeScript** (`dbal/ts/`): Fast iteration, development
- **C++ Daemon** (`dbal/cpp/`): Production security, credential protection

```typescript
import { dbalQuery } from '@/lib/database-dbal.server'

const result = await dbalQuery({
  operation: 'transfer_workflow',
  from: user1Id,
  to: user2Id,
})
```

---

## Multi-Tenant System

Complete isolation with access control, quotas, and namespace separation.

### Initialize Tenant

```typescript
import { InMemoryTenantManager, TenantAwareBlobStorage } from './dbal/ts/src'

const tenantManager = new InMemoryTenantManager()

await tenantManager.createTenant('tenant-123', {
  maxBlobStorageBytes: 1024 * 1024 * 1024, // 1GB
  maxBlobCount: 10000,
  maxRecords: 100000,
})
```

### Tenant-Aware Storage

```typescript
const tenantStorage = new TenantAwareBlobStorage(
  baseStorage,
  tenantManager,
  'tenant-123',
  'user-456'
)

// Automatically scoped to tenant namespace
await tenantStorage.upload('documents/report.pdf', pdfBuffer)
// Actual key: tenants/tenant-123/documents/report.pdf
```

### Key-Value Store

```typescript
const kvStore = new InMemoryKVStore()
const context = await tenantManager.getTenantContext('tenant-123', 'user-456')

await kvStore.set('config:theme', 'dark', context)
await kvStore.set('user:profile', { name: 'John' }, context)

// Lists
await kvStore.listAdd('tasks', ['Task 1', 'Task 2'], context)
const tasks = await kvStore.listGet('tasks', context)
```

### Access Control

```typescript
tenantManager.setUserRole('tenant-123', 'user-admin', 'admin')
tenantManager.setUserRole('tenant-123', 'user-viewer', 'viewer')

// Viewer can only read
const viewerContext = await tenantManager.getTenantContext('tenant-123', 'user-viewer')
await kvStore.get('data', viewerContext) // ✅ Success
await kvStore.set('data', 'new', viewerContext) // ❌ Permission denied
```

### Quota Management

```typescript
const usage = await tenantManager.getUsage('tenant-123')
console.log({
  blobStorage: `${usage.currentBlobStorageBytes} / ${usage.maxBlobStorageBytes}`,
  records: `${usage.currentRecords} / ${usage.maxRecords}`,
})
```

---

## Lua Scripting

Business logic without code redeployment. Scripts run in isolated sandbox.

### Sandbox Restrictions

- ❌ No `os`, `io`, `require`, `loadfile`, `dofile`
- ❌ No file system access
- ❌ 5-second execution timeout
- ✅ String manipulation, math, tables

### Example Scripts

```lua
-- Validation
function validateEmail(email)
  return string.match(email, "^[^@]+@[^@]+$") ~= nil
end

-- Data transformation
function formatCurrency(amount)
  return string.format("$%.2f", amount)
end

-- Business rules
function calculateDiscount(total, memberLevel)
  if memberLevel >= 3 then
    return total * 0.15
  elseif memberLevel >= 2 then
    return total * 0.10
  end
  return 0
end
```

### Executing Lua

```typescript
import { executeLua } from '@/lib/lua-sandbox'

const result = await executeLua(luaCode, {
  db: database,
  user: currentUser,
  config: packageConfig,
})
```

---

## API Reference

### Authentication

```typescript
// POST /api/auth/login
{ email: string, password: string }
// Returns: { user: User, token: string }

// POST /api/auth/register
{ email: string, username: string }
// Returns: { user: User } (password emailed)

// POST /api/auth/reset-password
{ email: string }
// Returns: { success: boolean }
```

### Users

```typescript
// GET /api/users
// Returns: User[]

// GET /api/users/:id
// Returns: User

// PATCH /api/users/:id (Level 3+)
{ level?: number, email?: string }
// Returns: User
```

### Packages

```typescript
// GET /api/packages
// Returns: Package[]

// POST /api/packages/install (Level 4+)
{ packageId: string }
// Returns: { success: boolean }

// DELETE /api/packages/:id (Level 4+)
// Returns: { success: boolean }
```

### Workflows

```typescript
// GET /api/workflows
// Returns: Workflow[]

// POST /api/workflows (Level 4+)
{ name: string, config: object }
// Returns: Workflow

// POST /api/workflows/:id/execute (Level 4+)
{ input?: object }
// Returns: { result: any }
```

---

## Testing

### Commands

```bash
# From frontends/nextjs/
npm run test:unit              # Vitest unit tests
npm run test:unit -- --run     # Run once (no watch)
npm run test:unit -- --coverage # With coverage
npm run test:e2e               # Playwright E2E tests
npm run lint                   # ESLint
npm run typecheck              # TypeScript validation
```

### Test File Structure

```
src/lib/utils.ts           → src/lib/utils.test.ts
src/hooks/useKV.ts         → src/hooks/useKV.test.ts
src/components/Button.tsx  → src/components/Button.test.tsx
```

### Parameterized Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('validateField', () => {
  it.each([
    { field: { type: 'email' }, value: 'test@example.com', shouldError: false },
    { field: { type: 'email' }, value: 'invalid', shouldError: true },
    { field: { type: 'number', min: 0 }, value: -1, shouldError: true },
  ])('validates $field.type with $value', ({ field, value, shouldError }) => {
    const result = validateField(field, value)
    expect(!!result).toBe(shouldError)
  })
})
```

### React Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react'

describe('useIsMobile', () => {
  it.each([
    { width: 400, expected: true },
    { width: 768, expected: false },
  ])('returns $expected for width $width', ({ width, expected }) => {
    window.innerWidth = width
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(expected)
  })
})
```

### Local CI Testing

```bash
npm run act           # Full CI pipeline locally
npm run act:lint      # Test linting only
npm run act:build     # Test build only
npm run act:diagnose  # Check setup (no Docker)
```

Refer to [`docs/guides/ACT_CHEAT_SHEET.md`](./docs/guides/ACT_CHEAT_SHEET.md) or the detailed [`docs/guides/ACT_TESTING.md`](./docs/guides/ACT_TESTING.md) guide to mirror GitHub Actions workflows locally and understand each Act mode.

---

## Development

### Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run preview       # Preview production build

# Quality
npm run lint          # Check code
npm run lint:fix      # Auto-fix issues
npm run typecheck     # TypeScript check
```

### Code Conventions

| Rule | Details |
|------|---------|
| **UI Library** | Material-UI (`@mui/material`) with `sx` prop |
| **No Tailwind** | Use MUI or `.module.scss` |
| **No Radix UI** | MUI equivalents only |
| **One lambda per file** | Classes only as containers |
| **Imports** | Absolute `@/` paths |
| **Components** | Functional with hooks |
| **Tests** | 1:1 source-to-test naming |

### Component Example

```tsx
import { Box, Button } from '@mui/material'

interface MyComponentProps {
  title: string
  onAction: () => void
}

export const MyComponent = ({ title, onAction }: MyComponentProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, p: 3 }}>
      <h1>{title}</h1>
      <Button variant="contained" onClick={onAction}>
        Action
      </Button>
    </Box>
  )
}
```

### Generic Component Rendering

```tsx
// ✅ Declarative
<RenderComponent component={{
  type: 'form',
  props: { schema: formSchema },
  children: [/* field components */]
}} />

// ❌ Hardcoded
<UserForm user={user} onSave={handleSave} />
```

---

## Security

### Password Hashing

SHA-512 for all credentials:

```typescript
import { hashPassword, verifyPassword } from '@/lib/password-utils'

const hash = hashPassword('mypassword')
const isValid = verifyPassword('mypassword', hash)
```

### Lua Sandbox

Scripts cannot access system resources:

```lua
-- ❌ These are blocked
os.execute('rm -rf /')
io.open('/etc/passwd')
require('socket')

-- ✅ These work
local result = string.match(input, pattern)
local sum = a + b
```

### Security Scanning

Code is automatically scanned for:

| Category | Patterns |
|----------|----------|
| JavaScript | `eval()`, `innerHTML`, XSS patterns, prototype pollution |
| Lua | `os`/`io` module usage, infinite loops, global manipulation |
| JSON | `__proto__` injection, script tags |

Critical severity blocks execution. High severity requires acknowledgment.

### Best Practices

- ✅ Always filter queries by `tenantId`
- ✅ Validate all user input
- ✅ Use transactions for related operations
- ✅ Hash passwords with SHA-512
- ❌ Never trust client-side permission checks
- ❌ Don't allow users to modify their own level
- ❌ Don't store secrets in database

---

## Deployment

### Docker

```bash
# Development
docker-compose -f deployment/docker-compose.development.yml up

# Production
docker-compose -f deployment/docker-compose.production.yml up
```

### Environment Variables

```env
# Development (SQLite)
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/metabuilder"

# Optional
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Production Build

```bash
npm run build
npm run start
```

---

## Contributing

### Workflow

1. Follow `.github/copilot-instructions.md`
2. Check `docs/todo/` before starting
3. Run `npm run lint:fix` before committing
4. Add parameterized tests for new functions
5. Commit with descriptive messages on `main`

### Before Committing

```bash
npm run lint
npm run typecheck
npm run test:unit -- --run
```

### Code Quality Targets

- 80%+ test coverage on critical paths
- All exported functions have tests
- JSDoc comments on public APIs

### Pull Request Process

PRs are optional (trunk-based on `main` is default). When required:

1. Run linter and tests
2. Update documentation
3. Add test cases
4. Use descriptive PR title

---

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Port in use | `npm run dev -- --port 5174` |
| Database connection failed | Check `DATABASE_URL`, run `npm run db:push` |
| TypeScript errors | Run `npm run db:generate` |
| Prisma client outdated | Run `npm run db:generate` |
| Build fails | Check `npm run typecheck` output |

### Debug Commands

```bash
# View database
npm run db:studio

# Check migrations
ls prisma/migrations/

# Verbose logging
DEBUG=metabuilder:* npm run dev
```

### If Something Fails

| Issue Type | Check |
|------------|-------|
| Build/config | Run sanity check above |
| Next.js app | Check terminal for errors |
| Prisma/DB | Run `npm run db:generate && npm run db:push` |
| Tests | Run `npm run test:unit -- --run` |

---

## Key Files Reference

| Purpose | Location |
|---------|----------|
| App source | `frontends/nextjs/src/` |
| Database schema | `prisma/schema.prisma` |
| Package seeds | `packages/*/seed/` |
| DBAL TypeScript | `dbal/ts/src/` |
| DBAL C++ | `dbal/cpp/src/` |
| E2E tests | `frontends/nextjs/e2e/` |
| Shared config | `config/` |
| Development prompts | `.github/prompts/` |

---

## Documentation Resources

- [`docs/README.md`](./docs/README.md) is the master index for architecture, deployment, testing, and contribution guidance.
- [`docs/guides/getting-started.md`](./docs/guides/getting-started.md) walks through initial setup, the sanity checklist, and environment tips.
- [`docs/architecture/packages.md`](./docs/architecture/packages.md) and [`docs/architecture/database.md`](./docs/architecture/database.md) cover package metadata, seed expectations, and tenant-safe Prisma patterns.
- [`docs/security/README.md`](./docs/security/README.md) plus [`docs/security/SECURITY.md`](./docs/security/SECURITY.md) summarize sandboxed Lua rules, credential handling, and scanning policies.
- [`docs/guides/ACT_CHEAT_SHEET.md`](./docs/guides/ACT_CHEAT_SHEET.md) with [`docs/guides/ACT_TESTING.md`](./docs/guides/ACT_TESTING.md) explain how to mirror GitHub Actions workflows locally via Act.

## Documentation Quality

- Run `./scripts/doc-quality-checker.sh` whenever you touch docs to keep coverage metrics in sync.
- The documentation hub cites 60%+ README coverage, 100% JSDoc coverage, 80%+ type annotations, and 100% security documentation targets.

## Quick Links

- Permission model: [`docs/architecture/5-level-system.md`](./docs/architecture/5-level-system.md)
- Database schema: [`prisma/schema.prisma`](./prisma/schema.prisma)
- API conventions: [`docs/guides/api-development.md`](./docs/guides/api-development.md)
- Security guidelines: [`docs/security/SECURITY.md`](./docs/security/SECURITY.md)
- Package system: [`docs/architecture/packages.md`](./docs/architecture/packages.md)

## License

MIT License - See LICENSE file
