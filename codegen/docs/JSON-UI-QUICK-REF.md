# JSON UI Quick Reference

## Basic Component Structure

```json
{
  "id": "unique-id",
  "type": "ComponentName",
  "props": {},
  "className": "tailwind-classes",
  "children": []
}
```

## Common Components

### Layout
```json
{"type": "div", "className": "flex gap-4"}
{"type": "section", "className": "grid grid-cols-2"}
```

### Typography
```json
{"type": "h1", "children": "Title"}
{"type": "p", "className": "text-muted-foreground"}
```

### Buttons
```json
{
  "type": "Button",
  "props": {"variant": "default|destructive|outline|secondary|ghost|link"},
  "events": {"onClick": "action-id"}
}
```

### Inputs
```json
{
  "type": "Input",
  "props": {"type": "text|email|password", "placeholder": "..."},
  "dataBinding": "formData.fieldName"
}
```

### Cards
```json
{
  "type": "Card",
  "children": [
    {"type": "CardHeader", "children": [
      {"type": "CardTitle", "children": "Title"},
      {"type": "CardDescription", "children": "Description"}
    ]},
    {"type": "CardContent", "children": [...]}
  ]
}
```

### Tables
```json
{
  "type": "Table",
  "children": [
    {"type": "TableHeader", "children": [...]},
    {"type": "TableBody", "children": [...]}
  ]
}
```

### Tabs
```json
{
  "type": "Tabs",
  "children": [
    {"type": "TabsList", "children": [
      {"type": "TabsTrigger", "props": {"value": "tab1"}}
    ]},
    {"type": "TabsContent", "props": {"value": "tab1"}}
  ]
}
```

## Data Binding

### Simple Binding
```json
{"dataBinding": "users"}
```

### Nested Path
```json
{"dataBinding": "user.profile.name"}
```

### With Source
```json
{
  "dataBinding": {
    "source": "userData",
    "path": "email"
  }
}
```

## Event Handlers

### Simple Action
```json
{"events": {"onClick": "my-action"}}
```

### With Parameters
```json
{
  "events": {
    "onClick": {
      "action": "delete-item",
      "params": {"id": "item.id"}
    }
  }
}
```

### Common Events
- `onClick`, `onDoubleClick`
- `onChange`, `onInput`
- `onSubmit`
- `onCheckedChange` (checkbox/switch)
- `onBlur`, `onFocus`

## Looping

```json
{
  "loop": {
    "source": "items",
    "itemVar": "item",
    "indexVar": "idx"
  },
  "children": [
    {"type": "div", "dataBinding": "item.name"}
  ]
}
```

## Conditional Rendering

```json
{
  "conditional": {
    "if": "user.isAdmin",
    "then": {"type": "div", "children": "Admin Panel"},
    "else": {"type": "div", "children": "Access Denied"}
  }
}
```

## Data Sources

### Static
```json
{
  "dataSources": {
    "stats": {
      "type": "static",
      "config": {"count": 42}
    }
  }
}
```

### API
```json
{
  "dataSources": {
    "users": {
      "type": "api",
      "config": {
        "url": "/api/users",
        "method": "GET"
      }
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

## Icons

Use Phosphor icon names:
```json
{"type": "Plus", "props": {"size": 16}}
{"type": "Trash", "className": "text-destructive"}
{"type": "Settings"}
```

Common icons: Plus, Minus, Check, X, Search, Filter, Edit, Trash, Eye, Save, Download, Upload, User, Bell, Calendar, Star, Heart, Settings

## Styling

Use Tailwind classes:
```json
{
  "className": "flex items-center gap-4 p-6 bg-card rounded-lg"
}
```

Responsive:
```json
{
  "className": "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
}
```

## Complete Example

```json
{
  "id": "user-card",
  "type": "Card",
  "className": "hover:shadow-lg transition-shadow",
  "children": [
    {
      "id": "card-header",
      "type": "CardHeader",
      "children": [
        {
          "id": "user-name",
          "type": "CardTitle",
          "dataBinding": "user.name"
        },
        {
          "id": "user-email",
          "type": "CardDescription",
          "dataBinding": "user.email"
        }
      ]
    },
    {
      "id": "card-content",
      "type": "CardContent",
      "children": [
        {
          "id": "user-bio",
          "type": "p",
          "className": "text-sm",
          "dataBinding": "user.bio"
        }
      ]
    },
    {
      "id": "card-footer",
      "type": "CardFooter",
      "className": "flex gap-2",
      "children": [
        {
          "id": "edit-button",
          "type": "Button",
          "props": {"size": "sm"},
          "events": {
            "onClick": {
              "action": "edit-user",
              "params": {"userId": "user.id"}
            }
          },
          "children": [
            {"type": "Edit", "props": {"size": 16}},
            {"type": "span", "children": "Edit"}
          ]
        }
      ]
    }
  ]
}
```

## Tips

✅ Always provide unique `id` values
✅ Use semantic HTML elements for better accessibility
✅ Leverage data binding instead of hardcoding
✅ Keep component trees shallow
✅ Use Tailwind for all styling
✅ Test with static data first, then move to dynamic sources
