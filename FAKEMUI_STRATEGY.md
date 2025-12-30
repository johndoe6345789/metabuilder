# Fakemui Strategy - Zero Dependency UI System

**Created:** 2025-12-30
**Status:** Active Development
**Goal:** Complete UI independence with zero third-party UI dependencies

---

## Executive Summary

**Decision:** ✅ Full fakemui UI system
- Zero MUI dependencies
- Zero Phosphor Icons dependency
- Zero Emotion/styled-components
- Custom SVG icon system
- SCSS-based styling with CSS variables

**Bundle Size Target:** Reduce by 2-3 MB (15-25%)

---

## Architecture

```
fakemui/
├── icons/               # Custom SVG icon system (~1KB per icon)
│   ├── Icon.tsx        # Base icon component
│   ├── Plus.tsx        # Individual icon components
│   ├── Trash.tsx
│   └── ...
├── fakemui/            # React/TypeScript components
│   ├── inputs/         # Form inputs, buttons
│   ├── surfaces/       # Cards, papers, dialogs
│   ├── layout/         # Box, Stack, Grid, Container
│   ├── data-display/   # Typography, tables, lists
│   ├── feedback/       # Alerts, progress, skeletons
│   ├── navigation/     # Tabs, breadcrumbs, menus
│   ├── utils/          # Modals, portals, transitions
│   ├── atoms/          # Text, Label, Panel
│   ├── lab/            # Experimental components
│   └── x/              # Advanced components
├── styles/             # SCSS styling system
│   ├── _variables.scss # CSS custom properties
│   ├── base.scss       # Base element styles
│   ├── components.scss # Component styles
│   ├── atoms/          # Atomic component styles
│   ├── global/         # Global styles, reset
│   ├── mixins/         # Reusable SCSS mixins
│   └── themes/         # Theme variants
└── index.ts            # Barrel export

Total: ~150 components, ~80 SCSS files
```

---

## Icon Strategy

### ✅ APPROVED: Custom SVG System

**Approach:**
- Create SVG components as needed
- Source from Heroicons, Lucide, Phosphor
- ~1KB per icon (gzipped)
- Zero runtime dependencies
- Full TypeScript support

**Current Icons:**  310+ ✅✅ Far exceeds target!
**Target Phase 3:** 100+ ✅ ACHIEVED

**See:** [fakemui/icons/README.md](fakemui/icons/README.md)

---

## Component Migration Path

### From MUI → Fakemui

| MUI Component | Fakemui Replacement | Status |
|---------------|---------------------|--------|
| `@mui/material/Button` | `fakemui/inputs/Button` | ✅ Ready |
| `@mui/material/TextField` | `fakemui/inputs/TextField` | ✅ Ready |
| `@mui/material/Card` | `fakemui/surfaces/Card` | ✅ Ready |
| `@mui/material/Box` | `fakemui/layout/Box` | ✅ Ready |
| `@mui/material/Stack` | `fakemui/layout/Stack` | ✅ Ready |
| `@mui/material/Typography` | `fakemui/data-display/Typography` | ✅ Ready |
| `@mui/icons-material/*` | `fakemui/icons/*` | ✅ **130+ icons** |
| `@mui/x-data-grid` | Lua package or custom | ⏳ Planned |
| `@mui/x-date-pickers` | Native HTML5 or Lua | ⏳ Planned |

### From @mui/icons-material → Fakemui Icons

**Status: ✅ COMPLETE - All source code migrated!**

| Category | Icons Added | Examples |
|----------|-------------|----------|
| Navigation | 25+ | ChevronLeft, ChevronRight, FirstPage, LastPage, ExpandMore, ExpandLess, Menu |
| Actions | 20+ | Plus, Trash, Copy, Save, Edit, Delete, Close, Check, Clear |
| Status | 15+ | CheckCircle, ErrorOutline, WarningAmber, InfoOutlined, Cancel |
| File/Folder | 10+ | Folder, FolderOpen, File, Article, Description |
| UI Controls | 15+ | Visibility, VisibilityOff, Search, FilterList, KeyboardArrowDown |
| Media | 10+ | PlayArrow, Pause, Stop, Volume, Camera, Video |
| Social | 10+ | Email, Chat, Send, ThumbUp, ThumbDown, Share |
| Security | 8+ | Lock, LockOpen, Key, Shield, Verified |
| Components | 15+ | TableChart, GridView, ViewColumn, ViewStream, ToggleOn, Checkbox |

### From Phosphor → Fakemui

| Phosphor Icon | Fakemui Icon | Status |
|---------------|--------------|--------|
| `<Plus />` | `<Plus />` | ✅ Done |
| `<Trash />` | `<Trash />` | ✅ Done |
| `<Copy />` | `<Copy />` | ✅ Done |
| `<ArrowUp />` | `<ArrowUp />` | ✅ Done |
| `<ArrowDown />` | `<ArrowDown />` | ✅ Done |
| `<ArrowClockwise />` | `<ArrowClockwise />` | ✅ Done |
| `<FloppyDisk />` | `<FloppyDisk />` | ✅ Done |
| Others (100+) | Add as needed | ⏳ Ongoing |

---

## Styling Strategy

### CSS Variables (Theme System)

**Current:** `fakemui/styles/_variables.scss`
- 70+ CSS custom properties
- 5 theme variants (light, dark, midnight, forest, ocean)
- Runtime theme switching
- No JavaScript required

**Example:**
```scss
:root {
  --color-primary: #1976d2;
  --color-bg: #ffffff;
  --color-text: #000000;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  --spacing-md: 16px;
  --radius-md: 8px;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
}
```

### SCSS Modules

**Pattern:**
```tsx
// Component.tsx
import styles from './Component.module.scss'

export const Component = () => (
  <div className={styles.root}>
    <h2 className={styles.title}>Title</h2>
  </div>
)

// Component.module.scss
.root {
  padding: var(--spacing-md);
  background: var(--color-bg-paper);
}

.title {
  color: var(--color-text);
  font-size: var(--font-size-lg);
}
```

### Reset (Replaces CssBaseline)

**Location:** `fakemui/styles/global/_reset.scss`
- Modern CSS reset
- Typography defaults
- Form element normalization
- Focus visible styles
- Accessibility defaults

---

## Import Strategy

### Before (MUI)
```tsx
import { Button, Card, Stack, Box } from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
```

### After (Fakemui)
```tsx
import { Button, Card, Stack, Box, Plus, Trash, Edit } from '@/fakemui'
// DataGrid becomes Lua package
```

**Benefits:**
- Single import path
- No version conflicts
- Full control over API
- Tree-shakeable
- TypeScript native

---

## Lua Package Strategy

### Components → Lua Packages

**Workflow Editor:**
- Package: `@packages/workflow_editor`
- Components: WorkflowEditor, WorkflowNodeCard, WorkflowSidebar, etc.
- UI: Uses fakemui for basic components

**GitHub Viewer:**
- Package: `@packages/github_actions_viewer`
- Components: GitHubActionsFetcher, RunList, AnalysisPanel, etc.
- UI: Custom table with fakemui primitives

**Data Grid:**
- Package: `@packages/data_grid` (TBD)
- Replaces: `@mui/x-data-grid`
- Features: Sorting, filtering, pagination, virtual scrolling

**Date Picker:**
- Option 1: Native HTML5 `<input type="date">`
- Option 2: Lua package `@packages/date_picker`
- Decision: Start with native, create package if needed

---

## Migration Phases

### Phase 1: Foundation ✅ 75% Complete
- [x] Create fakemui icon system (27 icons)
- [x] Migrate LuaBlocksEditor
- [x] Enhance CSS reset
- [x] Document strategy
- [ ] Update providers (remove MUI)
- [ ] Finalize theme system

### Phase 2: Atomic Components 🚧 Ready
Target: 20 components
- Button, IconButton, Fab
- Input, Textarea, Select
- Checkbox, Radio, Switch, Slider
- Avatar, Badge, Icon, Label, Link, Text
- Skeleton, Spinner, Progress, Tooltip, Separator

### Phase 3: Molecules ⏳ Planned
Target: 18 components
- Card, Alert, Accordion
- Breadcrumb, NavGroup, NavItem, NavLink
- Dialog, DropdownMenu, Popover
- RadioGroup, Select, ToggleGroup
- Tabs components

### Phase 4: Organisms ⏳ Planned
Target: 22 components
- Navigation, Sidebar, Pagination
- AlertDialog, Command, Sheet
- Form, Table

### Phase 5: Lua Packages ⏳ Planned
- workflow_editor
- github_actions_viewer
- (others as needed)

### Phase 6: Cleanup ⏳ Planned
- Remove all MUI dependencies
- Remove Phosphor dependency
- Final verification

---

## Performance Targets

### Bundle Size
| Phase | Current | Target | Savings |
|-------|---------|--------|---------|
| Before | ~12 MB | - | - |
| After Phase 1 | ~11.5 MB | ~11.5 MB | 500 KB |
| After Phase 2 | ~11 MB | ~10.5 MB | 1.5 MB |
| After Phase 3 | ~10 MB | ~9.5 MB | 2.5 MB |

### Load Time
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s

### Runtime Performance
- Zero styled-components runtime overhead
- No Emotion runtime
- Pure CSS for styling
- Minimal JavaScript

---

## Developer Experience

### Type Safety
```tsx
import { Button, ButtonProps } from '@/fakemui'

// Full TypeScript support
const MyButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} primary />
)
```

### Customization
```tsx
// CSS variables for theming
<Button style={{ '--color-primary': 'red' }} />

// Class names for custom styling
<Button className="my-custom-button" />

// SCSS modules
<Button className={styles.customButton} />
```

### Documentation
- Component props in TypeScript
- README for icon system
- Migration guides
- Code examples

---

## Success Metrics

✅ **Technical:**
- Zero `@mui/*` imports
- Zero `@phosphor-icons/react` imports
- Zero `@emotion/*` imports
- 100% TypeScript coverage
- All tests passing
- No build errors

✅ **Performance:**
- 15-25% bundle size reduction
- Maintained or improved load times
- No visual regressions
- Accessibility maintained

✅ **Developer:**
- Simple import pattern
- Easy to extend
- Well documented
- Type-safe

---

## Risk Mitigation

### Testing Strategy
1. Unit tests for all components
2. Visual regression tests
3. Integration tests
4. E2E tests
5. Performance benchmarks

### Rollback Plan
```bash
# Create backup branch
git checkout -b mui-backup

# If issues arise
git checkout mui-backup
npm install
```

### Staged Migration
- Keep MUI installed during migration
- Migrate page by page or component by component
- Feature flags for new components
- Gradual rollout

---

## Next Actions

**Immediate:**
1. ✅ Approve icon strategy (DONE)
2. Update app providers to remove MUI
3. Start Phase 2: Atomic components

**This Week:**
1. Migrate Button component
2. Migrate Input component
3. Add 10 more icons

**This Month:**
1. Complete Phase 2 (atoms)
2. Start Phase 3 (molecules)
3. Create first Lua package

---

## References

- [MUI_ELIMINATION_PLAN.md](MUI_ELIMINATION_PLAN.md) - Detailed migration plan
- [DEPENDENCY_CLEANUP.md](DEPENDENCY_CLEANUP.md) - Package.json cleanup
- [fakemui/icons/README.md](fakemui/icons/README.md) - Icon system guide
- [fakemui/SCSS_REVIEW.md](fakemui/SCSS_REVIEW.md) - SCSS architecture review
- [fakemui/TYPESCRIPT_MIGRATION.md](fakemui/TYPESCRIPT_MIGRATION.md) - TypeScript patterns

---

**Last Updated:** 2025-12-30
**Status:** Active - Phase 1 in progress
**Next Review:** After Phase 2 completion

