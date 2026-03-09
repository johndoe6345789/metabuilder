# JSON Orchestration System - Complete Guide

## Overview

The JSON Orchestration System allows you to define entire pages, components, data sources, and actions using JSON schemas. This enables:

- **Zero-code page creation**: Build pages without writing React components
- **Dynamic configuration**: Change page structure without rebuilding
- **Type safety**: Full TypeScript validation of schemas
- **Testability**: JSON schemas are easy to validate and test
- **Rapid prototyping**: Create new pages by editing JSON files

## Architecture

```
┌─────────────────────────────────────────────────┐
│              JSON Page Schema                    │
│  (Structure, Data Sources, Actions, Components) │
└───────────────┬─────────────────────────────────┘
                │
        ┌───────▼──────┐
        │ PageRenderer │
        └───────┬──────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼────┐ ┌───▼─────┐ ┌──▼────────┐
│ Data   │ │ Action  │ │ Component │
│ Source │ │ Executor│ │ Registry  │
│ Manager│ │         │ │           │
└────────┘ └─────────┘ └───────────┘
```

## Core Concepts

### 1. Page Schema

A complete page definition:

```typescript
interface PageSchema {
  id: string                    // Unique identifier
  name: string                  // Display name
  description?: string          // Optional description
  icon?: string                 // Icon name
  layout: Layout                // Layout configuration
  components: ComponentDef[]    // Component tree
  dataSources?: DataSource[]    // Data sources
  actions?: Action[]            // Available actions
  hooks?: HookConfig[]          // Custom hooks
  seedData?: Record<string, any> // Initial data
}
```

### 2. Data Sources

Define where data comes from and how it's managed:

```typescript
interface DataSource {
  id: string                              // Unique ID for referencing
  type: 'kv' | 'api' | 'computed' | 'static'
  key?: string                            // KV store key
  endpoint?: string                       // API endpoint
  transform?: string                      // Transform function name
  defaultValue?: any                      // Default/fallback value
  dependencies?: string[]                 // Other data sources needed
}
```

**Example:**
```json
{
  "dataSources": [
    {
      "id": "todos",
      "type": "kv",
      "key": "user-todos",
      "defaultValue": []
    },
    {
      "id": "user",
      "type": "api",
      "endpoint": "/api/user",
      "defaultValue": null
    },
    {
      "id": "stats",
      "type": "computed",
      "dependencies": ["todos"],
      "transform": "calculateStats"
    }
  ]
}
```

### 3. Actions

Define what happens when users interact:

```typescript
interface Action {
  id: string                                           // Action identifier
  type: 'create' | 'update' | 'delete' | 'navigate'
       | 'api' | 'transform' | 'custom'
  target?: string                                      // Target data source
  payload?: Record<string, any>                        // Action payload
  handler?: string                                     // Custom handler name
}
```

**Action Types:**

- **`create`**: Add new item to data source
- **`update`**: Modify existing item
- **`delete`**: Remove item
- **`navigate`**: Change route/tab
- **`api`**: Make HTTP request
- **`transform`**: Transform data using custom function
- **`custom`**: Execute custom handler

**Example:**
```json
{
  "actions": [
    {
      "id": "add-todo",
      "type": "create",
      "target": "todos"
    },
    {
      "id": "complete-todo",
      "type": "update",
      "target": "todos"
    },
    {
      "id": "delete-todo",
      "type": "delete",
      "target": "todos"
    },
    {
      "id": "refresh-data",
      "type": "api",
      "target": "todos",
      "payload": {
        "endpoint": "/api/todos",
        "method": "GET"
      }
    },
    {
      "id": "export",
      "type": "custom",
      "handler": "handleExport"
    }
  ]
}
```

### 4. Components

Define the component tree structure:

```typescript
interface ComponentDef {
  id: string                                // Unique component ID
  type: string                              // Component name (from registry)
  props?: Record<string, any>               // Component props
  children?: ComponentDef[]                 // Child components
  dataBinding?: string                      // Bind to data source
  eventHandlers?: Record<string, string>    // Event → Action mapping
}
```

**Example:**
```json
{
  "components": [
    {
      "id": "todo-list",
      "type": "Card",
      "props": {
        "className": "max-w-2xl mx-auto"
      },
      "children": [
        {
          "id": "header",
          "type": "CardHeader",
          "children": [
            {
              "id": "title",
              "type": "CardTitle",
              "props": {
                "children": "My Todos"
              }
            }
          ]
        },
        {
          "id": "content",
          "type": "CardContent",
          "dataBinding": "todos",
          "children": [
            {
              "id": "add-button",
              "type": "Button",
              "props": {
                "children": "Add Todo"
              },
              "eventHandlers": {
                "onClick": "add-todo"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### 5. Layout

Define how components are arranged:

```typescript
interface Layout {
  type: 'single' | 'split' | 'grid' | 'tabs' | 'flex'
  direction?: 'horizontal' | 'vertical' | 'row' | 'column'
  panels?: PanelConfig[]
}

interface PanelConfig {
  id: string
  minSize?: number
  maxSize?: number
  defaultSize?: number
}
```

**Example:**
```json
{
  "layout": {
    "type": "split",
    "direction": "horizontal",
    "panels": [
      {
        "id": "sidebar",
        "minSize": 15,
        "maxSize": 30,
        "defaultSize": 20
      },
      {
        "id": "main",
        "defaultSize": 80
      }
    ]
  }
}
```

## Complete Examples

### Example 1: Simple Todo List Page

```json
{
  "id": "todo-list",
  "name": "Todo List",
  "description": "Simple todo list application",
  "icon": "CheckSquare",
  "layout": {
    "type": "single"
  },
  "dataSources": [
    {
      "id": "todos",
      "type": "kv",
      "key": "user-todos",
      "defaultValue": []
    }
  ],
  "components": [
    {
      "id": "root",
      "type": "Card",
      "props": {
        "className": "max-w-2xl mx-auto mt-8"
      },
      "children": [
        {
          "id": "header",
          "type": "CardHeader",
          "children": [
            {
              "id": "title",
              "type": "CardTitle",
              "props": {
                "children": "My Tasks"
              }
            }
          ]
        },
        {
          "id": "content",
          "type": "CardContent",
          "props": {
            "className": "space-y-4"
          },
          "children": [
            {
              "id": "input",
              "type": "Input",
              "props": {
                "placeholder": "What needs to be done?",
                "id": "todo-input"
              },
              "eventHandlers": {
                "onKeyDown": "add-on-enter"
              }
            },
            {
              "id": "add-button",
              "type": "Button",
              "props": {
                "children": "Add Task",
                "className": "w-full"
              },
              "eventHandlers": {
                "onClick": "add-todo"
              }
            }
          ]
        }
      ]
    }
  ],
  "actions": [
    {
      "id": "add-todo",
      "type": "create",
      "target": "todos"
    },
    {
      "id": "toggle-todo",
      "type": "update",
      "target": "todos"
    },
    {
      "id": "delete-todo",
      "type": "delete",
      "target": "todos"
    },
    {
      "id": "add-on-enter",
      "type": "custom",
      "handler": "handleEnterKey"
    }
  ],
  "seedData": {
    "todos": [
      {
        "id": "1",
        "text": "Welcome to JSON-driven pages!",
        "completed": false
      }
    ]
  }
}
```

### Example 2: Dashboard with Multiple Data Sources

```json
{
  "id": "dashboard",
  "name": "Project Dashboard",
  "description": "Overview of project metrics",
  "icon": "ChartBar",
  "layout": {
    "type": "grid"
  },
  "dataSources": [
    {
      "id": "files",
      "type": "kv",
      "key": "project-files",
      "defaultValue": []
    },
    {
      "id": "models",
      "type": "kv",
      "key": "project-models",
      "defaultValue": []
    },
    {
      "id": "components",
      "type": "kv",
      "key": "project-components",
      "defaultValue": []
    },
    {
      "id": "stats",
      "type": "computed",
      "dependencies": ["files", "models", "components"],
      "transform": "calculateProjectStats"
    }
  ],
  "components": [
    {
      "id": "stats-grid",
      "type": "div",
      "props": {
        "className": "grid grid-cols-3 gap-4 p-4"
      },
      "children": [
        {
          "id": "files-card",
          "type": "Card",
          "children": [
            {
              "id": "files-content",
              "type": "CardContent",
              "props": {
                "className": "pt-6"
              },
              "dataBinding": "files",
              "children": [
                {
                  "id": "files-count",
                  "type": "div",
                  "props": {
                    "className": "text-2xl font-bold"
                  }
                },
                {
                  "id": "files-label",
                  "type": "div",
                  "props": {
                    "children": "Files",
                    "className": "text-muted-foreground"
                  }
                }
              ]
            }
          ]
        },
        {
          "id": "models-card",
          "type": "Card",
          "children": [
            {
              "id": "models-content",
              "type": "CardContent",
              "props": {
                "className": "pt-6"
              },
              "dataBinding": "models"
            }
          ]
        },
        {
          "id": "components-card",
          "type": "Card",
          "children": [
            {
              "id": "components-content",
              "type": "CardContent",
              "props": {
                "className": "pt-6"
              },
              "dataBinding": "components"
            }
          ]
        }
      ]
    }
  ],
  "actions": [
    {
      "id": "navigate-to-files",
      "type": "navigate",
      "target": "code"
    },
    {
      "id": "navigate-to-models",
      "type": "navigate",
      "target": "models"
    }
  ]
}
```

## Using the PageRenderer

In your application:

```typescript
import { PageRenderer } from '@/config/orchestration'
import dashboardSchema from '@/config/pages/dashboard.json'

function DashboardPage() {
  const handleNavigate = (path: string) => {
    // Your navigation logic
    router.push(path)
  }

  const customHandlers = {
    handleExport: async () => {
      // Custom export logic
      const data = await exportData()
      downloadFile(data)
    },
    calculateStats: (todos: any[]) => {
      return {
        total: todos.length,
        completed: todos.filter(t => t.completed).length
      }
    }
  }

  return (
    <PageRenderer
      schema={dashboardSchema}
      onNavigate={handleNavigate}
      customHandlers={customHandlers}
    />
  )
}
```

## Component Registry

Register all components that can be used in JSON schemas:

```typescript
// src/config/orchestration/component-registry.ts
import { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { MyCustomComponent } from '@/components/MyCustomComponent'

export const ComponentRegistry: Record<string, ComponentType<any>> = {
  Button,
  Input,
  Card,
  // ... shadcn components
  
  // Custom components
  MyCustomComponent,
  TodoList,
  Dashboard,
}
```

## Advanced Patterns

### Conditional Rendering

Use computed data sources:

```json
{
  "dataSources": [
    {
      "id": "user",
      "type": "kv",
      "key": "current-user"
    },
    {
      "id": "isAdmin",
      "type": "computed",
      "dependencies": ["user"],
      "transform": "checkIsAdmin"
    }
  ]
}
```

### Nested Data Binding

Bind to nested properties:

```json
{
  "id": "email-input",
  "type": "Input",
  "dataBinding": "user.profile.email"
}
```

### Batch Actions

Execute multiple actions:

```json
{
  "id": "save-all",
  "type": "custom",
  "handler": "saveAllChanges",
  "payload": {
    "actions": ["save-files", "save-models", "save-components"]
  }
}
```

## Best Practices

1. **Keep schemas focused**: One page = one schema
2. **Use meaningful IDs**: Makes debugging easier
3. **Leverage seed data**: For examples and testing
4. **Document custom handlers**: In the schema description
5. **Validate schemas**: Use Zod validation before runtime
6. **Version your schemas**: Track changes over time
7. **Test with different data**: Ensure schemas work with various inputs

## Migration Strategy

To migrate existing components to JSON:

1. **Identify static structure**: What doesn't change?
2. **Extract data dependencies**: What data does it need?
3. **Map actions**: What can users do?
4. **Create JSON schema**: Follow the structure
5. **Test with PageRenderer**: Verify functionality
6. **Add custom handlers**: For complex logic
7. **Remove old component**: Once verified

## Performance Considerations

- JSON schemas are parsed once
- Component registry lookups are O(1)
- Data sources use React hooks (memoized)
- Actions are executed asynchronously
- Large schemas can be code-split

## Debugging

Enable debug mode:

```typescript
<PageRenderer
  schema={schema}
  debug={true} // Logs all actions and data changes
/>
```

## TypeScript Support

All schemas are fully typed:

```typescript
import { PageSchema } from '@/config/orchestration'

const mySchema: PageSchema = {
  // Full type checking and autocomplete
}
```

## Testing

Test schemas independently:

```typescript
import { PageSchemaDefinition } from '@/config/orchestration/schema'
import dashboardSchema from '@/config/pages/dashboard.json'

test('dashboard schema is valid', () => {
  const result = PageSchemaDefinition.safeParse(dashboardSchema)
  expect(result.success).toBe(true)
})
```

## Future Enhancements

- Visual schema editor
- Schema hot-reloading
- A/B testing support
- Schema versioning
- Analytics integration
- Performance profiling
