# Migrating React Components to JSON UI

This guide helps you convert existing React components to JSON UI configurations.

## When to Migrate

✅ **Good Candidates:**
- Static layouts and dashboards
- Forms with standard inputs
- Data tables and lists
- Settings panels
- Card-based UIs
- Simple interactive components

❌ **Poor Candidates:**
- Complex state management
- Heavy animations and transitions
- Canvas/WebGL rendering
- Real-time collaboration features
- Components with custom hooks
- Performance-critical rendering

## Migration Process

### Step 1: Identify Component Structure

**React Component:**
```tsx
export function UserCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{user.bio}</p>
      </CardContent>
    </Card>
  )
}
```

**Break Down:**
1. Root component: Card
2. Children: CardHeader, CardContent
3. Data: user object with name, email, bio
4. No events or complex logic

### Step 2: Create Data Sources

Identify where data comes from:

```json
{
  "dataSources": {
    "user": {
      "type": "static",
      "config": {
        "name": "John Doe",
        "email": "john@example.com",
        "bio": "Software developer"
      }
    }
  }
}
```

### Step 3: Build Component Tree

Convert JSX to JSON:

```json
{
  "id": "user-card",
  "type": "Card",
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
          "dataBinding": "user.bio"
        }
      ]
    }
  ]
}
```

### Step 4: Convert Event Handlers

**React:**
```tsx
<Button onClick={() => handleDelete(user.id)}>
  Delete
</Button>
```

**JSON:**
```json
{
  "type": "Button",
  "events": {
    "onClick": {
      "action": "delete-user",
      "params": {
        "userId": "user.id"
      }
    }
  },
  "children": "Delete"
}
```

Then implement the action handler in your page component.

### Step 5: Handle Lists

**React:**
```tsx
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}
```

**JSON:**
```json
{
  "loop": {
    "source": "users",
    "itemVar": "user",
    "indexVar": "index"
  },
  "children": [
    {
      "id": "user-card",
      "type": "Card",
      "children": [...]
    }
  ]
}
```

### Step 6: Convert Conditionals

**React:**
```tsx
{user.isAdmin ? (
  <AdminPanel />
) : (
  <UserPanel />
)}
```

**JSON:**
```json
{
  "conditional": {
    "if": "user.isAdmin",
    "then": {
      "id": "admin-panel",
      "type": "AdminPanel"
    },
    "else": {
      "id": "user-panel",
      "type": "UserPanel"
    }
  }
}
```

## Common Patterns

### Form with State

**React:**
```tsx
const [formData, setFormData] = useState({})
const handleChange = (e) => {
  setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
}

return (
  <Input 
    name="email"
    value={formData.email}
    onChange={handleChange}
  />
)
```

**JSON:**
```json
{
  "type": "Input",
  "props": {
    "name": "email"
  },
  "dataBinding": "formData.email",
  "events": {
    "onChange": "update-field"
  }
}
```

Data source:
```json
{
  "dataSources": {
    "formData": {
      "type": "static",
      "config": {
        "email": ""
      }
    }
  }
}
```

### Styling and Classes

**React:**
```tsx
<div className={cn(
  "flex items-center gap-4",
  isActive && "bg-primary"
)}>
```

**JSON:**
```json
{
  "type": "div",
  "className": "flex items-center gap-4",
  "conditional": {
    "if": "isActive",
    "then": {
      "type": "div",
      "className": "flex items-center gap-4 bg-primary"
    }
  }
}
```

Or better, use data binding for dynamic classes:
```json
{
  "type": "div",
  "className": "flex items-center gap-4",
  "style": {
    "backgroundColor": "isActive ? 'var(--primary)' : 'transparent'"
  }
}
```

### API Data

**React:**
```tsx
const [users, setUsers] = useState([])

useEffect(() => {
  fetch('/api/users')
    .then(r => r.json())
    .then(setUsers)
}, [])
```

**JSON:**
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

### Persistent Data

**React:**
```tsx
const [prefs, setPrefs] = useKV('user-prefs', {})
```

**JSON:**
```json
{
  "dataSources": {
    "prefs": {
      "type": "kv",
      "config": {
        "key": "user-prefs",
        "defaultValue": {}
      }
    }
  }
}
```

## Complete Migration Example

### Before (React)

```tsx
export function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data)
      setLoading(false)
    })
  }, [])

  const handleDelete = (id) => {
    deleteProject(id).then(() => {
      setProjects(prev => prev.filter(p => p.id !== id))
    })
  }

  if (loading) return <Skeleton />

  return (
    <div className="space-y-4">
      <h1>Projects</h1>
      {projects.map(project => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
            <Badge>{project.status}</Badge>
          </CardHeader>
          <CardContent>
            <p>{project.description}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleDelete(project.id)}>
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
```

### After (JSON)

```json
{
  "id": "project-list",
  "layout": {
    "type": "flex",
    "direction": "column",
    "gap": "4",
    "className": "p-6",
    "children": [
      {
        "id": "title",
        "type": "h1",
        "children": "Projects"
      },
      {
        "id": "projects-container",
        "type": "div",
        "className": "space-y-4",
        "loop": {
          "source": "projects",
          "itemVar": "project"
        },
        "children": [
          {
            "id": "project-card",
            "type": "Card",
            "children": [
              {
                "id": "card-header",
                "type": "CardHeader",
                "className": "flex flex-row items-center justify-between",
                "children": [
                  {
                    "id": "project-name",
                    "type": "CardTitle",
                    "dataBinding": "project.name"
                  },
                  {
                    "id": "project-status",
                    "type": "Badge",
                    "dataBinding": "project.status"
                  }
                ]
              },
              {
                "id": "card-content",
                "type": "CardContent",
                "children": [
                  {
                    "id": "project-desc",
                    "type": "p",
                    "dataBinding": "project.description"
                  }
                ]
              },
              {
                "id": "card-footer",
                "type": "CardFooter",
                "children": [
                  {
                    "id": "delete-btn",
                    "type": "Button",
                    "events": {
                      "onClick": {
                        "action": "delete-project",
                        "params": {
                          "projectId": "project.id"
                        }
                      }
                    },
                    "children": "Delete"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "dataSources": {
    "projects": {
      "type": "api",
      "config": {
        "url": "/api/projects",
        "method": "GET"
      }
    }
  }
}
```

## Benefits After Migration

✅ No React state management boilerplate
✅ Configuration can be modified without code changes
✅ Easy to A/B test different layouts
✅ Non-developers can make UI changes
✅ Clear separation of data and presentation
✅ Version control shows structural changes clearly

## Challenges and Solutions

### Challenge: Complex State Logic
**Solution:** Keep state management in React, only migrate presentational parts

### Challenge: Custom Hooks
**Solution:** Expose hook data through data sources

### Challenge: Performance Issues
**Solution:** Use static components for hot paths, JSON for configurable areas

### Challenge: Type Safety
**Solution:** Use Zod schemas to validate JSON at runtime

## Testing Migrated Components

1. **Visual Comparison**: Compare side-by-side with original
2. **Interaction Testing**: Verify all events work correctly
3. **Data Flow**: Confirm data binding updates properly
4. **Edge Cases**: Test with empty data, errors, loading states
5. **Performance**: Check render performance hasn't regressed

## Incremental Migration Strategy

1. Start with static content pages
2. Move to simple forms
3. Migrate data tables and lists
4. Convert settings and configuration UIs
5. Leave complex interactive components in React

## When to Stop

If you encounter:
- More than 3 levels of conditionals
- Complex derived state calculations
- Performance bottlenecks
- Heavy animation requirements
- Real-time data synchronization

Consider keeping it as a React component or creating a custom component for the JSON UI system.
