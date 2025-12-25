# Performance Optimization

Optimize MetaBuilder performance:

## Identify Bottlenecks
```bash
npm run analyze-render-performance
npm run analyze-bundle-size
npm run check-performance-budget
```

## Common Optimizations

### 1. Database Queries
```typescript
// ❌ N+1 query
for (const user of users) {
  const tenant = await Database.getTenant(user.tenantId)
}

// ✅ Batch query
const users = await Database.getUsersWithTenants({ tenantId })
```

### 2. Component Rendering
```tsx
// ❌ Re-renders on every parent render
function List({ items }) {
  return items.map(item => <Item key={item.id} {...item} />)
}

// ✅ Memoized
const MemoizedItem = React.memo(Item)
function List({ items }) {
  return items.map(item => <MemoizedItem key={item.id} {...item} />)
}
```

### 3. Bundle Size
- Use dynamic imports for large components
- Check `reports/size-limits-report.json`

### 4. Lua Script Caching
Scripts are compiled once - avoid registering repeatedly
