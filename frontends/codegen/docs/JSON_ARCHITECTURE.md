# JSON-First Architecture

## Overview

This low-code platform uses a **JSON-first architecture** where the entire application is defined declaratively in JSON, eliminating React boilerplate and enabling visual editing, version control, and runtime customization.

## Core Principles

### 1. Everything is JSON
- **Pages**: All 35 application pages defined in JSON schemas
- **Components**: Atomic design library (atoms, molecules, organisms) in JSON
- **Themes**: Complete theming system configurable via JSON
- **Data**: State, bindings, and data sources declared in JSON
- **Actions**: Event handlers and side effects defined in JSON

### 2. Composition via $ref
JSON files reference each other using JSON Schema `$ref`:
```json
{
  "id": "dashboard",
  "components": [
    { "$ref": "./molecules/dashboard-header.json" },
    { "$ref": "./molecules/stats-grid.json" }
  ]
}
```

### 3. One Definition Per File
Following single-responsibility principle:
- 1 function per TypeScript file
- 1 type per TypeScript file
- 1 component definition per JSON file
- Compose larger structures via $ref

## Architecture Layers

```
┌─────────────────────────────────────┐
│      pages.json (35 pages)          │  ← Router configuration
└──────────────┬──────────────────────┘
               │ references
┌──────────────▼──────────────────────┐
│   Page Schemas (55 .json files)    │  ← Page definitions
└──────────────┬──────────────────────┘
               │ compose via $ref
┌──────────────▼──────────────────────┐
│   Organisms (8 .json files)         │  ← Complex layouts
└──────────────┬──────────────────────┘
               │ compose via $ref
┌──────────────▼──────────────────────┐
│   Molecules (23 .json files)        │  ← Composed components
└──────────────┬──────────────────────┘
               │ compose via $ref
┌──────────────▼──────────────────────┐
│     Atoms (23 .json files)          │  ← Base components
└──────────────┬──────────────────────┘
               │ reference
┌──────────────▼──────────────────────┐
│  React Components (68 .tsx)         │  ← Implementation
│  Component Registry (100+ mapped)   │
└─────────────────────────────────────┘
```

## File Structure

```
src/config/pages/
├── atoms/              # 23 base components
│   ├── button-primary.json
│   ├── heading-1.json
│   ├── text-muted.json
│   └── ...
├── molecules/          # 23 composed components
│   ├── dashboard-header.json
│   ├── stats-grid.json
│   ├── stat-card-base.json
│   └── ...
├── organisms/          # 8 complex layouts
│   ├── app-header.json
│   ├── navigation-menu.json
│   └── ...
├── layouts/           # Layout templates
│   └── single-column.json
├── data-sources/      # Data source templates
│   └── kv-storage.json
└── *.json             # 55 page schemas
    ├── dashboard-simple.json
    ├── settings-page.json
    └── ...
```

## JSON Schema Features

### Page Schema
```json
{
  "$schema": "./schema/page-schema.json",
  "id": "dashboard-simple",
  "name": "Project Dashboard",
  "description": "Overview of your project",
  "icon": "ChartBar",
  "layout": {
    "$ref": "./layouts/single-column.json"
  },
  "dataSources": [
    {
      "id": "projectStats",
      "$ref": "./data-sources/kv-storage.json",
      "key": "project-stats",
      "defaultValue": { "files": 0, "models": 0 }
    }
  ],
  "components": [
    { "$ref": "./molecules/dashboard-header.json" },
    { "$ref": "./molecules/stats-grid.json" }
  ]
}
```

### Data Binding
```json
{
  "id": "files-value",
  "type": "div",
  "props": {
    "className": "text-2xl font-bold",
    "children": "0"
  },
  "dataBinding": {
    "source": "projectStats",
    "path": "files"
  }
}
```

### Actions
```json
{
  "type": "Button",
  "events": [
    {
      "event": "onClick",
      "actions": [
        {
          "type": "setState",
          "target": "selectedTab",
          "value": "colors"
        },
        {
          "type": "toast",
          "title": "Tab changed",
          "variant": "success"
        }
      ]
    }
  ]
}
```

### Conditionals
```json
{
  "type": "div",
  "conditional": {
    "source": "customColorCount",
    "operator": "eq",
    "value": 0
  },
  "children": [
    { "type": "p", "children": "No custom colors" }
  ]
}
```

## Theming System

### JSON Theme Definition
The entire theming system is JSON-based (theme.json):

```json
{
  "sidebar": {
    "width": "16rem",
    "backgroundColor": "oklch(0.19 0.02 265)",
    "foregroundColor": "oklch(0.95 0.01 265)"
  },
  "colors": {
    "primary": "oklch(0.58 0.24 265)",
    "accent": "oklch(0.75 0.20 145)",
    "background": "oklch(0.15 0.02 265)"
  },
  "typography": {
    "fontFamily": {
      "body": "'IBM Plex Sans', sans-serif",
      "heading": "'JetBrains Mono', monospace"
    }
  },
  "spacing": {
    "radius": "0.5rem"
  }
}
```

### Runtime Theme Editing
Users can create theme variants and customize colors/fonts via JSON:

```json
{
  "activeVariantId": "dark",
  "variants": [
    {
      "id": "dark",
      "name": "Dark Mode",
      "colors": {
        "primary": "#7c3aed",
        "secondary": "#38bdf8",
        "customColors": {
          "success": "#10b981",
          "warning": "#f59e0b"
        }
      }
    }
  ]
}
```

## Data Sources

### KV Storage
```json
{
  "id": "userData",
  "type": "kv",
  "key": "user-settings",
  "defaultValue": { "theme": "dark" }
}
```

### Computed Sources
```json
{
  "id": "totalFiles",
  "type": "computed",
  "compute": "(data) => data.files.length",
  "dependencies": ["files"]
}
```

### Static Sources
```json
{
  "id": "tabs",
  "type": "static",
  "defaultValue": ["colors", "typography", "preview"]
}
```

## Benefits Over Traditional React

### Traditional React Component (~50 lines)
```tsx
import { useState } from 'react'
import { Card } from '@/components/ui/card'

interface DashboardProps {
  initialData?: { files: number }
}

export function Dashboard({ initialData }: DashboardProps) {
  const [stats, setStats] = useState(initialData || { files: 0 })

  return (
    <div className="p-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <Card className="p-6">
        <div className="text-2xl font-bold">{stats.files}</div>
        <div className="text-sm text-muted">Files</div>
      </Card>
    </div>
  )
}
```

### JSON Equivalent (~15 lines)
```json
{
  "id": "dashboard",
  "dataSources": [
    { "id": "stats", "type": "kv", "key": "stats" }
  ],
  "components": [
    { "$ref": "./molecules/dashboard-header.json" },
    {
      "$ref": "./molecules/stat-card.json",
      "dataBinding": { "source": "stats", "path": "files" }
    }
  ]
}
```

## Eliminated Boilerplate

✅ **No imports** - Components referenced by type string
✅ **No TypeScript interfaces** - Types inferred from registry
✅ **No useState/useEffect** - State declared in dataSources
✅ **No event handlers** - Actions declared in events array
✅ **No prop drilling** - Data binding handles it
✅ **No component exports** - Automatic via registry
✅ **No JSX nesting** - Flat JSON structure with $ref

## Coverage Statistics

- **35/35 pages** use JSON schemas (100%)
- **0/35 pages** use React component references
- **109 JSON component files** created
  - 23 atoms
  - 23 molecules
  - 8 organisms
  - 55 page schemas
- **68 React components** remain as implementation layer

## Potential Cleanup Targets

### Deprecated Files (Safe to Remove)
- `src/config/default-pages.json` - Replaced by pages.json
- `src/config/json-demo.json` - Old demo file
- `src/config/template-ui.json` - Replaced by JSON schemas

### Keep (Still Used)
- `src/config/pages.json` - Active router configuration
- `theme.json` - Active theming system
- `src/config/feature-toggle-settings.json` - Feature flags
- All JSON schemas in `src/config/pages/`

## Best Practices

### 1. Atomic Granularity
Break components into smallest reusable units:
```
❌ dashboard.json (monolithic)
✅ dashboard-header.json + stats-grid.json + stat-card.json
```

### 2. $ref Composition
Always compose via references, never inline:
```json
❌ { "type": "div", "children": [ ... 50 lines ... ] }
✅ { "$ref": "./molecules/complex-section.json" }
```

### 3. Single Responsibility
One purpose per JSON file:
```
✅ stat-card-base.json (template)
✅ stat-card-files.json (specific instance)
✅ stat-card-models.json (specific instance)
```

### 4. Descriptive IDs
Use semantic IDs that describe purpose:
```json
{ "id": "dashboard-header" }      // ✅ Good
{ "id": "div-1" }                 // ❌ Bad
```

## Future Enhancements

- [ ] Visual JSON editor for drag-and-drop page building
- [ ] Theme marketplace with sharable JSON themes
- [ ] Component library with searchable JSON snippets
- [ ] JSON validation and IntelliSense in VSCode
- [ ] Hot-reload JSON changes without app restart
- [ ] A/B testing via JSON variant switching
- [ ] Multi-tenant customization via tenant-specific JSONs

## Conclusion

This JSON-first architecture transforms React development from code-heavy to configuration-driven, enabling:
- **Visual editing** without touching code
- **Version control** friendly (JSON diffs)
- **Runtime customization** (load different JSONs)
- **Non-developer accessibility** (JSON is readable)
- **Rapid prototyping** (compose existing pieces)
- **Consistent patterns** (enforced by schema)

All without sacrificing the power of React when you need it - complex interactive components can still be written in React and referenced from JSON.
