# New Contributor Path

A guided learning path through MetaBuilder documentation for new team members.

## 🎯 Your Learning Journey (2-3 hours)

This path guides you through the essential concepts in a logical order. Follow the sections sequentially.

### Phase 1: Foundation (30 minutes)

Understand what MetaBuilder is and how it's structured.

1. **[Project Overview](./README.md)** ⭐ **START HERE**
   - What MetaBuilder does
   - Key features
   - Tech stack overview

2. **[Executive Brief](../guides/EXECUTIVE_BRIEF.md)**
   - High-level business context
   - Key stakeholders
   - Project goals

3. **[Product Requirements](./PRD.md)**
   - Feature list
   - User personas
   - Requirements breakdown

### Phase 2: Architecture Fundamentals (45 minutes)

Learn how MetaBuilder is architected.

4. **[5-Level Permission System](../architecture/5-level-system.md)** ⭐ **CRITICAL**
   - Permission hierarchy (Public → User → Admin → God → Supergod)
   - Role-based access patterns
   - Multi-tenant considerations

5. **[Data-Driven Architecture](../architecture/data-driven-architecture.md)**
   - 95% JSON/Lua philosophy
   - Minimal TypeScript
   - Declarative patterns

6. **[Package System](../architecture/packages.md)**
   - How packages work
   - Package structure
   - Self-contained modules

7. **[Generic Component Rendering](../architecture/generic-page-system.md)**
   - Component declaration via JSON
   - RenderComponent pattern
   - Dynamic UI composition

8. **[Database Design](../architecture/database.md)**
   - Schema overview
   - Multi-tenant isolation
   - DBAL integration

### Phase 3: Development Workflow (45 minutes)

Learn how to develop with MetaBuilder.

9. **[Quick Start](./README.md#quick-start)** (if available in getting-started/README.md)
   - Development environment setup
   - Running the project locally
   - Common commands

10. **[Testing Guidelines](../testing/TESTING_GUIDELINES.md)** ⭐ **REQUIRED**
    - Test structure
    - Parameterized testing
    - Coverage requirements

11. **[Refactoring Strategy](../refactoring/REFACTORING_STRATEGY.md)**
    - Code quality standards
    - Component size limits (150 LOC)
    - TypeScript reduction principles

12. **[Lua Scripting Guide](../lua/snippets-guide.md)**
    - Lua sandbox execution
    - Script patterns
    - Integration with TypeScript

### Phase 4: Common Tasks (30 minutes)

Learn how to accomplish typical work items.

13. **[Component Development](../guides/getting-started.md)** (or component development guide)
    - Creating new components
    - Using RenderComponent
    - Testing components

14. **[DBAL Integration](../implementation/DBAL_INTEGRATION.md)**
    - Database operations
    - Using Database helper class
    - Query patterns

15. **[Package Creation](../packages/README.md)**
    - Creating new packages
    - Package structure
    - Seed data

---

## 🔑 Key Concepts to Remember

As you work through this path, keep these principles in mind:

### ✅ DO:
- ✅ Use `Database` class for all database operations (never raw Prisma)
- ✅ Filter queries by `tenantId` for multi-tenant safety
- ✅ Use generic `RenderComponent` instead of hardcoded JSX
- ✅ Keep components < 150 LOC
- ✅ Write parameterized tests for every function
- ✅ Use Lua for data transformation, TypeScript for orchestration

### ❌ DON'T:
- ❌ Hardcode values in TypeScript (move to database/config)
- ❌ Forget tenantId in queries (breaks multi-tenancy)
- ❌ Create new database fields without running `npm run db:generate`
- ❌ Commit code without tests passing
- ❌ Build custom components when JSON config would work
- ❌ Add fields/operations to DBAL without updating YAML first

---

## 📚 Reference Resources

Keep these handy as you develop:

- **[Copilot Instructions](../../.github/copilot-instructions.md)** - AI assistant context
- **[Master Navigation](../NAVIGATION.md)** - Complete docs index
- **[Troubleshooting](../troubleshooting/README.md)** - Common issues
- **[Quick References](../testing/TESTING_QUICK_REFERENCE.md)** - Testing patterns

---

## 🎓 Learning Paths by Role

### Frontend Developer
1-4, 7, 10-15 in the main path, plus:
- [Component Architecture](../architecture/generic-page-system.md)
- [SASS Configuration](../guides/SASS_CONFIGURATION.md)

### Backend Developer
1-6, 8-9, 14 in the main path, plus:
- [DBAL Integration](../implementation/DBAL_INTEGRATION.md)
- [Database Migrations](../migrations/README.md)
- [API Reference](../api/platform-guide.md)

### DevOps/Infrastructure
1-2, plus:
- [Deployment Guide](../deployments/README.md)
- [Docker Setup](../deployments/README.md#docker)
- [CI/CD Workflows](../deployments/GITHUB_WORKFLOWS_AUDIT.md)

### QA/Testing
1-3, 10-11, plus:
- [Testing Implementation](../testing/TESTING_IMPLEMENTATION_SUMMARY.md)
- [E2E Testing](../testing/README.md)

---

## ✅ Completion Checklist

After completing this path, you should be able to:

- [ ] Explain the 5-level permission system
- [ ] Describe why MetaBuilder is 95% JSON/Lua
- [ ] Create a new component using RenderComponent
- [ ] Write a parameterized test with 3+ cases
- [ ] Run the project locally and make a simple code change
- [ ] Query data safely with tenantId filtering
- [ ] Create a new package with seed data
- [ ] Run the test suite and see all tests pass
- [ ] Explain the package system architecture
- [ ] Understand DBAL's role in the system

---

## 💬 Questions?

If something isn't clear:
1. Check [Troubleshooting](../troubleshooting/README.md)
2. Search for keywords in [Master Navigation](../NAVIGATION.md)
3. Review the [Copilot Instructions](../../.github/copilot-instructions.md) for patterns

Welcome to MetaBuilder! 🚀
