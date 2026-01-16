# Fakemui Quick Reference Card

Quick lookup for fakemui components and usage patterns.

## Import Registry

```typescript
import {
  FAKEMUI_REGISTRY,
  FAKEMUI_CATEGORIES,
  getFakemUIComponent,
  isFakemUIComponentAvailable
} from '@/lib/fakemui-registry'

// Or import components directly
import { Button, TextField, Box, Grid } from '@/fakemui'
```

## Render JSON Component

```typescript
import { renderJSONComponent } from '@/lib/packages/json/render-json-component'

export function MyPage() {
  const component = await db.components.findOne({ id: 'comp_id' })
  return renderJSONComponent(component, { label: 'Save' })
}
```

## Component Categories (151+ Components)

| Category | Count | Examples |
|----------|-------|----------|
| Form | 28 | Button, TextField, Select, Checkbox, DatePicker |
| Display | 26 | Typography, Avatar, Badge, List, Table |
| Layout | 18 | Box, Grid, Stack, Card, Flex |
| Navigation | 22 | Tabs, Menu, Breadcrumbs, Pagination, Stepper |
| Modal | 11 | Dialog, Drawer, Modal, Accordion, AppBar |
| Table | 10 | Table, TableHead, DataGrid |
| Icons | 27 | Plus, Trash, Copy, Check, etc. |
| Feedback | 6 | Alert, Snackbar, Skeleton, Spinner |
| Advanced | 3 | Timeline, TreeView, Masonry |

## Component Definition

```json
{
  "id": "comp_my_component",
  "name": "My Component",
  "category": "form",
  "description": "What it does",
  "version": "1.0.0",
  "isPublished": true,
  "schema": {
    "type": "object",
    "properties": {
      "label": { "type": "string", "default": "Click" },
      "variant": { "enum": ["primary", "secondary"], "default": "primary" }
    }
  },
  "template": {
    "type": "Button",
    "props": { "variant": "{{variant}}" },
    "children": "{{label}}"
  },
  "props": { "label": "Click Me", "variant": "primary" },
  "events": [
    { "name": "onClick", "description": "Fired when clicked" }
  ]
}
```

## Common Components

### Buttons
```json
{ "type": "Button", "props": { "variant": "primary" }, "children": "Click" }
{ "type": "IconButton", "children": { "type": "Plus" } }
{ "type": "Fab", "props": { "color": "primary" }, "children": "+" }
```

### Forms
```json
{ "type": "TextField", "props": { "label": "Email", "type": "email" } }
{ "type": "Select", "props": { "label": "Option" } }
{ "type": "Checkbox", "props": { "label": "Agree" } }
{ "type": "DatePicker", "props": { "label": "Date" } }
```

### Layout
```json
{ "type": "Box", "style": { "padding": "1rem" }, "children": "..." }
{ "type": "Grid", "props": { "container": true, "spacing": 2 }, "children": [...] }
{ "type": "Stack", "props": { "spacing": 1 }, "children": [...] }
{ "type": "Card", "children": { "type": "CardContent", "children": "..." } }
```

### Text
```json
{ "type": "Typography", "props": { "variant": "h1" }, "children": "Title" }
{ "type": "Typography", "props": { "variant": "body1" }, "children": "Text" }
{ "type": "Label", "children": "Field Label" }
```

### Navigation
```json
{ "type": "Breadcrumbs", "children": [...] }
{ "type": "Tabs", "children": [...] }
{ "type": "Menu", "children": [...] }
{ "type": "Pagination", "props": { "count": 10 } }
```

### Table
```json
{
  "type": "TableContainer",
  "children": {
    "type": "Table",
    "children": [
      { "type": "TableHead", "children": [...] },
      { "type": "TableBody", "children": [...] }
    ]
  }
}
```

## Template Expressions

### Simple Property
```json
{ "props": { "label": "{{label}}" } }
```

### Nested Property
```json
{ "props": { "user": "{{state.user.name}}" } }
```

### Ternary Operator
```json
{ "children": "{{isLoading ? 'Loading...' : 'Ready'}}" }
```

### Negation
```json
{ "props": { "disabled": "{{!isEnabled}}" } }
```

### Conditional Rendering
```json
{
  "type": "conditional",
  "condition": "{{isLoading}}",
  "then": { "type": "Spinner" },
  "else": { "type": "Button", "children": "Save" }
}
```

## Common Props

### All Components
```json
{
  "style": { "padding": "1rem", "margin": "0.5rem" },
  "className": "my-class"
}
```

### Buttons
```json
{
  "variant": "primary|secondary|outline|ghost|danger|text",
  "size": "sm|md|lg",
  "disabled": false,
  "loading": false,
  "fullWidth": false
}
```

### Form Inputs
```json
{
  "label": "Field Label",
  "type": "text|email|password|number",
  "placeholder": "...",
  "required": true,
  "disabled": false,
  "fullWidth": true,
  "value": "{{value}}"
}
```

### Grid
```json
{
  "container": true,
  "item": true,
  "xs": 12,
  "sm": 6,
  "md": 4,
  "lg": 3,
  "spacing": 2
}
```

## Create Component

1. **Create folder**
   ```bash
   mkdir -p packages/my_pkg/component
   ```

2. **Create metadata.json**
   ```json
   {
     "entityType": "component",
     "description": "My components",
     "components": [
       { "id": "comp_x", "name": "Component X" }
     ]
   }
   ```

3. **Create components.json**
   ```json
   [
     {
       "id": "comp_x",
       "name": "Component X",
       "category": "form",
       "template": { "type": "Button", "children": "{{label}}" },
       "props": { "label": "Click" }
     }
   ]
   ```

4. **Use in page**
   ```json
   {
     "type": "comp_x",
     "props": { "label": "Save" }
   }
   ```

## Check Availability

```typescript
// Check if component exists
if (isFakemUIComponentAvailable('Button')) {
  // Can use Button
}

// Get component
const Button = getFakemUIComponent('Button')

// List all in category
const formComponents = FAKEMUI_CATEGORIES['form']

// List all categories
const categories = Object.keys(FAKEMUI_CATEGORIES)
```

## Patterns

### Card with Header and Actions
```json
{
  "type": "Card",
  "children": [
    { "type": "CardHeader", "props": { "title": "{{title}}" } },
    { "type": "CardContent", "children": "{{content}}" },
    {
      "type": "CardActions",
      "children": [
        { "type": "Button", "props": { "variant": "text" }, "children": "Cancel" },
        { "type": "Button", "props": { "variant": "contained" }, "children": "Save" }
      ]
    }
  ]
}
```

### Form with Validation
```json
{
  "type": "Box",
  "children": [
    {
      "type": "FormField",
      "props": { "label": "Email" },
      "children": {
        "type": "TextField",
        "props": { "type": "email", "required": true }
      }
    },
    {
      "type": "FormField",
      "props": { "label": "Password" },
      "children": {
        "type": "TextField",
        "props": { "type": "password", "required": true }
      }
    },
    {
      "type": "Button",
      "props": { "variant": "contained", "fullWidth": true },
      "children": "Sign In"
    }
  ]
}
```

### Responsive Grid
```json
{
  "type": "Grid",
  "props": { "container": true, "spacing": 2 },
  "children": [
    {
      "type": "Grid",
      "props": { "item": true, "xs": 12, "sm": 6, "md": 4 },
      "children": { "type": "Card", "children": "Item 1" }
    },
    {
      "type": "Grid",
      "props": { "item": true, "xs": 12, "sm": 6, "md": 4 },
      "children": { "type": "Card", "children": "Item 2" }
    },
    {
      "type": "Grid",
      "props": { "item": true, "xs": 12, "sm": 6, "md": 4 },
      "children": { "type": "Card", "children": "Item 3" }
    }
  ]
}
```

### Loading State
```json
{
  "type": "conditional",
  "condition": "{{isLoading}}",
  "then": {
    "type": "Box",
    "style": { "display": "flex", "justifyContent": "center", "padding": "2rem" },
    "children": { "type": "Spinner" }
  },
  "else": {
    "type": "Box",
    "children": "{{content}}"
  }
}
```

## Files

- **Registry**: `/frontends/nextjs/src/lib/fakemui-registry.ts`
- **Renderer**: `/frontends/nextjs/src/lib/packages/json/render-json-component.tsx`
- **Examples**: `/packages/ui_home/component/ui-components.json`
- **Mapping**: `/fakemui/COMPONENT_MAPPING.md`
- **Full Guide**: `/docs/FAKEMUI_INTEGRATION.md`
- **Architecture**: `/docs/COMPONENT_SYSTEM_ARCHITECTURE.md`
- **Migration**: `/docs/COMPONENT_MIGRATION_GUIDE.md`

## Learn More

- Full integration guide: `docs/FAKEMUI_INTEGRATION.md`
- System architecture: `docs/COMPONENT_SYSTEM_ARCHITECTURE.md`
- Migration examples: `docs/COMPONENT_MIGRATION_GUIDE.md`
- Component mapping: `fakemui/COMPONENT_MAPPING.md`
- Implementation summary: `docs/FAKEMUI_INTEGRATION_SUMMARY.md`

---

**Quick Reference**: Use this card as a bookmark for common tasks
**Full Documentation**: Refer to the guides for detailed information
**Version**: 1.0.0
**Components**: 151+
