# JSON-Driven Page Orchestration Guide

## Overview

The JSON orchestration system allows you to define entire pages using JSON schemas, eliminating the need for writing React components for common patterns. This approach:

- **Reduces code complexity**: Components stay under 150 LOC
- **Improves maintainability**: Changes to page structure don't require code changes
- **Enables rapid prototyping**: New pages can be created by editing JSON
- **Provides type safety**: Full TypeScript validation of schemas
- **Facilitates testing**: JSON schemas are easy to validate and test

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Page Schema Structure](#page-schema-structure)
3. [Component Tree](#component-tree)
4. [Data Sources](#data-sources)
5. [Actions](#actions)
6. [Bindings](#bindings)
7. [Events](#events)
8. [Hooks](#hooks)
9. [Examples](#examples)
10. [Best Practices](#best-practices)

## Core Concepts

### Page Schema

A page schema is a JSON object that completely describes a page's structure, data, and behavior:

```typescript
interface PageSchema {
  id: string                      // Unique page identifier
  name: string                    // Display name
  description?: string            // Optional description
  layout: LayoutConfig            // How components are arranged
  components: ComponentSchema[]   // Tree of components
  data?: DataSource[]            // Data sources
  actions?: ActionConfig[]        // Available actions
  hooks?: HookConfig[]           // Custom hooks to use
  seedData?: Record<string, any> // Initial/example data
}
```

### Component Schema

Each component in the tree is described by:

```typescript
interface ComponentSchema {
  id: string                     // Unique component ID
  type: string                   // Component type (Button, Card, etc.)
  props?: Record<string, any>    // Component props
  children?: ComponentSchema[]   // Nested components
  bindings?: DataBinding[]       // Data bindings
  events?: EventHandler[]        // Event handlers
  condition?: string             // Conditional rendering
}
```

## Page Schema Structure

### Basic Structure

```json
{
  "id": "my-page",
  "name": "My Page",
  "layout": {
    "type": "single"
  },
  "components": [
    {
      "id": "main",
      "type": "div",
      "props": {
        "className": "p-6"
      }
    }
  ]
}
```

### Layout Types

#### Single Layout

All components in a single container:

```json
{
  "layout": {
    "type": "single"
  }
}
```

#### Split Layout

Resizable panels:

```json
{
  "layout": {
    "type": "split",
    "direction": "horizontal",
    "sizes": [30, 70]
  }
}
```

#### Tabs Layout

Tabbed interface:

```json
{
  "layout": {
    "type": "tabs"
  },
  "components": [
    {
      "id": "tab1",
      "props": {
        "label": "Tab 1"
      }
    }
  ]
}
```

#### Grid Layout

CSS Grid:

```json
{
  "layout": {
    "type": "grid",
    "gap": 16
  }
}
```

## Component Tree

### Available Components

- **UI Components**: `Button`, `Card`, `Input`, `Badge`, `Textarea`
- **HTML Elements**: `div`, `span`, `h1`, `h2`, `h3`, `p`
- **Custom**: Register more in `ComponentRenderer.tsx`

### Component Example

```json
{
  "id": "submit-button",
  "type": "Button",
  "props": {
    "variant": "default",
    "size": "lg",
    "className": "w-full"
  },
  "children": [
    {
      "id": "button-text",
      "type": "span",
      "props": {
        "children": "Submit"
      }
    }
  ]
}
```

### Nesting Components

```json
{
  "id": "card",
  "type": "Card",
  "props": {
    "className": "p-4"
  },
  "children": [
    {
      "id": "title",
      "type": "h2",
      "props": {
        "children": "Title"
      }
    },
    {
      "id": "content",
      "type": "p",
      "props": {
        "children": "Content goes here"
      }
    }
  ]
}
```

## Data Sources

Data sources define where data comes from:

### KV Store

```json
{
  "id": "files",
  "type": "kv",
  "key": "project-files",
  "defaultValue": []
}
```

### Computed Data

```json
{
  "id": "activeFile",
  "type": "computed",
  "dependencies": ["files", "activeFileId"],
  "compute": "context.files.find(f => f.id === context.activeFileId)"
}
```

### Static Data

```json
{
  "id": "greeting",
  "type": "static",
  "defaultValue": "Hello, World!"
}
```

### AI-Generated Data

```json
{
  "id": "suggestions",
  "type": "ai",
  "dependencies": ["userInput"],
  "compute": "Generate 3 suggestions based on: ${context.userInput}"
}
```

## Actions

Actions define what happens when events occur:

### Create Action

```json
{
  "id": "add-model",
  "type": "create",
  "trigger": "button-click",
  "params": {
    "target": "Models",
    "data": {
      "id": "${Date.now()}",
      "name": "NewModel"
    }
  },
  "onSuccess": "show-success-toast"
}
```

### Update Action

```json
{
  "id": "update-file",
  "type": "update",
  "trigger": "input-change",
  "params": {
    "target": "Files",
    "id": "${context.activeFileId}",
    "data": {
      "content": "${event.value}"
    }
  }
}
```

### Delete Action

```json
{
  "id": "delete-item",
  "type": "delete",
  "trigger": "button-click",
  "params": {
    "target": "Models",
    "id": "${context.selectedId}"
  }
}
```

### Navigate Action

```json
{
  "id": "go-to-dashboard",
  "type": "navigate",
  "trigger": "button-click",
  "params": {
    "tab": "dashboard"
  }
}
```

### AI Generate Action

```json
{
  "id": "ai-generate",
  "type": "ai-generate",
  "trigger": "button-click",
  "params": {
    "prompt": "Generate a user registration form with validation",
    "target": "Components"
  }
}
```

### Custom Action

```json
{
  "id": "custom-logic",
  "type": "custom",
  "trigger": "button-click",
  "params": {
    "customParam": "value"
  },
  "handler": "myCustomHandler"
}
```

## Bindings

Bindings connect data to component props:

### Simple Binding

```json
{
  "bindings": [
    {
      "source": "user.name",
      "target": "children"
    }
  ]
}
```

### Transformed Binding

```json
{
  "bindings": [
    {
      "source": "files",
      "target": "children",
      "transform": "value.length + ' files'"
    }
  ]
}
```

### Multiple Bindings

```json
{
  "bindings": [
    {
      "source": "user.name",
      "target": "value"
    },
    {
      "source": "user.isActive",
      "target": "disabled",
      "transform": "!value"
    }
  ]
}
```

## Events

Events connect user interactions to actions:

### Button Click

```json
{
  "events": [
    {
      "event": "onClick",
      "action": "add-model"
    }
  ]
}
```

### Input Change

```json
{
  "events": [
    {
      "event": "onChange",
      "action": "update-content",
      "params": {
        "field": "name"
      }
    }
  ]
}
```

### Multiple Events

```json
{
  "events": [
    {
      "event": "onClick",
      "action": "select-item"
    },
    {
      "event": "onDoubleClick",
      "action": "edit-item"
    }
  ]
}
```

## Hooks

Custom hooks can be included:

```json
{
  "hooks": [
    {
      "id": "files-hook",
      "name": "useFiles",
      "exports": ["files", "addFile", "updateFile"]
    },
    {
      "id": "modal-hook",
      "name": "useModal",
      "params": {
        "defaultOpen": false
      },
      "exports": ["isOpen", "open", "close"]
    }
  ]
}
```

## Examples

### Simple List Page

```json
{
  "id": "todo-list",
  "name": "Todo List",
  "layout": {
    "type": "single"
  },
  "components": [
    {
      "id": "container",
      "type": "div",
      "props": {
        "className": "p-6"
      },
      "children": [
        {
          "id": "header",
          "type": "div",
          "props": {
            "className": "flex justify-between mb-4"
          },
          "children": [
            {
              "id": "title",
              "type": "h1",
              "props": {
                "children": "My Todos"
              }
            },
            {
              "id": "add-button",
              "type": "Button",
              "events": [
                {
                  "event": "onClick",
                  "action": "add-todo"
                }
              ],
              "children": [
                {
                  "id": "button-text",
                  "type": "span",
                  "props": {
                    "children": "Add Todo"
                  }
                }
              ]
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
      "params": {
        "target": "Todos",
        "data": {
          "id": "${Date.now()}",
          "text": "New todo",
          "completed": false
        }
      }
    }
  ]
}
```

### Master-Detail Page

```json
{
  "id": "user-detail",
  "name": "User Detail",
  "layout": {
    "type": "split",
    "direction": "horizontal",
    "sizes": [30, 70]
  },
  "components": [
    {
      "id": "user-list",
      "type": "Card",
      "props": {
        "className": "h-full p-4"
      }
    },
    {
      "id": "user-details",
      "type": "Card",
      "props": {
        "className": "h-full p-4"
      },
      "condition": "context.selectedUser !== null"
    }
  ],
  "data": [
    {
      "id": "selectedUser",
      "type": "computed",
      "dependencies": ["users", "selectedUserId"],
      "compute": "context.users.find(u => u.id === context.selectedUserId)"
    }
  ]
}
```

## Best Practices

### 1. Use Descriptive IDs

```json
{
  "id": "submit-form-button"
}
```

### 2. Keep Components Focused

Break down complex UIs into smaller components.

### 3. Use Computed Data

Don't repeat logic - compute derived data:

```json
{
  "id": "incomplete-count",
  "type": "computed",
  "compute": "context.todos.filter(t => !t.completed).length"
}
```

### 4. Handle Edge Cases

Use conditions for empty states:

```json
{
  "condition": "context.items.length === 0"
}
```

### 5. Provide Seed Data

Include example data for testing:

```json
{
  "seedData": {
    "exampleUser": {
      "id": "1",
      "name": "John Doe"
    }
  }
}
```

### 6. Use Action Chains

Link actions with onSuccess:

```json
{
  "id": "create-and-navigate",
  "type": "create",
  "onSuccess": "navigate-to-detail"
}
```

### 7. Keep Transforms Simple

Complex logic should be in hooks, not transforms.

### 8. Document Your Schemas

Add descriptions to clarify intent:

```json
{
  "description": "Main dashboard showing project stats"
}
```

## Next Steps

- See `/src/config/pages/` for more examples
- Check `/src/hooks/orchestration/` for hook implementation
- Refer to `/src/types/page-schema.ts` for full type definitions
- Read `REFACTOR_PHASE3.md` for architecture details
