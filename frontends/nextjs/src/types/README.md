# Type Definitions (`src/types/`)

TypeScript type definitions for the MetaBuilder application.

## Key Type Files

### level-types.ts

Core types for the 6-level system:

```typescript
interface User {
  id: string
  email: string
  level: 1 | 2 | 3 | 4 | 5 | 6
  tenant: Tenant
}

// Level-specific types
type Level = 'public' | 'user' | 'moderator' | 'admin' | 'god' | 'supergod'
```

### schema-types.ts

Database schema type definitions generated from Prisma schema.

### component-types.ts

Component configuration types for database-driven UI.

### workflow-types.ts

Workflow definition and execution types for automation system.

## Adding New Types

1. Create new file: `src/types/my-feature.ts`
2. Export types for use throughout application
3. Import in components: `import type { MyType } from '@/types'`

## Type Safety

- Enable TypeScript strict mode in `tsconfig.json`
- Avoid using `any` type
- Use `unknown` for type-unsafe values
- Prefer union types over enums for variants

See `/docs/` for TypeScript best practices.
