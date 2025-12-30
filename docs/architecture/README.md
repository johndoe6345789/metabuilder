# Architecture Documentation

Comprehensive guides to understanding MetaBuilder's system architecture.

## Core Architecture

- **[5-Level System](./5-level-system.md)** - The foundational architecture layers
- **[Data-Driven Architecture](./data-driven-architecture.md)** - Declarative design patterns
- **[Packages System](./packages.md)** - Self-contained component packages
- **[Generic Components](./generic-page-system.md)** - Dynamic rendering system

## Supporting Documentation

- **[Database Design](./database.md)** - Schema and structure
- **[Declarative Components](./declarative-components.md)** - Component definition patterns
- **[CSS as an Abstract System](./css-as-abstract-system.md)** - Styling as data and GUI mapping
- **[Testing Architecture](./testing.md)** - Testing strategy
- **[Deployment](./deployment.md)** - Production deployment

## Key Concepts

### Five-Level System
MetaBuilder's sophisticated architecture organizes functionality across 5 levels:

1. **Level 0 (Global)**
   - Global system configuration
   - Shared resources
   - Platform-wide settings

2. **Level 1 (Tenant)**
   - Tenant-specific configuration
   - Feature toggles
   - Branding and customization

3. **Level 2 (Modules)**
   - Package definitions
   - Module configuration
   - Feature modules

4. **Level 3 (Entities)**
   - Entity schemas
   - Form configurations
   - Business rules

5. **Level 4 (Records)**
   - Individual data records
   - Instance-specific data
   - User-generated content

→ Learn more: [5-Level System](./5-level-system.md)

### Data-Driven Design
Rather than hardcoding features in TypeScript, MetaBuilder defines 95% of functionality through:
- **JSON** - Configuration and schemas
- **Lua** - Business logic and scripting
- **Database** - Centralized source of truth

Benefits:
- ✅ Multi-tenant support
- ✅ Runtime configuration changes
- ✅ Reduced TypeScript code
- ✅ Easier customization

→ Learn more: [Data-Driven Architecture](./data-driven-architecture.md)

### Package System
Components are organized as self-contained packages:
```
packages/
├── package-name/
│   ├── seed/                    # Configuration and initial data
│   ├── components/              # React components
│   ├── scripts/                 # Lua scripts
│   └── static_content/          # Assets
```

→ Learn more: [Packages System](./packages.md)

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Level 1 (Tenant Layer)          │
│  - Features, Branding, Configuration    │
├─────────────────────────────────────────┤
│       Level 2 (Module/Package Layer)    │
│  - Package Definitions, Components      │
├─────────────────────────────────────────┤
│      Level 3 (Entity/Schema Layer)      │
│  - Schemas, Forms, Business Rules       │
├─────────────────────────────────────────┤
│     Level 4 (Record/Data Layer)         │
│  - Individual Records, User Data        │
├─────────────────────────────────────────┤
│    Database (Prisma, PostgreSQL)        │
│  - Centralized Configuration            │
└─────────────────────────────────────────┘
```

## Design Principles

### 1. Declarative Over Imperative
Define **what** you want, not **how** to do it.

```typescript
// ❌ Imperative - How to render
export const UserForm = ({ user }) => {
  return (
    <form>
      <label>Name</label>
      <input name="name" defaultValue={user.name} />
      {/* ... more fields */}
    </form>
  );
};

// ✅ Declarative - What to render
const formConfig = {
  fields: [
    { name: 'name', label: 'Name', type: 'text' },
    // ... more fields defined in config
  ],
};

export const Form = ({ config, data }) => {
  return renderFormFromConfig(config, data);
};
```

### 2. Database-Driven Configuration
Configuration lives in the database, not in code.

```typescript
// Load routes from database
const routes = await db.query('routes')
  .where('tenantId', currentTenant.id)
  .get();
```

### 3. Multi-Tenant Awareness
Every query filters by tenant ID.

```typescript
// Always include tenant filter
const users = await db.query('users')
  .where('tenantId', currentTenant.id)
  .get();
```

### 4. Modularity
Features are self-contained packages that can be imported/exported.

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Scripting**: Lua (via Fengari)
- **Testing**: Vitest, React Testing Library, Playwright

## Quick Links

| Need | Resource |
|------|----------|
| System overview | [5-Level System](./5-level-system.md) |
| Configuration patterns | [Data-Driven Architecture](./data-driven-architecture.md) |
| Component organization | [Packages System](./packages.md) |
| Rendering system | [Generic Components](./generic-page-system.md) |
| Database design | [Database Design](./database.md) |
| Deployment | [Deployment](./deployment.md) |

## Common Architecture Questions

**Q: Why five levels?**
A: Each level represents a different scope: global, tenant, module, entity, and record. This allows flexible multi-tenant configuration.

[Read more](./5-level-system.md)

**Q: Why use Lua for scripts?**
A: Lua is lightweight, sandboxable, and allows business logic without redeploying.

[Read more](./data-driven-architecture.md)

**Q: How does multi-tenancy work?**
A: Every database query is filtered by tenant ID, with separate configurations per tenant.

[Read more](./5-level-system.md#multi-tenancy)

**Q: Can I customize components?**
A: Yes! Through configuration, Lua scripts, or by creating new packages.

[Read more](./packages.md)

## Next Steps

1. Start with [5-Level System](./5-level-system.md) for overview
2. Understand [Data-Driven Architecture](./data-driven-architecture.md)
3. Learn about [Packages System](./packages.md) for organization
4. Review [Generic Components](./generic-page-system.md) for rendering
5. Check [Database Design](./database.md) for data structure

---

**Have questions?** Check the [full documentation index](../INDEX.md).
