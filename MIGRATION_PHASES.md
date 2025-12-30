# MetaBuilder Migration Phases
**Master Plan for UI Migration & Package Enhancement**

**Created:** 2025-12-30
**Updated:** 2025-12-30
**Status:** Active - Phase 1 & 2 In Progress
**Goal:** Complete migration to fakemui + Lua packages, eliminate dependencies

---

## Executive Summary

| Goal | Current State | Target |
|------|---------------|--------|
| @mui/material | In use | ❌ Removed |
| @mui/icons-material | ✅ Eliminated from source | ✅ Complete |
| @phosphor-icons/react | In package.json | ❌ Removed |
| fakemui icons | 357+ icons | 400+ icons |
| fakemui components | ~155 (TreeView added) | 200+ (full MUI parity) |
| Lua packages typed | 16+ packages | All packages |
| Lua packages tested | 20+ packages | All packages |
| TSX to Lua conversion | ~40% | 95% |

### Recent Progress (2025-12-30)
- ✅ Created types.lua for: admin_dialog, form_builder, schema_editor, data_table, nav_menu, dashboard, workflow_editor, stats_grid
- ✅ Added 25+ new fakemui icons (formatting, charts, communication, status)
- ✅ Added TreeView component to fakemui/data-display
- ✅ Updated fakemui/icons/index.ts with all new exports


---

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Foundation Enhancement          [Week 1]              │
│   - Add missing fakemui icons                                   │
│   - Add missing fakemui components                              │
│   - Create Monaco/Markdown fakemui components                   │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 2: Lua Package Types              [Week 1-2]             │
│   - Add LuaCATS annotations to all packages                     │
│   - Create types.lua for each package                           │
│   - Cross-reference with shared/types/                          │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 3: Parameterized Tests            [Week 2]               │
│   - Add .test.lua and .cases.json to all packages               │
│   - Use lua_test framework                                      │
│   - Achieve 80%+ coverage                                       │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 4: Package Validator Compliance   [Week 2-3]             │
│   - Run package_validator on all packages                       │
│   - Fix any validation errors                                   │
│   - Update validator if needed                                  │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 5: TSX to Lua Conversion          [Week 3-4]             │
│   - Convert hardcoded TSX components to Lua                     │
│   - Create new packages as needed                               │
│   - Remove MUI imports                                          │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 6: Dependency Cleanup             [Week 4]               │
│   - Remove @mui/* from package.json                             │
│   - Remove @emotion/* from package.json                         │
│   - Remove @phosphor-icons/react                                │
│   - Verify app still renders                                    │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 7: Permission System              [Week 5]               │
│   - Add database toggle to packages                             │
│   - Add component on/off switches                               │
│   - Implement minLevel enforcement                              │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 8: Style System                   [Week 5-6]             │
│   - Create CSS designer Lua package                             │
│   - Enable style overlays via seed data                         │
│   - Theme customization via database                            │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 9: Multi-Frontend Support         [Week 6-7]             │
│   - QT6/QML powered by packages                                 │
│   - CLI frontend integration                                    │
│   - Abstract package rendering                                  │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 10: Verification & Polish         [Week 7-8]             │
│   - Playwright E2E tests                                        │
│   - Enable packages one at a time                               │
│   - Final cleanup and documentation                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation Enhancement

### 1.1 Missing fakemui Icons
Add icons that may still be needed:

**Editor Icons:**
- [ ] Spellcheck, FormatClear, FormatIndentIncrease, FormatIndentDecrease
- [ ] FormatAlignCenter, FormatAlignRight, FormatAlignJustify
- [ ] Superscript, Subscript, Strikethrough

**Data/Chart Icons:**
- [ ] TrendDown, TrendingFlat
- [ ] DonutLarge, DonutSmall
- [ ] StackedBarChart, StackedLineChart

**Communication:**
- [ ] Forum, Comment, CommentOutlined
- [ ] Announcement, Campaign

**Status/Progress:**
- [ ] HourglassEmpty, HourglassFull
- [ ] Pending, PendingActions
- [ ] PublishedWithChanges

### 1.2 Missing fakemui Components

**Layout:**
- [ ] AspectRatio (maintains aspect ratio)
- [ ] Center (centers content)
- [ ] Spacer (flexible space)

**Inputs:**
- [ ] SearchInput (input with search icon)
- [ ] PasswordInput (with visibility toggle)
- [ ] TagInput (multiple tags)
- [ ] Autocomplete (suggestions)

**Data Display:**
- [ ] DataList (definition lists)
- [ ] Timeline (event timeline)
- [ ] TreeView (hierarchical tree)
- [ ] VirtualList (virtualized rendering)

**Advanced:**
- [ ] Monaco (code editor wrapper)
- [ ] MarkdownRenderer (markdown display)
- [ ] RichTextEditor (WYSIWYG editor)

### 1.3 Component Gaps Checklist

| Component | fakemui | MUI Equivalent | Status |
|-----------|---------|----------------|--------|
| Autocomplete | ❌ | Autocomplete | Needed |
| TreeView | ❌ | TreeView | Needed |
| Stepper | ❌ | Stepper | Needed |
| SpeedDial | ❌ | SpeedDial | Optional |
| Backdrop | ❌ | Backdrop | Needed |
| ClickAwayListener | ❌ | ClickAwayListener | Needed |
| Popper | ❌ | Popper | Needed |
| Transition | ✅ | Transition | Complete |

---

## Phase 2: Lua Package Type Annotations

### Packages Needing Types

| Package | types.lua | Status |
|---------|-----------|--------|
| admin_dialog | ❌ | Needed |
| arcade_lobby | ❌ | Needed |
| audit_log | ✅ | Complete |
| codegen_studio | ❌ | Needed |
| code_editor | ✅ | Complete |
| config_summary | ❌ | Needed |
| dashboard | ❌ | Needed |
| data_table | ❌ | Needed |
| dbal_demo | ✅ | Complete |
| form_builder | ❌ | Needed |
| forum_forge | ✅ | Complete |
| github_tools | ✅ | Complete |
| irc_webchat | ✅ | Complete |
| lua_test | ✅ | Complete |
| media_center | ✅ | Complete |
| nav_menu | ❌ | Needed |
| notification_center | ✅ | Complete |
| package_validator | ✅ | Complete |
| quick_guide | ❌ | Needed |
| role_editor | ❌ | Needed |
| schema_editor | ❌ | Needed |
| screenshot_analyzer | ✅ | Complete |
| shared | ✅ | Complete |
| smtp_config | ❌ | Needed |
| social_hub | ✅ | Complete |
| stats_grid | ❌ | Needed |
| stream_cast | ✅ | Complete |
| ui_* (all) | ✅ | Complete |
| user_manager | ❌ | Needed |
| workflow_editor | ❌ | Needed |

---

## Phase 3: Parameterized Tests

### Test Structure Pattern
```
package/seed/scripts/tests/
├── {module}.test.lua      # Test definitions
└── {module}.cases.json    # Test parameters
```

### Example Test Pattern (from lua_test)
```lua
---@param case table Test case data
---@field input any Input value
---@field expected any Expected output
local function testCase(case)
  local result = functionUnderTest(case.input)
  expect(result).toEqual(case.expected)
end

describe("Module Tests", function()
  it.each(testCases)("should handle $description", testCase)
end)
```

### Packages Needing Tests

| Package | Test Files | Status |
|---------|------------|--------|
| admin_dialog | ❌ | Needed |
| config_summary | ❌ | Needed |
| dashboard | ❌ | Needed |
| data_table | ❌ | Needed |
| form_builder | ❌ | Needed |
| nav_menu | ❌ | Needed |
| quick_guide | ❌ | Needed |
| role_editor | ❌ | Needed |
| schema_editor | ❌ | Needed |
| smtp_config | ❌ | Needed |
| stats_grid | ❌ | Needed |
| user_manager | ❌ | Needed |
| workflow_editor | ❌ | Needed |

---

## Phase 4: Package Validator Compliance

### Validation Rules (from package_validator)
1. ✅ Valid metadata.json with required fields
2. ✅ components.json array structure
3. ✅ All exported scripts exist
4. ✅ All component types are valid
5. ✅ No circular dependencies
6. ✅ Version follows semver
7. ✅ minLevel in valid range (0-6)

### Run Command
```bash
npm run package:validate -- --all
```

---

## Phase 5: TSX to Lua Conversion

### Priority Order
1. **Viewers** - Read-only data display (easiest)
2. **Editors** - Form-based editing
3. **Complex** - Multi-step workflows

### Files to Convert
See MUI_ELIMINATION_PLAN.md for full list (~160 files)

---

## Phase 6: Dependency Cleanup

### Dependencies to Remove
```json
{
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@mui/icons-material": "^7.3.6",
  "@mui/material": "^7.3.6",
  "@mui/x-data-grid": "^8.23.0",
  "@mui/x-date-pickers": "^8.23.0",
  "@phosphor-icons/react": "^2.1.10"
}
```

### Estimated Savings
- Bundle size: -2-3 MB
- Install time: -30 seconds
- Build time: -15%

---

## Phase 7: Permission System

### Package-Level Permissions
```json
{
  "permissions": {
    "minLevel": 3,
    "requiresDatabase": true,
    "features": {
      "editing": { "minLevel": 4 },
      "deleting": { "minLevel": 5 },
      "admin": { "minLevel": 6 }
    }
  }
}
```

### Component Toggle System
```lua
-- In package init.lua
local enabled_components = config.get("enabled_components", {})

function is_enabled(component_id)
  return enabled_components[component_id] ~= false
end
```

---

## Phase 8: Style System

### CSS Designer Package
```
packages/css_designer/
├── seed/
│   ├── metadata.json
│   ├── components.json
│   └── scripts/
│       ├── init.lua
│       ├── theme_manager.lua
│       ├── color_picker.lua
│       ├── variable_editor.lua
│       └── preview.lua
```

### Theme Override Structure
```lua
---@class ThemeOverride
---@field primary_color string
---@field secondary_color string
---@field background_color string
---@field text_color string
---@field border_radius string
---@field font_family string
```

---

## Phase 9: Multi-Frontend Support

### Package Rendering Abstraction
```lua
---@class RenderTarget
---@field type "react" | "qml" | "cli"
---@field capabilities table<string, boolean>

---@param target RenderTarget
---@param component UIComponent
---@return string Rendered output
function render(target, component)
  if target.type == "react" then
    return render_react(component)
  elseif target.type == "qml" then
    return render_qml(component)
  elseif target.type == "cli" then
    return render_cli(component)
  end
end
```

---

## Phase 10: Verification

### E2E Test Plan
1. Enable one package at a time
2. Run Playwright tests
3. Check for visual regressions
4. Verify functionality
5. Document any issues

### Success Criteria
- [ ] All packages pass validation
- [ ] All packages have types
- [ ] All packages have tests
- [ ] Zero MUI imports in codebase
- [ ] App renders correctly
- [ ] E2E tests pass

---

## Progress Tracking

### Weekly Updates
- **Week 1:** Phase 1-2
- **Week 2:** Phase 2-4
- **Week 3:** Phase 4-5
- **Week 4:** Phase 5-6
- **Week 5:** Phase 6-7
- **Week 6:** Phase 7-8
- **Week 7:** Phase 8-9
- **Week 8:** Phase 9-10

### Completion Notification
When all phases complete, create `MIGRATION_COMPLETE.md` with:
- Summary of changes
- Performance metrics
- Breaking changes
- Upgrade guide
