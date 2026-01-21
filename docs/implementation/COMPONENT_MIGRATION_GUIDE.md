# Component Migration Guide

Guide for adding declarative JSON components to existing packages.

## Quick Start

### Step 1: Create Component Folder

```bash
mkdir -p packages/my_package/component
```

### Step 2: Create Metadata File

```bash
cat > packages/my_package/component/metadata.json << 'EOF'
{
  "entityType": "component",
  "description": "My package components",
  "components": [
    { "id": "comp_my_button", "name": "My Button" },
    { "id": "comp_my_card", "name": "My Card" }
  ]
}
EOF
```

### Step 3: Define Components

```bash
cat > packages/my_package/component/components.json << 'EOF'
[
  {
    "id": "comp_my_button",
    "name": "My Button",
    "category": "form",
    "template": {
      "type": "Button",
      "props": { "variant": "{{variant}}" },
      "children": "{{label}}"
    },
    "props": { "label": "Click", "variant": "primary" }
  },
  {
    "id": "comp_my_card",
    "name": "My Card",
    "category": "layout",
    "template": {
      "type": "Card",
      "children": { "type": "CardContent", "children": "{{content}}" }
    },
    "props": { "content": "Card content" }
  }
]
EOF
```

### Step 4: Bootstrap

```bash
POST http://localhost:3000/api/bootstrap
```

Components now available in database and can be used in pages.

## Detailed Examples

### Example 1: Basic Button Component

**Scenario**: You have a custom button style and want to make it customizable.

**Before** (Hardcoded):
```typescript
// packages/my_package/src/components/MyButton.tsx
export function MyButton({ label }: { label: string }) {
  return (
    <Button variant="contained" color="primary">
      {label}
    </Button>
  )
}

// Usage in page.tsx
return <MyButton label="Click Me" />
```

**After** (Declarative):
```json
// packages/my_package/component/components.json
[
  {
    "id": "comp_my_button",
    "name": "My Button",
    "description": "Custom branded button",
    "category": "form",
    "version": "1.0.0",
    "isPublished": true,
    "schema": {
      "type": "object",
      "properties": {
        "label": { "type": "string", "default": "Click" },
        "variant": {
          "type": "string",
          "enum": ["contained", "outlined", "text"],
          "default": "contained"
        },
        "color": {
          "type": "string",
          "enum": ["primary", "secondary", "error"],
          "default": "primary"
        },
        "disabled": { "type": "boolean", "default": false }
      }
    },
    "template": {
      "type": "Button",
      "props": {
        "variant": "{{variant}}",
        "color": "{{color}}",
        "disabled": "{{disabled}}"
      },
      "children": "{{label}}"
    },
    "props": {
      "label": "Click Me",
      "variant": "contained",
      "color": "primary",
      "disabled": false
    },
    "events": [
      { "name": "onClick", "description": "Fired when button clicked" }
    ]
  }
]
```

**Usage in page**:
```json
// packages/my_package/page-config/page.json
[
  {
    "id": "page_example",
    "path": "/example",
    "title": "Example",
    "component": "example_root",
    "componentTree": {
      "type": "Box",
      "children": {
        "type": "comp_my_button",
        "props": {
          "label": "Save Changes",
          "variant": "contained",
          "color": "primary"
        }
      }
    }
  }
]
```

**Benefits**:
- Customizable from admin panel
- No code changes to update UI
- Consistent styling across app
- Can be used in multiple pages

### Example 2: Complex Card Component

**Before** (Hardcoded):
```typescript
// packages/dashboard/src/components/DashboardCard.tsx
export function DashboardCard({
  title,
  icon,
  content,
  footer
}: {
  title: string
  icon: React.ReactNode
  content: string
  footer?: string
}) {
  return (
    <Card>
      <CardHeader
        avatar={<Avatar>{icon}</Avatar>}
        title={title}
      />
      <CardContent>
        <Typography>{content}</Typography>
      </CardContent>
      {footer && (
        <CardActions>
          <Typography variant="caption">{footer}</Typography>
        </CardActions>
      )}
    </Card>
  )
}
```

**After** (Declarative):
```json
[
  {
    "id": "comp_dashboard_card",
    "name": "Dashboard Card",
    "description": "Card for dashboard widgets",
    "category": "layout",
    "schema": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "icon": { "type": "string" },
        "content": { "type": "string" },
        "footer": { "type": ["string", "null"] },
        "showIcon": { "type": "boolean", "default": true }
      },
      "required": ["title", "content"]
    },
    "template": {
      "type": "Card",
      "children": [
        {
          "type": "CardHeader",
          "props": { "title": "{{title}}" },
          "children": {
            "type": "conditional",
            "condition": "{{showIcon}}",
            "then": {
              "type": "Avatar",
              "children": "{{icon}}"
            }
          }
        },
        {
          "type": "CardContent",
          "children": {
            "type": "Typography",
            "children": "{{content}}"
          }
        },
        {
          "type": "CardActions",
          "children": {
            "type": "conditional",
            "condition": "{{footer}}",
            "then": {
              "type": "Typography",
              "props": { "variant": "caption" },
              "children": "{{footer}}"
            }
          }
        }
      ]
    },
    "props": {
      "title": "Widget",
      "icon": "Star",
      "content": "Widget content",
      "footer": null,
      "showIcon": true
    }
  }
]
```

### Example 3: Form Component

**Before** (Hardcoded):
```typescript
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <Box sx={{ maxWidth: 400 }}>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{ mt: 2 }}
      />
      <Button variant="contained" fullWidth sx={{ mt: 3 }}>
        Sign In
      </Button>
    </Box>
  )
}
```

**After** (Declarative):
```json
[
  {
    "id": "comp_login_form",
    "name": "Login Form",
    "category": "form",
    "template": {
      "type": "Box",
      "style": { "maxWidth": "400px", "margin": "0 auto" },
      "children": [
        {
          "type": "FormField",
          "props": { "label": "Email" },
          "children": {
            "type": "TextField",
            "props": {
              "type": "email",
              "placeholder": "{{emailPlaceholder}}",
              "fullWidth": true
            }
          }
        },
        {
          "type": "FormField",
          "props": { "label": "Password" },
          "children": {
            "type": "TextField",
            "props": {
              "type": "password",
              "placeholder": "{{passwordPlaceholder}}",
              "fullWidth": true
            }
          }
        },
        {
          "type": "Button",
          "props": {
            "variant": "contained",
            "fullWidth": true,
            "disabled": "{{isLoading}}"
          },
          "children": "{{isLoading ? 'Signing in...' : 'Sign In'}}"
        }
      ]
    },
    "props": {
      "emailPlaceholder": "you@example.com",
      "passwordPlaceholder": "••••••••",
      "isLoading": false
    }
  }
]
```

### Example 4: Data Table Component

**Before** (Hardcoded):
```typescript
export function UserTable({ users }: { users: User[] }) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
```

**After** (Declarative):
```json
[
  {
    "id": "comp_user_table",
    "name": "User Table",
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
                { "type": "TableCell", "children": "Name" },
                { "type": "TableCell", "children": "Email" },
                { "type": "TableCell", "children": "Role" }
              ]
            }
          },
          {
            "type": "TableBody",
            "children": [
              {
                "type": "TableRow",
                "children": [
                  { "type": "TableCell", "children": "{{users[0].name}}" },
                  { "type": "TableCell", "children": "{{users[0].email}}" },
                  { "type": "TableCell", "children": "{{users[0].role}}" }
                ]
              }
            ]
          }
        ]
      }
    }
  }
]
```

**Note**: Full iteration support would require template loops (future enhancement).

### Example 5: Feature Grid Component

**Before** (Hardcoded):
```typescript
export function FeatureGrid() {
  const features = [
    { icon: '⚡', title: 'Fast', desc: 'Lightning quick' },
    { icon: '🔒', title: 'Secure', desc: 'Enterprise security' },
    { icon: '📈', title: 'Scalable', desc: 'Grow without limits' },
  ]

  return (
    <Grid container spacing={2}>
      {features.map((feature) => (
        <Grid item xs={12} md={4} key={feature.title}>
          <Card>
            <CardContent>
              <div style={{ fontSize: '2rem' }}>{feature.icon}</div>
              <Typography variant="h6">{feature.title}</Typography>
              <Typography variant="body2">{feature.desc}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
```

**After** (Declarative):
```json
[
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
          "props": { "item": true, "xs": 12, "md": 4 },
          "children": {
            "type": "Card",
            "children": {
              "type": "CardContent",
              "children": [
                {
                  "type": "Box",
                  "style": { "fontSize": "2rem", "marginBottom": "1rem" },
                  "children": "⚡"
                },
                {
                  "type": "Typography",
                  "props": { "variant": "h6" },
                  "children": "Fast"
                },
                {
                  "type": "Typography",
                  "props": { "variant": "body2" },
                  "children": "Lightning quick"
                }
              ]
            }
          }
        },
        {
          "type": "Grid",
          "props": { "item": true, "xs": 12, "md": 4 },
          "children": {
            "type": "Card",
            "children": {
              "type": "CardContent",
              "children": [
                {
                  "type": "Box",
                  "style": { "fontSize": "2rem", "marginBottom": "1rem" },
                  "children": "🔒"
                },
                {
                  "type": "Typography",
                  "props": { "variant": "h6" },
                  "children": "Secure"
                },
                {
                  "type": "Typography",
                  "props": { "variant": "body2" },
                  "children": "Enterprise security"
                }
              ]
            }
          }
        },
        {
          "type": "Grid",
          "props": { "item": true, "xs": 12, "md": 4 },
          "children": {
            "type": "Card",
            "children": {
              "type": "CardContent",
              "children": [
                {
                  "type": "Box",
                  "style": { "fontSize": "2rem", "marginBottom": "1rem" },
                  "children": "📈"
                },
                {
                  "type": "Typography",
                  "props": { "variant": "h6" },
                  "children": "Scalable"
                },
                {
                  "type": "Typography",
                  "props": { "variant": "body2" },
                  "children": "Grow without limits"
                }
              ]
            }
          }
        }
      ]
    }
  }
]
```

## Migration Checklist

- [ ] Create `/packages/[package]/component/` folder
- [ ] Create `metadata.json` with entity type and component list
- [ ] Create `components.json` with all component definitions
- [ ] Define schema for each component (props validation)
- [ ] Define template (component tree structure)
- [ ] Set default props
- [ ] Document events (if component emits events)
- [ ] Test with `POST /api/bootstrap`
- [ ] Verify components load in database: `db.components.list()`
- [ ] Test rendering in a page
- [ ] Update page definitions to reference new components
- [ ] Remove hardcoded components from TypeScript
- [ ] Commit changes

## Common Patterns

### Pattern 1: Conditional Display

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

### Pattern 2: Styled Box

```json
{
  "type": "Box",
  "style": {
    "padding": "2rem",
    "backgroundColor": "{{backgroundColor}}",
    "borderRadius": "8px"
  },
  "children": "{{children}}"
}
```

### Pattern 3: Form Field Wrapper

```json
{
  "type": "FormField",
  "props": {
    "label": "{{label}}",
    "required": "{{required}}"
  },
  "children": {
    "type": "TextField",
    "props": {
      "placeholder": "{{placeholder}}",
      "value": "{{value}}"
    }
  }
}
```

### Pattern 4: Card with Actions

```json
{
  "type": "Card",
  "children": [
    {
      "type": "CardContent",
      "children": "{{content}}"
    },
    {
      "type": "CardActions",
      "children": [
        {
          "type": "Button",
          "props": { "variant": "text" },
          "children": "Cancel"
        },
        {
          "type": "Button",
          "props": { "variant": "contained" },
          "children": "Save"
        }
      ]
    }
  ]
}
```

### Pattern 5: Responsive Grid

```json
{
  "type": "Grid",
  "props": { "container": true, "spacing": 2 },
  "children": [
    {
      "type": "Grid",
      "props": {
        "item": true,
        "xs": 12,
        "sm": 6,
        "md": 4,
        "lg": 3
      },
      "children": "{{item}}"
    }
  ]
}
```

## Troubleshooting

### Components Not Loading After Bootstrap

1. Check metadata.json exists:
   ```bash
   ls packages/my_package/component/metadata.json
   ```

2. Check components.json exists:
   ```bash
   ls packages/my_package/component/components.json
   ```

3. Check JSON is valid:
   ```bash
   npx json-schema-validator packages/my_package/component/components.json \
     schemas/package-schemas/component.schema.json
   ```

4. Check database:
   ```bash
   npm --prefix dbal/development run db:studio
   # Query ComponentConfig table
   ```

### Template Expressions Not Evaluating

1. Check component receives props:
   ```json
   {
     "template": {
       "type": "Button",
       "props": {
         "label": "{{label}}"  // Props passed to renderJSONComponent
       }
     },
     "props": {
       "label": "Default Label"  // Optional default
     }
   }
   ```

2. Check expression syntax:
   ```json
   // ✅ CORRECT
   "{{props.title}}"
   "{{isLoading ? 'Saving...' : 'Save'}}"
   "{{!disabled}}"

   // ❌ WRONG
   "{title}"
   "{{props.title + ' extra'}}"
   "{{doSomething()}}"
   ```

### Component Not Found in Registry

```bash
# List all available components
node -e "console.log(require('@/lib/fakemui-registry').FAKEMUI_REGISTRY)"

# Check if fakemui import works
npm --prefix frontends/nextjs run typecheck
```

---

**Last Updated**: 2026-01-16
**Version**: 1.0.0
**Status**: Production Ready
