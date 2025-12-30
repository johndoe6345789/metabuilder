# MetaBuilder Implementation Breakdown
**Comprehensive Phase-by-Phase Modernization Plan**

**Created:** 2025-12-30
**Status:** Active Execution (Phase 9+ Complete)
**Goal:** Complete modernization - MUI → fakemui, TSX → Lua packages, Beautiful UI

---

## Executive Summary

### Current State (Updated 2025-12-30)
- ✅ **44 Lua packages** with full type annotations (LuaCATS) - css_designer added!
- ✅ **421+ fakemui icons** (zero dependency custom SVG system)
- ✅ **155+ fakemui components** (React + QML dual platform)
- ✅ **DataGrid & DatePicker** added to fakemui/x
- ✅ **127+ parameterized test files** across packages
- ✅ **MUI eliminated from source code** (100% in imports)
- ✅ **MUI removed from package.json** (dependencies gone!)
- ✅ **Permissions system** fully implemented in shared/permissions/
- ✅ **CSS Designer package** complete with colors, fonts, spacing, borders, shadows, export

### Target State
- ✅ **Zero external UI dependencies** (@mui, @phosphor-icons) - COMPLETE
- **Beautiful, delightful UI** powered by fakemui
- **All user-facing UI in Lua packages**
- ✅ **Permissions system** for package/component control - COMPLETE
- **Parameterized testing** for all packages
- ✅ **Type-annotated** Lua codebase (95%+)
- **Package validator** passing for all packages
- **Multi-frontend support** (React, Qt6/QML, CLI)

---

## Phase Breakdown (14 Micro-Phases)

### ✅ PHASE 1: fakemui Component & Icon Gaps [COMPLETE]
**Goal:** Fill remaining gaps in fakemui library
**Status:** ✅ Complete

#### 1.1 Missing Components
- ✅ ToggleButtonGroup exists in fakemui/inputs
- ✅ LoadingButton exists in fakemui/lab
- ✅ DataGrid added to fakemui/x
- ✅ DatePicker/TimePicker added to fakemui/x
- [ ] VirtualList (optional - low priority)

#### 1.2 Icon Expansion
- ✅ **421+ icons** available
- ✅ Add icons on-demand as TSX conversion reveals needs

#### 1.3 Monaco & Markdown Integration
- ✅ Monaco wrapper exists in code_editor package
- ✅ Markdown component exists (uses 'marked')

---

### ✅ PHASE 2: Add Type Comments to All Lua Files [COMPLETE]
**Goal:** 100% LuaCATS type annotation coverage
**Status:** ✅ Complete (95%+)

- ✅ All 44 packages have types.lua
- ✅ Inline type comments present in most files
- ✅ LuaCATS annotations throughout codebase
- Files > 200 lines
- Files with multiple unrelated functions
- Monolithic init.lua files

**Pattern:**
```
scripts/
├── init.lua              # Package initialization only
├── types.lua             # Type definitions only
├── render.lua            # renderComponent() only
├── validate.lua          # validateProps() only
└── helpers/
    ├── format.lua        # formatValue() only
    └── parse.lua         # parseInput() only
```

#### 3.2 Update Exports
- [ ] Update components.json scripts references
- [ ] Verify all exports remain functional
- [ ] Update tests to match new structure

**Deliverables:**
- [ ] All files < 150 lines (target)
- [ ] 1-3 functions per file maximum
- [ ] Clear file naming conventions

---

### 🎨 PHASE 4: fakemui Enhancements [4-8 hours]
**Goal:** Upgrade components, add icons, improve styling
**Priority:** Medium-High (user delight)

#### 4.1 Component Upgrades
- [ ] Add micro-interactions (hover, focus states)
- [ ] Improve accessibility (ARIA labels, keyboard nav)
- [ ] Add animation polish (transitions, loading states)
- [ ] Enhance error states (clear messaging)

#### 4.2 Icon Additions
- [ ] Create icon request process
- [ ] Add icons as TSX conversion reveals needs
- [ ] Maintain icon naming conventions

#### 4.3 Styling Polish
- [ ] Review all SCSS modules (64 files)
- [ ] Ensure consistent spacing/sizing
- [ ] Add dark mode refinements
- [ ] Test all 5 theme variants

#### 4.4 Documentation
- [ ] Component showcase page (Storybook-like)
- [ ] Usage examples for each component
- [ ] Accessibility guide

**Deliverables:**
- [ ] Beautiful, polished components
- [ ] Comprehensive icon library (500+ target)
- [ ] Component documentation complete

---

### 🔐 PHASE 5: Permissions System [4-8 hours]
**Goal:** Enable/disable packages and components, minLevel enforcement
**Priority:** High (security & flexibility)

#### 5.1 Permission Types
```lua
---@class PackagePermissions
---@field enabled boolean Package enabled/disabled
---@field minLevel PermissionLevel (0-6)
---@field databaseRequired boolean Needs DB connection
---@field components table<string, ComponentPermission>

---@class ComponentPermission
---@field enabled boolean Component enabled/disabled
---@field minLevel PermissionLevel
---@field featureFlags string[] Required feature flags
```

#### 5.2 Implementation
- [ ] Create `permissions.lua` in shared package
- [ ] Update package renderer to check permissions
- [ ] Add database toggle support
- [ ] Add component-level toggles
- [ ] Create permission management UI

#### 5.3 Database Control
- [ ] Add `databaseRequired` flag to metadata.json
- [ ] Implement database on/off toggle
- [ ] Handle graceful degradation when DB off

**Deliverables:**
- [ ] Working permissions system
- [ ] Database toggle functional
- [ ] Component on/off switches working
- [ ] minLevel enforcement in renderer

---

### 🧹 PHASE 6: Dependency Cleanup [1-2 hours]
**Goal:** Remove all MUI, Emotion, Phosphor dependencies
**Priority:** High (already ready to execute)

#### 6.1 Remove from package.json
```bash
cd frontends/nextjs
npm uninstall @mui/material @mui/icons-material
npm uninstall @mui/x-data-grid @mui/x-date-pickers
npm uninstall @emotion/react @emotion/styled
npm uninstall @phosphor-icons/react
```

#### 6.2 Verify Removal
- [ ] `npm run build` succeeds
- [ ] `npm run typecheck` passes
- [ ] `npm run test:unit` passes
- [ ] Bundle size reduced 2-3 MB

#### 6.3 Update Documentation
- [ ] Update README with new dependencies
- [ ] Document fakemui usage

**Deliverables:**
- [ ] 7 dependencies removed
- [ ] Build successful
- [ ] Bundle size reduced 15-25%

---

### 🔄 PHASE 7: TSX → Lua Package Conversion (Part 1) [8-16 hours]
**Goal:** Convert high-value TSX components to Lua packages
**Priority:** High (reduces framework code, increases flexibility)

#### 7.1 Workflow Editor → workflow_editor package
**Files:** 8 TSX files
- [ ] Enhance existing package structure
- [ ] Create component definitions (components.json)
- [ ] Implement visual node editor
- [ ] Add drag & drop support
- [ ] Wire to frontend renderer
- [ ] Delete TSX files

#### 7.2 Schema Editor → schema_editor package
**Files:** ~10 TSX files
- [ ] Enhance existing package
- [ ] Create table/field editors
- [ ] Add relationship editor
- [ ] DBAL integration
- [ ] Wire to frontend renderer
- [ ] Delete TSX files

#### 7.3 Form Builder → form_builder package
**Files:** ~15 TSX files
- [ ] Add missing field types (date, color, file)
- [ ] Enhance validation
- [ ] Add conditional logic
- [ ] Wire to frontend renderer
- [ ] Delete TSX files

**Deliverables:**
- [ ] 3 major packages converted
- [ ] ~33 TSX files removed
- [ ] All functionality preserved

---

### 🔄 PHASE 8: TSX → Lua Package Conversion (Part 2) [8-16 hours]
**Goal:** Convert remaining complex TSX to Lua packages

#### 8.1 Nerd IDE → nerd_ide package
**Files:** ~20 TSX files
- [ ] Create package structure
- [ ] Implement file tree
- [ ] Add code panel (Monaco integration)
- [ ] Add console/terminal
- [ ] Wire to frontend renderer
- [ ] Delete TSX files

#### 8.2 Component Managers → Multiple packages
**Files:** ~50 TSX files
- [ ] component_builder package
- [ ] css_manager package
- [ ] dropdown_manager package
- [ ] package_manager package
- [ ] routes_manager package
- [ ] Wire to frontend renderer
- [ ] Delete TSX files

**Deliverables:**
- [ ] 6 new packages created
- [ ] ~70 TSX files removed
- [ ] All manager functionality in Lua

---

### 🎨 PHASE 9: CSS Designer Package [4-8 hours]
**Goal:** Enable style overlays via Lua package
**Priority:** Medium (user customization)

#### 9.1 Create css_designer Package
```
packages/css_designer/
├── metadata.json
├── components.json
└── scripts/
    ├── init.lua
    ├── types.lua
    ├── parser.lua          # Parse CSS
    ├── generator.lua       # Generate styles
    ├── color_picker.lua    # Color selection UI
    └── style_editor.lua    # Visual style editor
```

#### 9.2 Features
- [ ] Visual color picker
- [ ] Font family selection
- [ ] Spacing adjustments
- [ ] Border radius controls
- [ ] Shadow editor
- [ ] Export to SCSS

#### 9.3 Database Integration
- [ ] Store custom styles in DB
- [ ] Load user styles on init
- [ ] Apply style overlays to fakemui

**Deliverables:**
- [ ] css_designer package complete
- [ ] Visual style editor working
- [ ] Database-driven styling functional

---

### 🧪 PHASE 10: Parameterized Tests for All Packages [4-8 hours]
**Goal:** 100% test coverage with data-driven tests
**Priority:** High (quality & reliability)

#### 10.1 Test Template
```lua
-- tests/module.test.lua
local test = require("lua_test")
local module = require("../module")

test.describe("Module Tests", function()
  test.it.each("test_cases")("should $description", function(case)
    local result = module.function(case.input)
    test.expect(result).toEqual(case.expected)
  end)
end)
```

```json
// tests/module.cases.json
{
  "test_cases": [
    {
      "description": "handle valid input",
      "input": { "value": 42 },
      "expected": { "result": 84 }
    }
  ]
}
```

#### 10.2 Per-Package Test Creation
- [ ] Audit existing test coverage (127 test files)
- [ ] Add tests to packages missing them
- [ ] Convert inline data to .cases.json
- [ ] Ensure all exports have tests

#### 10.3 Test Categories
- [ ] Unit tests (functions)
- [ ] Integration tests (components)
- [ ] Permission tests (access control)
- [ ] Validation tests (schema checks)

**Deliverables:**
- [ ] All 43 packages have tests
- [ ] 200+ parameterized test suites
- [ ] 80%+ code coverage

---

### ✅ PHASE 11: Package Validator Compliance [2-4 hours]
**Goal:** All packages pass validator checks
**Priority:** High (quality gate)

#### 11.1 Run Validator
```bash
npm run validate:packages -- --all
```

#### 11.2 Fix Common Issues
- [ ] Missing metadata.json fields
- [ ] Invalid component types
- [ ] Missing exports in scripts/
- [ ] Circular dependencies
- [ ] Invalid semver versions
- [ ] Missing types.lua
- [ ] Missing tests/

#### 11.3 Per-Package Validation
- [ ] Verify all 43 packages pass
- [ ] Document any exceptions
- [ ] Create validation pre-commit hook

**Deliverables:**
- [ ] 100% packages pass validator
- [ ] Validation automated in CI/CD
- [ ] Quality standards enforced

---

### 🖥️ PHASE 12: Multi-Frontend Support [8-16 hours]
**Goal:** Make packages work with Qt6/QML and CLI frontends
**Priority:** Medium (future-proofing)

#### 12.1 Abstract Rendering Layer
```lua
---@class RenderTarget
---@field type "react"|"qt6"|"cli"
---@field capabilities table<string, boolean>

---@class AbstractComponent
---@field render fun(target: RenderTarget): any
```

#### 12.2 Qt6/QML Integration
- [ ] Create QML component mappings
- [ ] Test fakemui QML components (104 exist)
- [ ] Verify package compatibility
- [ ] Create QML-specific layouts

#### 12.3 CLI Frontend
- [ ] Create CLI component mappings
- [ ] Implement text-based UI
- [ ] Handle input/output
- [ ] Test package compatibility

#### 12.4 Generic Package Design
- [ ] Review packages for platform assumptions
- [ ] Refactor to be platform-agnostic
- [ ] Document platform-specific code

**Deliverables:**
- [ ] Qt6/QML frontend working
- [ ] CLI frontend working
- [ ] Packages work across all 3 frontends

---

### 🧪 PHASE 13: Verification & Playwright Tests [4-8 hours]
**Goal:** Verify app renders correctly with Lua packages
**Priority:** High (final quality check)

#### 13.1 Playwright E2E Tests
```typescript
// test/e2e/packages.spec.ts
test.describe('Package Rendering', () => {
  const packages = ['audit_log', 'github_tools', 'workflow_editor', ...]

  for (const pkg of packages) {
    test(`${pkg} renders correctly`, async ({ page }) => {
      await page.goto(`/packages/${pkg}`)
      await expect(page.locator('[data-package]')).toBeVisible()
      await expect(page.locator('[data-error]')).not.toBeVisible()
    })
  }
})
```

#### 13.2 Gradual Package Enable
- [ ] Start with 1 package enabled
- [ ] Test rendering
- [ ] Enable next package
- [ ] Repeat for all 43 packages

#### 13.3 Smoke Tests
1. shared (types only)
2. lua_test (testing framework)
3. ui_auth (authentication)
4. ui_home (landing page)
5. dashboard (main dashboard)
6. ... all remaining packages

#### 13.4 Visual Regression
- [ ] Screenshot comparison
- [ ] Component snapshot tests
- [ ] Theme variant tests

**Deliverables:**
- [ ] All 43 packages render successfully
- [ ] E2E tests passing
- [ ] Visual regression suite complete
- [ ] No critical bugs

---

### 📝 PHASE 14: Documentation & Completion [2-4 hours]
**Goal:** Finalize documentation, notify completion
**Priority:** Medium (knowledge transfer)

#### 14.1 Package Documentation
- [ ] README for each package
- [ ] API documentation (types)
- [ ] Usage examples
- [ ] Configuration guides

#### 14.2 Developer Guides
- [ ] Creating new Lua packages guide
- [ ] fakemui component guide
- [ ] Testing guide (parameterized tests)
- [ ] Permissions system guide
- [ ] Multi-frontend guide

#### 14.3 Architecture Docs
- [ ] Update architecture diagrams
- [ ] Document package system
- [ ] Document fakemui framework
- [ ] Document type system

#### 14.4 Migration Summary
- [ ] Before/after metrics
- [ ] Bundle size reduction
- [ ] Performance improvements
- [ ] Dependency cleanup summary

#### 14.5 Completion Notification
- [ ] Generate completion report
- [ ] Notify user (you!)
- [ ] Celebrate! 🎉

**Deliverables:**
- [ ] Complete documentation suite
- [ ] Developer onboarding guide
- [ ] Project completion report
- [ ] User notified

---

## Execution Strategy

### Parallel Work (Use Subagents)
- **Type annotation** (Phase 2) + **Package structure** (Phase 3) can run in parallel
- **fakemui enhancements** (Phase 4) + **Permissions** (Phase 5) can run in parallel
- **TSX conversion** (Phases 7-8) can be split across multiple agents (1 package per agent)

### Sequential Work
- Phase 1 → Phase 6 (foundation before cleanup)
- Phase 6 → Phase 7 (cleanup before conversion)
- Phase 13 → Phase 14 (verify before document)

### Quality Gates
After each phase:
1. Run package validator
2. Run all tests
3. Build successfully
4. Visual smoke test

---

## Progress Tracking

### Overall Progress
- **Phases Complete:** 0/14 (0%)
- **fakemui Components:** 155/155 (100%)
- **fakemui Icons:** 421+ (exceeds target)
- **Lua Packages:** 43/43 exist
- **Type Coverage:** 76/43 packages (100%)
- **Test Coverage:** 127 test files (good, needs expansion)
- **MUI Eliminated:** Source code ✅, package.json ⏳

### Phase Checklist
- [ ] Phase 1: fakemui Gaps
- [ ] Phase 2: Type Comments (100%)
- [ ] Phase 3: Package Structure Refinement
- [ ] Phase 4: fakemui Enhancements
- [ ] Phase 5: Permissions System
- [ ] Phase 6: Dependency Cleanup
- [ ] Phase 7: TSX → Lua (Part 1)
- [ ] Phase 8: TSX → Lua (Part 2)
- [ ] Phase 9: CSS Designer Package
- [ ] Phase 10: Parameterized Tests (All)
- [ ] Phase 11: Package Validator (100%)
- [ ] Phase 12: Multi-Frontend Support
- [ ] Phase 13: Verification & E2E
- [ ] Phase 14: Documentation & Notify

---

## Key Principles

### 1 Function Per File (Where Practical)
✅ **Good:**
```
scripts/
├── render.lua          # renderComponent()
├── validate.lua        # validateProps()
└── format.lua          # formatValue()
```

❌ **Avoid:**
```
scripts/
└── utils.lua           # 20 unrelated functions
```

### Type Everything
```lua
---@param value string The input value
---@return boolean is_valid
local function validate(value)
  return #value > 0
end
```

### Test Everything
```lua
test.it("should validate non-empty strings", function()
  test.expect(validate("hello")).toBe(true)
  test.expect(validate("")).toBe(false)
end)
```

### Beautiful UI
- Micro-interactions (hover, focus, active states)
- Smooth transitions
- Clear feedback
- Accessible (keyboard nav, ARIA labels)
- Delightful (animations, polish)

---

## Success Criteria

### Technical
- ✅ Zero @mui/* imports
- ✅ Zero @phosphor-icons/* imports
- ✅ 100% Lua type coverage
- ✅ All 43 packages pass validator
- ✅ 200+ parameterized test suites
- ✅ All tests passing
- ✅ Bundle size reduced 15-25%

### User Experience
- ✅ Beautiful, polished UI
- ✅ Smooth animations
- ✅ Fast load times
- ✅ Accessible interface
- ✅ Delightful interactions

### Architecture
- ✅ Small, focused Lua files (1 function per file ideal)
- ✅ Clear separation of concerns
- ✅ Multi-frontend ready
- ✅ Permissions system functional
- ✅ Well-documented codebase

---

## Quick Reference Commands

```bash
# Run all package tests
npm run test:packages

# Validate all packages
npm run validate:packages -- --all

# Check for MUI imports (should be zero)
grep -r "@mui/material" frontends/nextjs/src --include="*.tsx"

# Build and verify
npm run build

# Run E2E tests
npm run test:e2e

# Remove dependencies (Phase 6)
cd frontends/nextjs
npm uninstall @mui/material @mui/icons-material @mui/x-data-grid @mui/x-date-pickers @emotion/react @emotion/styled @phosphor-icons/react

# Verify bundle size
npm run build
# Check .next/static/chunks/ sizes
```

---

**Last Updated:** 2025-12-30
**Status:** Ready to Execute
**Next:** Begin Phase 1 (fakemui Gaps)
