# FakeMUI Icons Integration Guide

This document describes how to use fakemui icons in Lua packages declaratively.

## Overview

The fakemui icon system allows Lua packages to reference icons by name without directly importing React components. Icons are resolved at render time through the component registry and icon registry.

## Architecture

### Components

1. **Icon Registry** (`frontends/nextjs/src/lib/rendering/icon-registry.ts`)
   - Maps icon names to fakemui icon components
   - Provides alias resolution for common icon names
   - Supports case-insensitive lookups

2. **Component Registry** (`frontends/nextjs/src/lib/rendering/component-registry.ts`)
   - Registers the `Icon` component for use in Lua
   - Maps component type names to React components

3. **Package Icon Modules** (e.g., `packages/dashboard/seed/scripts/icons.lua`)
   - Provide package-specific icon name constants
   - Document available icons for each package

## Usage in Lua Packages

### Basic Icon Usage

Icons can be used in Lua by specifying the icon name in the component tree:

```lua
-- Using Icon component directly
local icon_component = {
  type = "Icon",
  props = {
    name = "CheckCircle",  -- Icon name from fakemui
    size = "medium",       -- small, medium, large, inherit
    className = "text-green-500"
  }
}
```

### Icon Sizes

Available sizes:
- `small` - 20px
- `medium` - 24px (default)
- `large` - 32px
- `inherit` - Inherits from parent

### Icon Name Resolution

The icon registry supports multiple name formats:

1. **PascalCase** (exact match): `CheckCircle`, `ChevronRight`
2. **kebab-case** (alias): `check-circle`, `chevron-right`
3. **lowercase** (alias): `checkcircle`, `chevronright`

Example:
```lua
-- All of these resolve to the same icon
{ type = "Icon", props = { name = "CheckCircle" } }
{ type = "Icon", props = { name = "check-circle" } }
{ type = "Icon", props = { name = "checkcircle" } }
```

## Package-Specific Icon Modules

Each package has an `icons.lua` module that provides constants for commonly used icons:

### Dashboard Package

```lua
local icons = require("icons")

-- Using icon constants
local stat_card = {
  icon = icons.get("CHART_LINE"),  -- Returns "ChartLine"
  label = "Total Revenue",
  value = 12500
}
```

Available icons in `dashboard/icons.lua`:
- `CHART_LINE`, `TREND_UP`, `BAR_CHART`, `PIE_CHART`
- `CHECK_CIRCLE`, `SHIELD_CHECK`, `WARNING`, `ERROR`
- `CLOCK`, `CALENDAR`, `SCHEDULE`
- And more...

### Navigation Menu Package

```lua
local icons = require("icons")

local sidebar_item = {
  label = "Dashboard",
  path = "/dashboard",
  icon = icons.get("DASHBOARD")  -- Returns "Dashboard"
}
```

Available icons in `nav_menu/icons.lua`:
- `HOME`, `DASHBOARD`, `SETTINGS`, `PROFILE`
- `SEARCH`, `NOTIFICATIONS`, `MAIL`
- `ADMIN_PANEL`, `SECURITY`, `VERIFIED_USER`
- And more...

### Data Table Package

```lua
local icons = require("icons")

local actions = {
  { id = "edit", icon = icons.get("EDIT"), label = "Edit" },
  { id = "delete", icon = icons.get("DELETE"), label = "Delete" },
  { id = "export", icon = icons.get("CSV"), label = "Export CSV" }
}
```

Available icons in `data_table/icons.lua`:
- `SORT`, `SORT_ASCENDING`, `SORT_DESCENDING`
- `FILTER`, `FILTER_CLEAR`, `FILTER_OFF`
- `EDIT`, `DELETE`, `ADD`, `REMOVE`
- `CSV`, `JSON`, `EXPORT`
- And more...

### Workflow Editor Package

```lua
local icons = require("icons")

local workflow_node = {
  type = "action",
  label = "Process Data",
  icon = icons.get("WORKFLOW")  -- Returns "Workflow"
}
```

Available icons in `workflow_editor/icons.lua`:
- `WORKFLOW`, `GIT_BRANCH`, `CALL_SPLIT`
- `PLAY`, `STOP`, `PAUSE`
- `CHECK_CIRCLE`, `ERROR`, `WARNING`
- And more...

### Form Builder Package

```lua
local icons = require("icons")

local validation_rule = {
  type = "required",
  message = "This field is required",
  icon = icons.get("ERROR")  -- Returns "CircleX"
}
```

Available icons in `form_builder/icons.lua`:
- `CHECK_CIRCLE`, `ERROR`, `WARNING`, `INFO`
- `TEXT_FIELDS`, `EMAIL`, `LOCK`, `CALENDAR`
- `VISIBILITY`, `VISIBILITY_OFF`
- `FORMAT_BOLD`, `FORMAT_ITALIC`, `INSERT_LINK`
- And more...

## Complete Examples

### Dashboard Stat Card with Icon

```lua
local icons = require("icons")
local stat_card = require("stats.card")

local revenue_card = stat_card.create({
  label = "Total Revenue",
  value = 12500,
  icon = icons.get("CHART_LINE"),
  change = "+12.5%",
  positive = true,
  className = "col-span-1"
})
```

### Sidebar Navigation with Icons

```lua
local icons = require("icons")

local sidebar_items = {
  {
    label = "Dashboard",
    path = "/dashboard",
    icon = icons.get("DASHBOARD")
  },
  {
    label = "Users",
    path = "/users",
    icon = icons.get("USERS")
  },
  {
    label = "Settings",
    path = "/settings",
    icon = icons.get("SETTINGS")
  }
}
```

### Data Table with Action Icons

```lua
local icons = require("icons")
local action_column = require("columns.action")

local actions = action_column("actions", {
  { id = "edit", icon = icons.get("EDIT"), label = "Edit", handler = "edit_user" },
  { id = "delete", icon = icons.get("TRASH"), label = "Delete", handler = "delete_user", confirm = true },
  { id = "view", icon = icons.get("EYE"), label = "View", handler = "view_user" }
})
```

### Workflow Node with Icon

```lua
local icons = require("icons")
local action_node = require("nodes.action")

local process_node = action_node(
  "process_data",
  "Process Data",
  "transform",
  icons.get("WORKFLOW")
)
```

### Form Field with Validation Icons

```lua
local icons = require("icons")

local email_field = {
  type = "TextField",
  props = {
    label = "Email",
    type = "email",
    required = true,
    helperText = "Enter your email address",
    -- Icons can be added to show validation state
    startIcon = icons.get("EMAIL"),
    endIcon = nil  -- Will be set based on validation
  }
}
```

## Available Icons

The fakemui icon library includes 390+ icons. Common categories:

### Actions
`Plus`, `Add`, `Remove`, `Trash`, `Delete`, `Copy`, `Check`, `Done`, `X`, `Edit`, `Save`

### Navigation
`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `ChevronUp`, `ChevronDown`, `Home`, `Menu`

### UI Controls
`Settings`, `Search`, `Filter`, `More`, `Expand`, `Collapse`, `ZoomIn`, `ZoomOut`

### Data & Status
`CheckCircle`, `Error`, `Warning`, `Info`, `Star`, `Heart`, `Flag`

### Users & Security
`User`, `Users`, `UserCircle`, `Lock`, `Key`, `Shield`, `Verified`

### Data Table
`Sort`, `SortAscending`, `FilterList`, `Csv`, `Json`, `Pagination`

### Workflow
`Workflow`, `GitBranch`, `CallSplit`, `Play`, `Stop`, `Pause`

### Forms
`TextFields`, `Email`, `Calendar`, `Checkbox`, `Radio`, `Visibility`

For a complete list, see:
- `frontends/nextjs/src/lib/rendering/icon-registry.ts` - Icon registry with aliases
- `fakemui/icons/index.ts` - All available icons

## Best Practices

1. **Use Icon Constants**: Always use the package-specific icon modules rather than hardcoding icon names:
   ```lua
   -- Good
   local icons = require("icons")
   icon = icons.get("DASHBOARD")

   -- Avoid
   icon = "Dashboard"  -- Works but not type-safe
   ```

2. **Check Icon Availability**: Ensure the icon exists in fakemui before using it. All icons in the package icon modules are guaranteed to exist.

3. **Use Semantic Names**: Choose icons that match the action or concept:
   - Delete actions: `Trash` or `Delete`
   - Edit actions: `Edit` or `Pencil`
   - Success states: `CheckCircle`
   - Errors: `CircleX` or `XCircle`

4. **Consistent Sizing**: Use consistent icon sizes within the same context:
   - Buttons: `medium` (24px)
   - Large cards/headers: `large` (32px)
   - Inline text: `small` (20px)

5. **Accessibility**: Icons should be paired with text labels for accessibility:
   ```lua
   {
     type = "Button",
     children = {
       { type = "Icon", props = { name = "Delete", className = "mr-2" } },
       { type = "Typography", props = { text = "Delete" } }
     }
   }
   ```

## Type Definitions

### Lua Type Annotations

```lua
---@class IconProps
---@field name string Icon name from fakemui
---@field size? "small"|"medium"|"large"|"inherit"
---@field className? string Additional CSS classes

---@class UIComponent
---@field type "Icon"
---@field props IconProps
```

## Migration from MUI Icons

If migrating from @mui/icons-material, use the icon registry aliases:

| MUI Icon | FakeMUI Equivalent |
|----------|-------------------|
| `AccountCircle` | `AccountCircle` |
| `Dashboard` | `Dashboard` |
| `Delete` | `Delete` or `Trash` |
| `Edit` | `Edit` or `Pencil` |
| `Settings` | `Settings` or `Gear` |
| `MoreVert` | `MoreVert` or `MoreVertical` |
| `ExpandMore` | `ExpandMore` or `ChevronDown` |
| `Error` | `CircleX` or `XCircle` |

## Troubleshooting

### Icon Not Rendering

1. Check icon name spelling
2. Verify icon exists in fakemui (see `fakemui/icons/index.ts`)
3. Check browser console for warnings

### Icon Name Not Found

```
Warning: Icon "IconName" not found in @/fakemui/icons
```

Solution: Use correct icon name or add to icon registry aliases

### Icon Size Not Applied

Ensure size prop is one of: `small`, `medium`, `large`, `inherit`

```lua
-- Correct
{ type = "Icon", props = { name = "Check", size = "medium" } }

-- Incorrect
{ type = "Icon", props = { name = "Check", size = 24 } }  -- Use "medium" instead
```

## Reference

### Icon Registry Functions

```typescript
// Get icon component by name
getIconComponent(iconName: string): ComponentType | undefined

// Resolve icon name (handles aliases)
resolveIconName(luaIconName: string): IconName | undefined

// Check if icon name is valid
isValidIconName(iconName: string): boolean

// Get all available icon names
getAllIconNames(): IconName[]
```

### Component Registry

The Icon component is registered in the component registry:

```typescript
import { Icon } from '@/components/atoms/display/Icon'

componentRegistry = {
  // ... other components
  Icon,
}
```

## Summary

The fakemui icon integration provides:

1. ✅ Declarative icon usage in Lua packages
2. ✅ Type-safe icon name constants per package
3. ✅ Flexible name resolution (PascalCase, kebab-case, lowercase)
4. ✅ 390+ icons covering common use cases
5. ✅ Consistent icon sizing and styling
6. ✅ No direct React imports needed in Lua

All icons are rendered as SVG components from the fakemui library, ensuring consistent styling and performance across the application.
