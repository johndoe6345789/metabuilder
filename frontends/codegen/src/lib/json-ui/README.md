# JSON UI System

A comprehensive declarative UI framework for building React interfaces from JSON configurations.

## 📁 Directory Structure

```
src/lib/json-ui/
├── index.ts              # Main exports
├── schema.ts             # Zod schemas for type validation
├── component-registry.ts # Component registry and lookup
├── renderer.tsx          # React renderer for JSON configs
├── hooks.ts              # React hooks for data management
├── utils.ts              # Utility functions
└── validator.ts          # Configuration validation
```

## 🚀 Quick Start

### 1. Create a JSON Configuration

```json
{
  "id": "my-page",
  "title": "My Page",
  "layout": {
    "type": "flex",
    "direction": "column",
    "children": [
      {
        "id": "greeting",
        "type": "h1",
        "children": "Hello World"
      },
      {
        "id": "cta-button",
        "type": "Button",
        "events": {"onClick": "greet"},
        "children": "Click Me"
      }
    ]
  },
  "dataSources": {}
}
```

### 2. Render the Configuration

```tsx
import { JSONUIPage } from '@/components/JSONUIPage'
import config from './my-config.json'

export function MyPage() {
  return <JSONUIPage jsonConfig={config} />
}
```

## 📚 Documentation

- **[Complete Guide](/docs/JSON-UI-SYSTEM.md)** - Full system documentation
- **[Quick Reference](/docs/JSON-UI-QUICK-REF.md)** - Component and syntax quick reference
- **[Migration Guide](/docs/MIGRATING-TO-JSON-UI.md)** - Convert React to JSON UI
- **[Examples README](/src/config/ui-examples/README.md)** - Example configurations

## 🎯 Core Concepts

### Components

Define UI elements using JSON:

```json
{
  "id": "my-button",
  "type": "Button",
  "props": {"variant": "primary"},
  "className": "mt-4",
  "children": "Submit"
}
```

### Data Binding

Connect UI to data sources:

```json
{
  "type": "p",
  "dataBinding": "user.name"
}
```

### Event Handling

Respond to user interactions using a JSON event map. Each entry maps an event name to an action definition:

```json
{
  "events": {
    "onClick": {
      "action": "save-data",
      "payload": {
        "source": "profile"
      }
    }
  }
}
```

You can also pass full action arrays when needed:

```json
{
  "events": {
    "change": {
      "actions": [
        { "id": "set-name", "type": "set-value", "target": "userName" }
      ]
    }
  }
}
```

#### Supported events

Events map directly to React handler props, so common values include:

- `click` / `onClick`
- `change` / `onChange`
- `submit` / `onSubmit`
- `focus` / `onFocus`
- `blur` / `onBlur`
- `keyDown` / `onKeyDown`
- `keyUp` / `onKeyUp`
- `mouseEnter` / `onMouseEnter`
- `mouseLeave` / `onMouseLeave`

### Looping

Render lists from arrays:

```json
{
  "loop": {
    "source": "items",
    "itemVar": "item",
    "indexVar": "index"
  },
  "children": [...]
}
```

### Conditionals

Show/hide based on conditions:

```json
{
  "conditional": {
    "if": "user.isAdmin",
    "then": {...},
    "else": {...}
  }
}
```

## 🧭 Schema Patterns & Examples

### Conditional Branches

Conditionals can return a single component, an array of components, or a string payload:

```json
{
  "id": "admin-greeting",
  "type": "div",
  "conditional": {
    "if": "user.isAdmin",
    "then": [
      { "id": "admin-title", "type": "h2", "children": "Welcome, Admin!" },
      { "id": "admin-subtitle", "type": "p", "children": "You have full access." }
    ],
    "else": "You do not have access."
  }
}
```

### Loop Templates (itemVar/indexVar)

Loop containers render once and repeat their children as the template. The `itemVar` and
`indexVar` values are available in bindings and expressions inside the loop:

```json
{
  "id": "activity-list",
  "type": "div",
  "className": "space-y-2",
  "loop": {
    "source": "activities",
    "itemVar": "activity",
    "indexVar": "idx"
  },
  "children": [
    {
      "id": "activity-row",
      "type": "div",
      "children": [
        { "id": "activity-index", "type": "span", "dataBinding": "idx" },
        { "id": "activity-text", "type": "span", "dataBinding": "activity.text" }
      ]
    }
  ]
}
```

### Dot-Path Bindings

Bindings support `foo.bar` access for both `dataBinding` and `bindings`:

```json
{
  "id": "profile-name",
  "type": "p",
  "dataBinding": "user.profile.fullName"
}
```

```json
{
  "id": "profile-avatar",
  "type": "Avatar",
  "bindings": {
    "src": { "source": "user", "path": "profile.avatarUrl" },
    "alt": { "source": "user.profile.fullName" }
  }
}
```

### Transforms

Transforms can be applied to bindings for light formatting in JSON:

```json
{
  "id": "user-score",
  "type": "span",
  "dataBinding": {
    "source": "user",
    "path": "score",
    "transform": "data ?? 0"
  }
}
```

```json
{
  "id": "user-initials",
  "type": "Badge",
  "bindings": {
    "children": {
      "source": "user.profile.fullName",
      "transform": "data.split(' ').map(part => part[0]).join('')"
    }
  }
}
```

## 🧩 Available Components

### Layout
- HTML primitives: `div`, `span`, `section`, `header`, etc.

### UI Components (shadcn/ui)
- `Button`, `Input`, `Textarea`, `Label`
- `Card`, `CardHeader`, `CardTitle`, `CardContent`, etc.
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Badge`, `Separator`, `Alert`, `Switch`, `Checkbox`
- And 30+ more...

### Icons (Phosphor)
- `Plus`, `Minus`, `Edit`, `Trash`, `Eye`, `Settings`
- `User`, `Bell`, `Calendar`, `Star`, `Heart`
- And 30+ more...

## 💾 Data Sources

### Static Data
```json
{
  "dataSources": {
    "config": {
      "type": "static",
      "config": {"theme": "dark"}
    }
  }
}
```

### API Data
```json
{
  "dataSources": {
    "users": {
      "type": "api",
      "config": {"url": "/api/users"}
    }
  }
}
```

### KV Store
```json
{
  "dataSources": {
    "preferences": {
      "type": "kv",
      "config": {
        "key": "user-prefs",
        "defaultValue": {}
      }
    }
  }
}
```

## 🛠️ Advanced Usage

### Custom Components

Register your own components:

```typescript
import { registerComponent } from '@/lib/json-ui'
import { MyCustomComponent } from './MyCustomComponent'

registerComponent('MyCustom', MyCustomComponent)
```

### Validation

Validate JSON configurations:

```typescript
import { validateJSONUI, prettyPrintValidation } from '@/lib/json-ui'

const result = validateJSONUI(myConfig)
console.log(prettyPrintValidation(result))
```

### Type Safety

Use TypeScript types from schemas:

```typescript
import type { UIComponent, PageUI } from '@/lib/json-ui'

const component: UIComponent = {
  id: 'my-component',
  type: 'Button',
  children: 'Click Me'
}
```

### Hooks

Consume JSON UI data hooks from the public entrypoint:

```typescript
import { useJSONDataSource, useJSONDataSources, useJSONActions } from '@/lib/json-ui'
```

## 📦 Exports

```typescript
// Schemas and Types
export type {
  UIComponent,
  Form,
  Table,
  Dialog,
  Layout,
  Tabs,
  Menu,
  PageUI,
  DataBinding,
  EventHandler
} from './schema'

// Components
export {
  JSONUIRenderer,
  JSONFormRenderer
} from './renderer'

export {
  uiComponentRegistry,
  registerComponent,
  getUIComponent,
  hasComponent
} from './component-registry'

// Hooks
export {
  useJSONDataSource,
  useJSONDataSources,
  useJSONActions
} from './hooks'

// Utils
export {
  resolveDataBinding,
  getNestedValue,
  setNestedValue,
  evaluateCondition,
  transformData
} from './utils'

// Validation
export {
  validateJSONUI,
  prettyPrintValidation
} from './validator'
```

## 🎨 Examples

See `/src/config/ui-examples/` for complete working examples:
- **dashboard.json** - Dashboard with stats and activity feed
- **form.json** - Registration form with validation
- **table.json** - Data table with row actions
- **settings.json** - Tabbed settings panel

View them live in the app under "JSON UI" tab.

## ✅ Benefits

- **Declarative**: Clear, readable configuration format
- **Type-Safe**: Validated with Zod schemas
- **Extensible**: Add custom components easily
- **Dynamic**: Load and modify UIs at runtime
- **Maintainable**: Separation of structure and logic
- **Accessible**: Non-developers can modify UIs

## ⚠️ Limitations

- Not suitable for complex state management
- Performance considerations for very large UIs
- Debugging can be more challenging
- Learning curve for the JSON schema

## 🔮 Future Enhancements

- Visual drag-and-drop UI builder
- GraphQL data source support
- Animation configurations
- Form validation schemas
- WebSocket real-time updates
- Export JSON to React code
- Template library with common patterns

## 📝 License

Part of the Spark template project.
