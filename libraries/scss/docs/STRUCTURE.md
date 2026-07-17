# M3 Directory Structure

**Organized by implementation type** - all code preserved and well-organized

## Directory Map

```
m3/
├── react/                          # React TypeScript Components (Production)
│   └── components/                 # 145 React components + Python bindings
│       ├── atoms/                  # Basic building blocks (9)
│       ├── inputs/                 # Form controls (30)
│       ├── surfaces/               # Containers & cards (15)
│       ├── layout/                 # Grid, Flex, Box, Stack (8)
│       ├── data-display/           # Tables, Lists, Trees (26)
│       ├── feedback/               # Alerts, Progress, Snackbars (6)
│       ├── navigation/             # Tabs, Drawers, Breadcrumbs (22)
│       ├── utils/                  # Portals, Popovers, Tooltips (15)
│       ├── lab/                    # Experimental features (11)
│       ├── x/                      # Advanced components (11)
│       ├── theming/                # Theme definitions
│       ├── workflows/              # Workflow-specific components
│       └── *.py                    # Python binding implementations
│
├── qml/                            # QML Desktop Components
│   ├── components/                 # Pure QML components (104+)
│   ├── hybrid/                     # QML/JS hybrid components (legacy)
│   ├── widgets/                    # QML widget library
│   └── qmldir                      # QML module metadata
│
├── utilities/                      # Core Utilities (formerly legacy/utilities/)
│   ├── contexts/                   # React Context implementations
│   └── core/                       # Core utility functions
│
├── wip/                            # Work-In-Progress (formerly legacy/migration-in-progress/)
│   ├── styles/                     # Incomplete style migrations
│   └── utils/                      # Partially migrated utilities
│
├── icons/                          # SVG Icon Library
│   └── 421 SVG icons (organized by category)
│
├── theming/                        # Material Design 3 Theme
│   ├── theme.ts
│   ├── colors.ts
│   └── typography.ts
│
├── styles/                         # SCSS Modules
│   ├── atoms/                      # SCSS for atoms (40 files)
│   ├── components/                 # Component-specific styles
│   ├── global/                     # Global CSS baseline
│   ├── mixins/                     # Reusable mixins
│   └── _variables.scss             # Design tokens
│
├── scss/                           # SCSS Preprocessor Files
│   └── m3-scss/                    # Material Design 3 SCSS
│
├── docs/                           # Documentation
│   ├── COMPONENT_GUIDE.md
│   ├── MIGRATION_SUMMARY.md
│   ├── TYPESCRIPT_MIGRATION.md
│   ├── COMPONENT_MAPPING.md
│   ├── CODE_REVIEW.md
│   └── SCSS_REVIEW.md
│
├── index.ts                        # Main Export (307 lines)
├── index.qml                       # QML Entry Point
├── qmldir                          # QML Module Definition
├── package.json                    # NPM Package Config
├── README.md                       # Overview
└── LICENSE                         # MIT License
```

## Component Counts

| Category | Count | Location |
|----------|-------|----------|
| **React Components** | 145 | `react/components/` |
| **QML Components** | 104+ | `qml/components/` |
| **QML Hybrid** | 23 | `qml/hybrid/` |
| **SVG Icons** | 421 | `icons/` |
| **SCSS Files** | 78 | `styles/` + `scss/` |
| **Documentation Files** | 6 | `docs/` |

## Implementation Types

### 🔵 React (Production)
- **Location**: `react/components/`
- **Purpose**: Primary web UI framework
- **Status**: ✅ Active, production-ready
- **Language**: TypeScript
- **Components**: 145 organized by category
- **Contains**: React TSX + Python binding files

### 🟣 QML (Desktop)
- **Location**: `qml/`
- **Purpose**: Desktop UI for Qt applications
- **Status**: ✅ Available for desktop use
- **Language**: QML
- **Components**: 104+ QML-specific components
- **Folders**:
  - `components/` - Pure QML components (104+)
  - `hybrid/` - QML/JS hybrid components
  - `widgets/` - Widget library

### 🟢 Utilities
- **Location**: `utilities/`
- **Purpose**: Core utilities and contexts
- **Status**: ✅ Production utilities
- **Contains**:
  - React Context implementations
  - Core utility functions

### ⚙️ Work-In-Progress
- **Location**: `wip/`
- **Purpose**: Ongoing migrations and incomplete work
- **Status**: ✅ Preserved for reference
- **Contains**:
  - Partial style migrations
  - Migrated utilities

## Using Components

### For Web (React)
```typescript
// Main export with all components
import { Button, Dialog, TextField } from '@metabuilder/m3'

// Direct imports (when tree-shaking enabled)
import { Button } from '@metabuilder/m3/react/components/inputs'
```

### For Desktop (QML)
```qml
import M3 1.0

Button {
    text: "Click me"
}
```

### For Python
```python
from m3.inputs import Button
from m3.surfaces import Card
```

## File Organization Principles

1. **By Type**: React, QML, Python implementations separated
2. **By Category**: Components organized by Material Design 3 categories
3. **By Layer**: Core utilities, legacy code in separate folders
4. **By Format**: Icons, styles, docs in dedicated folders
5. **Preserved**: All code kept, nothing deleted

## Theming

Material Design 3 theme system located in:
- `theming/` - Theme configuration
- `styles/` - SCSS modules and utilities
- `react/components/theming/` - React theme setup

## Documentation

- `COMPONENT_GUIDE.md` - How to use components
- `MIGRATION_SUMMARY.md` - History of changes
- `TYPESCRIPT_MIGRATION.md` - TS migration details
- `COMPONENT_MAPPING.md` - Component index
- `CODE_REVIEW.md` - Code review findings
- `SCSS_REVIEW.md` - SCSS analysis

## Next Steps

1. **Review** - Check the new organization
2. **Build** - Test: `npm run build`
3. **Verify** - Run tests and E2E
4. **Commit** - All code now organized

---

**Last Updated**: January 23, 2026
**Status**: ✅ Fully organized, all code preserved
