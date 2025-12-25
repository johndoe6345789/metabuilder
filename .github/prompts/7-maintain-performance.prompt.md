# Performance Optimization

Optimize MetaBuilder performance:

Run performance scripts from `frontends/nextjs/` after `npm run build` (requires `tsx` via `npx`).

## Identify Bottlenecks
```bash
npx tsx ../../tools/analyze-render-performance.ts
npx tsx ../../tools/analyze-bundle-size.ts
npx tsx ../../tools/check-performance-budget.ts
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
- Check `docs/reports/size-limits-report.json`

### 4. Lua Script Caching
Scripts are compiled once - avoid registering repeatedly
