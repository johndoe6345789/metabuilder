# Component Trees in features.json

**Define entire UI hierarchies in JSON - build complete interfaces declaratively!**

The `componentTrees` section in features.json allows you to define complete component hierarchies in a declarative JSON format. This enables you to build entire pages and complex UIs without writing JSX code.

## Overview

Component trees support:
- ✅ Nested component hierarchies
- ✅ Props passing with interpolation
- ✅ Conditional rendering
- ✅ Loops/iterations with `forEach`
- ✅ Data binding with `dataSource`
- ✅ Event handlers
- ✅ Dynamic values with template syntax `{{variable}}`

## Basic Structure

```json
{
  "componentTrees": {
    "MyPage": {
      "component": "Box",
      "props": {
        "sx": { "p": 3 }
      },
      "children": [
        {
          "component": "Typography",
          "props": {
            "variant": "h4",
            "text": "Hello World"
          }
        }
      ]
    }
  }
}
```

## Component Node Schema

```typescript
{
  "component": string,          // Component name (e.g., "Box", "Button", "DataGrid")
  "props"?: object,             // Component props
  "children"?: ComponentNode[], // Child components
  "condition"?: string,         // Render condition (e.g., "hasPermission('create')")
  "forEach"?: string,           // Loop over data (e.g., "items", "users")
  "dataSource"?: string,        // Bind to data source (e.g., "tableData", "navItems")
  "comment"?: string            // Documentation comment
}
```

## Template Syntax

Use `{{variable}}` for dynamic values:

```json
{
  "component": "Typography",
  "props": {
    "text": "Welcome, {{user.name}}!"
  }
}
```

### Accessing Nested Properties

```json
{
  "component": "Typography",
  "props": {
    "text": "{{user.profile.firstName}} {{user.profile.lastName}}"
  }
}
```

### Using Expressions

```json
{
  "component": "Icon",
  "props": {
    "name": "{{card.change > 0 ? 'TrendingUp' : 'TrendingDown'}}"
  }
}
```

## Conditional Rendering

Use the `condition` property to conditionally render components:

```json
{
  "component": "Button",
  "condition": "hasPermission('create')",
  "props": {
    "text": "Create New",
    "onClick": "openCreateDialog"
  }
}
```

### Multiple Conditions

```json
{
  "condition": "features.enableSearch && userRole === 'admin'",
  "component": "TextField",
  "props": {
    "placeholder": "Search..."
  }
}
```

## Loops with forEach

Iterate over arrays using `forEach`:

```json
{
  "component": "Grid",
  "forEach": "users",
  "props": {
    "item": true,
    "xs": 12,
    "sm": 6
  },
  "children": [
    {
      "component": "Card",
      "children": [
        {
          "component": "Typography",
          "props": {
            "text": "{{user.name}}"
          }
        }
      ]
    }
  ]
}
```

In the loop, the current item is available as the singular form of the array name:
- `forEach: "users"` → current item is `{{user}}`
- `forEach: "products"` → current item is `{{product}}`
- `forEach: "items"` → current item is `{{item}}`

## Data Sources

Bind components to data sources:

```json
{
  "component": "NavList",
  "dataSource": "navItems",
  "children": [
    {
      "component": "NavItem",
      "props": {
        "icon": "{{item.icon}}",
        "label": "{{item.label}}",
        "href": "/admin/{{item.id}}"
      }
    }
  ]
}
```

## Event Handlers

Reference event handler functions by name:

```json
{
  "component": "Button",
  "props": {
    "text": "Save",
    "onClick": "handleSave"
  }
}
```

Multiple handlers:

```json
{
  "component": "TextField",
  "props": {
    "value": "{{searchTerm}}",
    "onChange": "handleSearch",
    "onKeyPress": "handleKeyPress"
  }
}
```

## Complete Examples

### Admin Dashboard Layout

```json
{
  "AdminDashboard": {
    "component": "Box",
    "props": {
      "sx": { "display": "flex", "minHeight": "100vh" }
    },
    "children": [
      {
        "component": "Sidebar",
        "props": { "width": 240 },
        "children": [
          {
            "component": "NavList",
            "dataSource": "navItems",
            "children": [
              {
                "component": "NavItem",
                "props": {
                  "icon": "{{item.icon}}",
                  "label": "{{item.label}}",
                  "href": "/admin/{{item.id}}"
                }
              }
            ]
          }
        ]
      },
      {
        "component": "Box",
        "props": { "sx": { "flexGrow": 1 } },
        "children": [
          {
            "component": "AppBar",
            "children": [
              {
                "component": "Toolbar",
                "children": [
                  {
                    "component": "Typography",
                    "props": {
                      "variant": "h6",
                      "text": "{{pageTitle}}"
                    }
                  }
                ]
              }
            ]
          },
          {
            "component": "Outlet",
            "comment": "Child routes render here"
          }
        ]
      }
    ]
  }
}
```

### Resource List Page with CRUD Actions

```json
{
  "ResourceListPage": {
    "component": "Box",
    "children": [
      {
        "component": "Box",
        "props": {
          "sx": { "display": "flex", "justifyContent": "space-between", "mb": 3 }
        },
        "children": [
          {
            "component": "Typography",
            "props": {
              "variant": "h4",
              "text": "{{resourceName}}"
            }
          },
          {
            "component": "Button",
            "condition": "hasPermission('create')",
            "props": {
              "variant": "contained",
              "startIcon": "Add",
              "text": "Create New",
              "onClick": "openCreateDialog"
            }
          }
        ]
      },
      {
        "component": "DataGrid",
        "dataSource": "tableData",
        "props": {
          "columns": "{{columns}}",
          "rows": "{{rows}}",
          "onEdit": "handleEdit",
          "onDelete": "handleDelete"
        }
      },
      {
        "component": "Pagination",
        "condition": "features.enablePagination",
        "props": {
          "count": "{{totalPages}}",
          "page": "{{currentPage}}",
          "onChange": "handlePageChange"
        }
      }
    ]
  }
}
```

### Form Dialog

```json
{
  "FormDialogTree": {
    "component": "Dialog",
    "props": {
      "open": "{{open}}",
      "onClose": "handleClose",
      "maxWidth": "md"
    },
    "children": [
      {
        "component": "DialogTitle",
        "children": [
          {
            "component": "Typography",
            "props": {
              "text": "{{title}}"
            }
          }
        ]
      },
      {
        "component": "DialogContent",
        "children": [
          {
            "component": "Grid",
            "props": { "container": true, "spacing": 2 },
            "children": [
              {
                "component": "Grid",
                "forEach": "formFields",
                "props": {
                  "item": true,
                  "xs": 12,
                  "sm": 6
                },
                "children": [
                  {
                    "component": "DynamicField",
                    "props": {
                      "field": "{{field}}",
                      "value": "{{values[field.name]}}",
                      "onChange": "handleFieldChange"
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "component": "DialogActions",
        "children": [
          {
            "component": "Button",
            "props": {
              "text": "Cancel",
              "onClick": "handleClose"
            }
          },
          {
            "component": "Button",
            "props": {
              "variant": "contained",
              "text": "Save",
              "onClick": "handleSubmit",
              "disabled": "{{!isValid}}"
            }
          }
        ]
      }
    ]
  }
}
```

### Dashboard Stats Cards

```json
{
  "DashboardStatsCards": {
    "component": "Grid",
    "props": { "container": true, "spacing": 3 },
    "children": [
      {
        "component": "Grid",
        "forEach": "statsCards",
        "props": {
          "item": true,
          "xs": 12,
          "sm": 6,
          "md": 3
        },
        "children": [
          {
            "component": "Card",
            "children": [
              {
                "component": "CardContent",
                "children": [
                  {
                    "component": "Icon",
                    "props": {
                      "name": "{{card.icon}}",
                      "color": "{{card.color}}"
                    }
                  },
                  {
                    "component": "Typography",
                    "props": {
                      "variant": "h4",
                      "text": "{{card.value}}"
                    }
                  },
                  {
                    "component": "Typography",
                    "props": {
                      "variant": "body2",
                      "text": "{{card.label}}"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## Using Component Trees in Code

### Get a Component Tree

```typescript
import { getComponentTree } from '@/utils/featureConfig';

const tree = getComponentTree('AdminDashboard');
```

### Render a Component Tree

```typescript
import { getComponentTree } from '@/utils/featureConfig';

function ComponentTreeRenderer({ treeName, data, handlers }: Props) {
  const tree = getComponentTree(treeName);
  
  if (!tree) return null;
  
  return renderNode(tree, data, handlers);
}

function renderNode(node: ComponentNode, data: any, handlers: any): JSX.Element {
  const Component = getComponent(node.component);
  
  // Evaluate condition
  if (node.condition && !evaluateCondition(node.condition, data)) {
    return null;
  }
  
  // Handle forEach loops
  if (node.forEach) {
    const items = data[node.forEach] || [];
    return (
      <>
        {items.map((item: any, index: number) => {
          const itemData = { ...data, [getSingular(node.forEach)]: item };
          return renderNode({ ...node, forEach: undefined }, itemData, handlers);
        })}
      </>
    );
  }
  
  // Interpolate props
  const props = interpolateProps(node.props, data, handlers);
  
  // Render children
  const children = node.children?.map((child, idx) =>
    renderNode(child, data, handlers)
  );
  
  return <Component key={index} {...props}>{children}</Component>;
}
```

### Complete Example with React

```typescript
import React from 'react';
import { getComponentTree } from '@/utils/featureConfig';
import { Box, Button, Typography, Dialog, TextField } from '@mui/material';

const componentMap = {
  Box, Button, Typography, Dialog, TextField,
  // ... other components
};

function DynamicPage({ treeName }: { treeName: string }) {
  const tree = getComponentTree(treeName);
  const [data, setData] = useState({
    pageTitle: 'Users Management',
    resourceName: 'Users',
    rows: [],
    loading: false,
  });
  
  const handlers = {
    handleEdit: (row: any) => console.log('Edit', row),
    handleDelete: (row: any) => console.log('Delete', row),
    openCreateDialog: () => console.log('Create'),
  };
  
  return renderComponentTree(tree, data, handlers);
}
```

## Benefits of Component Trees

1. **Declarative UI**: Define UIs in configuration, not code
2. **Rapid Prototyping**: Build pages quickly without JSX
3. **Non-Technical Edits**: Allow non-developers to modify UI structure
4. **Consistency**: Enforce consistent component usage
5. **Dynamic Generation**: Generate UIs from API responses
6. **A/B Testing**: Easily swap component trees
7. **Version Control**: Track UI changes in JSON
8. **Hot Reloading**: Update UIs without code changes
9. **Multi-Platform**: Same tree can target web, mobile, etc.
10. **Reduced Code**: Less boilerplate, more configuration

## Best Practices

1. **Keep trees shallow**: Deep nesting is hard to maintain
2. **Use meaningful names**: `UserListPage` not `Page1`
3. **Document with comments**: Add `comment` fields for clarity
4. **Group related trees**: Organize by feature or page
5. **Validate props**: Ensure required props are present
6. **Test conditions**: Verify conditional logic works
7. **Handle missing data**: Provide fallbacks for `{{variables}}`
8. **Reuse subtrees**: Extract common patterns
9. **Type checking**: Use TypeScript for component props
10. **Version trees**: Track changes in version control

## Advanced Features

### Computed Values

```json
{
  "component": "Typography",
  "props": {
    "text": "{{items.length}} items found"
  }
}
```

### Nested Conditionals

```json
{
  "condition": "user.role === 'admin'",
  "component": "Box",
  "children": [
    {
      "condition": "user.permissions.includes('delete')",
      "component": "Button",
      "props": {
        "text": "Delete All",
        "onClick": "handleDeleteAll"
      }
    }
  ]
}
```

### Dynamic Component Selection

```json
{
  "component": "{{viewType === 'grid' ? 'GridView' : 'ListView'}}",
  "props": {
    "items": "{{items}}"
  }
}
```

## API Reference

### `getComponentTree(treeName: string): ComponentTree | undefined`

Get a component tree by name.

```typescript
const tree = getComponentTree('AdminDashboard');
```

### `getAllComponentTrees(): Record<string, ComponentTree>`

Get all defined component trees.

```typescript
const trees = getAllComponentTrees();
console.log(Object.keys(trees)); // ['AdminDashboard', 'ResourceListPage', ...]
```

## Conclusion

Component trees in features.json enable you to:
- Build complete UIs without writing JSX
- Define page layouts declaratively
- Create dynamic, data-driven interfaces
- Rapidly prototype and iterate
- **Build half your app from configuration!**

With component trees, features.json becomes a complete UI definition language, enabling true configuration-driven development.
