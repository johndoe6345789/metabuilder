# Props Configuration Guide

## Overview

The CodeForge application now supports **dynamic component props configuration** through the `pages.json` file. This declarative approach eliminates the need to modify `App.tsx` when adding or updating component props, making the system more maintainable and scalable.

## Architecture

### Key Files

1. **`src/config/pages.json`** - Declarative page and props configuration
2. **`src/config/page-loader.ts`** - Props resolution logic and interfaces
3. **`src/App.tsx`** - Consumes the configuration and renders pages

## Props Configuration Schema

### Basic Props Structure

```json
{
  "id": "example-page",
  "component": "ExampleComponent",
  "props": {
    "state": ["stateKey1", "stateKey2"],
    "actions": ["actionPropName:actionFunctionName"]
  }
}
```

### Props Configuration Options

#### `state` Array

Maps application state to component props. Supports two formats:

1. **Direct mapping** (prop name = state key):
   ```json
   "state": ["files", "models", "theme"]
   ```
   Results in: `{ files, models, theme }`

2. **Renamed mapping** (prop name : state key):
   ```json
   "state": ["trees:componentTrees", "config:flaskConfig"]
   ```
   Results in: `{ trees: componentTrees, config: flaskConfig }`

#### `actions` Array

Maps action functions (handlers/setters) to component props. Uses format:

```json
"actions": ["propName:functionName"]
```

Example:
```json
"actions": [
  "onModelsChange:setModels",
  "onFileSelect:setActiveFileId"
]
```

### Resizable Page Configuration

For pages with split-panel layouts (e.g., File Explorer + Code Editor):

```json
{
  "id": "code",
  "component": "CodeEditor",
  "requiresResizable": true,
  "props": {
    "state": ["files", "activeFileId"],
    "actions": ["onFileChange:handleFileChange"]
  },
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

## Available State Keys

The following state variables are available in the state context:

- `files` - Project files
- `models` - Data models
- `components` - Component definitions
- `componentTrees` - Component tree structures
- `workflows` - Workflow definitions
- `lambdas` - Lambda function definitions
- `theme` - Theme configuration
- `playwrightTests` - Playwright test definitions
- `storybookStories` - Storybook story definitions
- `unitTests` - Unit test definitions
- `flaskConfig` - Flask API configuration
- `nextjsConfig` - Next.js project configuration
- `npmSettings` - NPM package settings
- `featureToggles` - Feature toggle states
- `activeFileId` - Currently selected file ID

## Available Actions

The following action functions are available in the action context:

- `handleFileChange` - Update file content
- `setActiveFileId` - Set active file
- `handleFileClose` - Close a file
- `handleFileAdd` - Add new file
- `setModels` - Update models
- `setComponents` - Update components
- `setComponentTrees` - Update component trees
- `setWorkflows` - Update workflows
- `setLambdas` - Update lambdas
- `setTheme` - Update theme
- `setPlaywrightTests` - Update Playwright tests
- `setStorybookStories` - Update Storybook stories
- `setUnitTests` - Update unit tests
- `setFlaskConfig` - Update Flask config
- `setNextjsConfig` - Update Next.js config
- `setNpmSettings` - Update NPM settings
- `setFeatureToggles` - Update feature toggles

## Examples

### Simple Component (No Props)

```json
{
  "id": "docs",
  "title": "Documentation",
  "component": "DocumentationView",
  "props": {}
}
```

### Component with State Only

```json
{
  "id": "models",
  "title": "Models",
  "component": "ModelDesigner",
  "props": {
    "state": ["models"]
  }
}
```

### Component with State and Actions

```json
{
  "id": "models",
  "title": "Models",
  "component": "ModelDesigner",
  "props": {
    "state": ["models"],
    "actions": ["onModelsChange:setModels"]
  }
}
```

### Component with Renamed Props

```json
{
  "id": "flask",
  "title": "Flask API",
  "component": "FlaskDesigner",
  "props": {
    "state": ["config:flaskConfig"],
    "actions": ["onConfigChange:setFlaskConfig"]
  }
}
```

### Dashboard with Multiple State Props

```json
{
  "id": "dashboard",
  "title": "Dashboard",
  "component": "ProjectDashboard",
  "props": {
    "state": [
      "files",
      "models",
      "components",
      "theme",
      "playwrightTests",
      "storybookStories",
      "unitTests",
      "flaskConfig"
    ]
  }
}
```

## Adding a New Page

To add a new page with props configuration:

1. **Add the page to `pages.json`**:
   ```json
   {
     "id": "new-page",
     "title": "New Feature",
     "icon": "Star",
     "component": "NewFeatureComponent",
     "enabled": true,
     "order": 21,
     "props": {
       "state": ["relevantState"],
       "actions": ["onAction:setRelevantState"]
     }
   }
   ```

2. **Add the component to the lazy import map in `App.tsx`**:
   ```typescript
   const componentMap: Record<string, React.LazyExoticComponent<any>> = {
     // ... existing components
     NewFeatureComponent: lazy(() => import('@/components/NewFeatureComponent').then(m => ({ default: m.NewFeatureComponent }))),
   }
   ```

3. **Optionally add to feature toggles** (if applicable):
   ```json
   {
     "toggleKey": "newFeature"
   }
   ```

That's it! No need to modify the `getPropsForComponent` function or other logic in `App.tsx`.

## Benefits

1. **Declarative Configuration** - All page configs in one place
2. **No Code Changes** - Add/modify pages without touching `App.tsx` logic
3. **Type Safety** - TypeScript interfaces ensure configuration validity
4. **Maintainability** - Easy to understand and modify page props
5. **Scalability** - Simple to add new pages and props
6. **Consistency** - Standardized prop resolution across all pages

## Migration from Old System

The old hardcoded `propsMap` in `getPropsForComponent` has been replaced with dynamic resolution using `resolveProps()`. The configuration in `pages.json` now drives all prop mapping.

### Before (Hardcoded in App.tsx)
```typescript
const propsMap: Record<string, any> = {
  'ModelDesigner': {
    models,
    onModelsChange: setModels,
  },
  // ... 20+ more entries
}
```

### After (Declarative in pages.json)
```json
{
  "id": "models",
  "component": "ModelDesigner",
  "props": {
    "state": ["models"],
    "actions": ["onModelsChange:setModels"]
  }
}
```

## Future Enhancements

Potential extensions to the props configuration system:

1. **Computed Props** - Props derived from multiple state values
2. **Prop Transformations** - Map/filter/reduce operations on state
3. **Conditional Props** - Props based on feature toggles or user state
4. **Default Values** - Fallback values for missing state
5. **Validation Rules** - Runtime prop validation from schema
6. **Hook Configuration** - Custom hooks to inject into components
7. **Event Handlers** - Declarative event handler composition

## Troubleshooting

### Props not being passed to component

1. Check that the state/action key exists in the context objects
2. Verify the prop name mapping is correct (before:after colon)
3. Ensure the page is enabled and not filtered by feature toggles
4. Check browser console for resolution errors

### Component not rendering

1. Verify the component is added to the `componentMap` in `App.tsx`
2. Check that the component name matches exactly (case-sensitive)
3. Ensure the component export matches the import pattern

### State updates not working

1. Verify the action function name is correct
2. Check that the setter is using functional updates for array/object state
3. Ensure the action is properly mapped in the action context
