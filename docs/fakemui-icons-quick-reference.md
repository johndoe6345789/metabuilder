# FakeMUI Icons Quick Reference

## Quick Start

### 1. Import icon module in your Lua package

```lua
local icons = require("icons")
```

### 2. Use icons in components

```lua
-- In a button
{
  type = "Button",
  children = {
    { type = "Icon", props = { name = icons.get("ADD"), size = "medium" } },
    { type = "Typography", props = { text = "Add Item" } }
  }
}

-- In a stat card
stat_card.create({
  label = "Total Users",
  value = 1234,
  icon = icons.get("USERS")
})
```

## Icon Sizes

| Size | Pixels | Usage |
|------|--------|-------|
| `small` | 20px | Inline with text |
| `medium` | 24px | Buttons, default |
| `large` | 32px | Headers, cards |
| `inherit` | - | Inherit from parent |

## Package Icon Constants

### Dashboard (`packages/dashboard/seed/scripts/icons.lua`)

```lua
-- Stats & Analytics
CHART_LINE, TREND_UP, BAR_CHART, PIE_CHART, ANALYTICS, DASHBOARD, STATS

-- Status
CHECK_CIRCLE, SHIELD_CHECK, WARNING, ERROR, INFO

-- Time
CLOCK, CALENDAR, SCHEDULE

-- Users
USER, USERS, USER_CIRCLE, PEOPLE
```

### Navigation Menu (`packages/nav_menu/seed/scripts/icons.lua`)

```lua
-- Navigation
HOME, HOUSE, DASHBOARD, MENU, SIDEBAR

-- Pages
SETTINGS, PROFILE, USER, USERS

-- Actions
SEARCH, NOTIFICATIONS, MAIL, CALENDAR

-- Data
FILE, FOLDER, DATABASE, TABLE, LIST, GRID

-- Admin
ADMIN_PANEL, MANAGE_ACCOUNTS, SECURITY, VERIFIED_USER, POLICY
```

### Data Table (`packages/data_table/seed/scripts/icons.lua`)

```lua
-- Sorting
SORT, SORT_ASCENDING, SORT_DESCENDING, ARROW_UP_DOWN

-- Filtering
FILTER, FILTER_LIST, FILTER_OFF, FILTER_CLEAR, FUNNEL

-- Actions
EDIT, DELETE, TRASH, ADD, REMOVE, COPY, SAVE

-- Export
DOWNLOAD, UPLOAD, EXPORT, CSV, JSON

-- Selection
CHECKBOX, SELECT_ALL, ROW_SELECT

-- Pagination
FIRST_PAGE, LAST_PAGE, CHEVRON_LEFT, CHEVRON_RIGHT
```

### Workflow Editor (`packages/workflow_editor/seed/scripts/icons.lua`)

```lua
-- Workflow
WORKFLOW, GIT_BRANCH, CALL_SPLIT, ACCOUNT_TREE

-- Control
PLAY, PLAY_ARROW, STOP, PAUSE

-- Status
CHECK_CIRCLE, CIRCLE_X, WARNING, INFO, PENDING

-- Tools
BUILD, CODE, TERMINAL, SETTINGS

-- View
ZOOM_IN, ZOOM_OUT, FULLSCREEN, FULLSCREEN_EXIT, CENTER_FOCUS
```

### Form Builder (`packages/form_builder/seed/scripts/icons.lua`)

```lua
-- Validation
CHECK_CIRCLE, ERROR, WARNING, INFO

-- Field Types
TEXT_FIELDS, EMAIL, LOCK, CALENDAR, CHECKBOX, RADIO, TOGGLE_ON

-- Visibility
VISIBILITY, VISIBILITY_OFF

-- File Handling
ATTACH_FILE, INSERT_PHOTO, UPLOAD

-- Rich Text
FORMAT_BOLD, FORMAT_ITALIC, FORMAT_UNDERLINE, INSERT_LINK
```

## Common Icon Patterns

### Button with Icon

```lua
{
  type = "Button",
  props = { variant = "contained" },
  children = {
    { type = "Icon", props = { name = "Add", className = "mr-2" } },
    { type = "Typography", props = { text = "Add Item" } }
  }
}
```

### Icon Button

```lua
{
  type = "IconButton",
  props = { onClick = "delete_item", title = "Delete" },
  children = {
    { type = "Icon", props = { name = "Trash" } }
  }
}
```

### List Item with Icon

```lua
{
  type = "ListItem",
  children = {
    {
      type = "ListItemIcon",
      children = {
        { type = "Icon", props = { name = "Home" } }
      }
    },
    {
      type = "ListItemText",
      props = { text = "Home" }
    }
  }
}
```

### Input with Start/End Icons

```lua
{
  type = "Box",
  props = { className = "relative" },
  children = {
    -- Start icon
    {
      type = "Icon",
      props = { name = "Search", className = "absolute left-3 top-4" }
    },
    -- Input field
    {
      type = "TextField",
      props = { label = "Search", className = "pl-10" }
    }
  }
}
```

### Status Badge with Icon

```lua
{
  type = "Chip",
  props = {
    label = "Active",
    color = "success"
  },
  children = {
    { type = "Icon", props = { name = "CheckCircle", size = "small" } }
  }
}
```

## Color Classes

Use Tailwind classes for icon colors:

```lua
-- Success (green)
{ type = "Icon", props = { name = "CheckCircle", className = "text-green-500" } }

-- Error (red)
{ type = "Icon", props = { name = "CircleX", className = "text-red-500" } }

-- Warning (yellow)
{ type = "Icon", props = { name = "Warning", className = "text-yellow-500" } }

-- Info (blue)
{ type = "Icon", props = { name = "Info", className = "text-blue-500" } }

-- Muted
{ type = "Icon", props = { name = "User", className = "text-gray-400" } }
```

## Icon Name Formats

All formats work (case-insensitive, alias-aware):

```lua
-- PascalCase (recommended)
{ type = "Icon", props = { name = "CheckCircle" } }

-- kebab-case
{ type = "Icon", props = { name = "check-circle" } }

-- lowercase
{ type = "Icon", props = { name = "checkcircle" } }
```

## Top 50 Most Useful Icons

### Actions (15)
`Add`, `Edit`, `Delete`, `Save`, `Check`, `Close`, `Copy`, `Download`, `Upload`, `Refresh`, `Search`, `Filter`, `Play`, `Pause`, `Stop`

### Navigation (10)
`Home`, `Menu`, `ChevronRight`, `ChevronDown`, `ArrowRight`, `ArrowLeft`, `ExpandMore`, `Close`, `NavigateNext`, `NavigateBefore`

### Status (10)
`CheckCircle`, `CircleX`, `Warning`, `Info`, `Star`, `Heart`, `Flag`, `CircleCheck`, `AlertCircle`, `AlertTriangle`

### Users & Security (5)
`User`, `Users`, `Lock`, `Shield`, `Settings`

### Data & Content (10)
`Dashboard`, `Table`, `List`, `Grid`, `File`, `Folder`, `Database`, `Calendar`, `Mail`, `Bell`

## Accessibility

Always pair icons with text labels:

```lua
-- Good: Icon + Label
{
  type = "Button",
  children = {
    { type = "Icon", props = { name = "Delete", className = "mr-2" } },
    { type = "Typography", props = { text = "Delete" } }
  }
}

-- Also Good: Icon with title attribute
{
  type = "IconButton",
  props = { title = "Delete", onClick = "delete_item" },
  children = {
    { type = "Icon", props = { name = "Delete" } }
  }
}
```

## File Locations

| Component | Path |
|-----------|------|
| Icon Registry | `frontends/nextjs/src/lib/rendering/icon-registry.ts` |
| Component Registry | `frontends/nextjs/src/lib/rendering/component-registry.ts` |
| Icon Component | `frontends/nextjs/src/components/atoms/display/Icon.tsx` |
| FakeMUI Icons | `fakemui/icons/` |
| Package Icons | `packages/{package}/seed/scripts/icons.lua` |
| Examples | `packages/{package}/seed/scripts/examples/` |

## Complete Example

```lua
-- Import modules
local icons = require("icons")
local sidebar = require("sidebar")

-- Create sidebar with icons
local admin_nav = sidebar.render({
  title = "Admin Panel",
  currentPath = "/admin/users",
  items = {
    {
      label = "Dashboard",
      path = "/admin",
      icon = icons.get("DASHBOARD")
    },
    {
      label = "User Management",
      path = "/admin/users",
      icon = icons.get("MANAGE_ACCOUNTS")
    },
    {
      label = "Security Settings",
      path = "/admin/security",
      icon = icons.get("SECURITY")
    },
    {
      label = "Database",
      path = "/admin/database",
      icon = icons.get("DATABASE")
    }
  }
})
```

## Next Steps

1. Browse available icons in `fakemui/icons/index.ts`
2. Check package-specific icon constants in `packages/{package}/seed/scripts/icons.lua`
3. See full examples in `packages/{package}/seed/scripts/examples/`
4. Read complete documentation in `docs/fakemui-icons-integration.md`
