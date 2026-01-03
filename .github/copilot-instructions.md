# GitHub Copilot Instructions for MetaBuilder

## Architecture Overview

MetaBuilder is a **data-driven, multi-tenant platform** with 95% functionality in JSON, not TypeScript. The system combines:

- **6-Level Permission System**: Public → User → Moderator → Admin → God → Supergod access hierarchies
- **DBAL (Database Abstraction Layer)**: TypeScript SDK + C++ daemon, language-agnostic via YAML contracts
- **Declarative Components**: Render complex UIs from JSON configuration using `RenderComponent`
- **Package System**: Self-contained modules in `/packages/{name}/seed/` with metadata, components, scripts
- **Multi-Source Package Repos**: Support for local and remote package registries via `PackageSourceManager`
- **Multi-Tenancy**: All data queries filter by `tenantId`; each tenant has isolated configurations

## 0-kickstart Operating Rules

Follow `.github/prompts/0-kickstart.md` as the current workflow source of truth. Key rules:
- Work through `.github/prompts/` as needed; start with `0-kickstart.md`.
- Commit as you go with descriptive messages; default to trunking on `main`.
- Use `act` to diagnose GitHub workflow issues locally.
- Keep unit tests parameterized; create new test files where possible; use 1:1 source-to-test naming.
- Leave TODO comments for missing functionality.
- Check `docs/todo/` before starting.
- One lambda per file; classes only serve as containers for related lambdas (see `.github/prompts/LAMBDA_PROMPT.md`).
- Route data access through DBAL; treat it as the trusted layer.
- Design for flexibility, modularity, and containerization.
- See `docs/RADIX_TO_MUI_MIGRATION.md` for UI migration guidance.

## Critical Patterns

### 1. API-First DBAL Development
When adding features to DBAL:
1. **Define in YAML first**: `api/schema/entities/*.yaml` and `api/schema/operations/*.yaml`
2. **Generate types**: Run type generation scripts (creates TS and C++ types)
3. **Implement adapters**: TypeScript (`ts/src/adapters/`) for speed, C++ (`cpp/src/adapters/`) for security
4. **Add conformance tests**: `common/contracts/*_tests.yaml` (runs on both implementations to guarantee parity)
5. Never add fields/operations directly in code without updating YAML source of truth

**Why**: C++ daemon isolates credentials (users never see DB URLs), enforces row-level security, and protects against malicious queries.

### 2. Generic Component Rendering
Instead of hardcoded components, use declarative config:
```tsx
// ❌ Wrong: Hardcoded
<UserForm user={user} onSave={handleSave} />

// ✅ Right: Declarative
<RenderComponent component={{
  type: 'form',
  props: { schema: formSchema },
  children: [/* field components */]
}} />
```
See: `RenderComponent.tsx`, `declarative-component-renderer.ts`

### 3. Package Seed Data Structure
Each package auto-loads on init:
```
packages/{name}/
├── seed/
│   ├── metadata.json      # Package info, exports, dependencies, minLevel
│   ├── components.json    # Component definitions
│   ├── scripts/           # JSON scripts organized by function
│   └── index.ts           # Exports packageSeed object
├── src/                   # Optional React components
└── static_content/        # Assets (images, etc.)
```
Loaded by `initializePackageSystem()` → `buildPackageRegistry()` → `exportAllPackagesForSeed()`

### 3a. Multi-Source Package Repositories
Packages can come from multiple sources:
```typescript
import { createPackageSourceManager, LocalPackageSource, RemotePackageSource } from '@/lib/packages/package-glue'

const manager = createPackageSourceManager({
  enableRemote: true,
  remoteUrl: 'https://registry.metabuilder.dev/api/v1',
  conflictResolution: 'priority' // or 'latest-version', 'local-first', 'remote-first'
})

const packages = await manager.fetchMergedIndex()
const pkg = await manager.loadPackage('dashboard')
```
See: `docs/packages/package-sources.md`, `package-glue/sources/`

### 4. Database Helpers Pattern
Always use `Database` class methods, never raw Prisma:
```typescript
// ✅ Right
const users = await Database.getUsers()
await Database.setSchemas(schemas)

// ❌ Wrong
const users = await prisma.user.findMany()
```
See: `src/lib/database.ts` (1200+ LOC utility wrapper)

### 5. Script Execution
Scripts are defined in JSON format and executed in a controlled environment with limited access to system resources.

## Code Conventions

### UI Components & Styling

**⚠️ CRITICAL: This project does NOT use Radix UI or Tailwind CSS**

- ❌ **NEVER import from `@radix-ui/*`** - These dependencies have been removed
- ❌ **NEVER use Tailwind utility classes** in `className` props
- ✅ **ALWAYS use Material-UI** (`@mui/material`) for UI components
- ✅ **Use MUI's `sx` prop** for inline styles with theme access
- ✅ **Create `.module.scss` files** for component-specific custom styles
- ✅ **Use `@mui/icons-material`** for icons, not lucide-react or heroicons

```tsx
// ❌ Wrong: Using Radix UI or Tailwind
import { Dialog } from '@radix-ui/react-dialog'
<button className="bg-blue-500 text-white px-4 py-2">Click</button>

// ✅ Right: Using Material-UI
import { Dialog, Button } from '@mui/material'
<Button variant="contained" color="primary">Click</Button>
<Box sx={{ display: 'flex', gap: 2, p: 3 }}>Content</Box>
```

**Component Mapping:**
- Radix Dialog → MUI Dialog
- Radix Select → MUI Select
- Radix Checkbox → MUI Checkbox
- Radix Switch → MUI Switch
- Tailwind classes → MUI `sx` prop or SCSS modules

**See:** `UI_STANDARDS.md` and `docs/UI_MIGRATION.md` for complete reference

### TypeScript/React
- One lambda per file; classes are containers for related lambdas.
- Keep files small and focused; split by responsibility when they grow.
- Use `@/` absolute paths
- Functional components with hooks; avoid class components
- Test files next to source with matching names: `utils.ts` + `utils.test.ts`, using parameterized `it.each()`

### Tests
All functions need coverage with parameterized tests:
```typescript
// From schema-utils.test.ts: 63 tests for 14 functions
it.each([
  { input: 'case1', expected: 'result1' },
  { input: 'case2', expected: 'result2' },
])('should handle $input', ({ input, expected }) => {
  expect(myFunction(input)).toBe(expected)
})
```
Run `npm run test:coverage:report` to auto-generate coverage markdown.

### Database
- Schema in `prisma/schema.prisma`, always run `npm run db:generate` after changes
- Hash passwords with SHA-512 (see `password-utils.ts`)
- Queries must include `where('tenantId', currentTenant.id)` for multi-tenancy

### Styling
Material-UI with SASS; theme in `src/theme/mui-theme.ts` with light/dark mode support. Font families: IBM Plex Sans (body), Space Grotesk (headings), JetBrains Mono (code). Use MUI's `sx` prop for inline styles or create `.module.scss` files for custom component styles.

## Development Checklist

**Before implementing**: Check `docs/` and `docs/todo/`, and review `.github/prompts/0-kickstart.md` for current workflow rules.

**During implementation**:
1. Define database schema changes first (Prisma)
2. Add seed data to `src/seed-data/` or package `/seed/`
3. Use generic renderers (`RenderComponent`) not hardcoded JSX
4. Add JSON scripts in package `/seed/scripts/` as needed
5. Keep one lambda per file and split as needed
6. Add parameterized tests in `.test.ts` files with matching names

**Before commit**:
- `npm run lint:fix` (fixes ESLint issues)
- `npm test -- --run` (all tests pass)
- `npm run test:coverage:report` (verify new functions have tests)
- `npm run test:e2e` (critical workflows still work)
- Use `npm run act:diagnose` or `npm run act` when investigating CI/workflow failures
- Commit with a descriptive message on `main` unless a PR workflow is explicitly required

## Multi-Tenant Safety

Every query must filter by tenant:
```typescript
// ❌ Never
const data = await Database.getData()

// ✅ Always  
const data = await Database.getData({ tenantId: user.tenantId })
```

Permission checks cascade from lowest level:
```typescript
if (user.level >= 3) {  // Admin and above
  showAdminPanel()
}
```

## DBAL-Specific Guidance

**TypeScript DBAL**: Fast iteration, development use. Located in `dbal/ts/src/`.
**C++ DBAL Daemon**: Production security, credential protection. Located in `dbal/production/src/`.
**Conformance Tests**: Guarantee both implementations behave identically. Update `common/contracts/` when changing YAML schemas.

If fixing a DBAL bug:
1. Verify the bug exists in YAML schema definition
2. Reproduce in TypeScript implementation first (faster feedback loop)
3. Apply fix to both TS and C++ adapters
4. Add/update conformance test in `common/contracts/`
5. Verify both implementations pass conformance tests

## Common Mistakes

❌ **Hardcoding values in TSX** → Move to database or YAML config
❌ **Forgetting tenantId filter** → Breaks multi-tenancy
❌ **Adding fields without Prisma generate** → Type errors in DB helper
❌ **Multiple lambdas per file** → Split into single-lambda files and wrap with a class only when needed
❌ **New function without test** → `npm run test:check-functions` will fail
❌ **Missing TODO for unfinished behavior** → Leave a TODO comment where functionality is pending

## Key Files

- **Architecture**: `docs/architecture/5-level-system.md` (permissions), `docs/architecture/packages.md` (packages)
- **Components**: `src/components/RenderComponent.tsx` (generic renderer), `src/lib/declarative-component-renderer.ts`
- **Database**: `src/lib/database.ts` (all DB operations), `prisma/schema.prisma` (schema)
- **Packages**: `src/lib/package-loader.ts` (initialization), `packages/*/seed/` (definitions)
- **Tests**: `src/lib/schema-utils.test.ts` (parameterized pattern), `FUNCTION_TEST_COVERAGE.md` (auto-generated report)
- **DBAL**: `dbal/docs/AGENTS.md` (detailed DBAL agent guide), `api/schema/` (YAML contracts)

## Questions to Ask

1. Is this hardcoded value better in database?
2. Could a generic component render this instead of custom TSX?
3. Does this query filter by tenantId?
4. Could JSON configuration handle this without code changes?
5. Is this one lambda per file (and test file name matches)?
6. Does this function have a parameterized test?
7. Is this DBAL change reflected in YAML schema first?
