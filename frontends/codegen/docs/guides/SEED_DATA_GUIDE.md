# Seed Data System

## Overview

The application now includes a comprehensive seed data system that loads initial data from JSON configuration into the database (KV store) on first launch.

## Features

### 1. Automatic Data Loading
- Seed data is automatically loaded on application startup
- Only loads if data doesn't already exist (safe to re-run)
- All data is stored in the KV database for persistence

### 2. Seed Data Management UI
Navigate to **Settings → Data** tab to access the Seed Data Manager with three options:

- **Load Seed Data**: Populates database with initial data (only if not already loaded)
- **Reset to Defaults**: Overwrites all data with fresh seed data
- **Clear All Data**: Removes all data from the database (destructive action)

### 3. Dashboard Integration
The Project Dashboard displays available seed data including:
- Number of pre-configured files
- Number of sample models
- Number of example components
- And more...

## Seed Data Contents

The system includes the following pre-configured data:

### Files (`project-files`)
- Sample Next.js pages (page.tsx, layout.tsx)
- Material UI integration examples
- TypeScript configuration

### Models (`project-models`)
- User model with authentication fields
- Post model with relationships
- Complete Prisma schema examples

### Components (`project-components`)
- Button components with variants
- Card components with styling
- Reusable UI elements

### Workflows (`project-workflows`)
- User registration flow
- Complete workflow with triggers and actions
- Visual workflow nodes and connections

### Lambdas (`project-lambdas`)
- User data processing function
- HTTP trigger configuration
- Environment variable examples

### Tests (`project-playwright-tests`, `project-storybook-stories`, `project-unit-tests`)
- E2E test examples
- Component story examples
- Unit test templates

### Component Trees (`project-component-trees`)
- Application layout tree
- Nested component structures
- Material UI component hierarchies

## Configuration

### Adding New Seed Data

Edit `/src/config/seed-data.json` to add or modify seed data:

```json
{
  "project-files": [...],
  "project-models": [...],
  "your-custom-key": [...]
}
```

### Seed Data Schema

Each data type follows the TypeScript interfaces defined in `/src/types/project.ts`:

- `ProjectFile`
- `PrismaModel`
- `ComponentNode`
- `Workflow`
- `Lambda`
- `PlaywrightTest`
- `StorybookStory`
- `UnitTest`
- `ComponentTree`

## API Reference

### Hook: `useSeedData()`

```typescript
import { useSeedData } from '@/hooks/data/use-seed-data'

const { isLoaded, isLoading, loadSeedData, resetSeedData, clearAllData } = useSeedData()
```

**Returns:**
- `isLoaded`: Boolean indicating if seed data has been loaded
- `isLoading`: Boolean indicating if an operation is in progress
- `loadSeedData()`: Function to load seed data (if not already loaded)
- `resetSeedData()`: Function to reset all data to seed defaults
- `clearAllData()`: Function to clear all data from database

### Direct KV API

You can also interact with seed data directly:

```typescript
// Get specific seed data
const files = await window.spark.kv.get('project-files')

// Update seed data
await window.spark.kv.set('project-files', updatedFiles)

// Delete seed data
await window.spark.kv.delete('project-files')
```

## Components

### `<SeedDataManager />`
Management UI for seed data operations (used in Settings → Data tab)

### `<SeedDataStatus />`
Display component showing available seed data (used on Dashboard)

## Best Practices

1. **Always use the useKV hook** for reactive state management
2. **Use functional updates** when modifying arrays/objects to prevent data loss
3. **Test seed data** thoroughly before deploying
4. **Document custom seed data** for team members
5. **Keep seed data minimal** - only include essential examples

## Example: Custom Seed Data

```typescript
// 1. Add to seed-data.json
{
  "my-custom-data": [
    { "id": "1", "name": "Example 1" },
    { "id": "2", "name": "Example 2" }
  ]
}

// 2. Use in component
import { useKV } from '@github/spark/hooks'

function MyComponent() {
  const [data, setData] = useKV('my-custom-data', [])
  
  // Always use functional updates
  const addItem = (newItem) => {
    setData(current => [...current, newItem])
  }
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

## Troubleshooting

### Data Not Loading
- Check browser console for errors
- Verify seed-data.json is valid JSON
- Ensure data keys match KV store keys

### Data Persisting After Clear
- Hard refresh the browser (Ctrl+Shift+R)
- Check for cached service workers (PWA)
- Verify clearAllData completed successfully

### Type Errors
- Ensure seed data matches TypeScript interfaces
- Update types in `/src/types/project.ts` if needed
- Run type checking: `npm run type-check`

## Future Enhancements

Planned improvements:
- Import/export seed data as JSON files
- Version control for seed data
- Seed data migration system
- Seed data validation UI
- Partial seed data loading
