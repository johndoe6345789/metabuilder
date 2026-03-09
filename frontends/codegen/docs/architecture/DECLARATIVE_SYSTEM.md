# Declarative System Documentation

## Overview

CodeForge now uses a **declarative, JSON-driven architecture** that makes it easy to add, modify, and configure pages without touching core application code. This system reduces complexity, improves maintainability, and makes the codebase more scalable.

## Key Benefits

✅ **Add new pages by editing a JSON file** - no need to modify App.tsx  
✅ **Dynamic component loading** - components are lazy-loaded based on configuration  
✅ **Automatic keyboard shortcuts** - defined in JSON, automatically wired up  
✅ **Feature toggle integration** - pages automatically show/hide based on feature flags  
✅ **Consistent page structure** - all pages follow the same rendering pattern  
✅ **Easy to test and maintain** - configuration is separate from implementation  

## Architecture

### Configuration Files

#### `/src/config/pages.json`
The main configuration file that defines all pages in the application.

```json
{
  "pages": [
    {
      "id": "dashboard",
      "title": "Dashboard",
      "icon": "ChartBar",
      "component": "ProjectDashboard",
      "enabled": true,
      "shortcut": "ctrl+1",
      "order": 1
    },
    {
      "id": "code",
      "title": "Code Editor",
      "icon": "Code",
      "component": "CodeEditor",
      "enabled": true,
      "toggleKey": "codeEditor",
      "shortcut": "ctrl+2",
      "order": 2,
      "requiresResizable": true
    }
  ]
}
```

#### Page Configuration Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier for the page (used in routing) |
| `title` | string | ✅ | Display name for the page |
| `icon` | string | ✅ | Phosphor icon name |
| `component` | string | ✅ | Component name (must exist in componentMap) |
| `enabled` | boolean | ✅ | Whether the page is available |
| `toggleKey` | string | ❌ | Feature toggle key (from FeatureToggles type) |
| `shortcut` | string | ❌ | Keyboard shortcut (e.g., "ctrl+1", "ctrl+shift+e") |
| `order` | number | ✅ | Display order in navigation |
| `requiresResizable` | boolean | ❌ | Special flag for split-pane layouts |

### Core Functions

#### `getPageConfig()`
Returns the complete page configuration.

```typescript
import { getPageConfig } from '@/config/page-loader'

const config = getPageConfig()
// Returns: { pages: PageConfig[] }
```

#### `getEnabledPages(featureToggles)`
Returns only pages that are enabled and pass feature toggle checks.

```typescript
import { getEnabledPages } from '@/config/page-loader'

const enabledPages = getEnabledPages(featureToggles)
// Returns: PageConfig[]
```

#### `getPageShortcuts(featureToggles)`
Returns keyboard shortcuts for enabled pages.

```typescript
import { getPageShortcuts } from '@/config/page-loader'

const shortcuts = getPageShortcuts(featureToggles)
// Returns: Array<{ key: string, ctrl?: boolean, shift?: boolean, description: string, action: string }>
```

## How to Add a New Page

### Step 1: Create Your Component

```typescript
// src/components/MyNewDesigner.tsx
export function MyNewDesigner() {
  return (
    <div className="p-6">
      <h1>My New Designer</h1>
    </div>
  )
}
```

### Step 2: Add to Component Map

In `src/App.tsx`, add your component to the `componentMap`:

```typescript
const componentMap: Record<string, React.LazyExoticComponent<any>> = {
  // ... existing components
  MyNewDesigner: lazy(() => import('@/components/MyNewDesigner').then(m => ({ default: m.MyNewDesigner }))),
}
```

### Step 3: Add to pages.json

Add your page configuration to `/src/config/pages.json`:

```json
{
  "id": "my-new-page",
  "title": "My New Designer",
  "icon": "Sparkle",
  "component": "MyNewDesigner",
  "enabled": true,
  "toggleKey": "myNewFeature",
  "shortcut": "ctrl+shift+n",
  "order": 21
}
```

### Step 4: (Optional) Add Feature Toggle

If using a feature toggle, add it to the `FeatureToggles` type in `/src/types/project.ts`:

```typescript
export interface FeatureToggles {
  // ... existing toggles
  myNewFeature: boolean
}
```

And update the default in `/src/hooks/use-project-state.ts`:

```typescript
const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
  // ... existing toggles
  myNewFeature: true,
}
```

### Step 5: (Optional) Add Props Mapping

If your component needs props, add it to `getPropsForComponent` in `App.tsx`:

```typescript
const getPropsForComponent = (pageId: string) => {
  const propsMap: Record<string, any> = {
    // ... existing mappings
    'MyNewDesigner': {
      data: someData,
      onDataChange: setSomeData,
    },
  }
  return propsMap[pageId] || {}
}
```

That's it! Your new page will now:
- ✅ Appear in the navigation menu
- ✅ Be accessible via the keyboard shortcut
- ✅ Show/hide based on the feature toggle
- ✅ Be searchable in global search
- ✅ Follow the same rendering pattern as other pages

## Component Map

The `componentMap` in `App.tsx` is the registry of all available components:

```typescript
const componentMap: Record<string, React.LazyExoticComponent<any>> = {
  ProjectDashboard: lazy(() => import('@/components/ProjectDashboard').then(m => ({ default: m.ProjectDashboard }))),
  CodeEditor: lazy(() => import('@/components/CodeEditor').then(m => ({ default: m.CodeEditor }))),
  // ... more components
}
```

All components are **lazy-loaded** for optimal performance. They only load when the user navigates to that page.

## Special Layouts

### Split-Pane Layout (Code Editor)

The code editor uses a special resizable split-pane layout. This is handled by the `requiresResizable` flag:

```json
{
  "id": "code",
  "component": "CodeEditor",
  "requiresResizable": true
}
```

The rendering logic in `App.tsx` checks for this flag and renders the appropriate layout.

## Feature Toggles Integration

Pages can be conditionally enabled based on feature toggles:

```json
{
  "id": "playwright",
  "toggleKey": "playwright",
  "enabled": true
}
```

The page will only appear if:
1. `enabled` is `true` in the JSON
2. `featureToggles.playwright` is `true` (or undefined)

Users can toggle features on/off in the **Features** page.

## Keyboard Shortcuts

Shortcuts are automatically parsed from the configuration:

```json
{
  "shortcut": "ctrl+1"
}
```

Supported modifiers:
- `ctrl` - Control key
- `shift` - Shift key
- `alt` - Alt key (not implemented yet, but easy to add)

Format: `[modifier+]key` (e.g., "ctrl+1", "ctrl+shift+e", "f")

## Future Enhancements

The declarative system can be extended to support:

### 1. Dynamic Props from JSON
```json
{
  "component": "MyComponent",
  "props": {
    "title": "Dynamic Title",
    "showToolbar": true
  }
}
```

### 2. Layout Configuration
```json
{
  "layout": {
    "type": "split",
    "direction": "horizontal",
    "panels": [
      { "component": "Sidebar", "size": 20 },
      { "component": "MainContent", "size": 80 }
    ]
  }
}
```

### 3. Permission-Based Access
```json
{
  "permissions": ["admin", "editor"]
}
```

### 4. Page Groups/Categories
```json
{
  "category": "Design Tools",
  "group": "styling"
}
```

### 5. Page Metadata
```json
{
  "description": "Design and test Playwright e2e tests",
  "tags": ["testing", "automation"],
  "beta": true
}
```

## Advanced: Page Schema System

For even more advanced use cases, check out:
- `/src/config/page-schema.ts` - TypeScript types for page schemas
- `/src/components/orchestration/PageRenderer.tsx` - Generic page renderer
- `/src/config/default-pages.json` - Alternative page configuration format

These files provide a more sophisticated schema-based system that can define:
- Complex layouts (split, tabs, grid)
- Component hierarchies
- Action handlers
- Context management

## Migration Guide

If you have an existing page that's hardcoded in App.tsx:

### Before (Hardcoded):
```typescript
<TabsContent value="my-page" className="h-full m-0">
  <Suspense fallback={<LoadingFallback message="Loading..." />}>
    <MyComponent prop1={data} prop2={handler} />
  </Suspense>
</TabsContent>
```

### After (Declarative):
1. Add to `pages.json`:
```json
{
  "id": "my-page",
  "title": "My Page",
  "icon": "Star",
  "component": "MyComponent",
  "enabled": true,
  "order": 10
}
```

2. Add to `componentMap`:
```typescript
MyComponent: lazy(() => import('@/components/MyComponent').then(m => ({ default: m.MyComponent }))),
```

3. Add props mapping if needed:
```typescript
'MyComponent': {
  prop1: data,
  prop2: handler,
}
```

4. Remove the hardcoded TabsContent - the system handles it automatically!

## Troubleshooting

### Page doesn't appear in navigation
- ✅ Check `enabled: true` in pages.json
- ✅ Check feature toggle is enabled (if using `toggleKey`)
- ✅ Verify component exists in `componentMap`
- ✅ Check console for errors

### Component not loading
- ✅ Verify import path in `componentMap`
- ✅ Check component has a default export
- ✅ Look for TypeScript errors in component file

### Keyboard shortcut not working
- ✅ Verify shortcut format (e.g., "ctrl+1")
- ✅ Check for conflicts with browser shortcuts
- ✅ Make sure page is enabled

### Props not being passed
- ✅ Add mapping in `getPropsForComponent`
- ✅ Verify component name matches `pages.json`
- ✅ Check prop types match component interface

## Best Practices

1. **Keep pages.json organized** - Group related pages together, use consistent ordering
2. **Use meaningful IDs** - Use kebab-case, descriptive IDs (e.g., "code-editor", not "ce")
3. **Choose appropriate icons** - Use Phosphor icons that match the page purpose
4. **Document feature toggles** - Add comments to FeatureToggles type
5. **Test shortcuts** - Verify shortcuts don't conflict with browser/OS shortcuts
6. **Lazy load everything** - Keep components in the lazy componentMap
7. **Type your props** - Use TypeScript interfaces for component props
8. **Keep components small** - Follow the <150 LOC guideline from refactoring

## Summary

The declarative system transforms CodeForge from a monolithic React app into a flexible, configuration-driven platform. By moving page definitions to JSON, we gain:

- 🚀 **Faster development** - Add pages in minutes, not hours
- 🔧 **Easier maintenance** - Configuration is centralized and versioned
- 📦 **Better performance** - Lazy loading reduces initial bundle size
- 🎯 **Cleaner code** - Business logic separated from configuration
- 🧪 **Simpler testing** - Mock configuration instead of mocking components

The system is designed to grow with your needs - start simple with basic page definitions, then add advanced features like layout configuration, permissions, and dynamic props as needed.
