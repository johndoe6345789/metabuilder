# JSON Page Configuration Guide

## Overview
Define entire pages using JSON configuration instead of writing React components.

## Page Schema Structure

```json
{
  "id": "my-page",
  "layout": {
    "type": "vertical",
    "spacing": "6",
    "sections": [...]
  },
  "dataBindings": ["prop1", "prop2"],
  "components": [...]
}
```

## Layout Types

### Vertical Layout
```json
{
  "type": "vertical",
  "spacing": "6",
  "sections": [
    { "type": "header", "title": "Page Title", "description": "Description" },
    { "type": "grid", "items": "statCards", "columns": { "md": 2, "lg": 3 } },
    { "type": "cards", "items": "dashboardCards" }
  ]
}
```

### Grid Layout
```json
{
  "type": "grid",
  "items": "myItems",
  "columns": {
    "sm": 1,
    "md": 2,
    "lg": 3,
    "xl": 4
  },
  "gap": "4"
}
```

## Data Binding

### Simple Bindings
```json
{
  "dataBinding": "files.length"
}
```

### Complex Expressions
```json
{
  "dataBinding": "flaskConfig.blueprints.reduce((acc, bp) => acc + bp.endpoints.length, 0)"
}
```

### Computed Data Sources
```json
{
  "dataSource": {
    "type": "computed",
    "compute": "calculateCompletionScore"
  }
}
```

## Component Types

### Stat Cards
```json
{
  "id": "code-files",
  "icon": "Code",
  "title": "Code Files",
  "dataBinding": "files.length",
  "description": "files in your project",
  "color": "text-blue-500"
}
```

### Gradient Cards
```json
{
  "id": "completion",
  "type": "gradient-card",
  "title": "Project Completeness",
  "icon": "CheckCircle",
  "gradient": "from-primary/10 to-accent/10",
  "dataSource": {
    "type": "computed",
    "compute": "calculateScore"
  },
  "components": [
    {
      "type": "metric",
      "binding": "score",
      "format": "percentage",
      "size": "large"
    },
    {
      "type": "progress",
      "binding": "score"
    }
  ]
}
```

### Custom React Components
```json
{
  "id": "build-status",
  "type": "card",
  "title": "Build Status",
  "component": "GitHubBuildStatus",
  "props": {}
}
```

## Sub-Components

### Metric Display
```json
{
  "type": "metric",
  "binding": "completionScore",
  "format": "percentage",
  "size": "large"
}
```

### Badge
```json
{
  "type": "badge",
  "binding": "status",
  "variants": {
    "ready": { "label": "Ready", "variant": "default" },
    "pending": { "label": "Pending", "variant": "secondary" }
  }
}
```

### Progress Bar
```json
{
  "type": "progress",
  "binding": "completionScore"
}
```

### Text
```json
{
  "type": "text",
  "binding": "message",
  "className": "text-sm text-muted-foreground"
}
```

## Icons
Use Phosphor icon names:
```json
{
  "icon": "Code"        // <Code size={24} weight="duotone" />
  "icon": "Database"    // <Database size={24} weight="duotone" />
  "icon": "Cube"        // <Cube size={24} weight="duotone" />
}
```

## Complete Example

```json
{
  "id": "project-overview",
  "layout": {
    "type": "vertical",
    "spacing": "6",
    "sections": [
      {
        "type": "header",
        "title": "Project Overview",
        "description": "Key metrics and status"
      },
      {
        "type": "grid",
        "items": "metrics",
        "columns": { "md": 2, "lg": 4 },
        "gap": "4"
      }
    ]
  },
  "metrics": [
    {
      "id": "total-files",
      "icon": "FileText",
      "title": "Total Files",
      "dataBinding": "files.length",
      "description": "source files",
      "color": "text-blue-500"
    },
    {
      "id": "test-coverage",
      "icon": "Shield",
      "title": "Test Coverage",
      "dataBinding": "tests.coverage",
      "description": "of code tested",
      "color": "text-green-500"
    }
  ]
}
```

## Usage in React

```typescript
import { JSONPageRenderer } from '@/components/JSONPageRenderer'
import pageSchema from '@/config/pages/my-page.json'

function MyPage(props) {
  const functions = {
    calculateScore: (data) => {
      // Custom calculation logic
      return Math.round((data.completed / data.total) * 100)
    }
  }

  return (
    <JSONPageRenderer
      schema={pageSchema}
      data={props}
      functions={functions}
    />
  )
}
```

## Benefits

1. **No Code Deployment**: Update UI without code changes
2. **Consistent Design**: Enforced design patterns
3. **Rapid Prototyping**: Build pages in minutes
4. **Easy Maintenance**: Clear structure and readability
5. **Type Safety**: Still benefits from TypeScript

## Migration Strategy

1. Start with simple stat-heavy pages (dashboards)
2. Define JSON schema for page
3. Implement custom functions for computed data
4. Replace React component with JSONPageRenderer
5. Test and iterate

## Future Enhancements

- [ ] Actions and event handlers in JSON
- [ ] Conditional rendering
- [ ] Animations and transitions
- [ ] Form definitions
- [ ] Table configurations
- [ ] Visual JSON schema editor
