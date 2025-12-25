# Refactor Large Component

Break down a component exceeding 150 LOC:

## 1. Identify Split Points
- Separate data fetching from rendering
- Extract repeated patterns into sub-components
- Move business logic to Lua or utility functions

## 2. Refactoring Patterns

### Extract Child Components
```tsx
// Before: 200 LOC monolith
function BigComponent() { /* everything */ }

// After: Composed
function BigComponent() {
  return (
    <Container>
      <Header />
      <ContentList items={items} />
      <Footer />
    </Container>
  )
}
```

### Convert to Declarative
```tsx
// Before: Hardcoded
<UserForm user={user} />

// After: Declarative
<RenderComponent component={{
  type: 'form',
  props: { schema: formSchema }
}} />
```

### Extract Hooks
```typescript
// Custom hook for data logic
function useUserData(tenantId: string) {
  const [users, setUsers] = useState([])
  // ... fetch logic
  return { users, loading, error }
}
```

## 3. Verify
- Each file < 150 LOC
- Tests still pass
- No functionality lost
