# Data Source Binding Guide

## Overview

The Data Source Binding system enables declarative data management in CodeForge applications. Instead of manually managing React state, you define data sources and bind them directly to component properties.

## Data Source Types

### 1. KV Store (`kv`)
Persistent data storage backed by the Spark KV API. Perfect for user preferences, application state, and any data that needs to survive page refreshes.

```typescript
{
  id: 'userProfile',
  type: 'kv',
  key: 'user-profile-data',
  defaultValue: {
    name: 'John Doe',
    email: 'john@example.com',
    preferences: {
      theme: 'dark',
      notifications: true
    }
  }
}
```

**Use cases:**
- User profiles and preferences
- Todo lists and task management
- Shopping cart data
- Form drafts
- Application settings

### 2. Computed Values (`computed`)
Derived data that automatically updates when dependencies change. Great for calculations, formatted strings, and aggregated data.

```typescript
{
  id: 'displayName',
  type: 'computed',
  compute: (data) => {
    const profile = data.userProfile
    return `${profile?.name || 'Guest'} (${profile?.email || 'N/A'})`
  },
  dependencies: ['userProfile']
}
```

**Use cases:**
- Formatted display text
- Calculated totals and statistics
- Filtered/sorted lists
- Conditional values
- Data transformations

### 3. Static Data (`static`)
Constant values that don't change during the session. Useful for configuration and reference data.

```typescript
{
  id: 'appConfig',
  type: 'static',
  defaultValue: {
    apiUrl: 'https://api.example.com',
    version: '1.0.0',
    features: ['chat', 'notifications']
  }
}
```

**Use cases:**
- API endpoints and configuration
- Feature flags
- Reference data (countries, categories)
- Constants
- Initial form values

## Binding Properties

Once you have data sources, bind them to component properties:

```typescript
{
  id: 'welcome-heading',
  type: 'Heading',
  bindings: {
    children: { 
      source: 'displayName' 
    }
  }
}
```

### Path-based Bindings

Access nested properties using dot notation:

```typescript
{
  id: 'email-input',
  type: 'Input',
  bindings: {
    value: { 
      source: 'userProfile',
      path: 'email'
    }
  }
}
```

### Transform Functions

Apply transformations to bound values:

```typescript
{
  id: 'price-display',
  type: 'Text',
  bindings: {
    children: {
      source: 'price',
      transform: (value) => `$${(value / 100).toFixed(2)}`
    }
  }
}
```

## Dependency Tracking

Computed sources automatically re-calculate when their dependencies change:

```typescript
// Stats computed source depends on todos
{
  id: 'stats',
  type: 'computed',
  compute: (data) => ({
    total: data.todos?.length || 0,
    completed: data.todos?.filter(t => t.completed).length || 0,
    remaining: data.todos?.filter(t => !t.completed).length || 0
  }),
  dependencies: ['todos']
}

// When todos updates, stats automatically updates too
```

## Best Practices

### 1. Use KV for Persistence
If data needs to survive page refreshes, use a KV source:
```typescript
✅ { id: 'cart', type: 'kv', key: 'shopping-cart', defaultValue: [] }
❌ { id: 'cart', type: 'static', defaultValue: [] } // Will reset on refresh
```

### 2. Keep Computed Functions Pure
Computed functions should be deterministic and not have side effects:
```typescript
✅ compute: (data) => data.items.filter(i => i.active)
❌ compute: (data) => { 
     toast.info('Computing...') // Side effect!
     return data.items.filter(i => i.active)
   }
```

### 3. Declare All Dependencies
Always list dependencies for computed sources:
```typescript
✅ dependencies: ['todos', 'filter']
❌ dependencies: [] // Missing dependencies!
```

### 4. Use Meaningful IDs
Choose descriptive IDs that clearly indicate the data's purpose:
```typescript
✅ id: 'userProfile'
✅ id: 'todoStats'
❌ id: 'data1'
❌ id: 'temp'
```

### 5. Structure Data Logically
Organize related data in nested objects:
```typescript
✅ {
     id: 'settings',
     type: 'kv',
     defaultValue: {
       theme: 'dark',
       notifications: true,
       language: 'en'
     }
   }

❌ Multiple separate sources for related data
```

## Complete Example

Here's a full example with multiple data sources and bindings:

```typescript
{
  dataSources: [
    // KV storage for tasks
    {
      id: 'tasks',
      type: 'kv',
      key: 'user-tasks',
      defaultValue: []
    },
    
    // Static filter options
    {
      id: 'filterOptions',
      type: 'static',
      defaultValue: ['all', 'active', 'completed']
    },
    
    // Current filter selection
    {
      id: 'currentFilter',
      type: 'kv',
      key: 'task-filter',
      defaultValue: 'all'
    },
    
    // Computed filtered tasks
    {
      id: 'filteredTasks',
      type: 'computed',
      compute: (data) => {
        const filter = data.currentFilter
        const tasks = data.tasks || []
        
        if (filter === 'all') return tasks
        if (filter === 'active') return tasks.filter(t => !t.completed)
        if (filter === 'completed') return tasks.filter(t => t.completed)
        
        return tasks
      },
      dependencies: ['tasks', 'currentFilter']
    },
    
    // Computed statistics
    {
      id: 'taskStats',
      type: 'computed',
      compute: (data) => ({
        total: data.tasks?.length || 0,
        active: data.tasks?.filter(t => !t.completed).length || 0,
        completed: data.tasks?.filter(t => t.completed).length || 0
      }),
      dependencies: ['tasks']
    }
  ],
  
  components: [
    // Display total count
    {
      id: 'total-badge',
      type: 'Badge',
      bindings: {
        children: {
          source: 'taskStats',
          path: 'total'
        }
      }
    },
    
    // List filtered tasks
    {
      id: 'task-list',
      type: 'List',
      bindings: {
        items: {
          source: 'filteredTasks'
        }
      }
    }
  ]
}
```

## UI Components

### Data Source Manager
The `DataSourceManager` component provides a visual interface for creating and managing data sources:
- Create KV, computed, and static sources
- Edit source configuration
- View dependency relationships
- Delete sources (with safety checks)

### Binding Editor
The `BindingEditor` component allows you to bind component properties to data sources:
- Select properties to bind
- Choose data sources
- Specify nested paths
- Preview bindings

### Component Binding Dialog
Open a dialog to edit all bindings for a specific component with live preview.

## Hooks

### useDataSources
The core hook that manages all data sources:

```typescript
import { useDataSources } from '@/hooks/data/use-data-sources'

const { data, updateData, updatePath, loading } = useDataSources(dataSources)

// Access data
const userProfile = data.userProfile

// Update entire source
updateData('userProfile', newProfile)

// Update nested property
updatePath('userProfile', 'email', 'newemail@example.com')
```

### useDataSourceManager
Hook for managing the data source configuration:

```typescript
import { useDataSourceManager } from '@/hooks/data/use-data-source-manager'

const {
  dataSources,
  addDataSource,
  updateDataSource,
  deleteDataSource,
  getDataSource,
  getDependents
} = useDataSourceManager(initialSources)
```

## Tips & Tricks

### Avoiding Circular Dependencies
Never create circular dependencies between computed sources:
```typescript
❌ Bad:
{
  id: 'a',
  type: 'computed',
  compute: (data) => data.b + 1,
  dependencies: ['b']
},
{
  id: 'b',
  type: 'computed',
  compute: (data) => data.a + 1,
  dependencies: ['a']
}
```

### Optimizing Computed Sources
Keep compute functions fast and efficient:
```typescript
✅ Fast:
compute: (data) => data.items.length

❌ Slow:
compute: (data) => {
  let result = 0
  for (let i = 0; i < 1000000; i++) {
    result += Math.random()
  }
  return result
}
```

### Testing Data Sources
Test your data sources independently:
```typescript
const source = {
  id: 'stats',
  type: 'computed',
  compute: (data) => ({ total: data.items.length }),
  dependencies: ['items']
}

const testData = { items: [1, 2, 3] }
const result = source.compute(testData)
// result: { total: 3 }
```
