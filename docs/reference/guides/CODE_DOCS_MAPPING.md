# Code-to-Documentation Mapping Summary

## Overview
This document provides a 1:1 mapping between code folders and their corresponding documentation.

## Mapping Structure

### `/src/` → `/docs/src/`

| Code Location | Documentation | Purpose |
|---------------|---------------|---------|
| `/src/components/` | [/docs/src/components/](../../src/components/) | React components (atoms, molecules, organisms) |
| `/src/components/level1/` | [/docs/src/components/](../../src/components/) | Level 1 components |
| `/src/components/level2/` | [/docs/src/components/](../../src/components/) | Level 2 components |
| `/src/components/level4/` | [/docs/src/components/](../../src/components/) | Level 4 components |
| `/src/components/level5/` | [/docs/src/components/](../../src/components/) | Level 5 components |
| `/src/components/atoms/` | [/docs/src/components/](../../src/components/) | Atomic design atoms |
| `/src/components/molecules/` | [/docs/src/components/](../../src/components/) | Atomic design molecules |
| `/src/components/organisms/` | [/docs/src/components/](../../src/components/) | Atomic design organisms |
| `/src/components/shared/` | [/docs/src/components/](../../src/components/) | Shared components |
| `/src/components/ui/` | [/docs/src/components/](../../src/components/) | UI component library |
| `/src/lib/` | [/docs/src/lib/](../../src/lib/) | Core utility libraries |
| `/src/hooks/` | [/docs/src/hooks/](../../src/hooks/) | Custom React hooks |
| `/src/seed-data/` | [/docs/src/seed-data/](../../src/seed-data/) | Initial database seed data |
| `/src/types/` | [/docs/src/types/](../../src/types/) | TypeScript type definitions |
| `/src/styles/` | [/docs/src/styles/](../../src/styles/) | Global styles and themes |
| `/src/tests/` | [/docs/src/tests/](../../src/tests/) | Unit and integration tests |

### `/dbal/` → `/docs/dbal/`

| Code Location | Documentation | Purpose |
|---------------|---------------|---------|
| `/dbal/api/` | [/docs/dbal/api/](../../dbal/api/) | API schemas and versioning |
| `/dbal/api/schema/` | [/docs/dbal/api/](../../dbal/api/) | Schema definitions |
| `/dbal/api/versioning/` | [/docs/dbal/api/](../../dbal/api/) | Version management |
| `/dbal/backends/` | [/docs/dbal/backends/](../../dbal/backends/) | Database backends |
| `/dbal/backends/prisma/` | [/docs/dbal/backends/](../../dbal/backends/) | Prisma ORM backend |
| `/dbal/backends/sqlite/` | [/docs/dbal/backends/](../../dbal/backends/) | SQLite backend |
| `/dbal/common/` | [/docs/dbal/common/](../../dbal/common/) | Shared utilities |
| `/dbal/cpp/` | [/docs/dbal/cpp/](../../dbal/cpp/) | C++ implementation |
| `/dbal/cpp/src/` | [/docs/dbal/cpp/](../../dbal/cpp/) | C++ source files |
| `/dbal/cpp/include/` | [/docs/dbal/cpp/](../../dbal/cpp/) | C++ headers |
| `/dbal/cpp/tests/` | [/docs/dbal/cpp/](../../dbal/cpp/) | C++ tests |
| `/dbal/ts/` | [/docs/dbal/ts/](../../dbal/ts/) | TypeScript implementation |
| `/dbal/tools/` | [/docs/dbal/tools/](../../dbal/tools/) | Development tools |
| `/dbal/scripts/` | [/docs/dbal/scripts/](../../dbal/scripts/) | Automation scripts |

### `/packages/` → `/docs/packages/`

| Code Location | Documentation | Purpose |
|---------------|---------------|---------|
| `/packages/admin_dialog/` | [/docs/packages/admin_dialog.md](../../packages/admin_dialog.md) | Admin dialog components |
| `/packages/dashboard/` | [/docs/packages/dashboard.md](../../packages/dashboard.md) | Dashboard components |
| `/packages/data_table/` | [/docs/packages/data_table.md](../../packages/data_table.md) | Data table component |
| `/packages/form_builder/` | [/docs/packages/form_builder.md](../../packages/form_builder.md) | Form builder system |
| `/packages/nav_menu/` | [/docs/packages/nav_menu.md](../../packages/nav_menu.md) | Navigation menu |
| `/packages/notification_center/` | [/docs/packages/notification_center.md](../../packages/notification_center.md) | Notification system |
| `/packages/spark-tools/` | [/docs/packages/spark-tools.md](../../packages/spark-tools.md) | Development tools |

### Other Code Folders

| Code Location | Existing Documentation | Purpose |
|---------------|------------------------|---------|
| `/app/` | [/docs/development/](../../docs/development/) | Next.js app directory |
| `/e2e/` | [/docs/](../../docs/) - See testing | E2E tests (smoke, login, crud) |
| `/prisma/` | [/docs/database/](../../docs/database/) | Prisma schema and migrations |
| `/scripts/` | [/docs/implementation/](../../docs/implementation/) | Utility scripts |
| `/deployment/` | [/docs/deployments/](../../docs/deployments/) | Deployment configuration |
| `/docs/` | Self-documenting | Documentation itself |

## Documentation Files Created

### In `/docs/src/`
- `components/README.md` - Component architecture and organization
- `lib/README.md` - Core library modules reference
- `hooks/README.md` - React hooks documentation
- `seed-data/README.md` - Seed data modules
- `types/README.md` - Type definitions
- `styles/README.md` - Styling system
- `tests/README.md` - Testing information

### In `/docs/dbal/`
- `api/README.md` - API schemas and versioning
- `backends/README.md` - Database backend implementations
- `common/README.md` - Common utilities
- `cpp/README.md` - C++ implementation
- `ts/README.md` - TypeScript implementation
- `tools/README.md` - Development tools
- `scripts/README.md` - Automation scripts

### In `/docs/packages/`
- `admin_dialog.md` - Admin dialog package
- `dashboard.md` - Dashboard package
- `data_table.md` - Data table package
- `form_builder.md` - Form builder package
- `nav_menu.md` - Navigation menu package
- `notification_center.md` - Notification center package
- `spark-tools.md` - Spark tools package

### Updated Existing Files
- `INDEX.md` - Added new "Code-to-Documentation Mapping" section

## How to Use This Mapping

1. **Find documentation for code**: Locate your code folder in the left column, then navigate to the corresponding documentation
2. **Find code for documentation**: Locate documentation in the right column, then navigate to the corresponding code folder
3. **Keep in sync**: When adding new code folders, create corresponding documentation
4. **Update INDEX.md**: Always update the INDEX.md mapping when adding new code/docs

## Best Practices

- **Every code folder should have documentation**
- **Documentation should be at the same hierarchy level as code**
- **Use README.md for folder documentation**
- **Use specific .md files for individual package/component documentation**
- **Keep documentation updated as code changes**
- **Link between related code and docs**

## Maintenance Checklist

- [ ] All `/src/` subdirectories have corresponding `/docs/src/` documentation
- [ ] All `/dbal/` subdirectories have corresponding `/docs/dbal/` documentation
- [ ] All `/packages/` subdirectories have corresponding `/docs/packages/` documentation
- [ ] INDEX.md is updated with all mappings
- [ ] Documentation includes links to related code
- [ ] Code comments link to relevant documentation

---

**Last Updated**: December 2025
**Status**: ✅ Complete - 1:1 mapping established
