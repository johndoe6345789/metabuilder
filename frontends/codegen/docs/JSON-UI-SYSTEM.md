# JSON UI System Documentation

## Overview

The JSON UI System is a declarative framework for building React user interfaces from JSON configurations. Instead of writing React components, you define your UI structure, data sources, and event handlers in JSON files, which are then rendered dynamically.

This document now serves as the consolidated reference for the JSON UI system. Legacy notes like `JSON_COMPONENTS.md`, `JSON_EXPRESSION_SYSTEM.md`, `JSON_COMPATIBILITY_IMPLEMENTATION.md`, the component usage report, and the old `json-components-list.json` artifact have been retired in favor of keeping the guidance in one place.

## Key Features

- **Fully Declarative**: Define complete UIs without writing React code
- **Data Binding**: Automatic synchronization between data sources and UI components
- **Event Handling**: Configure user interactions and actions in JSON
- **Component Library**: Access to all shadcn/ui components and Phosphor icons
- **Conditional Rendering**: Show/hide elements based on data conditions
- **Looping**: Render lists from array data sources
- **Type-Safe**: Validated with Zod schemas

## JSON Structure

### Basic Page Configuration

```json
{
  "id": "my-page",
  "title": "My Page",
  "description": "Page description",
  "layout": {
    "type": "flex",
    "direction": "column",
    "gap": "6",
    "padding": "6",
    "className": "h-full bg-background",
    "children": []
  },
  "dataSources": {},
  "actions": []
}
```

### Components

Components are the building blocks of your UI. Each component has:

```json
{
  "id": "unique-id",
  "type": "ComponentName",
  "props": {},
  "className": "tailwind-classes",
  "style": {},
  "children": [],
  "dataBinding": "dataSource.path",
  "events": {},
  "conditional": {},
  "loop": {}
}
```

#### Component Types

**HTML Primitives**:
- `div`, `span`, `p`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- `section`, `article`, `header`, `footer`, `main`, `aside`, `nav`

**shadcn/ui Components**:
- `Button`, `Input`, `Textarea`, `Label`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Badge`, `Separator`, `Alert`, `AlertDescription`, `AlertTitle`
- `Switch`, `Checkbox`, `RadioGroup`, `RadioGroupItem`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Dialog`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogTitle`
- `Skeleton`, `Progress`, `Avatar`, `AvatarFallback`, `AvatarImage`

**Icons** (Phosphor):
- `ArrowLeft`, `ArrowRight`, `Check`, `X`, `Plus`, `Minus`
- `Search`, `Filter`, `Download`, `Upload`, `Edit`, `Trash`
- `Eye`, `EyeOff`, `ChevronUp`, `ChevronDown`, `ChevronLeft`, `ChevronRight`
- `Settings`, `User`, `Bell`, `Mail`, `Calendar`, `Clock`, `Star`
- `Heart`, `Share`, `Link`, `Copy`, `Save`, `RefreshCw`
- `AlertCircle`, `Info`, `HelpCircle`, `Home`, `Menu`
- And many more...

### Data Binding

Bind component values to data sources:

```json
{
  "id": "stat-value",
  "type": "p",
  "className": "text-3xl font-bold",
  "dataBinding": "stats.users"
}
```

For nested data:

```json
{
  "dataBinding": {
    "source": "user",
    "path": "profile.name"
  }
}
```

### Event Handlers

Configure user interactions:

```json
{
  "events": {
    "onClick": "action-id"
  }
}
```

With parameters:

```json
{
  "events": {
    "onClick": {
      "action": "delete-item",
      "params": {
        "itemId": "item.id"
      }
    }
  }
}
```

Common events:
- `onClick`, `onDoubleClick`
- `onChange`, `onInput`, `onBlur`, `onFocus`
- `onSubmit`
- `onCheckedChange` (for checkboxes/switches)

### Data Sources

Define where your data comes from:

```json
{
  "dataSources": {
    "stats": {
      "type": "static",
      "config": {
        "users": 1234,
        "projects": 45
      }
    },
    "users": {
      "type": "api",
      "config": {
        "url": "/api/users",
        "method": "GET"
      }
    },
    "preferences": {
      "type": "kv",
      "config": {
        "key": "user-preferences",
        "defaultValue": {}
      }
    }
  }
}
```

Data source types:
- `static`: Hardcoded data in the JSON
- `api`: Fetch from an API endpoint
- `kv`: Persist to Spark KV store
- `computed`: Calculate from other data sources

### Conditional Rendering

Show components based on conditions:

```json
{
  "conditional": {
    "if": "user.isAdmin",
    "then": {
      "id": "admin-panel",
      "type": "div",
      "children": "Admin controls"
    },
    "else": {
      "id": "guest-message",
      "type": "p",
      "children": "Please log in"
    }
  }
}
```

### Looping

Render arrays of data:

```json
{
  "loop": {
    "source": "projects",
    "itemVar": "project",
    "indexVar": "index"
  },
  "children": [
    {
      "id": "project-card",
      "type": "Card",
      "children": [
        {
          "id": "project-name",
          "type": "CardTitle",
          "dataBinding": "project.name"
        }
      ]
    }
  ]
}
```

## Examples

### Dashboard Example

See `/src/config/ui-examples/dashboard.json` for a complete dashboard with:
- Stats cards
- Activity feed with looping
- Quick action buttons
- Static data sources

### Form Example

See `/src/config/ui-examples/form.json` for a registration form with:
- Text inputs
- Email and password fields
- Textarea
- Checkbox
- Form submission handling
- Data binding for all fields

### Table Example

See `/src/config/ui-examples/table.json` for a data table with:
- Row looping
- Status badges
- Action buttons per row
- Hover states

## Best Practices

1. **Unique IDs**: Always provide unique `id` values for every component
2. **Semantic Components**: Use HTML primitives (`div`, `section`, etc.) for layout, shadcn components for interactive elements
3. **Data Binding**: Bind to data sources rather than hardcoding values
4. **Event Naming**: Use clear, action-oriented event names (`create-user`, `delete-project`)
5. **Responsive Design**: Use Tailwind responsive prefixes (`md:`, `lg:`) in `className`
6. **Component Hierarchy**: Keep component trees shallow for better performance

## Extending the System

### Register Custom Components

```typescript
import { registerComponent } from '@/lib/json-ui/component-registry'
import { MyCustomComponent } from './MyCustomComponent'

registerComponent('MyCustom', MyCustomComponent)
```

### Add Custom Data Source Types

Use the public entrypoint when consuming JSON UI hooks:

```typescript
import { useJSONDataSource, useJSONDataSources, useJSONActions } from '@/lib/json-ui'
```

Edit `/src/lib/json-ui/hooks.ts` to add new data source handlers.

### Add Custom Actions

Actions are handled in the parent component. Add new action handlers in your page component:

```typescript
const handleAction = (handler: EventHandler, event?: any) => {
  switch (handler.action) {
    case 'my-custom-action':
      // Handle your custom action
      break
  }
}
```

## File Locations

- **Schema Definitions**: `/src/lib/json-ui/schema.ts`
- **Component Registry**: `/src/lib/json-ui/component-registry.ts`
- **Renderer**: `/src/lib/json-ui/renderer.tsx`
- **Hooks**: Import from `@/lib/json-ui` (source: `/src/lib/json-ui/hooks.ts`)
- **Utils**: `/src/lib/json-ui/utils.ts`
- **Examples**: `/src/config/ui-examples/`
- **Demo Page**: `/src/components/JSONUIShowcase.tsx`

## Advantages

✅ **No React Knowledge Required**: Build UIs with JSON
✅ **Rapid Prototyping**: Create and iterate on UIs quickly
✅ **Consistent Styling**: Automatic adherence to design system
✅ **Easy Testing**: JSON configurations are easy to validate
✅ **Version Control Friendly**: Clear diffs when UI changes
✅ **Dynamic Loading**: Load UI configurations at runtime
✅ **Type Safety**: Zod schemas validate configurations

## Limitations

⚠️ **Complex Logic**: Advanced state management still requires React components
⚠️ **Performance**: Very large component trees may be slower than hand-coded React
⚠️ **Debugging**: Stack traces point to the renderer, not your JSON
⚠️ **Learning Curve**: Understanding the JSON schema takes time

## Future Enhancements

- [ ] Visual JSON UI builder/editor
- [ ] More complex data transformations
- [ ] Animation configurations
- [ ] Form validation schemas in JSON
- [ ] GraphQL data source support
- [ ] WebSocket data sources for real-time updates
- [ ] Export JSON UI to React code
- [ ] JSON UI template library
