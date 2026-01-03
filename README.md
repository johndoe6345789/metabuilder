# MetaBuilder

**An ultra-generic, data-driven platform where everything flows through the database.**

No hardcoded routes, no component imports, no assumptions. The entire application structure lives in the database, rendered by a generic JSON-to-React engine.

---

## Table of Contents

1. [Core Concept](#core-concept)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Routing System](#routing-system)
5. [Package System](#package-system)
6. [Permission System](#permission-system)
7. [Deployment](#deployment)
8. [Database](#database)
9. [Development](#development)
10. [Project Structure](#project-structure)

---

## Core Concept

### The Mental Model

```
Browser URL → Database Query → JSON Component → Generic Renderer → React → User
```

**Zero hardcoded connections.** Everything is a database lookup:

```typescript
// ❌ Traditional way (hardcoded)
import HomePage from './HomePage'
<Route path="/" component={HomePage} />

// ✅ MetaBuilder way (data-driven)
const route = await db.query('PageConfig', { path: '/' })
const component = await loadPackage(route.packageId)
return renderJSONComponent(component)
```

### Key Principles

1. **No Hardcoded Routes**: Routes live in `PageConfig` table
2. **No Component Imports**: Components are JSON definitions in package files
3. **No Direct Database Access**: Everything goes through DBAL (Database Abstraction Layer)
4. **Complete Loose Coupling**: Frontend knows nothing about packages

---

## Quick Start

### One-Command Deployment

```bash
# Deploy everything (PostgreSQL, DBAL, Next.js, Media daemon, Redis, Nginx)
./deployment/deploy.sh all --bootstrap
```

This spins up:
- PostgreSQL database
- C++ DBAL daemon (database abstraction)
- Next.js frontend
- C++ media processing daemon
- Redis cache
- Nginx reverse proxy
- Monitoring stack (optional)

**Then visit**: `http://localhost:3000`

### Development Setup

```bash
# Clone and install
git clone <repo>
cd metabuilder

# Option 1: Run from root (recommended for quick setup)
npm install
npm run db:generate
npm run db:push

# Option 2: Run from frontends/nextjs
cd frontends/nextjs
npm install
npm run db:generate
npm run db:push

# Bootstrap seed data
cd ../../deployment
./scripts/bootstrap-system.sh

# Start development (from root)
cd ..
npm run dev

# Or from frontends/nextjs
cd frontends/nextjs
npm run dev
```

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Build tools: cmake, ninja, g++/clang (for C++ daemons)

---

## Architecture

### System Components

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP
┌──────▼──────┐     ┌───────────┐
│   Nginx     │────▶│   Redis   │
└──────┬──────┘     └───────────┘
       │
┌──────▼──────┐     ┌───────────┐
│  Next.js    │────▶│   DBAL    │
│  Frontend   │     │  Daemon   │
└──────┬──────┘     │  (C++)    │
       │            └─────┬─────┘
       │                  │
       │            ┌─────▼─────┐
       │            │ PostgreSQL│
       │            └───────────┘
       │
┌──────▼──────┐     ┌───────────┐
│   Media     │────▶│    HLS    │
│  Daemon     │     │  Streams  │
│  (C++)      │     └───────────┘
└─────────────┘
```

### Data Flow

1. **User visits URL** (`/`, `/dashboard`, `/about`)
2. **Next.js queries PageConfig** table for that path
3. **Database returns** packageId + component reference
4. **Frontend loads** JSON package from `/packages/{packageId}/`
5. **Generic renderer** converts JSON → React elements
6. **User sees** the rendered page

**Zero hardcoded assumptions!**

---

## Routing System

### Priority-Based Routing

Routes have two priority levels:

**Priority 1: God Panel Routes** (PageConfig table)
- User-configurable through admin UI
- God/supergod users can add/remove/modify routes
- Highest priority, overrides everything

**Priority 2: Package Routes** (InstalledPackage.config)
- Package-defined defaults
- Set during package installation
- Fallback when god panel has no override

### Example: Root Route

**Database seed** ([seed/database/installed_packages.yaml:44-54](seed/database/installed_packages.yaml#L44-L54)):
```yaml
- packageId: ui_home
  config: |
    {
      "defaultRoute": "/",
      "publicAccess": true
    }
```

**Frontend code** ([frontends/nextjs/src/app/page.tsx](frontends/nextjs/src/app/page.tsx)):
```typescript
// Check god panel routes first
const godRoute = await db.query('PageConfig', { path: '/', isPublished: true })
if (godRoute) {
  return renderComponent(godRoute.packageId, godRoute.component)
}

// Fall back to package default routes
const pkg = await db.query('InstalledPackage', { 'config.defaultRoute': '/' })
return renderComponent(pkg.packageId, 'HomePage')
```

### God Panel Override

Supergod users can remap any route:

```sql
-- Remap "/" to dashboard instead of ui_home
INSERT INTO "PageConfig" (
  id, path, packageId, component, level, requiresAuth, isPublished
) VALUES (
  'root_route', '/', 'dashboard', 'DashboardPage', 1, true, true
);
```

**No code changes required!**

### Route Schema

```prisma
model PageConfig {
  path          String   // URL: "/", "/dashboard", "/about"
  packageId     String?  // Which package: "ui_home", "dashboard"
  component     String?  // Which component: "HomePage", "DashboardPage"
  componentTree String   // Or full JSON component tree
  level         Int      // Permission level (0-5)
  requiresAuth  Boolean
  isPublished   Boolean
}
```

---

## Package System

### Package Structure

Packages are **completely self-contained** JSON + optional static files:

```
packages/{packageId}/
├── package.json           # Metadata
├── components/
│   └── ui.json           # Declarative JSON components
├── styles/
│   └── styles.scss       # Optional styles
└── static/
    └── assets/           # Images, fonts, etc.
```

### JSON Component Example

From [packages/ui_home/components/ui.json](packages/ui_home/components/ui.json):

```json
{
  "components": [
    {
      "id": "home_page",
      "name": "HomePage",
      "description": "Main home page layout",
      "render": {
        "template": {
          "type": "Box",
          "component": "main",
          "className": "home-page",
          "children": [
            { "$ref": "hero_section" },
            { "$ref": "features_section" }
          ]
        }
      }
    },
    {
      "id": "hero_section",
      "name": "HeroSection",
      "props": [
        { "name": "title", "type": "string", "default": "Build Anything, Visually" }
      ],
      "render": {
        "template": {
          "type": "Box",
          "component": "section",
          "className": "hero-section",
          "children": [
            {
              "type": "Text",
              "variant": "h1",
              "children": "{{title}}"
            }
          ]
        }
      }
    }
  ]
}
```

### Generic Renderer

The frontend **never imports package components**. It uses a generic renderer:

```typescript
import { renderJSONComponent } from '@/lib/packages/json/render-json-component'

// Load component from JSON
const pkg = await loadJSONPackage('/packages/ui_home')
const component = pkg.components.find(c => c.id === 'home_page')

// Render using generic renderer (no hardcoded React components!)
return renderJSONComponent(component, {}, {})
```

### Available Packages

| Package ID | Description |
|------------|-------------|
| `ui_home` | Landing page with hero, features, about sections |
| `ui_header` | Application header/navbar |
| `ui_footer` | Application footer |
| `ui_auth` | Authentication UI components |
| `ui_login` | Login page |
| `dashboard` | User dashboard |
| `user_manager` | User management (admin) |
| `package_manager` | Package installation UI (god) |
| `database_manager` | Database management (supergod) |
| `schema_editor` | Schema editor (supergod) |

---

## Permission System

### 6-Level Hierarchy

| Level | Role | Access | Example Route |
|-------|------|--------|---------------|
| 0 | Public | Unauthenticated | `/` (landing page) |
| 1 | User | Personal dashboard | `/dashboard` |
| 2 | Moderator | Content moderation | `/moderator` |
| 3 | Admin | User management | `/admin` |
| 4 | God | Package installation, workflows | `/builder` |
| 5 | Supergod | Full system control | `/supergod` |

**Each level inherits all permissions from levels below.**

### Permission Checks

Database records control access:

```yaml
# seed/database/package_permissions.yaml
- packageId: ui_home
  role: public        # Level 0 - anyone
  permission: read
  granted: true

- packageId: dashboard
  role: user          # Level 1 - authenticated
  permission: read
  granted: true

- packageId: database_manager
  role: supergod      # Level 5 - full control
  permission: admin
  granted: true
```

---

## Deployment

### One-Command Deploy

```bash
# Full stack with bootstrap
./deployment/deploy.sh all --bootstrap

# Individual stacks
./deployment/deploy.sh production    # Main services only
./deployment/deploy.sh development   # Dev environment
./deployment/deploy.sh monitoring    # Monitoring stack
```

### What Gets Deployed

**Production Stack** (`docker-compose.production.yml`):
- PostgreSQL 16
- C++ DBAL daemon (Conan + CMake)
- Next.js app (Node 18)
- C++ Media daemon (FFmpeg, ImageMagick)
- Redis 7
- Nginx (SSL, caching)

**Monitoring Stack** (`docker-compose.monitoring.yml`):
- Prometheus (metrics)
- Grafana (dashboards)
- Loki (logs)
- Promtail (log collector)
- Exporters (PostgreSQL, Redis, Node, Nginx)

### Bootstrap Process

The `bootstrap-system.sh` script runs in 7 phases:

1. **Wait for database** to be ready
2. **Run Prisma migrations** (schema setup)
3. **Check bootstrap status** (idempotent)
4. **Seed database** from `/seed/database/*.yaml`
5. **Install core packages** (12 packages in priority order)
6. **Verify installation** (health checks)
7. **Run post-hooks** (custom initialization)

### Core Packages Bootstrap Order

**Phase 1**: `package_manager` (required first)
**Phase 2**: `ui_header`, `ui_footer`, `ui_home`, `ui_auth`, `ui_login`
**Phase 3**: `dashboard`
**Phase 4**: `user_manager`, `role_editor`
**Phase 5**: `admin_dialog`, `database_manager`, `schema_editor`

See [seed/packages/core-packages.yaml](seed/packages/core-packages.yaml) for full configuration.

### Environment Variables

```env
# Database
POSTGRES_PASSWORD=changeme_prod_password
DATABASE_URL=postgresql://metabuilder:password@postgres:5432/metabuilder

# DBAL
DBAL_API_KEY=your_api_key_here

# Media Daemon
ICECAST_PASSWORD=hackme
REDIS_PASSWORD=changeme_redis_password
```

### Docker Build Process

**C++ Components** (DBAL, Media daemon):
- Multi-stage builds (builder + runtime)
- Conan for dependency management
- CMake + Ninja build system
- Optimized production images (~200MB final)

**Next.js**:
- Node 18 Alpine base
- Production build with output standalone
- Minimal runtime dependencies

---

## Database

### Schema Overview

**Core Tables**:
- `User` - User accounts, permission levels
- `Tenant` - Multi-tenant isolation
- `InstalledPackage` - Installed packages, config
- `PackagePermission` - Package access control
- `PageConfig` - God panel route definitions
- `Workflow` - Workflow definitions
- `LuaScript` - Stored Lua scripts

### Example: Installed Package

```prisma
model InstalledPackage {
  packageId    String   @id
  tenantId     String?
  version      String
  enabled      Boolean
  config       String   @db.Text  // JSON config
  installedAt  BigInt?
}
```

**Seed data** ([seed/database/installed_packages.yaml:44-54](seed/database/installed_packages.yaml#L44-L54)):
```yaml
- packageId: ui_home
  config: |
    {
      "systemPackage": true,
      "defaultRoute": "/",       # Maps root URL to this package
      "publicAccess": true        # Level 0 permission
    }
```

### DBAL (Database Abstraction Layer)

**Why?** Credentials never touch the frontend. All database operations go through the DBAL daemon.

**Architecture**:
- **TypeScript SDK** (`dbal/development/`) - Development, fast iteration
- **C++ Daemon** (`dbal/production/`) - Production, credential protection

**Usage**:
```typescript
import { getAdapter } from '@/lib/db/core/dbal-client'

const adapter = getAdapter()
const result = await adapter.list('InstalledPackage', {
  filters: { enabled: true }
})
```

### Database Commands

```bash
# Development (can be run from root or frontends/nextjs)
npm run db:generate   # Generate Prisma client
npm run db:push       # Apply schema changes
npm run db:migrate    # Create migration

# From root directory
npm run db:generate   # Delegates to frontends/nextjs

# From frontends/nextjs directory
npm run db:generate   # Uses --schema=../../prisma/schema.prisma

# Production (via Docker)
docker exec -it metabuilder-postgres-prod psql -U metabuilder
```

---

## Development

### Prerequisites

```bash
# Install Node.js dependencies
cd frontends/nextjs
npm install

# Install C++ build tools (for DBAL/Media daemons)
# Ubuntu/Debian:
sudo apt install cmake ninja-build g++ libssl-dev libpq-dev

# macOS:
brew install cmake ninja conan
```

### Development Workflow

```bash
# Terminal 1: Frontend
cd frontends/nextjs
npm run dev

# Terminal 2: DBAL daemon (optional, TypeScript version)
cd dbal/development
npm install
npm run dev

# Terminal 3: PostgreSQL (via Docker)
docker run -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16
```

### Code Conventions

**CRITICAL RULES**:
- ❌ **NO hardcoded routes** - use PageConfig
- ❌ **NO component imports from packages** - use generic renderer
- ❌ **NO direct database access** - use DBAL adapter
- ✅ **Material-UI only** for UI components
- ✅ **Absolute imports** with `@/` path
- ✅ **One lambda per file** pattern

### Testing

```bash
# From frontends/nextjs/
npm run test:unit              # Vitest unit tests
npm run test:unit -- --run     # Run once (no watch)
npm run test:e2e               # Playwright E2E tests
npm run lint                   # ESLint
npm run typecheck              # TypeScript validation
npm run build                  # Production build
```

---

## Project Structure

```
metabuilder/
├── frontends/nextjs/          # Next.js 14 App Router frontend
│   ├── src/
│   │   ├── app/               # App routes (minimal, generic)
│   │   │   └── page.tsx      # Root route (database-driven)
│   │   ├── components/        # Generic renderers only
│   │   ├── lib/
│   │   │   ├── db/           # DBAL client
│   │   │   ├── packages/     # Package loaders
│   │   │   └── rendering/    # JSON→React renderer
│   │   └── hooks/
│   └── package.json
│
├── packages/                  # Self-contained packages (JSON)
│   ├── ui_home/
│   │   ├── package.json
│   │   ├── components/ui.json
│   │   └── styles/
│   ├── ui_header/
│   ├── dashboard/
│   └── ... (12+ packages)
│
├── seed/                      # Bootstrap data
│   ├── packages/
│   │   └── core-packages.yaml
│   └── database/
│       ├── installed_packages.yaml
│       └── package_permissions.yaml
│
├── dbal/                      # Database Abstraction Layer
│   ├── development/           # TypeScript (dev)
│   └── production/            # C++ daemon (prod)
│       ├── src/
│       ├── include/
│       └── build-config/
│
├── services/
│   └── media_daemon/          # C++ media processing (FFmpeg, HLS)
│       ├── src/
│       ├── include/
│       └── Dockerfile
│
├── deployment/                # Docker deployment
│   ├── docker/
│   │   ├── docker-compose.production.yml
│   │   ├── docker-compose.development.yml
│   │   └── docker-compose.monitoring.yml
│   ├── scripts/
│   │   ├── deploy.sh
│   │   ├── bootstrap-system.sh
│   │   └── backup-database.sh
│   └── config/                # Service configs (Nginx, Prometheus, etc.)
│
├── prisma/
│   └── schema.prisma          # Database schema
│
└── docs/                      # Documentation
```

---

## Key Concepts Recap

### 1. Ultra-Generic Routing

**Traditional**:
```typescript
// Hardcoded route mapping
<Route path="/" component={HomePage} />
<Route path="/dashboard" component={Dashboard} />
```

**MetaBuilder**:
```typescript
// Database-driven routing
const route = await db.query('PageConfig', { path: req.url })
const pkg = await loadPackage(route.packageId)
const component = pkg.components.find(c => c.id === route.component)
return renderJSONComponent(component)
```

### 2. Zero Hardcoded Imports

**Traditional**:
```typescript
import HomePage from '@/components/HomePage'
import Dashboard from '@/components/Dashboard'
```

**MetaBuilder**:
```typescript
// All components loaded from JSON
const pkg = await loadJSONPackage('/packages/ui_home')
const component = pkg.components.find(c => c.name === 'HomePage')
```

### 3. God Panel Control

Supergod users can **remap the entire application** without touching code:

```sql
-- Remap root page
UPDATE "InstalledPackage"
SET config = '{"defaultRoute": "/"}'
WHERE "packageId" = 'dashboard';

-- Override with god panel
INSERT INTO "PageConfig" (path, packageId, component, ...)
VALUES ('/', 'custom_package', 'CustomPage', ...);
```

### 4. Complete Loose Coupling

```
Database (Source of Truth)
    ↓
JSON Packages (Data)
    ↓
Generic Renderer (Engine)
    ↓
React (Output)
```

**No layer knows about the layers above or below.**

---

## Trade-offs

### Pros
✅ Infinite flexibility - remap anything via database
✅ Zero coupling - no hardcoded dependencies
✅ God users control everything - no code deploys needed
✅ Package isolation - packages don't know about each other
✅ Multi-tenant ready - tenant-specific route overrides

### Cons
❌ Steep learning curve - "where does this render?"
❌ Harder debugging - trace through database → JSON → renderer
❌ Performance overhead - runtime JSON parsing
❌ Type safety loss - JSON components aren't type-checked
❌ Tooling challenges - no IDE autocomplete for package components

**The trade-off is flexibility vs. simplicity.**

---

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| "Page not found" at `/` | Check `InstalledPackage` has `defaultRoute: "/"` config |
| Package not rendering | Verify package installed: `SELECT * FROM "InstalledPackage"` |
| Permission denied | Check `PackagePermission` table for correct role |
| Database connection failed | Check `DATABASE_URL` env var, run `npm run db:push` |
| DBAL daemon won't start | Check PostgreSQL is running, credentials correct |

### Debug Steps

```bash
# 1. Check database
docker exec -it metabuilder-postgres-prod psql -U metabuilder -c "SELECT * FROM \"InstalledPackage\" WHERE \"packageId\" = 'ui_home';"

# 2. Check package files exist
ls -la packages/ui_home/components/

# 3. Check bootstrap logs
docker logs metabuilder-app-prod | grep bootstrap

# 4. View all routes
curl http://localhost:8080/api/list?entity=PageConfig
```

---

## License

MIT License - See LICENSE file

---

## Learn More

- [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) - Detailed deployment documentation
- [Package Structure](packages/README.md) - How to create packages
- [DBAL Documentation](dbal/docs/) - Database abstraction layer
- [Prisma Schema](prisma/schema.prisma) - Database schema reference

---

**Built with the philosophy: Everything is data, nothing is hardcoded.**
