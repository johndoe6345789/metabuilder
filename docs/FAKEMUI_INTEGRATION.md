# Fakemui Integration Guide

Complete guide to integrating fakemui components with the JSON component system.

## Overview

The MetaBuilder frontend uses **fakemui** (Material-UI inspired component library) with a declarative JSON-based component system. This enables:

- **No hardcoded components** - All UI defined in JSON
- **Data-driven rendering** - Components rendered from database
- **Consistent styling** - All components use fakemui Material Design
- **Package self-containment** - Each package defines its own components
- **Runtime customization** - Admins can modify component definitions without code changes

## Architecture

```
Package Seed Data
  ↓
/packages/[packageId]/component/ui-components.json
  ↓
Schema Validation (component.schema.json)
  ↓
JSON Component Loader
  ↓
FAKEMUI_REGISTRY
  ↓
renderJSONComponent()
  ↓
Fakemui Components
  ↓
React Elements
  ↓
Browser
```

## Components Available

### 131+ Fakemui Components Organized by Category

| Category | Count | Components | Status |
|----------|-------|------------|--------|
| **Form** | 28 | Button, TextField, Select, Checkbox, Radio, DatePicker, ColorPicker, etc. | ✅ Ready |
| **Display** | 26 | Typography, Avatar, Badge, Chip, Tooltip, List, etc. | ✅ Ready |
| **Layout** | 18 | Box, Grid, Stack, Flex, Card, Paper, etc. | ✅ Ready |
| **Navigation** | 22 | Breadcrumbs, Pagination, Tabs, Stepper, Menu, etc. | ✅ Ready |
| **Modal** | 11 | Modal, Drawer, Popover, Dialog, Accordion, AppBar, etc. | ✅ Ready |
| **Table** | 10 | Table, TableHead, TableBody, DataGrid, etc. | ✅ Ready |
| **Icons** | 27 | Plus, Trash, Copy, Check, Arrow icons, etc. | ✅ Ready |
| **Feedback** | 6 | Alert, Snackbar, Skeleton, Spinner, etc. | ✅ Ready |
| **Advanced** | 3 | Timeline, TreeView, Masonry, LoadingButton | ✅ Ready |

**Total: 151 components available**

### Full Component Registry

Access the complete registry:

```typescript
import { FAKEMUI_REGISTRY, FAKEMUI_CATEGORIES } from '@/lib/fakemui-registry'

// Get a specific component
const ButtonComponent = FAKEMUI_REGISTRY['Button']

// Get all components in a category
const formComponents = FAKEMUI_CATEGORIES['form']

// Check if component exists
const exists = 'Button' in FAKEMUI_REGISTRY
```

## Creating JSON Components

### Step 1: Define Component in Seed Data

Create `/packages/my_package/component/ui-components.json`:

```json
[
  {
    "id": "comp_my_button",
    "name": "My Button",
    "description": "Primary action button",
    "category": "form",
    "version": "1.0.0",
    "isPublished": true,
    "schema": {
      "type": "object",
      "properties": {
        "label": { "type": "string", "default": "Click Me" },
        "variant": {
          "type": "string",
          "enum": ["primary", "secondary", "outline"],
          "default": "primary"
        },
        "disabled": { "type": "boolean", "default": false }
      }
    },
    "template": {
      "type": "Button",
      "props": {
        "variant": "{{variant}}",
        "disabled": "{{disabled}}"
      },
      "children": "{{label}}"
    },
    "props": {
      "label": "Click Me",
      "variant": "primary",
      "disabled": false
    },
    "events": [
      { "name": "onClick", "description": "Fired when clicked" }
    ]
  }
]
```

### Step 2: Create Metadata File

Create `/packages/my_package/component/metadata.json`:

```json
{
  "entityType": "component",
  "description": "My package components",
  "components": [
    {
      "id": "comp_my_button",
      "name": "My Button"
    }
  ]
}
```

### Step 3: Use in Page Definition

In `/packages/my_package/page-config/my-page.json`:

```json
[
  {
    "id": "page_my_page",
    "path": "/my-page",
    "title": "My Page",
    "component": "my_page_root",
    "componentTree": {
      "type": "Box",
      "children": [
        {
          "type": "comp_my_button",
          "props": {
            "label": "Save",
            "variant": "primary"
          }
        }
      ]
    }
  }
]
```

## Template Syntax

### Basic Syntax

```json
{
  "type": "Button",
  "props": {
    "label": "Click Me"
  },
  "children": "Button Text"
}
```

### Dynamic Values (Template Expressions)

```json
{
  "type": "TextField",
  "props": {
    "label": "{{label}}",
    "placeholder": "{{placeholder}}",
    "value": "{{formData.email}}"
  }
}
```

Supported expressions:
- `{{variable}}` - Simple property access
- `{{props.title}}` - Nested property
- `{{state.isLoading}}` - State access
- `{{value ? 'Yes' : 'No'}}` - Ternary operator
- `{{!disabled}}` - Negation

### Conditional Rendering

```json
{
  "type": "conditional",
  "condition": "{{isLoading}}",
  "then": {
    "type": "Spinner"
  },
  "else": {
    "type": "Button",
    "children": "Save"
  }
}
```

### Arrays and Iteration

```json
{
  "type": "Box",
  "children": [
    {
      "type": "Typography",
      "children": "Item 1"
    },
    {
      "type": "Typography",
      "children": "Item 2"
    },
    {
      "type": "Typography",
      "children": "Item 3"
    }
  ]
}
```

## Fakemui Component Examples

### Button Component

```json
{
  "id": "comp_action_button",
  "name": "Action Button",
  "category": "form",
  "template": {
    "type": "Button",
    "props": {
      "variant": "{{variant}}",
      "size": "{{size}}",
      "disabled": "{{disabled}}",
      "loading": "{{loading}}",
      "fullWidth": "{{fullWidth}}"
    },
    "children": "{{label}}"
  },
  "props": {
    "label": "Click",
    "variant": "primary",
    "size": "md",
    "disabled": false,
    "loading": false,
    "fullWidth": false
  }
}
```

### Card Component

```json
{
  "id": "comp_feature_card",
  "name": "Feature Card",
  "category": "layout",
  "template": {
    "type": "Card",
    "children": [
      {
        "type": "CardMedia",
        "props": {
          "component": "img",
          "height": "200",
          "image": "{{image}}"
        }
      },
      {
        "type": "CardContent",
        "children": [
          {
            "type": "Typography",
            "props": { "variant": "h5", "component": "div" },
            "children": "{{title}}"
          },
          {
            "type": "Typography",
            "props": { "variant": "body2", "color": "textSecondary" },
            "children": "{{description}}"
          }
        ]
      },
      {
        "type": "CardActions",
        "children": [
          {
            "type": "Button",
            "props": { "size": "small" },
            "children": "Learn More"
          }
        ]
      }
    ]
  },
  "props": {
    "image": "/default-image.jpg",
    "title": "Feature",
    "description": "Feature description"
  }
}
```

### Form Component

```json
{
  "id": "comp_login_form",
  "name": "Login Form",
  "category": "form",
  "template": {
    "type": "Box",
    "style": { "maxWidth": "400px", "margin": "0 auto" },
    "children": [
      {
        "type": "TextField",
        "props": {
          "label": "Email",
          "type": "email",
          "fullWidth": true,
          "margin": "normal"
        }
      },
      {
        "type": "TextField",
        "props": {
          "label": "Password",
          "type": "password",
          "fullWidth": true,
          "margin": "normal"
        }
      },
      {
        "type": "Button",
        "props": {
          "variant": "contained",
          "fullWidth": true,
          "sx": { "mt": 3, "mb": 2 }
        },
        "children": "Sign In"
      }
    ]
  }
}
```

### Grid Layout

```json
{
  "id": "comp_feature_grid",
  "name": "Feature Grid",
  "category": "layout",
  "template": {
    "type": "Grid",
    "props": { "container": true, "spacing": 2 },
    "children": [
      {
        "type": "Grid",
        "props": { "item": true, "xs": 12, "sm": 6, "md": 4 },
        "children": {
          "type": "Card",
          "children": [
            {
              "type": "CardContent",
              "children": {
                "type": "Typography",
                "children": "Feature 1"
              }
            }
          ]
        }
      },
      {
        "type": "Grid",
        "props": { "item": true, "xs": 12, "sm": 6, "md": 4 },
        "children": {
          "type": "Card",
          "children": [
            {
              "type": "CardContent",
              "children": {
                "type": "Typography",
                "children": "Feature 2"
              }
            }
          ]
        }
      },
      {
        "type": "Grid",
        "props": { "item": true, "xs": 12, "sm": 6, "md": 4 },
        "children": {
          "type": "Card",
          "children": [
            {
              "type": "CardContent",
              "children": {
                "type": "Typography",
                "children": "Feature 3"
              }
            }
          ]
        }
      }
    ]
  }
}
```

## Rendering Components

### In React Component

```typescript
import { renderJSONComponent } from '@/lib/packages/json/render-json-component'
import type { JSONComponent } from '@/lib/packages/json/types'

export function MyComponent({ componentDef }: { componentDef: JSONComponent }) {
  return renderJSONComponent(componentDef, {
    label: 'Custom Label',
    isLoading: false,
  })
}
```

### With Custom Component Registry

```typescript
import { renderJSONComponent } from '@/lib/packages/json/render-json-component'
import { FAKEMUI_REGISTRY } from '@/lib/fakemui-registry'

const customRegistry = {
  ...FAKEMUI_REGISTRY,
  CustomButton: MyCustomButton,
}

return renderJSONComponent(componentDef, props, customRegistry)
```

## Real-World Examples

### Home Page Hero Section

```json
[
  {
    "id": "page_home",
    "path": "/",
    "title": "Home",
    "component": "home_root",
    "componentTree": {
      "type": "Box",
      "children": [
        {
          "type": "Box",
          "style": {
            "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "color": "white",
            "padding": "4rem 2rem",
            "textAlign": "center"
          },
          "children": [
            {
              "type": "Typography",
              "props": { "variant": "h1" },
              "style": { "marginBottom": "1rem", "fontSize": "3rem" },
              "children": "MetaBuilder"
            },
            {
              "type": "Typography",
              "props": { "variant": "h5" },
              "style": { "marginBottom": "2rem" },
              "children": "Data-driven application platform"
            },
            {
              "type": "Button",
              "props": { "variant": "contained", "size": "lg" },
              "children": "Get Started"
            }
          ]
        }
      ]
    }
  }
]
```

### Data Table Component

```json
{
  "id": "comp_users_table",
  "name": "Users Table",
  "category": "table",
  "template": {
    "type": "TableContainer",
    "children": {
      "type": "Table",
      "children": [
        {
          "type": "TableHead",
          "children": {
            "type": "TableRow",
            "children": [
              {
                "type": "TableCell",
                "children": "Name"
              },
              {
                "type": "TableCell",
                "children": "Email"
              },
              {
                "type": "TableCell",
                "children": "Role"
              }
            ]
          }
        },
        {
          "type": "TableBody",
          "children": [
            {
              "type": "TableRow",
              "children": [
                {
                  "type": "TableCell",
                  "children": "{{users[0].name}}"
                },
                {
                  "type": "TableCell",
                  "children": "{{users[0].email}}"
                },
                {
                  "type": "TableCell",
                  "children": "{{users[0].role}}"
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

## Best Practices

### 1. Use Semantic Components

```json
// ✅ GOOD - Use semantic components
{
  "type": "Button",
  "props": { "variant": "primary" },
  "children": "Save"
}

// ❌ AVOID - Don't hardcode divs
{
  "type": "div",
  "style": { "backgroundColor": "blue", "color": "white", "cursor": "pointer" },
  "children": "Save"
}
```

### 2. Leverage Props and State

```json
// ✅ GOOD - Use template expressions
{
  "type": "Button",
  "props": {
    "disabled": "{{isLoading}}",
    "loading": "{{isLoading}}"
  },
  "children": "{{isLoading ? 'Saving...' : 'Save'}}"
}

// ❌ AVOID - Don't hardcode values
{
  "type": "Button",
  "props": { "disabled": false },
  "children": "Save"
}
```

### 3. Organize Components by Package

```
packages/ui_header/component/
  ├── metadata.json
  └── header-components.json

packages/ui_footer/component/
  ├── metadata.json
  └── footer-components.json

packages/dashboard/component/
  ├── metadata.json
  └── dashboard-components.json
```

### 4. Use Consistent Naming

```json
// ✅ GOOD
{
  "id": "comp_header_navbar",
  "name": "Header Navigation Bar"
}

// ❌ AVOID
{
  "id": "nav1",
  "name": "Nav"
}
```

### 5. Document Props

```json
{
  "id": "comp_feature_card",
  "name": "Feature Card",
  "description": "Displays a feature with icon, title, and description",
  "schema": {
    "type": "object",
    "properties": {
      "icon": {
        "type": "string",
        "description": "Icon name (Star, Heart, etc.)",
        "default": "Star"
      },
      "title": {
        "type": "string",
        "description": "Card title",
        "minLength": 1
      },
      "description": {
        "type": "string",
        "description": "Card description text"
      }
    }
  }
}
```

## Troubleshooting

### Component Not Rendering

**Problem**: Component renders but is blank
**Solution**: Check that `template` is defined in component definition

```json
{
  "id": "comp_my_component",
  "name": "My Component",
  "template": {  // ← Required
    "type": "Box",
    "children": "..."
  }
}
```

### Template Expression Not Working

**Problem**: `{{variable}}` showing literally in output
**Solution**: Ensure props are passed to renderer

```typescript
// Make sure props match template expressions
renderJSONComponent(componentDef, {
  variable: 'actual value'  // ← Must be provided
})
```

### Component Not in Registry

**Problem**: Error "Component [Name] not found"
**Solution**: Verify component is exported from fakemui

```typescript
import { FAKEMUI_REGISTRY } from '@/lib/fakemui-registry'
console.log(Object.keys(FAKEMUI_REGISTRY))  // List all available
```

## Migration Guide

### From Hardcoded Components to JSON

**Before** (Hardcoded):
```typescript
export function HomePage() {
  return (
    <Box>
      <Typography variant="h1">Home</Typography>
      <Button variant="primary">Get Started</Button>
    </Box>
  )
}
```

**After** (JSON-based):
```typescript
// packages/ui_home/component/home-components.json
[
  {
    "id": "comp_home_hero",
    "template": {
      "type": "Box",
      "children": [
        { "type": "Typography", "props": { "variant": "h1" }, "children": "Home" },
        { "type": "Button", "props": { "variant": "primary" }, "children": "Get Started" }
      ]
    }
  }
]

// Frontend loads from database and renders
export function HomePage() {
  const component = await db.components.findOne({ id: 'comp_home_hero' })
  return renderJSONComponent(component)
}
```

## References

- **Fakemui Components**: 131+ Material Design components
- **Component Schema**: `/schemas/package-schemas/component.schema.json`
- **Registry**: `/frontends/nextjs/src/lib/fakemui-registry.ts`
- **Renderer**: `/frontends/nextjs/src/lib/packages/json/render-json-component.tsx`
- **Examples**: `/packages/ui_home/component/ui-components.json`

---

**Last Updated**: 2026-01-16
**Version**: 1.0.0
**Status**: Production Ready
