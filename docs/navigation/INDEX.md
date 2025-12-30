# MetaBuilder Documentation Index

Welcome to the MetaBuilder documentation. This is your central hub for all project information, organized by category for easy navigation.

**�️ [MASTER NAVIGATION](./NAVIGATION.md)** - Complete guide to all documentation  
**�📋 [View Documentation Organization](./ORGANIZATION.md)** - Understand the doc structure and guidelines

## 📚 Quick Navigation

### 🚀 [Getting Started](./getting-started/)
Start here if you're new to the project:
- **[README](./README.md)** - Project overview
- **[PRD.md](./getting-started/PRD.md)** - Product requirements & features
- **[QUICK_START.md](./getting-started/QUICK_START.md)** - Set up your development environment

### 🏗️ [Architecture](./architecture/)
Understand the system design:
- **[5-Level System](./architecture/5-level-system.md)** - Core architecture layers
- **[Data-Driven Architecture](./architecture/data-driven-architecture.md)** - Declarative design patterns
- **[Database Design](./architecture/database.md)** - Database schema and structure
- **[Packages System](./architecture/packages.md)** - Package-based components
- **[Generic Components](./architecture/generic-page-system.md)** - Rendering architecture
- **[CSS as an Abstract System](./architecture/css-as-abstract-system.md)** - Styling as data and GUI mapping

### 🧪 [Testing](./testing/)
Everything about testing the application:
- **[Testing Guidelines](./testing/TESTING_GUIDELINES.md)** - Best practices and standards
- **[Unit Tests](./testing/UNIT_TESTS_IMPLEMENTATION.md)** - Test implementation guide
- **[Quick Reference](./testing/quick-reference.md)** - Common testing patterns

### 🔒 [Security](./security/)
Security documentation and standards:
- **[Security Guide](./security/SECURITY.md)** - Security best practices
- **[Secure Database Layer](./security/SECURE_DATABASE_LAYER.md)** - Database security
- **[Database Security](./security/secure-db-implementation.md)** - Implementation details

### 🔧 [API Reference](./api/)
API documentation and integration guides:
- **[Platform Guide](./api/platform-guide.md)** - Complete API reference
- **[Quick Reference](./api/quick-reference.md)** - Common API patterns
- **[DBAL Integration](./api/DBAL_INTEGRATION.md)** - Database abstraction layer
- **[Packages API](./api/packages.md)** - Package installation and seed data endpoints

### 📋 [Implementation Guides](./implementation/)
Detailed implementation documentation:
- **[Component Map](./implementation/COMPONENT_MAP.md)** - Component structure
- **[Multi-Tenant System](./implementation/MULTI_TENANT_SYSTEM.md)** - Multi-tenancy guide
- **[Prisma Implementation](./implementation/PRISMA_IMPLEMENTATION_COMPLETE.md)** - ORM setup
- **[TypeScript Enhancements](./implementation/TYPESCRIPT_DBAL_ENHANCEMENTS.md)** - Type system improvements
- **[Nerd Mode IDE](./implementation/NERD_MODE_IDE.md)** - Package templates and zip exports
- **[Permission Levels](./permissions-levels.md)** - Five-tier security and UI guide
- **[Codegen Studio Export](./codegen-studio.md)** - Zip generation service for package starters

### 🔄 [Refactoring](./refactoring/)
Refactoring guides and tracking:
- **[Refactoring Strategy](./refactoring/REFACTORING_STRATEGY.md)** - Overall strategy
- **[Quick Reference](./refactoring/REFACTORING_QUICK_REFERENCE.md)** - Common patterns
- **[Enforcement Guide](./refactoring/REFACTORING_ENFORCEMENT_GUIDE.md)** - Standards
- **[Checklist](./refactoring/REFACTORING_CHECKLIST.md)** - Implementation checklist

### 🚨 [Troubleshooting](./troubleshooting/)
Solutions to common issues:
- Check for known issues and solutions
- Database setup problems
- Build and deployment issues

### 📚 [Reference Documentation](./reference/)
Additional references:
- **[Documentation Index](./reference/documentation-index.md)** - Detailed doc structure
- Architecture and design patterns
- Lua scripting guide
- Database migration guides

---

## 🎯 Common Tasks

### I want to...

**...get started with development**
→ Go to [Getting Started](./getting-started/README.md)

**...understand the architecture**
→ Read [5-Level System](./architecture/5-level-system.md)

**...write tests**
→ Check [Testing Guidelines](./testing/TESTING_GUIDELINES.md)

**...secure my code**
→ Review [Security Guide](./security/SECURITY.md)

**...refactor code**
→ See [Refactoring Strategy](./refactoring/REFACTORING_STRATEGY.md)

**...integrate with the database**
→ Learn about [DBAL Integration](./api/DBAL_INTEGRATION.md)

**...create a new package**
→ Follow [Packages System](./architecture/packages.md)

---

## 📂 Documentation Structure

```
docs/
├── README.md                          # Project overview
├── INDEX.md                           # This file - documentation map
│
├── getting-started/                   # For new developers
│   ├── PRD.md
│   └── QUICK_START.md
│
├── architecture/                      # System design
│   ├── 5-level-system.md
│   ├── data-driven-architecture.md
│   ├── database.md
│   ├── packages.md
│   ├── generic-page-system.md
│   └── css-as-abstract-system.md
│
├── testing/                           # Test documentation
│   ├── TESTING_GUIDELINES.md
│   ├── UNIT_TESTS_IMPLEMENTATION.md
│   └── quick-reference.md
│
├── security/                          # Security docs
│   ├── SECURITY.md
│   └── SECURE_DATABASE_LAYER.md
│
├── api/                               # API documentation
│   ├── platform-guide.md
│   ├── quick-reference.md
│   └── DBAL_INTEGRATION.md
│
├── implementation/                    # Detailed guides
│   ├── COMPONENT_MAP.md
│   ├── MULTI_TENANT_SYSTEM.md
│   ├── PRISMA_IMPLEMENTATION_COMPLETE.md
│   └── TYPESCRIPT_DBAL_ENHANCEMENTS.md
│
├── refactoring/                       # Refactoring guides
│   ├── REFACTORING_STRATEGY.md
│   ├── REFACTORING_QUICK_REFERENCE.md
│   ├── REFACTORING_ENFORCEMENT_GUIDE.md
│   └── REFACTORING_CHECKLIST.md
│
├── development/                       # Development guides
│   └── typescript-reduction-guide.md
│
├── troubleshooting/                   # Troubleshooting
│   └── (Known issues and solutions)
│
└── reference/                         # Additional references
    ├── documentation-index.md
    └── (Other reference materials)
```

---

## 🏆 Key Concepts

### Five-Level Architecture
MetaBuilder uses a sophisticated 5-level architecture:
1. **Level 0**: Global system configuration
2. **Level 1**: Tenant-specific features
3. **Level 2**: Module and package definitions
4. **Level 3**: Entity and form configurations
5. **Level 4**: Individual records and data

→ Learn more: [5-Level System](./architecture/5-level-system.md)

### Data-Driven Design
95% of functionality is defined through JSON and Lua, not TypeScript.
→ Learn more: [Data-Driven Architecture](./architecture/data-driven-architecture.md)

### Package System
Components are organized as self-contained packages with seeds, scripts, and assets.
→ Learn more: [Packages System](./architecture/packages.md)

### Multi-Tenancy
Each tenant has isolated configurations, data, and customizations.
→ Learn more: [Multi-Tenant System](./implementation/MULTI_TENANT_SYSTEM.md)

---

## 📞 Support

If you can't find what you're looking for:
1. Use the search feature in your editor (Ctrl+F)
2. Check the [Reference Documentation](./reference/)
3. Look at existing code examples
4. Review the [Troubleshooting](./troubleshooting/) section

---

**Last Updated**: December 2025

### [Migrations](migrations/)
Data migrations, code refactoring, and relocation guides.

- **[MIGRATION_STATUS.md](migrations/MIGRATION_STATUS.md)** - Migration progress tracking
- **[FILE_RELOCATION_GUIDE.md](migrations/FILE_RELOCATION_GUIDE.md)** - File organization
- **[RELOCATION_SUMMARY.md](migrations/RELOCATION_SUMMARY.md)** - Relocation completion status

### [Troubleshooting](troubleshooting/)
Diagnostics, debugging guides, and common issues.

- **[WORKFLOW_FAILURE_DIAGNOSIS.md](troubleshooting/WORKFLOW_FAILURE_DIAGNOSIS.md)** - CI/CD debugging
- **[CORS-BYPASS-EXPLANATION.md](troubleshooting/CORS-BYPASS-EXPLANATION.md)** - CORS issues
- **[TEST_COVERAGE_SUMMARY.md](troubleshooting/TEST_COVERAGE_SUMMARY.md)** - Test coverage info
- **[PACKAGE_TESTS.md](troubleshooting/PACKAGE_TESTS.md)** - Package testing guide

### [Archive](archive/)
Completed phases and historical work.

- **[PHASE2_SUMMARY.md](archive/PHASE2_SUMMARY.md)** - Phase 2 completion summary

## Code-to-Documentation Mapping

### [Source Code (src/)](src/)
Documentation for TypeScript/React source code

- **[components/](src/components/)** - React components (atoms, molecules, organisms)
- **[lib/](src/lib/)** - Core library modules (auth, database, lua, packages)
- **[hooks/](src/hooks/)** - React custom hooks
- **[seed-data/](src/seed-data/)** - Database seed data
- **[types/](src/types/)** - TypeScript type definitions
- **[styles/](src/styles/)** - Styling system and Tailwind configuration
- **[tests/](src/tests/)** - Unit and integration tests

### [DBAL (Data Abstraction Layer)](dbal/)
Documentation for C++ and TypeScript database layer

- **[api/](dbal/shared/api/)** - API schemas and versioning
- **[backends/](dbal/shared/backends/)** - Database backend implementations (Prisma, SQLite)
- **[common/](dbal/shared/common/)** - Shared DBAL utilities
- **[cpp/](dbal/production/)** - C++ implementation
- **[ts/](dbal/development/)** - TypeScript implementation
- **[tools/](dbal/shared/tools/)** - Development tools
- **[scripts/](dbal/shared/scripts/)** - Automation scripts

### [Packages](packages/)
Documentation for feature packages

- **[admin_dialog.md](packages/admin_dialog.md)** - Admin dialog components
- **[dashboard.md](packages/dashboard.md)** - Dashboard components
- **[data_table.md](packages/data_table.md)** - Data table component
- **[form_builder.md](packages/form_builder.md)** - Form builder system
- **[nav_menu.md](packages/nav_menu.md)** - Navigation menu components
- **[notification_center.md](packages/notification_center.md)** - Notification system
- **[spark-tools.md](packages/spark-tools.md)** - Development tools package

## Additional Topics

### Architecture
Fundamental architecture and design patterns.

- **[architecture/](architecture/)** - Core architecture documents

### Database
Database-specific documentation.

- **[database/](database/)** - Database design and setup

### Development
Development workflow and best practices.

- **[development/](development/)** - Development guides

### Lua Scripting
Lua integration and scripting.

- **[lua/](lua/)** - Lua documentation and examples

### Reference
Quick lookup and API reference.

- **[reference/](reference/)** - Technical references

### Security
Security policies and guidelines.

- **[security/](security/)** - Security documentation

## Navigation Tips

1. **New to MetaBuilder?** Start with [README.md](README.md) and [ATOMIC_QUICKSTART.md](guides/ATOMIC_QUICKSTART.md)
2. **Building a feature?** Check [IMPLEMENTATION_ROADMAP.md](guides/IMPLEMENTATION_ROADMAP.md) and the [implementation/](implementation/) folder
3. **Setting up locally?** See [SASS_QUICK_REFERENCE.md](guides/SASS_QUICK_REFERENCE.md) and [guides/](guides/)
4. **Deploying to production?** Review [NGINX_INTEGRATION.md](deployments/NGINX_INTEGRATION.md) and [deployments/](deployments/)
5. **Debugging issues?** Check [troubleshooting/](troubleshooting/) first
6. **Running CI/CD locally?** See [github-actions-local-testing.md](guides/github-actions-local-testing.md)
