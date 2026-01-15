# AI Agent Development Guide for MetaBuilder

**START HERE:** This document guides AI agents working on any part of MetaBuilder. Read the sections relevant to your task.

## Quick Navigation

- **Starting Development** → [Core Principles](#core-principles) + [Scoped Rules](#scoped-rules)
- **Working on DBAL** → [DBAL Development](#dbal-development-phase-2--phase-3)
- **Working on Frontend** → [Frontend Development](#frontend-development)
- **Working on Packages** → [Package Development](#package-development)
- **Running Tests** → [Testing Strategy](#testing-strategy)
- **Deploying Code** → [Deployment](#deployment-guidelines)
- **Troubleshooting** → [Troubleshooting](#troubleshooting)

---

## Core Principles

These principles apply to all development work on MetaBuilder:

### 1. Data-Driven Architecture (95% Rule)

MetaBuilder is **95% JSON/YAML configuration**, not code:

- **5% TypeScript** = Infrastructure, adapters, frameworks, bootstrapping
- **95% JSON/YAML** = UI definitions, business logic, configurations, database schemas

**When choosing between code and config: always prefer config.**

```typescript
// ❌ WRONG: Hardcoded UI
function HomePage() {
  return <div>Welcome to MetaBuilder</div>
}

// ✅ CORRECT: JSON definition
// File: packages/ui_home/seed/metadata.json
{
  "pages": [{
    "id": "home",
    "path": "/",
    "component": "DeclaredComponent",
    "config": { "title": "Welcome to MetaBuilder" }
  }]
}
```

### 2. One Lambda Per File

Every file should be **one focused unit**:

```typescript
// ✅ CORRECT
// File: src/lib/users/createUser.ts
export async function createUser(username: string): Promise<User> {
  // Single responsibility
}

// ✅ CORRECT (class as container)
// File: src/lib/users/UserManager.ts
export class UserManager {
  static async create = createUser
  static async list = listUsers
}

// ❌ WRONG: Multiple functions in one file
// File: src/lib/users.ts
export function createUser() { ... }
export function listUsers() { ... }
export function deleteUser() { ... }
```

See `.github/prompts/LAMBDA_PROMPT.md` for detailed guidance.

### 3. Schema-First Development

**Always define schema before implementation:**

```
1. Define in YAML/JSON schema (source of truth)
2. Generate types from schema
3. Implement code that conforms to types
4. Add tests
```

Never generate schema from code or hardcode types.

### 4. Multi-Tenant Safety

Every query must include tenant filtering:

```typescript
// ❌ WRONG: No tenant filter
const users = await db.users.list()

// ✅ CORRECT: Tenant filtered
const users = await db.users.list({
  filter: { tenantId: req.user.tenantId }
})
```

### 5. ACL (Access Control) First

Every database operation must check permissions:

```typescript
// Always use DBAL which includes ACL checks
const db = getDBALClient()
const users = await db.users.list() // ACL applied automatically
```

---

## Scoped Rules

**CRITICAL:** Before starting work, check for scoped `AGENTS.md` or similar files in your working directory:

| Location | Purpose |
|----------|---------|
| `AGENTS.md` (root) | **Start here** - General MetaBuilder guidance for AI agents |
| `CLAUDE.md` (root) | Overall project instructions (more detailed than AGENTS.md) |
| `ARCHITECTURE.md` | System architecture and data flow |
| `dbal/docs/` | DBAL-specific documentation and guides |
| `dbal/shared/docs/AGENTS.md` | YAML schema development rules (if exists) |
| `dbal/development/docs/AGENTS.md` | TypeScript DBAL rules (if exists) |
| `frontends/nextjs/AGENTS.md` | Next.js frontend rules (if exists) |
| `packages/[name]/AGENTS.md` | Package-specific rules (if exists) |

**Pattern:**
1. Find the directory/subsystem you're editing
2. Search for `AGENTS.md` or similar guidance files in that directory or parents
3. Scoped rules **override** general guidance
4. Read completely before starting work

---

## DBAL Development (Phase 2 & Phase 3)

The DBAL (Database Abstraction Layer) is a **language-agnostic contract system**:

- **Phase 2 (Current):** TypeScript in `/dbal/development/` with Prisma adapter
- **Phase 3 (Future):** C++ daemon in `/dbal/production/` with security isolation

### DBAL Architecture Philosophy

```
1. API Definition (YAML) ← Source of truth
       ↓
2. Development Implementation (TypeScript) ← Fast iteration
       ↓
3. Production Implementation (C++) ← Security & performance
       ↓
4. Conformance Tests ← Guarantee parity
```

### Key Rules for DBAL Work

#### 1. Schema First (API Contract is Source of Truth)

```bash
# CORRECT workflow:
1. Edit: /dbal/shared/api/schema/entities/user.yaml
2. Generate: npm --prefix dbal/development run codegen:prisma
3. Push: npm --prefix dbal/development run db:push
4. Implement TypeScript code
5. Add tests

# WRONG:
❌ Edit Prisma schema directly
❌ Hardcode fields in TypeScript
❌ Generate schema from code
```

#### 2. File Organization

**YAML Schemas (source of truth):**
```
/dbal/shared/api/schema/
├── entities/
│   ├── core/          (User, Session, Workflow, etc.)
│   ├── access/        (Credential, PageConfig, etc.)
│   └── packages/      (Package-specific entities)
├── operations/        (Operation definitions)
└── capabilities.yaml  (Adapter capabilities)
```

**TypeScript Implementation (Phase 2):**
```
/dbal/development/src/
├── core/              (Client, types, errors)
├── adapters/          (Database adapters: Prisma, SQLite, etc.)
├── runtime/           (Config, secrets, telemetry)
└── seeds/             (Seed orchestration)
```

**C++ Implementation (Phase 3):**
```
/dbal/production/
├── include/dbal/      (Public headers)
├── src/               (Implementation)
└── tests/             (Tests)
```

#### 3. Code Generation

**Phase 2 (TypeScript - Current):**
```bash
# Generate Prisma schema from YAML
npm --prefix dbal/development run codegen:prisma

# Push schema to database
npm --prefix dbal/development run db:push

# Rebuild types
npm --prefix dbal/development run build
```

**Never edit generated files manually:**
- `/prisma/schema.prisma` - Auto-generated
- `/dbal/development/src/core/types.ts` - Auto-generated

#### 4. Using DBAL Client

```typescript
// CORRECT: Use factory from DBAL
import { getDBALClient } from '@/dbal'

const db = getDBALClient()
const users = await db.users.list()

// WRONG:
❌ import { prisma } from '@/lib/prisma'  // Direct Prisma access
❌ import { getAdapter } from '@/lib/dbal-client/adapter'  // Old adapter
```

#### 5. Adding Entities/Fields

```bash
# 1. Update YAML schema
vim /dbal/shared/api/schema/entities/core/user.yaml
# Add: avatar_url: { type: string, optional: true }

# 2. Regenerate Prisma
npm --prefix dbal/development run codegen:prisma

# 3. Push to database
npm --prefix dbal/development run db:push

# 4. Update TypeScript code to use new field
# (Types auto-generated, so just use the field)

# 5. Add tests
# Update test files to cover new functionality
```

#### 6. Security Considerations

❌ **Never:**
- Expose database credentials to user code
- Allow raw SQL queries from user input
- Skip ACL checks
- Trust user input without validation
- Log sensitive data (passwords, tokens, PII)

✅ **Always:**
- Validate input against schema
- Enforce row-level security (multi-tenant)
- Use parameterized queries (Prisma handles this)
- Log security-relevant operations
- Test with malicious input

---

## Frontend Development

### Next.js Frontend (`/frontends/nextjs/`)

#### Key Rules

1. **Use DBAL for all database access:**
```typescript
// CORRECT
import { getDBALClient } from '@/dbal'
const db = getDBALClient()
const users = await db.users.list()

// WRONG
❌ Direct Prisma access
❌ SQL queries
❌ Old adapter patterns
```

2. **Follow one lambda per file:**
```
src/lib/users/createUser.ts    (single function)
src/lib/users/UserManager.ts   (class as container)
src/api/users/route.ts         (single handler)
```

3. **Keep API routes thin:**
```typescript
// ✅ CORRECT: API route delegates to DBAL
export async function GET(request: Request) {
  const db = getDBALClient()
  const users = await db.users.list()
  return Response.json(users)
}

// ❌ WRONG: Complex logic in route
export async function POST(request: Request) {
  const data = await request.json()
  // Complex validation, transformation, etc.
  // Should be in a separate function
}
```

4. **E2E Tests with Playwright:**
```bash
# Generate schema
npm --prefix dbal/development run codegen:prisma

# Push to database
npm --prefix dbal/development run db:push

# Run tests
npm run test:e2e
```

See `TESTING.md` for comprehensive E2E testing guide.

#### Project Structure

```
frontends/nextjs/src/
├── app/                    (Next.js App Router)
│   ├── api/               (API routes - keep thin)
│   ├── (pages)/           (Pages)
│   └── layout.tsx         (Root layout)
├── lib/
│   ├── db-client.ts       (DBAL integration)
│   └── [feature]/         (Feature-specific utilities)
├── components/            (React components)
└── styles/                (CSS/styling)
```

---

## Package Development

### Creating New Packages (`/packages/[name]/`)

A package is a self-contained feature with UI, configuration, and optional database entities.

#### Package Structure

```
packages/my_feature/
├── seed/
│   └── metadata.json      (Package definition & seed data)
├── components/            (Optional: package-specific components)
├── public/                (Static assets)
└── README.md              (Package documentation)
```

#### Package Metadata (`seed/metadata.json`)

```json
{
  "packageId": "my_feature",
  "name": "My Feature",
  "version": "1.0.0",
  "permissions": {
    "required": ["feature:read", "feature:write"]
  },
  "pages": [{
    "id": "main",
    "path": "/my-feature",
    "title": "My Feature",
    "component": "DeclaredComponent",
    "config": { }
  }],
  "entities": [],
  "scripts": [],
  "migrations": []
}
```

#### Development Workflow

1. **Create package structure:**
```bash
mkdir -p packages/my_feature/seed
```

2. **Define metadata (seed/metadata.json):**
```json
{
  "packageId": "my_feature",
  "name": "My Feature",
  "version": "1.0.0"
}
```

3. **Add to installed packages:**
```bash
# Edit: seed/database/installed_packages.yaml
- packageId: my_feature
  source: packages/my_feature
```

4. **Run bootstrap:**
```bash
./deployment/scripts/bootstrap-system.sh
```

5. **Test:**
```bash
npm run test:e2e
```

#### Key Rules

- 95% of package definition is JSON, not code
- Use `DeclaredComponent` for all UI
- Define configuration in JSON, not hardcoded
- One responsibility per component
- Test packages with E2E tests

---

## Testing Strategy

### Test Pyramid

```
           ↑
           │  E2E Tests (Playwright)
           │  - Full app flow
           │  - Real database
           │  - Real users
           │
           │  Integration Tests
           │  - Component + DBAL
           │  - SQLite/test DB
           │
           │  Unit Tests
           │  - Individual functions
           │  - Mocked dependencies
           │
           └─────────────────────
```

### Running Tests

**Unit tests (DBAL):**
```bash
npm --prefix dbal/development run test:unit
```

**Integration tests (DBAL):**
```bash
npm --prefix dbal/development run test:integration
```

**E2E tests (Full app):**
```bash
# 1. Generate schema
npm --prefix dbal/development run codegen:prisma

# 2. Push to database
npm --prefix dbal/development run db:push

# 3. Run E2E tests
npm run test:e2e
```

### Writing Tests

**Unit test example:**
```typescript
// tests/lib/users/createUser.test.ts
import { createUser } from '@/lib/users/createUser'

describe('createUser', () => {
  it('should create a user', async () => {
    const user = await createUser('john', 'john@example.com')
    expect(user.username).toBe('john')
  })
})
```

**E2E test example:**
```typescript
// e2e/users.spec.ts
import { test, expect } from '@playwright/test'

test('create user flow', async ({ page }) => {
  await page.goto('http://localhost:3000/users')
  await page.fill('input[name="username"]', 'john')
  await page.click('button:has-text("Create")')
  await expect(page).toHaveURL(/.*\/users\/.*/)
})
```

See `TESTING.md` for comprehensive testing guide.

---

## Deployment Guidelines

### Development Deployment

```bash
# Terminal 1: Frontend
cd frontends/nextjs
npm run dev  # http://localhost:3000

# Terminal 2: Generate and push schema (once)
npm --prefix dbal/development run codegen:prisma
npm --prefix dbal/development run db:push

# Terminal 3: Run tests
npm run test:e2e
```

### Production Deployment

```bash
# Using deployment script
./deployment/deploy.sh all --bootstrap

# Or docker-compose with GHCR images
docker compose -f docker-compose.ghcr.yml up -d
```

**What gets deployed:**
- PostgreSQL 16 (database)
- C++ DBAL daemon (Phase 3 when ready)
- Next.js frontend
- C++ Media daemon (FFmpeg, ImageMagick)
- Redis 7 (caching)
- Nginx (reverse proxy, SSL/TLS)
- Optional: Prometheus, Grafana, Loki (monitoring)

### Schema Management

**Local development:**
```bash
# Edit YAML schema
vim /dbal/shared/api/schema/entities/core/user.yaml

# Regenerate Prisma
npm --prefix dbal/development run codegen:prisma

# Push to local database
npm --prefix dbal/development run db:push
```

**Before committing:**
- Always regenerate schema from YAML
- Push to ensure tables exist
- Run E2E tests
- Commit generated schema changes

---

## Troubleshooting

### "The table X does not exist"

```bash
# Solution: Generate and push schema
npm --prefix dbal/development run codegen:prisma
npm --prefix dbal/development run db:push
```

### "Cannot find module '@/dbal'"

```bash
# Solution: Verify DBAL exports
cat dbal/development/src/index.ts | grep getDBALClient
```

### E2E tests fail with database errors

```bash
# Solution: Regenerate schema, push, then test
npm --prefix dbal/development run codegen:prisma
npm --prefix dbal/development run db:push
npm run test:e2e
```

### TypeScript type errors in DBAL

```bash
# Solution: Rebuild DBAL
npm --prefix dbal/development run build
npm --prefix dbal/development run codegen:prisma
```

### Package not loading

```bash
# Check: Is package in installed_packages.yaml?
cat seed/database/installed_packages.yaml | grep packageId

# Check: Is metadata.json valid JSON?
cat packages/[name]/seed/metadata.json | jq .

# Solution: Run bootstrap
./deployment/scripts/bootstrap-system.sh
```

### Tests fail with "seed not loaded"

```bash
# Solution: Ensure global.setup.ts runs
# Check playwright.config.ts has: globalSetup: './e2e/global.setup.ts'

# Manual fix: Call seed endpoint
curl http://localhost:3000/api/setup
```

---

## Best Practices Summary

1. ✅ **Schema-first** - Define in YAML, generate code
2. ✅ **95% config, 5% code** - Prefer JSON/YAML over TypeScript
3. ✅ **One lambda per file** - Small, focused units
4. ✅ **Multi-tenant safe** - Always filter by tenantId
5. ✅ **ACL-first** - Every operation checks permissions
6. ✅ **Use DBAL** - Never bypass database abstraction
7. ✅ **Test thoroughly** - Unit → Integration → E2E
8. ✅ **Document scoped rules** - Create AGENTS.md for subsystems
9. ✅ **Principle of least privilege** - Minimal permissions
10. ✅ **Security by default** - Validate early, fail fast

---

## Key Documents

**Read These First:**
- **CLAUDE.md** - Comprehensive project instructions
- **ARCHITECTURE.md** - System architecture and data flow
- **.github/copilot-instructions.md** - AI-specific development patterns

**Subsystem Guides:**
- **dbal/shared/docs/** - DBAL implementation guides
- **dbal/docs/** - DBAL-specific rules
- **TESTING.md** - E2E testing guide
- **DBAL_REFACTOR_PLAN.md** - Phase 2 cleanup roadmap

**Schemas:**
- **/dbal/shared/api/schema/** - DBAL entity definitions (YAML)
- **/schemas/package-schemas/** - Package system definitions (JSON)
- **/.github/prompts/LAMBDA_PROMPT.md** - Code organization pattern
- **/.github/prompts/WORKFLOW_PROMPTS/** - Development workflow guides

**Quick Reference:**
- **README.md** - System overview
- **ROADMAP.md** - Project vision and evolution

---

## Project Structure

```
metabuilder/
├── 📋 Core Documentation
│   ├── AGENTS.md                   ⭐ START HERE - AI agent guide for all subsystems
│   ├── CLAUDE.md                   Comprehensive project instructions for AI assistants
│   ├── ARCHITECTURE.md             System architecture, data flow, deployment stack
│   ├── ROADMAP.md                  Project vision, evolution (Spark → Next.js)
│   ├── README.md                   System overview, quick start
│   └── TESTING.md                  E2E testing guide with Playwright
│
├── 🗄️ Database (DBAL)
│   ├── dbal/
│   │   ├── development/            ⭐ Phase 2: TypeScript DBAL implementation
│   │   │   ├── src/                Core client, adapters, seeds
│   │   │   ├── tests/              Unit & integration tests
│   │   │   └── prisma/             Prisma schema (auto-generated)
│   │   ├── production/             Phase 3: C++ DBAL daemon (future)
│   │   │   ├── include/dbal/       C++ public headers
│   │   │   ├── src/                C++ implementation
│   │   │   └── tests/              C++ tests
│   │   ├── shared/                 ⭐ Shared between Phase 2 & 3
│   │   │   ├── api/schema/         YAML entity & operation definitions (source of truth)
│   │   │   ├── backends/           Database connection utilities
│   │   │   ├── docs/               DBAL implementation guides
│   │   │   └── tools/              Code generation scripts
│   │   └── docs/                   DBAL-specific documentation
│
├── 🎨 Frontend
│   ├── frontends/
│   │   ├── nextjs/                 ⭐ Main Next.js application (Phase 2)
│   │   │   ├── src/app/            Next.js App Router (pages, API routes)
│   │   │   ├── src/lib/            Utilities (DBAL client integration, etc.)
│   │   │   ├── src/components/     React components
│   │   │   └── e2e/                Playwright E2E tests
│   │   ├── cli/                    CLI frontend (optional)
│   │   ├── qt6/                    Qt6 frontend (optional)
│   │   └── dbal/                   DBAL exports for frontend use
│
├── 📦 Packages
│   ├── packages/                   ⭐ Modular feature packages
│   │   ├── ui_home/                Landing page
│   │   ├── ui_header/              App header/navbar
│   │   ├── ui_footer/              App footer
│   │   ├── ui_login/               Login UI
│   │   ├── dashboard/              User dashboard
│   │   ├── user_manager/           User management (Admin)
│   │   ├── package_manager/        Package installation (God level)
│   │   ├── database_manager/       Database admin (Supergod level)
│   │   ├── schema_editor/          Schema editor (Supergod level)
│   │   └── [40+ other packages]/   Feature-specific packages with JSON metadata
│
├── 🌱 Seed Data
│   ├── seed/
│   │   ├── database/               Base bootstrap YAML data
│   │   │   ├── installed_packages.yaml  Package installation records
│   │   │   └── package_permissions.yaml Permission seed data
│   │   ├── packages/               Package-specific seed order
│   │   └── config/                 Configuration files
│
├── 📋 Schemas
│   ├── schemas/
│   │   ├── package-schemas/        ⭐ Package system JSON schemas (18+ files)
│   │   │   ├── metadata_schema.json    Package structure
│   │   │   ├── entities_schema.json    Database models from packages
│   │   │   ├── components_schema.json  UI component definitions
│   │   │   ├── script_schema.json      JSON Script language spec (v2.2.0)
│   │   │   └── [13+ more schemas]     API, validation, permissions, jobs, etc.
│   │   └── yaml-schema.yaml        DBAL YAML schema validator
│
├── 🚀 Deployment
│   ├── deployment/
│   │   ├── deploy.sh               ⭐ Main deployment orchestration script
│   │   ├── docker/                 Docker images & compose files
│   │   │   ├── Dockerfile.app      Next.js production image
│   │   │   ├── Dockerfile.app.dev  Dev environment image
│   │   │   └── docker-compose.*.yml Development, production, monitoring
│   │   ├── scripts/                Bootstrap, schema, backup scripts
│   │   │   ├── bootstrap-system.sh Core package installation
│   │   │   ├── init-db.sh          Database initialization
│   │   │   └── backup-database.sh  Backup utilities
│   │   └── config/                 Configuration templates
│   │       ├── dbal/               DBAL daemon config
│   │       ├── nginx/              Reverse proxy config
│   │       ├── prometheus/         Monitoring config
│   │       └── grafana/            Dashboards config
│
├── 🧪 Testing
│   ├── e2e/                        ⭐ End-to-end tests (Playwright)
│   │   ├── global.setup.ts         Database initialization
│   │   ├── auth/                   Authentication flows
│   │   ├── crud/                   CRUD operations
│   │   ├── api/                    API endpoint tests
│   │   ├── dbal-daemon/            DBAL daemon tests
│   │   └── *.spec.ts               Individual test suites
│   ├── playwright.config.ts        E2E test configuration
│   ├── config/test/                Test configuration directory
│   └── spec/                       TLA+ formal specifications
│
├── 🔧 Configuration
│   ├── config/
│   │   ├── package.json            ⭐ Root package definitions
│   │   ├── lint/                   ESLint configuration
│   │   └── test/                   Test tool configurations
│   ├── .github/
│   │   ├── prompts/                AI agent development workflows
│   │   │   ├── workflow/           Feature planning, review, docs
│   │   │   ├── implement/          Implementation guides (DBAL, components, etc.)
│   │   │   ├── test/               Testing guides
│   │   │   ├── deploy/             Deployment procedures
│   │   │   └── maintain/           Maintenance & debugging guides
│   │   ├── copilot-instructions.md AI development patterns
│   │   └── TEMPLATES.md            PR/issue templates
│
├── 📚 Documentation
│   ├── docs/                       Additional documentation
│   │   ├── TESTING_GUIDE.md        TDD methodology, test pyramid
│   │   ├── CONTAINER_IMAGES.md     Docker image registry
│   │   ├── PIPELINE_CONSOLIDATION.md CI/CD pipeline
│   │   └── archive/                Historical documentation
│   ├── DBAL_REFACTOR_PLAN.md       Phase 2 cleanup roadmap
│   ├── SEED_SYSTEM_OVERHAUL.md     Seed system improvements
│   └── README files in each subsystem
│
├── 🎭 Other Frontends (Reference)
│   ├── fakemui/                    QML/UI component library (reference)
│   ├── storybook/                  Component documentation (archived)
│   └── old/                        Legacy Spark implementation (archived)
│
├── 📡 Services
│   ├── services/
│   │   └── media_daemon/           C++ FFmpeg/ImageMagick daemon (future)
│
├── 🔬 Specifications
│   ├── spec/                       TLA+ formal specifications
│   │   ├── metabuilder.tla         Core system behavior
│   │   ├── package_system.tla      Package loading & management
│   │   ├── workflow_system.tla     Workflow execution
│   │   └── integrations.tla        Integration patterns
│
├── 🛠️ Scripts & Tools
│   ├── scripts/                    Utility scripts
│   │   ├── generate-package.ts     Package scaffolding
│   │   └── check-dbal-prisma-sync.py Schema validation
│
├── 💾 Database Files
│   ├── prisma/
│   │   ├── schema.prisma           ⭐ AUTO-GENERATED from YAML schemas
│   │   └── schema-registry.json    Schema version tracking
│   ├── test-prisma-adapter.js      Adapter tests
│
└── 📦 Root Configuration
    ├── package.json                ⭐ Root dependencies
    ├── package-lock.json           Dependency lock file
    ├── playwright.config.ts        E2E test configuration
    ├── docker-compose.ghcr.yml     GHCR image deployment
    └── Jenkinsfile                 CI/CD pipeline definition
```

### Key Directory Roles

**Core Development (Always Active):**
- `dbal/development/` - TypeScript DBAL implementation
- `frontends/nextjs/` - Next.js frontend application
- `packages/` - Feature packages
- `dbal/shared/api/schema/` - Entity & operation definitions (YAML)

**Supporting Systems:**
- `deployment/` - Deployment automation and Docker
- `e2e/` - Playwright E2E tests
- `seed/` - Bootstrap data and seeding
- `.github/prompts/` - AI agent workflow guidance

**Configuration (Do Not Edit):**
- `prisma/schema.prisma` - AUTO-GENERATED from YAML
- `dbal/development/src/core/types.ts` - AUTO-GENERATED types

**Reference/Archive:**
- `old/` - Legacy Spark implementation
- `fakemui/` - Legacy QML components
- `storybook/` - Archived component documentation
- `spec/` - TLA+ formal specifications

---

## Questions?

- Stuck? See `.github/prompts/misc/EEK-STUCK.md` recovery guide
- Need help? Use `/help` command in Claude Code
- Report issues: https://github.com/anthropics/claude-code/issues
