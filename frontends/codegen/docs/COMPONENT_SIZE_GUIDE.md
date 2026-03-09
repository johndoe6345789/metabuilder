# Component Size Guidelines

All components must be under 150 lines of code (LOC). This refactor follows atomic design principles.

## Component Categories

### Atoms (< 50 LOC)
Single-purpose, highly reusable components:
- DataList
- StatCard
- ActionButton
- LoadingState
- EmptyState
- StatusBadge
- IconButton

### Molecules (50-100 LOC)
Combinations of atoms for specific use cases:
- SearchBar (Input + Icon)
- DataCard (Card + Content + Actions)
- FormField (Label + Input + Error)
- FilterBar (Multiple filters)

### Organisms (100-150 LOC)
Complex components combining molecules:
- DataTable (with sorting, filtering, pagination)
- Dashboard (multiple stat cards and charts)
- FormBuilder (dynamic form generation)

## Refactoring Large Components

### Before (200+ LOC):
```typescript
function ProjectDashboard() {
  // 50 lines of state and logic
  // 150 lines of JSX with embedded components
  return <div>...</div>
}
```

### After (< 50 LOC):
```typescript
function ProjectDashboard(props) {
  return (
    <JSONPageRenderer
      schema={dashboardSchema}
      data={props}
      functions={{ calculateCompletionScore }}
    />
  )
}
```

## Hook Extraction

Move logic out of components into hooks:

### Before:
```typescript
function MyComponent() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const filtered = items.filter(i => i.name.includes(search))
  const [page, setPage] = useState(1)
  const paginated = filtered.slice((page-1)*10, page*10)
  // ... more logic
  return <div>...</div>
}
```

### After:
```typescript
function MyComponent() {
  const [items, setItems] = useKV('items', [])
  const { filtered } = useSearchFilter({ items, searchFields: ['name'] })
  const { items: page } = usePagination({ items: filtered, pageSize: 10 })
  return <DataList items={page} renderItem={...} />
}
```

## JSON-Driven Pages

For data-heavy pages, use JSON configuration:

1. Create JSON schema in `/src/config/pages/`
2. Define data bindings and layout
3. Implement computed functions
4. Use JSONPageRenderer

This reduces component size from 200+ LOC to < 50 LOC.

## Composition Over Inheritance

Build complex UIs by composing simple components:

```typescript
<Card>
  <CardHeader>
    <Heading level={2}>Title</Heading>
    <StatusBadge status="active" />
  </CardHeader>
  <CardContent>
    <DataList items={data} renderItem={renderItem} />
  </CardContent>
  <CardFooter>
    <ActionButton label="Add" onClick={handleAdd} />
  </CardFooter>
</Card>
```

## Benefits

1. **Easier to Test**: Small components = simple tests
2. **Easier to Understand**: Clear, focused responsibility
3. **Easier to Reuse**: Composable building blocks
4. **Easier to Maintain**: Changes are localized
5. **Better Performance**: Smaller re-render boundaries
