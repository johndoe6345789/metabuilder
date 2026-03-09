# JSON-Driven Routing Configuration

This application uses a JSON-based configuration system to define routes and pages declaratively.

## Overview

All routes are defined in `/src/config/pages.json` and automatically loaded by the router system.

## Root Route Configuration

The `/` (root) route is determined by the page marked with `"isRoot": true` in the pages.json configuration:

```json
{
  "id": "home",
  "title": "Home",
  "icon": "House",
  "component": "ProjectDashboard",
  "enabled": true,
  "isRoot": true,
  "order": 0,
  "props": {
    "state": ["files", "models", "components", "theme", ...],
  }
}
```

## Page Configuration Schema

Each page in `pages.json` supports the following properties:

### Required Properties

- `id` (string): Unique identifier used in the URL path (`/dashboard`, `/code`, etc.)
- `title` (string): Display name shown in navigation
- `icon` (string): Phosphor icon name for navigation UI
- `component` (string): Name of the React component to render (must be registered in ComponentRegistry)
- `enabled` (boolean): Whether the page is active
- `order` (number): Sort order for navigation menu

### Optional Properties

- `isRoot` (boolean): If true, this page will be rendered at the `/` route
- `toggleKey` (string): Feature toggle key that controls page visibility
- `shortcut` (string): Keyboard shortcut (e.g., "ctrl+1", "ctrl+shift+s")
- `requiresResizable` (boolean): Whether the page uses a resizable split layout
- `props` (object): Component props configuration (see Props Configuration)
- `resizableConfig` (object): Split panel layout configuration (see Resizable Layout)

## Props Configuration

Props can be automatically resolved from app state and actions:

```json
"props": {
  "state": ["files", "models", "activeFileId"],
  "actions": ["onFileChange:handleFileChange", "onFileSelect:setActiveFileId"]
}
```

### State Props

State props are mapped from the global state context:

- Simple mapping: `"files"` → `{ files: stateContext.files }`
- Renamed mapping: `"trees:componentTrees"` → `{ trees: stateContext.componentTrees }`

### Action Props

Action props are mapped from the action context using `propName:actionName` format:

- `"onFileChange:handleFileChange"` → `{ onFileChange: actionContext.handleFileChange }`

## Resizable Layout Configuration

Pages with split panels use the `requiresResizable` flag and `resizableConfig`:

```json
{
  "id": "code",
  "requiresResizable": true,
  "resizableConfig": {
    "leftComponent": "FileExplorer",
    "leftProps": {
      "state": ["files", "activeFileId"],
      "actions": ["onFileSelect:setActiveFileId"]
    },
    "leftPanel": {
      "defaultSize": 20,
      "minSize": 15,
      "maxSize": 30
    },
    "rightPanel": {
      "defaultSize": 80
    }
  }
}
```

## Feature Toggles

Pages can be conditionally shown based on feature toggles:

```json
{
  "id": "models-json",
  "toggleKey": "modelsJSON",
  "enabled": true
}
```

The page will only appear if `featureToggles.modelsJSON !== false`.

## Keyboard Shortcuts

Define shortcuts in `ctrl+key` or `ctrl+shift+key` format:

```json
{
  "id": "dashboard",
  "shortcut": "ctrl+1"
}
```

Shortcuts automatically navigate to the page when pressed.

## Route Resolution Flow

1. **Load Configuration**: `pages.json` is loaded by `getPageConfig()`
2. **Filter Enabled Pages**: Only pages with `enabled: true` and matching feature toggles
3. **Sort by Order**: Pages are sorted by the `order` field
4. **Create Routes**: Each page becomes a route object with:
   - Path: `/${page.id}` or `/` if `isRoot: true`
   - Element: Lazy-loaded component with resolved props
   - Layout: Standard or resizable based on configuration
5. **Add Fallback**: Wildcard route redirects to root

## Adding a New Page

1. Add entry to `src/config/pages.json`:
```json
{
  "id": "my-page",
  "title": "My Page",
  "icon": "Star",
  "component": "MyPageComponent",
  "enabled": true,
  "order": 100,
  "props": {
    "state": ["someData"],
    "actions": ["onSave:handleSave"]
  }
}
```

2. Register component in `src/lib/component-registry.ts`
3. The route is automatically created at `/my-page`

## Console Logging

The routing system includes extensive console logging prefixed with `[ROUTES]` and `[CONFIG]`:

- `[ROUTES] 🏗️` - Route creation started
- `[ROUTES] 📄` - Pages loaded
- `[ROUTES] 🏠` - Root page identified
- `[ROUTES] 📝` - Individual route configured
- `[CONFIG] 🔍` - Config queries
- `[CONFIG] ✅` - Successful resolution

## Example: Changing the Root Page

To make a different page appear at `/`:

1. Remove `"isRoot": true` from the current root page (if any)
2. Add `"isRoot": true` to your desired page in `pages.json`
3. The change takes effect immediately on reload

## Related Files

- `/src/config/pages.json` - Page definitions
- `/src/config/page-loader.ts` - Configuration loading and prop resolution
- `/src/router/routes.tsx` - Route creation from config
- `/src/router/RouterProvider.tsx` - Router setup
- `/src/lib/component-registry.ts` - Component registration
