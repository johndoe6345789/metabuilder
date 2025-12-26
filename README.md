# MetaBuilder

A **data-driven, multi-tenant platform** where 95% of functionality lives in JSON/Lua, not TypeScript. Build enterprise applications declaratively with a 5-level permission system.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [5-Level Permission System](#5-level-permission-system)
- [Package System](#package-system)
- [Database](#database)
- [Testing](#testing)
- [Development](#development)
- [Security](#security)
- [Deployment](#deployment)

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

---

## Architecture

MetaBuilder combines:

- **Declarative Components**: Render UIs from JSON using `RenderComponent`
- **DBAL**: TypeScript SDK + C++ daemon, language-agnostic via YAML contracts
- **Package System**: Self-contained modules in `/packages/{name}/seed/`
- **Multi-Tenancy**: All queries filter by `tenantId`

### Project Structure

```
metabuilder/
├── frontends/nextjs/      # Next.js application
│   ├── src/
│   │   ├── app/           # App routes and pages
│   │   ├── components/    # React components (Atomic Design)
│   │   ├── lib/           # Core libraries
│   │   ├── hooks/         # Custom React hooks
│   │   └── seed-data/     # Database seeds
│   └── e2e/               # Playwright E2E tests
├── packages/              # Feature packages
├── dbal/                  # Database Abstraction Layer
│   ├── ts/                # TypeScript implementation
│   └── cpp/               # C++ daemon (production)
├── prisma/                # Database schema
└── docs/                  # Extended documentation
```

---

## 5-Level Permission System

Hierarchical access control where each level inherits all permissions from lower levels:

| Level | Role | Access |
|-------|------|--------|
| 1 | Public | Read-only, unauthenticated |
| 2 | User | Personal dashboard, content creation |
| 3 | Admin | User management, system settings |
| 4 | God | Workflows, advanced scripting, packages |
| 5 | Supergod | Full system control, tenant management |

### Routes

| Level | Route | Description |
|-------|-------|-------------|
| 1 | `/` | Public landing |
| 2 | `/dashboard` | User workspace |
| 3 | `/admin` | Admin panel |
| 4 | `/builder` | God-tier builder |
| 5 | `/supergod` | Supergod console |

### Usage

```typescript
import { canAccessLevel } from '@/lib/auth'

// Check if user has admin access or higher
if (canAccessLevel(user.level, 3)) {
  showAdminPanel()
}
```

---

## Package System

Self-contained feature modules with seed data, components, and Lua scripts.

### Structure

```
packages/{name}/
├── seed/
│   ├── metadata.json      # Package info (snake_case packageId, semver version)
│   ├── components.json    # Component definitions
│   └── scripts/           # Lua scripts
├── src/                   # React components (optional)
└── static_content/        # Assets
```

### Available Packages

- `admin_dialog` - Admin utilities
- `dashboard` - Dashboard widgets
- `data_table` - Data table component
- `form_builder` - Form creation tools
- `forum_forge` - Forum system
- `nav_menu` - Navigation menus
- `notification_center` - Notifications

---

## Database

### Prisma ORM

Schema: `prisma/schema.prisma`

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Apply schema changes
npm run db:studio     # Open database UI
```

### Multi-Tenant Queries

Always filter by tenant:

```typescript
const data = await prisma.workflow.findMany({
  where: { tenantId: user.tenantId }
})
```

### DBAL

For complex operations, use the Database Abstraction Layer:

- **TypeScript** (`dbal/ts/`): Fast iteration, development
- **C++ Daemon** (`dbal/cpp/`): Production security, credential protection

---

## Testing

### Commands

```bash
# From frontends/nextjs/
npm run test:unit              # Vitest unit tests
npm run test:unit -- --coverage # With coverage
npm run test:e2e               # Playwright E2E tests
npm run lint                   # ESLint
npm run typecheck              # TypeScript validation
```

### Guidelines

- Test files next to source: `utils.ts` → `utils.test.ts`
- Use parameterized tests with `it.each()`
- Cover happy path, edge cases, and errors

```typescript
it.each([
  { input: 'valid@email.com', expected: true },
  { input: 'invalid', expected: false },
])('validates $input', ({ input, expected }) => {
  expect(validateEmail(input)).toBe(expected)
})
```

### Local CI Testing

```bash
npm run act           # Full CI pipeline locally
npm run act:lint      # Test linting only
npm run act:build     # Test build only
```

---

## Development

### Available Scripts

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

- **UI**: Material-UI (`@mui/material`) with `sx` prop or `.module.scss`
- **No Tailwind or Radix UI** - See UI_STANDARDS.md
- **One lambda per file** - Classes only as containers for related lambdas
- **Absolute imports**: `@/` paths
- **Functional components** with hooks

### Generic Component Rendering

```tsx
// ✅ Use declarative config
<RenderComponent component={{
  type: 'form',
  props: { schema: formSchema },
  children: [/* field components */]
}} />

// ❌ Avoid hardcoded components
<UserForm user={user} onSave={handleSave} />
```

---

## Security

### Password Hashing

SHA-512 for all credentials (see `password-utils.ts`)

### Lua Sandbox

Scripts run in isolated sandbox without `os`, `io`, `require`:

```lua
function validateEmail(email)
  return string.match(email, "^[^@]+@[^@]+$") ~= nil
end
```

### Security Scanning

Code is scanned for:
- XSS patterns, `eval()`, `innerHTML`
- SQL injection
- Prototype pollution
- Lua: `os`/`io` module usage, infinite loops

---

## Deployment

### Docker

```bash
# Development
docker-compose -f deployment/docker-compose.development.yml up

# Production
docker-compose -f deployment/docker-compose.production.yml up
```

### Environment

```env
# Development (SQLite)
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/metabuilder"
```

---

## Key Files

| Purpose | Location |
|---------|----------|
| App source | `frontends/nextjs/src/` |
| Database schema | `prisma/schema.prisma` |
| Package seeds | `packages/*/seed/` |
| DBAL TypeScript | `dbal/ts/src/` |
| DBAL C++ | `dbal/cpp/src/` |
| E2E tests | `frontends/nextjs/e2e/` |
| Extended docs | `docs/` |

---

## Contributing

1. Follow code conventions in `.github/copilot-instructions.md`
2. Run `npm run lint:fix` before committing
3. Add parameterized tests for new functions
4. Commit with descriptive messages on `main`

---

## License

See [LICENSE](./docs/LICENSE)
