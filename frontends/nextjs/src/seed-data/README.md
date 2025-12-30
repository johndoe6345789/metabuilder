# Seed Data (`src/seed-data/`)

Initial database population scripts that run during application initialization.

## Purpose

Seed data files populate the database with:
- Default users at each permission level (for testing)
- Initial configurations and settings
- Example workflows and templates
- System components and pages
- Package metadata

## Files

### index.ts
Entry point that orchestrates seed data initialization.

### users.ts
Default user accounts with different permission levels:
- Supergod (Level 5)
- God (Level 4)
- Admin (Level 3)
- User (Level 2)

### components.ts
Pre-configured UI components and widgets available in the system.

### workflows.ts
Sample workflows demonstrating system capabilities.

### scripts.ts
Lua scripts for common operations.

### pages.ts
Page configurations and routing.

### packages.ts
Package metadata and registry.

## Running Seeds

```bash
# Seed database during setup
npm run db:seed

# Reset and reseed
npm run db:reset
```

## Adding Seed Data

1. Create new seed file in this directory
2. Export seed data structure
3. Import in `index.ts`
4. Run seed: `npm run db:seed`

### Example

```typescript
// src/seed-data/my-feature.ts
export const myFeatureSeed = {
  components: [
    { id: 'my-widget', name: 'My Widget', /* ... */ }
  ],
  workflows: [
    { id: 'my-workflow', name: 'My Workflow', /* ... */ }
  ],
}
```

Then import in `index.ts`:

```typescript
import { myFeatureSeed } from './my-feature'

export async function initializeAllSeedData() {
  // Add myFeatureSeed to initialization
}
```

## Multi-Tenant Seeds

Seed data respects tenant isolation:

```typescript
{
  tenantId: 'tenant-1',
  components: [ /* ... */ ]
}
```

## Performance

Large seed datasets may impact startup time. For production:
- Use lazy loading for seed data
- Cache seed results
- Use incremental migrations

See `/docs/` for seed data best practices.
