# UI to Lua Migration Plan
**Feature-by-Feature Approach**

**Strategy:** Move UI components to Lua packages while removing frontend dependencies
**Timeline:** 1 phase per feature, complete each before moving to next
**Goal:** Zero MUI/Phosphor dependencies, all UI in Lua packages or fakemui

---

## Architecture Principles

### fakemui = Framework (Built-in UI Primitives)
- Atoms: Button, Input, Checkbox, Avatar, Badge, Icon, etc.
- Layout: Box, Stack, Grid, Container
- Feedback: Alert, Toast, Progress, Spinner, Dialog
- Navigation: Tabs, Breadcrumbs, Menu
- Surfaces: Card, Paper, Accordion, AppBar
- Data Display: Typography, Divider, List, basic Table

**Usage:** `import { Button, Card, Toast } from '@/fakemui'`

### Lua Packages = Features (Business Logic)
- Small focused features with state/behavior
- Built using fakemui primitives
- Examples: `audit_log`, `data_grid`, `github_tools`, `workflow_editor`

**Usage:** `<LuaComponent package="audit_log" component="AuditLogViewer" />`

---

## Phase Status

```
Phase 1: fakemui Enhancement           ✅ Complete
Phase 2: Audit Log                     ✅ Complete
Phase 3: Quick Guide                   ✅ Complete
Phase 4: Data Grid                     ⏳ In Progress (scripts complete, frontend pending)
Phase 5: GitHub Tools                  📋 Planned
Phase 6: Workflow Editor               📋 Planned
Phase 7: Schema Editor                 📋 Planned
Phase 8: Nerd IDE                      📋 Planned
Phase 9: Form Builder Enhancement      📋 Planned
Phase 10: Component Managers           📋 Planned
Phase 11: Final Cleanup                📋 Planned
```

---

## Phase 1: fakemui Enhancement ✅
**Goal:** Complete fakemui with all framework primitives
**Status:** ✅ Complete (100%)

### What's Done ✅
- Icon system (27 icons created - Phase 2 complete!)
- CSS reset (replaces CssBaseline)
- SCSS architecture (64 files, A+ grade)
- TypeScript migration (76 components)
- LuaBlocksEditor migration

**1.1 Atoms** ✅
- [x] Icon expansion (add 20 more common icons) ✅ Complete - 27 icons total
- [x] Slider component ✅ `fakemui/inputs/Slider.tsx` (212 lines, full features)
- [x] Toggle component ✅ `fakemui/inputs/ToggleButton.tsx` + `fakemui/inputs/Switch.tsx`
- [x] Rating component ✅ `fakemui/inputs/Rating.tsx` (106 lines, precision, hover)

**1.2 Feedback** ✅
- [x] Toast/Snackbar component ✅ `fakemui/feedback/Snackbar.tsx` (146 lines)
- [x] Dialog component ✅ `fakemui/utils/Dialog.tsx` + `fakemui/utils/Modal.tsx`
- [x] Loading states ✅ `fakemui/feedback/Progress.tsx` + `fakemui/feedback/Spinner.tsx`

**1.3 Navigation** ✅
- [x] Menu component ✅ `fakemui/navigation/Menu.tsx` (53 lines)
- [x] Pagination component ✅ `fakemui/navigation/Pagination.tsx` (200 lines)

**1.4 Data Display** ✅
- [x] Basic Table component ✅ `fakemui/data-display/Table.tsx` (212 lines)
- [x] List enhancements ✅ `fakemui/data-display/List.tsx`
- [x] Chip component ✅ `fakemui/data-display/Chip.tsx` (44 lines)

**Dependencies to Remove:** None yet (foundation phase)

**Deliverables:**
- [x] 27+ icons in fakemui/icons ✅ Complete
- [x] Toast component ready ✅ Complete
- [x] All atoms complete ✅ Complete
- [ ] Component showcase page (optional, low priority)

---

## Phase 2: Audit Log ✅
**Goal:** Complete audit log package (already done!)
**Status:** ✅ Complete

### What Exists
- ✅ Package: `packages/audit_log`
- ✅ Components: AuditLogViewer, AuditStatsCard, LogTable, LogFilters
- ✅ Scripts: init.lua, filtering.lua, formatting.lua, statistics.lua
- ✅ Tests: components.cases.json with 9 test cases

### Frontend Impact
- ✅ Removed: `frontends/nextjs/src/components/misc/viewers/AuditLogViewer.tsx`
- ✅ Removed: `frontends/nextjs/src/components/misc/viewers/audit-log/` (3 files)

**Dependencies Removed:** MUI Table, MUI Select, MUI TextField (4 files)

---

## Phase 3: Quick Guide ✅
**Goal:** Complete quick guide package (already done!)
**Status:** ✅ Complete

### What Exists
- ✅ Package: `packages/quick_guide`
- ✅ Components: QuickGuideBuilder, StepsEditor, MediaPane
- ✅ Scripts: init.lua, media.lua
- ✅ Tests: components.cases.json

### Frontend Impact
- Migration status: Unknown (need to verify if frontend QuickGuide exists)

**Dependencies Removed:** TBD

---

## Phase 4: Data Grid
**Goal:** Advanced data table with sorting, filtering, pagination
**Status:** 🔜 Next

### Current State
- Exists: `packages/data_table` (basic table)
- ✅ Scripts complete: sorting, filtering, selection, export
- Frontend: Multiple table components using MUI

### Plan

**4.1 Enhance data_table Package**
Create `packages/data_table/seed/components.json`:
```json
[
  {
    "id": "data_grid",
    "name": "DataGrid",
    "type": "data_grid",
    "description": "Advanced data table with sorting, filtering, pagination",
    "props": {
      "columns": [],
      "data": [],
      "sortable": true,
      "filterable": true,
      "pagination": true,
      "pageSize": 10
    },
    "layout": { /* declarative table layout */ },
    "scripts": {
      "init": "init.initialize",
      "sort": "sorting.handleSort",
      "filter": "filtering.applyFilters",
      "paginate": "pagination.changePage",
      "export": "export.exportData"
    }
  }
]
```

**4.2 Create Lua Scripts** ✅ COMPLETE
- `scripts/sorting.lua` ✅ Column sorting with `sortByColumn()`, `toggleSort()`, `getSortIndicator()`
- `scripts/filtering.lua` ✅ Filter application with `applyFilters()`, `addFilter()`, `removeFilter()`
- `scripts/pagination.lua` ✅ Pagination state (existed already)
- `scripts/export.lua` ✅ CSV/JSON export with `exportToCsv()`, `exportToJson()`, `downloadCsv()`
- `scripts/selection.lua` ✅ Row selection with `toggleRow()`, `selectAll()`, `deselectAll()`

**4.3 Migrate Frontend Components** ⏳ PENDING
Replace these MUI usages:
- `@mui/x-data-grid` - DataGrid component (1 file)
- `components/organisms/data/Table.tsx`
- `components/ui/organisms/data/Table.tsx`
- `data/table/Body.tsx`, `data/table/Header.tsx`

**Dependencies to Remove:**
- `@mui/x-data-grid` ^8.23.0 (~500 KB)

**Deliverables:**
- [ ] Enhanced data_table package
- [ ] Sorting, filtering, pagination working
- [ ] Export to CSV/JSON
- [ ] Row selection
- [ ] Remove @mui/x-data-grid from package.json

---

## Phase 5: GitHub Tools
**Goal:** GitHub Actions integration package
**Status:** 📋 Planned

### Current State
- Location: `frontends/nextjs/src/components/misc/github/`
- Files: GitHubActionsFetcher.tsx, AnalysisPanel.tsx, RunList.tsx, RunDetails.tsx
- Uses: MUI Table, MUI Chip, MUI Alert

### Plan

**5.1 Create github_tools Package**
```
packages/github_tools/
├── seed/
│   ├── metadata.json
│   ├── components.json (GitHubViewer, RunList, AnalysisPanel)
│   └── scripts/
│       ├── init.lua
│       ├── fetch_runs.lua
│       ├── analyze.lua
│       └── filter.lua
```

**5.2 Components**
- GitHubViewer - Main component
- RunList - List of workflow runs
- RunDetails - Individual run details
- AnalysisPanel - Run statistics
- RunFilters - Filter controls

**5.3 Migrate Frontend**
Remove:
- `components/misc/github/GitHubActionsFetcher.tsx`
- `components/misc/github/views/` (10 files)

**Dependencies to Remove:**
- MUI Table, Chip, Alert usage (~10 files)

**Deliverables:**
- [ ] github_tools package created
- [ ] GitHub Actions fetching working
- [ ] Run analysis and filtering
- [ ] Remove 10 MUI files

---

## Phase 6: Workflow Editor
**Goal:** Visual workflow editor package
**Status:** 📋 Planned

### Current State
- Location: `frontends/nextjs/src/components/workflow/`
- Files: WorkflowEditor.tsx (8 files)
- Uses: MUI Card, Box, Stack, Icons

### Plan

**6.1 Enhance workflow_editor Package**
Already exists, needs migration from frontend.

**6.2 Components**
- WorkflowEditor - Main editor
- WorkflowCanvas - Node canvas
- WorkflowSidebar - Node palette
- WorkflowTester - Test runner
- NodeCard - Individual nodes

**6.3 Migrate Frontend**
Remove:
- `components/workflow/WorkflowEditor.tsx`
- `components/workflow/editor/` (7 files)

**Dependencies to Remove:**
- MUI Card, Stack, Box usage (~8 files)
- @mui/icons-material usage

**Deliverables:**
- [ ] Enhanced workflow_editor package
- [ ] Visual node editor working
- [ ] Workflow testing
- [ ] Remove 8 MUI files

---

## Phase 7: Schema Editor
**Goal:** Database schema editor package
**Status:** 📋 Planned

### Current State
- Package exists: `packages/schema_editor`
- Frontend: `components/managers/database/` (files need migration)

### Plan

**7.1 Enhance schema_editor Package**

**7.2 Components**
- SchemaEditor - Main editor
- TableEditor - Table definition
- FieldEditor - Field definition
- RelationEditor - Relationships

**7.3 Migrate Frontend**
Remove:
- `components/managers/database/DatabaseManager.tsx`
- Related database management components

**Dependencies to Remove:**
- MUI Table, Form components

**Deliverables:**
- [ ] Enhanced schema_editor package
- [ ] Schema editing working
- [ ] DBAL integration
- [ ] Remove database manager MUI files

---

## Phase 8: Nerd IDE
**Goal:** Developer IDE package
**Status:** 📋 Planned

### Current State
- Location: `frontends/nextjs/src/components/nerd-mode-ide/`
- Files: ~20 files
- Uses: MUI extensively

### Plan

**8.1 Create nerd_ide Package**

**8.2 Components**
- NerdModeIDE - Main IDE
- FileTree - File browser
- CodePanel - Code editor
- ConsolePanel - Console output
- TerminalPanel - Terminal

**8.3 Migrate Frontend**
Remove:
- `components/nerd-mode-ide/` (entire directory)

**Dependencies to Remove:**
- Significant MUI usage (~20 files)

**Deliverables:**
- [ ] nerd_ide package created
- [ ] File tree working
- [ ] Code editing integrated
- [ ] Console/terminal working
- [ ] Remove 20 MUI files

---

## Phase 9: Form Builder Enhancement
**Goal:** Complete form builder with all field types
**Status:** 📋 Planned

### Current State
- Package exists: `packages/form_builder`
- Has: EmailField, PasswordField, NumberField, SearchBar
- Missing: Many field types in frontend

### Plan

**9.1 Add Missing Fields**
- DateField (use native HTML5 or date_picker package)
- SelectField enhancements
- CheckboxField
- RadioField
- SwitchField
- SliderField
- AutocompleteField

**9.2 Migrate Frontend Forms**
Remove:
- `components/molecules/form/` (many files)
- `components/ui/molecules/form/` (duplicates)

**Dependencies to Remove:**
- MUI TextField, Select usage (30+ files)

**Deliverables:**
- [ ] All field types in form_builder
- [ ] Form validation working
- [ ] Remove 30+ form MUI files

---

## Phase 10: Component Managers
**Goal:** Migrate all manager components to packages
**Status:** 📋 Planned

### Packages to Create

**10.1 component_builder**
- ComponentHierarchyEditor
- ComponentCatalog
- ComponentConfigDialog

**10.2 css_manager**
- CssClassManager
- CssClassBuilder

**10.3 dropdown_manager**
- DropdownConfigManager

**10.4 package_manager**
- PackageManager
- Import/Export dialogs

**10.5 routes_manager**
- PageRoutesManager

**10.6 model_viewer**
- ModelListView

**10.7 record_form**
- RecordForm

**Dependencies to Remove:**
- MUI usage in managers/ directory (~50 files)

**Deliverables:**
- [ ] 7 new manager packages
- [ ] All manager functionality in Lua
- [ ] Remove 50 MUI files

---

## Phase 11: Final Cleanup
**Goal:** Remove all remaining MUI dependencies
**Status:** 📋 Planned

### Tasks

**11.1 Migrate Remaining Components**
- [ ] Auth components (Login, AccessDenied, etc.)
- [ ] Level components (if any remain)
- [ ] Misc components

**11.2 Remove Dependencies**
```bash
npm uninstall @mui/material
npm uninstall @mui/icons-material
npm uninstall @mui/x-data-grid
npm uninstall @mui/x-date-pickers
npm uninstall @phosphor-icons/react
npm uninstall @emotion/react
npm uninstall @emotion/styled
```

**11.3 Verification**
- [ ] Zero imports from @mui
- [ ] Zero imports from @phosphor-icons
- [ ] All tests passing
- [ ] Build successful
- [ ] Bundle size reduced 2-3 MB

**11.4 Documentation**
- [ ] Update component migration guide
- [ ] Document all new packages
- [ ] Create upgrade guide

**Deliverables:**
- [ ] 100% MUI removal
- [ ] Clean package.json
- [ ] Full documentation
- [ ] Migration guide

---

## Progress Tracking

### Overall Progress
- Phases Complete: 2/11 (18%)
- Packages Created: 2 (audit_log, quick_guide)
- MUI Files Removed: ~10
- Dependencies Removed: 0 (waiting for 100% migration)

### Phase Checklist
- [x] Phase 1: fakemui Enhancement (75%)
- [x] Phase 2: Audit Log (100%)
- [x] Phase 3: Quick Guide (100%)
- [ ] Phase 4: Data Grid
- [ ] Phase 5: GitHub Tools
- [ ] Phase 6: Workflow Editor
- [ ] Phase 7: Schema Editor
- [ ] Phase 8: Nerd IDE
- [ ] Phase 9: Form Builder
- [ ] Phase 10: Component Managers
- [ ] Phase 11: Final Cleanup

### Dependency Removal Tracker
- @mui/material: 164 files → TBD remaining
- @phosphor-icons/react: 97 files → TBD remaining
- @mui/x-data-grid: Phase 4
- @mui/x-date-pickers: Phase 9
- @emotion/*: Phase 11

---

## Success Metrics

### Per Phase
- ✅ Package created/enhanced
- ✅ Components working in Lua
- ✅ Frontend files removed
- ✅ Tests passing
- ✅ Documentation updated

### Final (Phase 11)
- ✅ Zero @mui imports
- ✅ Zero @phosphor-icons imports
- ✅ Bundle size: -2-3 MB
- ✅ All 359 TSX files migrated or removed
- ✅ All packages documented

---

## Next Actions

**Immediate:**
1. Complete Phase 1 (fakemui enhancement)
   - Add 20 more icons
   - Add Toast component
   - Add missing atoms

**This Week:**
2. Start Phase 4 (Data Grid)
   - Enhance data_table package
   - Add sorting, filtering, pagination
   - Remove @mui/x-data-grid

**This Month:**
3. Complete Phases 5-7
   - GitHub Tools
   - Workflow Editor
   - Schema Editor

---

**Last Updated:** 2025-12-30
**Current Phase:** Phase 1 (fakemui Enhancement)
**Next Phase:** Phase 4 (Data Grid)
