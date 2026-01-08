# Custom Hooks (`src/hooks/`)

Reusable React hooks for state management, side effects, and custom logic.

## Available Hooks

### Authentication & User

- **useAuth()** - Current user state and authentication status
- **usePermissions()** - Permission checking for current user
- **useUser()** - User profile and settings

### Form Management

- **useForm()** - Form state and validation
- **useFormField()** - Individual field management
- **useValidation()** - Input validation

### UI State

- **useModal()** - Modal/dialog state management
- **useSidebar()** - Sidebar visibility control
- **useTheme()** - Theme switching and state

### Data Management

- **useDatabase()** - Database query and mutation hooks
- **usePackages()** - Package loading and management
- **useWorkflows()** - Workflow state

### Effects & Lifecycle

- **useAsync()** - Handle async operations
- **useDebounce()** - Debounce hook
- **useLocalStorage()** - Persistent client storage

## Usage Examples

### useAuth - Get Current User

```typescript
import { useAuth } from '@/hooks'

export const UserProfile = () => {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginPrompt />
  }
  
  return <div>Welcome, {user.name}</div>
}
```

### useForm - Handle Form State

```typescript
import { useForm } from '@/hooks'

export const LoginForm = () => {
  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    onSubmit: (values) => loginUser(values)
  })
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={values.email} onChange={handleChange} />
      {errors.email && <span>{errors.email}</span>}
    </form>
  )
}
```

### usePermissions - Check Access Level

```typescript
import { usePermissions } from '@/hooks'

export const AdminPanel = () => {
  const { canAccess } = usePermissions()
  
  if (!canAccess(3)) {
    return <AccessDenied />
  }
  
  return <AdminContent />
}
```

### useAsync - Handle Async Operations

```typescript
import { useAsync } from '@/hooks'

export const DataLoader = () => {
  const { data, loading, error } = useAsync(
    () => fetchData(),
    []
  )
  
  if (loading) return <Spinner />
  if (error) return <Error message={error} />
  return <DataDisplay data={data} />
}
```

### useLocalStorage - Persistent State

```typescript
import { useLocalStorage } from '@/hooks'

export const PreferenceSettings = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'dark')
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Current: {theme}
    </button>
  )
}
```

## Hook Best Practices

1. ✅ Use hooks for cross-cutting concerns
2. ✅ Keep hook logic focused and single-purpose
3. ✅ Document parameters and return values with JSDoc
4. ✅ Handle loading and error states
5. ✅ Clean up side effects with return functions
6. ✅ Memoize expensive computations with useMemo
7. ❌ Don't call hooks conditionally
8. ❌ Don't use hooks outside React components
9. ❌ Don't forget dependency arrays

## Creating Custom Hooks

Template for new hooks:

```typescript
/**
 * useMyHook - Brief description of hook purpose
 * @param {string} param1 - Description of param
 * @returns {Object} Hook return value
 * @returns {any} returns.value - Current value
 * @returns {Function} returns.setValue - Update function
 * 
 * @example
 * const { value, setValue } = useMyHook(initialValue)
 */
export const useMyHook = (param1: string) => {
  const [value, setValue] = useState(null)
  
  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup logic
    }
  }, [param1])
  
  return { value, setValue }
}
```

## Hook Composition

Combine multiple hooks for complex features:

```typescript
// Complex hook using multiple simpler hooks
export const useAuthenticatedData = (endpoint: string) => {
  const { user } = useAuth()
  const { data, loading } = useAsync(
    () => fetch(endpoint, {
      headers: { Authorization: `Bearer ${user.token}` }
    }),
    [user.token]
  )
  
  return { data, loading, user }
}
```

## Performance Optimization

### Memoization

```typescript
export const useExpensiveComputation = (dependencies: any[]) => {
  return useMemo(() => {
    // Expensive calculation
    return result
  }, dependencies)
}
```

### Callback Memoization

```typescript
export const useCallbackHandler = () => {
  return useCallback((value: string) => {
    // Handle value
  }, [])
}
```

## File Organization

```
hooks/
├── index.ts              # Export all hooks
├── useAuth.ts            # Authentication
├── useForm.ts            # Form management
├── useAsync.ts           # Async operations
├── useLocalStorage.ts    # Storage
├── useDatabase.ts        # Database queries
├── usePermissions.ts     # Authorization
└── __tests__/
    ├── useAuth.spec.ts
    ├── useForm.spec.ts
    └── ...
```

## Testing Custom Hooks

Use `@testing-library/react` for hook testing:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from './useMyHook'

test('hook should update value', () => {
  const { result } = renderHook(() => useMyHook('initial'))
  
  act(() => {
    result.current.setValue('updated')
  })
  
  expect(result.current.value).toBe('updated')
})
```

See React documentation and `/docs/` for more hook patterns.
