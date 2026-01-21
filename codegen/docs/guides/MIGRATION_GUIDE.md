# Migration Guide: Moving to Phase 4 Architecture

## 🎯 Overview

This guide helps you migrate existing components to the new hook-based, JSON-driven architecture.

## 🚦 Migration Strategy

### Three Paths

#### Path 1: Hook Extraction (Recommended First)
**Best for:** Existing components with complex logic  
**Time:** 1-2 hours per component  
**Risk:** Low (backward compatible)

#### Path 2: Component Split
**Best for:** Large components (>150 LOC)  
**Time:** 2-4 hours per component  
**Risk:** Medium (requires refactoring)

#### Path 3: JSON Conversion
**Best for:** Simple, static pages  
**Time:** 1-2 hours per page  
**Risk:** Low (optional, new pattern)

## 📝 Path 1: Hook Extraction

### Step 1: Identify Business Logic

**Before:**
```typescript
function UserManager() {
  const [users, setUsers] = useKV('users', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  
  const addUser = (user) => {
    setUsers((prev) => [...prev, user])
  }
  
  const deleteUser = (id) => {
    setUsers((prev) => prev.filter(u => u.id !== id))
  }
  
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div>
      {/* 100+ lines of JSX */}
    </div>
  )
}
```

### Step 2: Extract to Custom Hook

**Create hook:**
```typescript
// src/hooks/features/use-user-manager.ts
import { useArray, useSearch, useCRUD } from '@/hooks/data'

export function useUserManager() {
  const { items: users, add, remove, update } = useArray('users', [])
  const { query, setQuery, results } = useSearch(users, ['name', 'email'])
  const { selected, setSelectedId } = useCRUD(results, () => {})
  
  return {
    users: results,
    addUser: add,
    deleteUser: remove,
    updateUser: update,
    searchQuery: query,
    setSearchQuery: setQuery,
    selectedUser: selected,
    setSelectedUser: setSelectedId,
  }
}
```

**After:**
```typescript
import { useUserManager } from '@/hooks/features/use-user-manager'

function UserManager() {
  const {
    users,
    addUser,
    deleteUser,
    searchQuery,
    setSearchQuery,
    selectedUser,
  } = useUserManager()
  
  return (
    <div>
      {/* Same JSX, now cleaner */}
    </div>
  )
}
```

### Benefits
✅ Logic is reusable  
✅ Component is smaller  
✅ Easy to test  
✅ Better organization  

## 📏 Path 2: Component Split

### Step 1: Identify Sub-Components

**Before (200 LOC):**
```typescript
function ProjectDashboard({ files, models, components }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 30 lines */}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Models</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 30 lines */}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Components</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 30 lines */}
        </CardContent>
      </Card>
      
      {/* More sections... */}
    </div>
  )
}
```

### Step 2: Extract Sub-Components

**Create small components:**
```typescript
// src/components/dashboard/StatsCard.tsx (< 50 LOC)
interface StatsCardProps {
  title: string
  count: number
  icon: React.ReactNode
  onClick?: () => void
}

export function StatsCard({ title, count, icon, onClick }: StatsCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg" onClick={onClick}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{count}</div>
      </CardContent>
    </Card>
  )
}
```

**After (< 80 LOC):**
```typescript
import { StatsCard } from './dashboard/StatsCard'

function ProjectDashboard({ files, models, components }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatsCard
        title="Files"
        count={files.length}
        icon={<FileIcon />}
        onClick={() => navigate('/files')}
      />
      
      <StatsCard
        title="Models"
        count={models.length}
        icon={<DatabaseIcon />}
        onClick={() => navigate('/models')}
      />
      
      <StatsCard
        title="Components"
        count={components.length}
        icon={<ComponentIcon />}
        onClick={() => navigate('/components')}
      />
    </div>
  )
}
```

### Benefits
✅ Each component < 150 LOC  
✅ Reusable sub-components  
✅ Easier to understand  
✅ Simpler to test  

## 📄 Path 3: JSON Conversion

### Step 1: Analyze Page Structure

**Before:**
```typescript
function SettingsPage() {
  const [name, setName] = useKV('app-name', '')
  const [theme, setTheme] = useKV('app-theme', 'light')
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>App Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        
        <div>
          <Label>Theme</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </Select>
        </div>
        
        <Button onClick={() => toast.success('Saved!')}>Save</Button>
      </CardContent>
    </Card>
  )
}
```

### Step 2: Create JSON Schema

**Create schema:**
```json
{
  "id": "settings",
  "name": "Settings",
  "description": "Application settings page",
  "layout": {
    "type": "single"
  },
  "dataSources": [
    {
      "id": "appName",
      "type": "kv",
      "key": "app-name",
      "defaultValue": ""
    },
    {
      "id": "appTheme",
      "type": "kv",
      "key": "app-theme",
      "defaultValue": "light"
    }
  ],
  "components": [
    {
      "id": "root",
      "type": "Card",
      "children": [
        {
          "id": "header",
          "type": "CardHeader",
          "children": [
            {
              "id": "title",
              "type": "CardTitle",
              "props": {
                "children": "Settings"
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
              "id": "name-input",
              "type": "Input",
              "dataBinding": "appName",
              "props": {
                "placeholder": "App Name"
              }
            },
            {
              "id": "save-button",
              "type": "Button",
              "props": {
                "children": "Save"
              },
              "eventHandlers": {
                "onClick": "save-settings"
              }
            }
          ]
        }
      ]
    }
  ],
  "actions": [
    {
      "id": "save-settings",
      "type": "custom",
      "handler": "handleSave"
    }
  ]
}
```

### Step 3: Use PageRenderer

**After:**
```typescript
import { PageRenderer } from '@/config/orchestration'
import settingsSchema from '@/config/pages/settings.json'
import { toast } from 'sonner'

function SettingsPage() {
  const customHandlers = {
    handleSave: () => {
      toast.success('Settings saved!')
    }
  }
  
  return (
    <PageRenderer
      schema={settingsSchema}
      customHandlers={customHandlers}
    />
  )
}
```

### Benefits
✅ No React code needed  
✅ Easy to modify structure  
✅ Testable schemas  
✅ Rapid prototyping  

## 🎯 Decision Matrix

### When to Use Hooks

| Scenario | Use Hooks? |
|----------|-----------|
| Complex business logic | ✅ Yes |
| Reusable functionality | ✅ Yes |
| API integration | ✅ Yes |
| Form validation | ✅ Yes |
| State management | ✅ Yes |

### When to Split Components

| Scenario | Split? |
|----------|--------|
| Component > 150 LOC | ✅ Yes |
| Repeated UI patterns | ✅ Yes |
| Testing complexity | ✅ Yes |
| Hard to understand | ✅ Yes |

### When to Use JSON

| Scenario | Use JSON? |
|----------|-----------|
| Simple CRUD page | ✅ Yes |
| Form-heavy page | ✅ Yes |
| Dashboard/stats | ✅ Yes |
| Static content | ✅ Yes |
| Complex interactions | ❌ No (use hooks) |
| Custom animations | ❌ No (use React) |

## 📋 Migration Checklist

### For Each Component

- [ ] Measure LOC (Lines of Code)
- [ ] If > 150 LOC, plan to split
- [ ] Identify business logic to extract
- [ ] Create custom hooks
- [ ] Update component to use hooks
- [ ] Test thoroughly
- [ ] Consider JSON if applicable
- [ ] Document changes

### Quality Gates

- [ ] All components < 150 LOC
- [ ] Business logic in hooks
- [ ] No duplicate code
- [ ] Full type safety
- [ ] Tests passing
- [ ] Documentation updated

## 🔧 Tools & Helpers

### LOC Counter

```bash
# Count lines in a component
wc -l src/components/MyComponent.tsx

# Find large components
find src/components -name "*.tsx" -exec wc -l {} \; | sort -rn | head -20
```

### Hook Template

```typescript
import { useKV } from '@github/spark/hooks'
import { useCallback } from 'react'

export function useMyFeature() {
  const [data, setData] = useKV('my-feature-data', [])
  
  const operation = useCallback(() => {
    // Logic here
  }, [])
  
  return {
    data,
    operation,
  }
}
```

### JSON Schema Template

```json
{
  "id": "my-page",
  "name": "My Page",
  "layout": { "type": "single" },
  "dataSources": [],
  "components": [],
  "actions": []
}
```

## 📚 Learning Resources

### Read First
1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Fast overview
2. [COMPLETE_HOOK_LIBRARY.md](../api/COMPLETE_HOOK_LIBRARY.md) - Hook details
3. [JSON_ORCHESTRATION_COMPLETE.md](../architecture/JSON_ORCHESTRATION_COMPLETE.md) - JSON guide

### Examples
- `/src/hooks/data/` - Hook implementations
- `/src/config/pages/` - JSON page examples
- `/src/components/` - Component examples

## 🆘 Common Issues

### Issue: Hook Violation
**Error:** "Hooks can only be called inside function components"

**Solution:** Ensure hooks are called at the top level, not in loops/conditions

```typescript
// ❌ Wrong
function MyComponent() {
  if (condition) {
    const data = useKV('key', []) // Hook in condition!
  }
}

// ✅ Correct
function MyComponent() {
  const data = useKV('key', [])
  if (condition) {
    // Use data here
  }
}
```

### Issue: Stale Closure
**Error:** State updates don't reflect current values

**Solution:** Use functional updates

```typescript
// ❌ Wrong
const add = () => {
  setItems([...items, newItem]) // items is stale!
}

// ✅ Correct
const add = () => {
  setItems((current) => [...current, newItem])
}
```

### Issue: JSON Not Rendering
**Error:** Component not found in registry

**Solution:** Register component in component-registry.ts

```typescript
import { MyComponent } from '@/components/MyComponent'

export const ComponentRegistry = {
  // ... other components
  MyComponent,
}
```

## 🎉 Success Stories

### Before
- 500 LOC component
- Mixed concerns
- Hard to test
- Duplicate logic

### After
- 3 hooks (< 100 LOC each)
- 5 components (< 50 LOC each)
- Or 1 JSON schema (< 100 lines)
- Fully tested
- Reusable everywhere

## 🚀 Next Steps

1. Pick one component to migrate
2. Follow Path 1 (Hook Extraction)
3. Measure success (LOC reduction, testability)
4. Share learnings with team
5. Repeat for other components

---

**Need Help?**
- Check [INDEX.md](./INDEX.md) for documentation
- Review example hooks in `/src/hooks/`
- Study JSON examples in `/src/config/pages/`
- Ask questions in team chat

**Good luck with your migration! 🚀**
