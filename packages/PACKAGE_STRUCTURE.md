# Package Structure Guide

## Quick Reference

Every MetaBuilder package follows this simple structure:

```
packages/my-package/
├── page-config/              [If package defines routes/pages]
│   ├── metadata.json
│   └── *.json                [Page configuration data]
├── workflow/                 [If package defines workflows]
│   ├── metadata.json
│   └── *.json                [Workflow definitions]
├── credential/               [If package needs API credentials]
│   ├── metadata.json
│   └── *.json                [Credential templates]
├── notification/             [If package sends notifications]
│   ├── metadata.json
│   └── *.json                [Notification templates]
├── component/                [If package defines reusable components]
│   ├── metadata.json
│   └── *.json                [Component definitions]
├── package.json              [Standard NPM package file]
├── README.md                 [Documentation]
└── ...other files...         [Source, tests, etc.]
```

## Entity Folders

Each entity folder contains:

| Folder | Purpose | When to Use |
|--------|---------|-------------|
| **page-config** | Routes/pages exposed by this package | If package has public pages/routes |
| **workflow** | Automation workflows | If package provides workflows |
| **credential** | API credentials or secrets | If package integrates with external APIs |
| **notification** | Notification templates | If package sends notifications |
| **component** | Reusable component definitions | If package defines UI components |
| **ui_component** | UI-specific components | Alternative for UI packages |

## File Organization

Inside each entity folder:

### metadata.json (Required)
Describes what's in this folder:

```json
{
  "entity": "page-config",
  "packageId": "my_package",
  "description": "Page routes defined by my_package",
  "version": "1.0.0"
}
```

### Data Files (Optional)
Named by what they define:

```
page-config/
├── metadata.json
├── home.json          [Route /my-package/home]
└── dashboard.json     [Route /my-package/dashboard]

workflow/
├── metadata.json
├── user_onboard.json  [Workflow: onboard users]
└── sync_data.json     [Workflow: sync data]

credential/
├── metadata.json
└── api_keys.json      [API credential template]
```

## Rules

1. **One folder per entity type** - Don't mix entities
2. **Only data files** - No code, scripts, or utilities
3. **Always include metadata.json** - Describes the folder
4. **Keep it minimal** - Only what the package actually needs

## Examples

### Package with Pages Only
```
packages/ui_home/
├── page-config/
│   ├── metadata.json
│   └── home.json
└── package.json
```

### Package with Multiple Entity Types
```
packages/dashboard/
├── page-config/
│   ├── metadata.json
│   └── dashboard.json
├── workflow/
│   ├── metadata.json
│   └── daily_sync.json
└── package.json
```

### Package with Just Components
```
packages/form_builder/
├── component/
│   ├── metadata.json
│   └── form_field.json
└── package.json
```

## Navigation

When you see a package folder, immediately know what it provides:

- See `page-config/` → This package defines routes
- See `workflow/` → This package provides workflows
- See `credential/` → This package needs API keys
- See `notification/` → This package sends alerts
- See `component/` → This package provides components

**No guessing. No overthinking. Just look at the folders.**

## Anti-Patterns (What NOT to Do)

```
❌ DON'T create other folders:
packages/my-package/
├── seed/              ← Put this in page-config/, workflow/, etc.
├── seeds/             ← Wrong location
├── data/              ← Wrong location
├── schemas/           ← Wrong location
└── utils/             ← Wrong location

❌ DON'T put code files here:
packages/my-package/
├── page-config/
│   ├── loader.ts      ← NO: TypeScript code
│   └── utils.js       ← NO: Utilities
```

## Adding to Your Package

To add entity data to an existing package:

1. Create the entity folder: `packages/my-package/page-config/`
2. Add metadata.json describing what's in it
3. Add data files for each entity (home.json, dashboard.json, etc.)
4. Done - the system will find and load it

See `/packages/SEED_FORMAT.md` for detailed seed data specification.

## See Also

- `/packages/SEED_FORMAT.md` - Complete seed data documentation
- `/packages/PACKAGE_AUDIT.md` - Analysis of all 51 packages
- `/dbal/shared/api/schema/entities/` - Entity definitions (source of truth)
