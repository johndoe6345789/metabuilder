# 1:1 Code-to-Documentation Quick Reference

## Find Documentation for Your Code

**I'm working in `/src/components/`**
→ Documentation: [/docs/src/components/](/docs/src/components/README.md)

**I'm working in `/src/lib/`**
→ Documentation: [/docs/src/lib/](/docs/src/lib/README.md)

**I'm working in `/dbal/production/`**
→ Documentation: [/docs/dbal/production/](/docs/dbal/production/README.md)

**I'm working in `/dbal/shared/backends/`**
→ Documentation: [/docs/dbal/shared/backends/](/docs/dbal/shared/backends/README.md)

**I'm working in `/packages/form_builder/`**
→ Documentation: [/docs/packages/form_builder.md](/docs/packages/form_builder.md)

## Document Structure

```
/workspaces/metabuilder/
├── /src/                    Code
│   ├── components/          ↔️  /docs/src/components/README.md
│   ├── lib/                 ↔️  /docs/src/lib/README.md
│   ├── hooks/               ↔️  /docs/src/hooks/README.md
│   ├── seed-data/           ↔️  /docs/src/seed-data/README.md
│   ├── types/               ↔️  /docs/src/types/README.md
│   ├── styles/              ↔️  /docs/src/styles/README.md
│   └── tests/               ↔️  /docs/src/tests/README.md
│
├── /dbal/                   Code
│   ├── api/                 ↔️  /docs/dbal/shared/api/README.md
│   ├── backends/            ↔️  /docs/dbal/shared/backends/README.md
│   ├── common/              ↔️  /docs/dbal/shared/common/README.md
│   ├── cpp/                 ↔️  /docs/dbal/production/README.md
│   ├── ts/                  ↔️  /docs/dbal/development/README.md
│   ├── tools/               ↔️  /docs/dbal/shared/tools/README.md
│   └── scripts/             ↔️  /docs/dbal/shared/scripts/README.md
│
└── /packages/               Code
    ├── admin_dialog/        ↔️  /docs/packages/admin_dialog.md
    ├── dashboard/           ↔️  /docs/packages/dashboard.md
    ├── data_table/          ↔️  /docs/packages/data_table.md
    ├── form_builder/        ↔️  /docs/packages/form_builder.md
    ├── nav_menu/            ↔️  /docs/packages/nav_menu.md
    ├── notification_center/ ↔️  /docs/packages/notification_center.md
    └── spark-tools/         ↔️  /docs/packages/spark-tools.md
```

## Rules for Maintaining Mapping

1. **Creating New Code Folder**
   ```
   /src/new_feature/  ← Create corresponding → /docs/src/new_feature/README.md
   /dbal/new_module/  ← Create corresponding → /docs/dbal/new_module/README.md
   /packages/feature/ ← Create corresponding → /docs/packages/feature.md
   ```

2. **Moving/Renaming Code**
   - Update code path
   - Update documentation path
   - Update all cross-references in INDEX.md and CODE_DOCS_MAPPING.md

3. **Deleting Code**
   - Delete corresponding documentation
   - Remove entries from INDEX.md and CODE_DOCS_MAPPING.md

## Reference Documents

- [CODE_DOCS_MAPPING.md](/docs/CODE_DOCS_MAPPING.md) - Complete mapping with tables
- [INDEX.md](/docs/INDEX.md) - Main documentation index
- Each folder's README.md contains:
  - Overview of the code folder
  - What files it contains
  - When to use it
  - Related documentation links

## Quick Navigation

```bash
# Go to component documentation
cd /workspaces/metabuilder/docs/src/components

# Go to DBAL documentation
cd /workspaces/metabuilder/docs/dbal

# Go to package documentation
cd /workspaces/metabuilder/docs/packages

# View mapping
cat /workspaces/metabuilder/docs/CODE_DOCS_MAPPING.md
```

---

**Principle**: Every code folder should have exactly one corresponding documentation location.
