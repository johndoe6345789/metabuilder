# Quick Start: New UX Components

## Available Components

All components are centrally exported from `/frontends/nextjs/src/components/index.ts`

### Import Pattern
```typescript
import {
  // Loading & Skeletons
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,

  // Loading Indicators
  LoadingIndicator,
  InlineLoader,
  AsyncLoading,

  // Empty States
  EmptyState,
  NoDataFound,
  NoResultsFound,
  NoItemsYet,
  AccessDeniedState,
  ErrorState,

  // Error Handling
  ErrorBoundary,
  withErrorBoundary,
} from '@/components'
```

## Component Reference

### 1. Skeleton Components

#### Basic Skeleton
```tsx
<Skeleton width="100%" height="20px" animate />
```
**Props**:
- `width`: string | number (default: "100%")
- `height`: string | number (default: "20px")
- `borderRadius`: string | number (default: "4px")
- `animate`: boolean (default: true)

#### Table Skeleton
```tsx
<TableSkeleton rows={5} columns={4} />
```
**Props**:
- `rows`: number (default: 5)
- `columns`: number (default: 4)
- `className`: string (optional)

#### Card Skeleton
```tsx
<CardSkeleton count={3} />
```
**Props**:
- `count`: number (default: 3)
- `className`: string (optional)

#### List Skeleton
```tsx
<ListSkeleton count={8} />
```
**Props**:
- `count`: number (default: 8)
- `className`: string (optional)

### 2. Loading Indicators

#### Loading Indicator
```tsx
<LoadingIndicator
  show={isLoading}
  variant="spinner"
  size="medium"
  message="Loading data..."
/>
```
**Props**:
- `show`: boolean (default: true)
- `variant`: 'spinner' | 'bar' | 'dots' | 'pulse' (default: 'spinner')
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `fullPage`: boolean (default: false)
- `message`: string (optional)

#### Inline Loader
```tsx
<button>
  <InlineLoader loading={isSubmitting} size="small" />
  Submit
</button>
```
**Props**:
- `loading`: boolean (default: true)
- `size`: 'small' | 'medium' (default: 'small')

#### Async Loading (Wrapper)
```tsx
<AsyncLoading
  isLoading={isLoading}
  error={error}
  skeletonComponent={<TableSkeleton rows={5} columns={4} />}
  errorComponent={<ErrorState title="Failed to load" />}
>
  <YourComponent />
</AsyncLoading>
```
**Props**:
- `isLoading`: boolean (required)
- `error`: Error | string | null (optional)
- `children`: ReactNode (required)
- `skeletonComponent`: ReactNode (optional)
- `errorComponent`: ReactNode (optional)
- `loadingMessage`: string (optional)

### 3. Empty States

#### Generic Empty State
```tsx
<EmptyState
  icon="📭"
  title="No items found"
  description="Create your first item to get started"
  action={{ label: 'Create', onClick: handleCreate }}
  secondaryAction={{ label: 'Learn more', onClick: handleLearnMore }}
/>
```
**Props**:
- `icon`: ReactNode (default: "📭")
- `title`: string (required)
- `description`: string (required)
- `action`: { label: string; onClick: () => void } (optional)
- `secondaryAction`: { label: string; onClick: () => void } (optional)

#### Pre-built Variants
```tsx
// No data
<NoDataFound title="No records" description="No records found." />

// No search results
<NoResultsFound />

// First-time creation
<NoItemsYet
  title="Get started"
  description="Create your first item"
  action={{ label: 'Create', onClick: handleCreate }}
/>

// Access denied
<AccessDeniedState />

// Error state
<ErrorState
  description="Failed to load data"
  action={{ label: 'Retry', onClick: handleRetry }}
/>
```

### 4. Error Boundary

#### Basic Error Boundary
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### With Custom Fallback
```tsx
<ErrorBoundary
  fallback={<div>Something went wrong</div>}
  context={{ component: 'MyComponent' }}
  onError={(error, errorInfo) => {
    console.error('Component error:', error)
  }}
>
  <YourComponent />
</ErrorBoundary>
```

#### HOC Pattern
```tsx
const SafeComponent = withErrorBoundary(
  MyComponent,
  <div>Error rendering component</div>,
  { component: 'MyComponent' }
)

// Usage
<SafeComponent prop="value" />
```

### 5. Error Reporting Hook

```tsx
import { useErrorReporting } from '@/lib/error-reporting'

function MyComponent() {
  const { reportError, getUserMessage } = useErrorReporting()

  async function handleAction() {
    try {
      // Your operation
    } catch (error) {
      // Report with context
      reportError(error, {
        component: 'MyComponent',
        action: 'handleAction',
      })

      // Get user-friendly message
      const message = getUserMessage(error)
      setErrorMessage(message)
    }
  }
}
```

## Common Patterns

### Pattern 1: Table with Loading State
```tsx
function UserTable() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <AsyncLoading
      isLoading={isLoading}
      error={error}
      skeletonComponent={<TableSkeleton rows={5} columns={4} />}
    >
      <table>
        {/* Your table */}
      </table>
    </AsyncLoading>
  )
}
```

### Pattern 2: Form with Submit Loading
```tsx
function CreateForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      // Submit form
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input />
      <button disabled={isSubmitting}>
        <InlineLoader loading={isSubmitting} size="small" />
        Create
      </button>
    </form>
  )
}
```

### Pattern 3: List with Empty State
```tsx
function ItemList({ items }) {
  if (items.length === 0) {
    return (
      <NoItemsYet
        action={{ label: 'New Item', onClick: () => navigate('/new') }}
      />
    )
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
```

### Pattern 4: Component Error Protection
```tsx
const SafeUserTable = withErrorBoundary(
  UserTable,
  <ErrorState
    title="Table Error"
    description="Failed to load user table"
  />,
  { component: 'UserTable' }
)

// Usage
<SafeUserTable />
```

### Pattern 5: Full Page Loading
```tsx
<LoadingIndicator
  fullPage
  variant="spinner"
  size="large"
  message="Loading application..."
/>
```

## Animation Classes

Use these CSS classes for custom animations:

```typescript
// Page transitions
className="page-transition"

// Skeleton animation
className="skeleton skeleton-animate"

// List item staggered animation
className="list-item-animated"

// Loading spinner
className="loading-spinner"

// Empty state layout
className="empty-state"
```

## Styling Examples

### Custom Skeleton
```tsx
<Skeleton
  width="200px"
  height="40px"
  borderRadius="8px"
  style={{ marginBottom: '16px' }}
/>
```

### Custom Loading Indicator
```tsx
<LoadingIndicator
  variant="dots"
  size="large"
  message="Processing..."
  style={{ padding: '40px' }}
/>
```

### Custom Empty State
```tsx
<EmptyState
  icon="🎉"
  title="All caught up!"
  description="You've completed all tasks."
  className="my-custom-empty-state"
/>
```

## Accessibility

All components support accessibility:

### Keyboard Navigation
- Tab through interactive elements
- Focus states are visible
- Enter/Space to activate buttons

### Screen Readers
- Semantic HTML structure
- Proper ARIA labels
- Descriptive messages

### Motion Preferences
- Respects `prefers-reduced-motion`
- Animations disabled for users who prefer reduced motion

## Performance Tips

1. **Use skeletons instead of spinners for data loading**
   ```tsx
   // Good - Shows placeholder content
   <AsyncLoading
     isLoading={isLoading}
     skeletonComponent={<TableSkeleton />}
   >
     <Table />
   </AsyncLoading>

   // OK - Shows spinner
   <LoadingIndicator show={isLoading} />
   ```

2. **Wrap error-prone components with ErrorBoundary**
   ```tsx
   <ErrorBoundary context={{ component: 'ExpensiveComponent' }}>
     <ExpensiveComponent />
   </ErrorBoundary>
   ```

3. **Use InlineLoader for buttons instead of disabling**
   ```tsx
   // Good - Shows feedback while processing
   <button>
     <InlineLoader loading={isSubmitting} />
     Submit
   </button>

   // Less good - No feedback
   <button disabled={isSubmitting}>Submit</button>
   ```

## Error Codes Reference

Error reporting provides automatic user-friendly messages:

| Code | Message |
|------|---------|
| 400 | "Invalid request. Please check your input." |
| 401 | "Unauthorized. Please log in again." |
| 403 | "You do not have permission to access this resource." |
| 404 | "The requested resource was not found." |
| 409 | "This resource already exists." |
| 429 | "Too many requests. Please try again later." |
| 500 | "Server error. Please try again later." |
| 502 | "Bad gateway. Please try again later." |
| 503 | "Service unavailable. Please try again later." |
| 504 | "Gateway timeout. Please try again later." |

## Troubleshooting

### Animations not smooth
- Check browser DevTools Performance tab
- Ensure animations are GPU-accelerated
- Verify `prefers-reduced-motion` isn't enabled

### Components not rendering
- Verify imports from `@/components`
- Check component export index
- Ensure TypeScript types are correct

### Error boundary not catching errors
- Only catches render errors, not async errors
- Wrap async error handlers with `try-catch` or `.catch()`
- Use `useErrorReporting()` hook for manual errors

## Resources

- **Component Documentation**: `/frontends/nextjs/src/components/`
- **Error Reporting**: `/frontends/nextjs/src/lib/error-reporting.ts`
- **Animations**: `/frontends/nextjs/src/main.scss`
- **Complete Reference**: `/PHASE5_COMPLETION_REPORT.md`
