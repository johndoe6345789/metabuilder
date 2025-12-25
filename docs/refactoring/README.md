# Code Refactoring Guide

Strategic guides for modernizing and maintaining the MetaBuilder codebase.

## Documentation

- **[REFACTORING_STRATEGY.md](./REFACTORING_STRATEGY.md)** - Overall refactoring strategy and roadmap
- **[REFACTORING_QUICK_REFERENCE.md](./REFACTORING_QUICK_REFERENCE.md)** - Common patterns and quick lookup
- **[REFACTORING_ENFORCEMENT_GUIDE.md](./REFACTORING_ENFORCEMENT_GUIDE.md)** - Standards and best practices
- **[REFACTORING_CHECKLIST.md](./REFACTORING_CHECKLIST.md)** - Implementation checklist

## Key Principles

### Declarative Over Imperative
Prefer configuration over code:
```typescript
// ❌ Bad - Hardcoded
const user = { name: 'John', role: 'admin' };

// ✅ Good - Declarative configuration
const user = loadUserFromConfig('john');
```

### Minimal TypeScript
Keep TypeScript components small (< 150 LOC) and generic.

```typescript
// ✅ Generic component
<RenderComponent config={componentConfig} data={data} />

// ❌ Large hardcoded components
const UserProfile = ({ user }) => { /* 500+ lines */ }
```

### Database-Driven
Move configuration from code to database:

```typescript
// ❌ Hardcoded routes
app.get('/users', (req, res) => { ... });

// ✅ Database-driven routes
const routes = await db.query('routes').get();
```

### Multi-Tenant Aware
Always consider tenant isolation:

```typescript
// ✅ Good - Filters by tenant
const data = await db
  .query('data')
  .where('tenantId', currentTenant.id)
  .get();

// ❌ Bad - Ignores tenant
const data = await db.query('data').get();
```

## Refactoring Phases

### Phase 1: Analysis
- Identify components > 150 LOC
- Find hardcoded configuration
- Locate database-ignorant code
- Review multi-tenant handling

### Phase 2: Planning
- Prioritize high-impact changes
- Design declarative alternatives
- Plan database schema updates
- Document migration path

### Phase 3: Implementation
- Create generic components
- Move config to database
- Update Prisma schema
- Write/update tests

### Phase 4: Testing
- Unit tests pass
- Integration tests pass
- E2E tests pass
- Multi-tenant scenarios tested

### Phase 5: Documentation
- Update code comments
- Update architecture docs
- Update implementation guides
- Share learnings with team

## Quick Reference

### TypeScript Component Too Large?
→ Read [REFACTORING_QUICK_REFERENCE.md](./REFACTORING_QUICK_REFERENCE.md#breaking-down-large-components)

### Want to Move Config to Database?
→ Read [REFACTORING_STRATEGY.md](./REFACTORING_STRATEGY.md#database-driven-architecture)

### Need to Enforce Standards?
→ Read [REFACTORING_ENFORCEMENT_GUIDE.md](./REFACTORING_ENFORCEMENT_GUIDE.md)

### Following a Checklist?
→ Read [REFACTORING_CHECKLIST.md](./REFACTORING_CHECKLIST.md)

## Common Refactoring Patterns

### Reduce Component Size
```typescript
// Before: 300+ LOC component
export const UserManager = ({ users }) => {
  // Component logic, rendering, validation, formatting...
};

// After: Generic component + config
export const RenderComponent = ({ config, data }) => {
  return renderByType(config.type, config, data);
};
```

### Extract to Lua
```typescript
// Before: Business logic in TypeScript
const calculatePrice = (items) => {
  return items.reduce((total, item) => {
    const tax = item.price * 0.1;
    return total + item.price + tax;
  }, 0);
};

// After: Lua script
function calculatePrice(items)
  local total = 0
  for _, item in ipairs(items) do
    local tax = item.price * 0.1
    total = total + item.price + tax
  end
  return total
end
```

### Make Components Generic
```typescript
// Before: Hardcoded component
export const ProductForm = ({ product }) => {
  return (
    <form>
      <input name="name" defaultValue={product.name} />
      <input name="price" defaultValue={product.price} />
      {/* More fields... */}
    </form>
  );
};

// After: Generic form builder
export const FormRenderer = ({ schema, data }) => {
  return (
    <form>
      {schema.fields.map(field => (
        <RenderField key={field.id} field={field} value={data[field.name]} />
      ))}
    </form>
  );
};
```

## What to Refactor

### High Priority ⭐⭐⭐
- Components > 200 LOC
- Hardcoded configuration
- Missing multi-tenant checks
- No test coverage

### Medium Priority ⭐⭐
- Components > 150 LOC
- Repeated code patterns
- Complex conditional logic
- Limited error handling

### Low Priority ⭐
- Components 100-150 LOC
- Code duplication in utils
- Simplified logic
- Full test coverage

## Refactoring Checklist

Before starting any refactoring:

- [ ] Create a feature branch
- [ ] Write/update tests
- [ ] Document your changes
- [ ] Get code review
- [ ] Update documentation
- [ ] Deploy to staging first
- [ ] Merge to main

## Success Metrics

After refactoring, aim for:

| Metric | Target | Notes |
|--------|--------|-------|
| Avg component size | < 100 LOC | Easier to maintain |
| Test coverage | > 80% | Core logic tested |
| TypeScript LOC | < 30% of project | More declarative |
| Config in database | > 90% | More flexible |

## Resources

- [REFACTORING_STRATEGY.md](./REFACTORING_STRATEGY.md) - Detailed strategy
- [REFACTORING_QUICK_REFERENCE.md](./REFACTORING_QUICK_REFERENCE.md) - Quick lookup
- [REFACTORING_ENFORCEMENT_GUIDE.md](./REFACTORING_ENFORCEMENT_GUIDE.md) - Standards

## Next Steps

1. Read [REFACTORING_STRATEGY.md](./REFACTORING_STRATEGY.md) for overall approach
2. Identify refactoring candidates in your codebase
3. Follow [REFACTORING_CHECKLIST.md](./REFACTORING_CHECKLIST.md)
4. Refer to [REFACTORING_QUICK_REFERENCE.md](./REFACTORING_QUICK_REFERENCE.md) during implementation
5. Use [REFACTORING_ENFORCEMENT_GUIDE.md](./REFACTORING_ENFORCEMENT_GUIDE.md) to maintain standards

---

**Have questions?** Check the [full documentation index](../INDEX.md).
