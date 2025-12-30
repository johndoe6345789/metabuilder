# MetaBuilder Master Migration Plan
**Comprehensive Phased Approach to UI Independence**

**Created:** 2025-12-30
**Updated:** 2025-12-30
**Status:** Active Development - Major Progress!
**Owner:** Automated Migration System

---

## Executive Summary

| Area | Current State | Target State |
|------|---------------|--------------|
| @mui/material | ✅ **ELIMINATED from source** | ✅ Complete |
| @mui/icons-material | ✅ Eliminated from source | ✅ Complete |
| @phosphor-icons/react | In package.json | ❌ Remove from deps |
| fakemui icons | 357+ icons | ✅ Complete |
| fakemui components | ~180 components | ✅ Full MUI parity |
| Lua packages typed | ✅ All 43 packages | ✅ Complete |
| Lua packages tested | 43/43 packages | ✅ Complete |
| Dependencies | Still in package.json | Remove from package.json |
| Bundle size | Large | Will reduce 15-25% |

### Progress Today (2025-12-30)
- ✅ **100+ TSX files migrated** from @mui/material to fakemui
- ✅ **All source code MUI-free** - Zero `@mui/material` imports remain
- ✅ **Theme system converted** - CSS custom properties instead of MUI theming
- ✅ **Missing tests added** - shared, config_summary, lua_test packages
- ✅ **ToggleButtonGroup enhanced** - Full value management, exclusive mode
- ✅ **40+ SCSS modules created** - Converted sx props to CSS modules

---

## Phase Overview (12 Micro-Phases)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Missing Tests                                      ✅ COMPLETE   │
│   - Add tests to shared, config_summary, lua_test                          │
│   - Ensure all test files have .cases.json parameterized data              │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Fakemui Component Gaps                             ✅ COMPLETE   │
│   - Add ToggleButtonGroup wrapper                                          │
│   - Add missing utility components (VirtualList, etc.)                     │
│   - Ensure all MUI equivalents exist                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: Frontends MUI Elimination                          ✅ COMPLETE   │
│   - Migrate 100+ files from @mui/material to fakemui                       │
│   - Update workflow/* components                                           │
│   - Update ui/molecules/* components                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Fakemui Icons Expansion                            ✅ COMPLETE   │
│   - 357+ icons available                                                   │
│   - All common MUI icons covered                                           │
│   - Icon naming conventions documented                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: Package Validator Compliance                       [Hours: 2-4]   │
│   - Run validator on all 43 packages                                       │
│   - Fix any validation errors                                              │
│   - Update validator rules if needed                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 6: Lua Package Permissions System                     [Hours: 4-8]   │
│   - Add database toggle to packages                                        │
│   - Add component on/off switches                                          │
│   - Implement minLevel enforcement in renderer                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 7: CSS/Style System via Lua                           [Hours: 4-8]   │
│   - Create css_designer Lua package                                        │
│   - Enable style overlays via seed data                                    │
│   - Theme customization via database                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 8: Legacy TSX to Lua Conversion                       [Hours: 8-16]  │
│   - Convert hardcoded TSX to Lua packages                                  │
│   - Create new packages as needed                                          │
│   - Wire components to Lua renderer                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 9: Monaco/Markdown Fakemui Integration                [Hours: 4-8]   │
│   - Create Monaco wrapper in fakemui                                       │
│   - Create Markdown renderer in fakemui                                    │
│   - Reduce external dependencies                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 10: Multi-Frontend Support                            [Hours: 8-16]  │
│   - Qt6/QML powered by generic packages                                    │
│   - CLI frontend integration                                               │
│   - Abstract package rendering layer                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 11: Dependency Cleanup                                [Hours: 2-4]   │
│   - Remove @mui/* from package.json                                        │
│   - Remove @emotion/* from package.json                                    │
│   - Remove @phosphor-icons/react                                           │
│   - Verify build still works                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 12: Verification & Polish                             [Hours: 4-8]   │
│   - Playwright E2E tests                                                   │
│   - Enable packages one at a time                                          │
│   - Final cleanup and documentation                                        │
│   - Notify completion                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Missing Tests (3 packages)

### 1.1 shared package
**Status:** ❌ No tests
**Path:** `packages/shared/seed/scripts/`

```
Create:
├── tests/
│   ├── types.test.lua        # Test type definitions work
│   └── types.cases.json      # Parameterized test data
```

### 1.2 config_summary package  
**Status:** ❌ Empty tests folder
**Path:** `packages/config_summary/seed/scripts/tests/`

```
Create:
├── config.test.lua           # Test config summary functions
└── config.cases.json         # Parameterized test data
```

### 1.3 lua_test package
**Status:** ⚠️ Examples only, no formal tests/
**Path:** `packages/lua_test/seed/scripts/`

```
Create:
├── tests/
│   ├── framework.test.lua    # Test the test framework itself
│   └── framework.cases.json  # Parameterized test data
```

---

## Phase 2: Fakemui Component Gaps

### Currently Missing Components (compared to MUI)

| Component | MUI Equivalent | Priority | Status |
|-----------|----------------|----------|--------|
| ToggleButtonGroup | ToggleButtonGroup | High | ❌ Need |
| VirtualList | Virtuoso/react-window | Medium | ❌ Need |
| TransferList | TransferList | Low | Optional |
| DataGrid | @mui/x-data-grid | Medium | Lua pkg |
| DesktopDatePicker | @mui/x-date-pickers | Done | ✅ |
| Masonry | Masonry | Low | Optional |
| LoadingButton | LoadingButton | Medium | ❌ Need |

### Components to Add

```typescript
// fakemui/inputs/ToggleButtonGroup.tsx
// fakemui/inputs/LoadingButton.tsx
// fakemui/data-display/VirtualList.tsx
```

---

## Phase 3: Frontends MUI Elimination

### Files Still Using @mui/material (20+ files)

#### Workflow Components (6 files)
- [ ] `workflow/WorkflowEditor.tsx`
- [ ] `workflow/WorkflowRunCard.tsx`
- [ ] `workflow/WorkflowRunStatus.tsx`
- [ ] `workflow/editor/WorkflowSidebar.tsx`
- [ ] `workflow/editor/WorkflowTester.tsx`

#### UI Molecules (14+ files)
- [ ] `ui/molecules/selection/ToggleGroup.tsx`
- [ ] `ui/molecules/selection/Select.tsx`
- [ ] `ui/molecules/selection/RadioGroup.tsx`
- [ ] `ui/molecules/overlay/DropdownMenu.tsx`
- [ ] `ui/molecules/overlay/DropdownMenu/MenuItem.tsx`
- [ ] `ui/molecules/overlay/Popover.tsx`
- [ ] `ui/molecules/overlay/Tooltip.tsx`
- [ ] `ui/molecules/overlay/Dialog.tsx`
- [ ] `ui/molecules/display/Card.tsx`
- [ ] `ui/molecules/display/Alert.tsx`
- [ ] `ui/molecules/tabs/core/Tabs.tsx`
- [ ] `ui/molecules/tabs/components/TabsContent.tsx`

#### Library Files
- [ ] `lib/lua/ui/generate-component-tree.tsx`

---

## Phase 4: Icon Expansion

### Target Icons to Add
Based on common MUI icons not yet in fakemui:

```
Editor:
- [ ] Spellcheck ✅
- [ ] Superscript ✅
- [ ] Subscript ✅

Status:
- [ ] HourglassEmpty ✅
- [ ] HourglassFull ✅
- [ ] Pending ✅
- [ ] PendingActions ✅
- [ ] PublishedWithChanges ✅

Charts:
- [ ] DonutLarge ✅
- [ ] DonutSmall ✅
- [ ] StackedBarChart ✅
- [ ] StackedLineChart ✅
- [ ] TrendDown ✅
- [ ] TrendingFlat ✅

Communication:
- [ ] Forum ✅
- [ ] Comment ✅
- [ ] CommentOutlined ✅
- [ ] Announcement ✅
- [ ] Campaign ✅
```

**Note:** Many of these may already exist - audit needed.

---

## Phase 5: Package Validator Compliance

### Validation Checklist Per Package

```bash
# Run validator
npm run validate:packages

# Expected checks:
✓ Valid metadata.json with required fields
✓ components.json array structure  
✓ All exported scripts exist
✓ All component types are valid
✓ No circular dependencies
✓ Version follows semver
✓ minLevel in valid range (0-6)
✓ types.lua present
✓ Test files present
```

---

## Phase 6: Lua Package Permissions System

### Permission Configuration Schema

```lua
---@class PackagePermissions
---@field minLevel PermissionLevel Minimum level to access package
---@field databaseRequired boolean Whether package needs database
---@field components table<string, ComponentPermission> Per-component permissions

---@class ComponentPermission
---@field enabled boolean Whether component is enabled
---@field minLevel PermissionLevel Minimum level for this component
---@field featureFlags string[] Required feature flags
```

### Implementation Plan

1. Add `permissions.lua` to shared package
2. Update renderer to check permissions before rendering
3. Add database toggle support
4. Add component-level on/off switches

---

## Phase 7: CSS/Style System via Lua

### css_designer Package Structure

```
packages/css_designer/
├── seed/
│   ├── metadata.json
│   ├── components.json
│   └── scripts/
│       ├── init.lua
│       ├── types.lua
│       ├── parser/
│       │   └── css_parser.lua
│       ├── generator/
│       │   └── style_generator.lua
│       └── ui/
│           ├── color_picker.lua
│           └── style_editor.lua
```

---

## Phase 8: Legacy TSX to Lua Conversion

### High-Priority Conversions

| TSX Component | Target Lua Package | Status |
|---------------|-------------------|--------|
| WorkflowEditor | workflow_editor | ⏳ |
| GitHubActionsFetcher | github_tools | ✅ Package exists |
| SchemaEditor | schema_editor | ✅ Package exists |
| FormBuilder | form_builder | ✅ Package exists |

---

## Phase 9: Monaco/Markdown Fakemui

### Monaco Wrapper

```typescript
// fakemui/editors/MonacoEditor.tsx
// Wrapper around @monaco-editor/react with fakemui styling
```

### Markdown Component

```typescript
// fakemui/data-display/Markdown.tsx ✅ Already exists!
// Uses 'marked' library internally
```

---

## Phase 10: Multi-Frontend Support

### Abstract Rendering Layer

```lua
---@class RenderTarget
---@field type "react"|"qt6"|"cli" Target platform
---@field capabilities table<string, boolean> Available features

---@class AbstractComponent
---@field render fun(target: RenderTarget): any Platform-specific render
```

---

## Phase 11: Dependency Cleanup

### Dependencies to Remove

```json
{
  "remove": [
    "@emotion/react",
    "@emotion/styled", 
    "@mui/material",
    "@mui/icons-material",
    "@mui/x-data-grid",
    "@mui/x-date-pickers",
    "@phosphor-icons/react"
  ]
}
```

### Estimated Savings
- Bundle size: -2-3 MB
- Build time: -10-20%
- Dependency tree: -50+ packages

---

## Phase 12: Verification

### Playwright E2E Tests

```typescript
// Test each package renders correctly
test.describe('Package Rendering', () => {
  for (const pkg of packages) {
    test(`${pkg.name} renders`, async ({ page }) => {
      await page.goto(`/packages/${pkg.name}`)
      await expect(page.locator('[data-package]')).toBeVisible()
    })
  }
})
```

### Smoke Test Order

1. ✅ shared (types only)
2. ✅ lua_test (testing framework)
3. ui_auth (authentication)
4. ui_home (landing page)
5. dashboard (main dashboard)
6. ... remaining packages

---

## Tracking

### Daily Progress Log

| Date | Phase | Tasks Completed | Notes |
|------|-------|-----------------|-------|
| 2025-12-30 | Planning | Created master plan | - |

### Completion Criteria

- [ ] All 43 packages pass validator
- [ ] All 43 packages have tests
- [ ] Zero @mui/* imports in codebase
- [ ] Zero @phosphor-icons imports
- [ ] Playwright E2E tests pass
- [ ] Bundle size reduced by 15%+
- [ ] User notified of completion

---

## Quick Reference Commands

```bash
# Run all package tests
npm run test:packages

# Validate all packages
npm run validate:packages

# Check for MUI imports
grep -r "@mui/material" frontends/nextjs/src --include="*.tsx"

# Build and verify
npm run build

# Run E2E tests
npm run test:e2e
```
