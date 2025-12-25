# Debug Issue

Systematic debugging approach for MetaBuilder:

Run app commands from `frontends/nextjs/`. Run DBAL conformance from `dbal/`.

## 1. Identify Layer
- **UI**: Check browser console, React DevTools
- **API/Data**: Check `Database` class calls
- **DBAL**: Check YAML schema matches implementation
- **Lua**: Check sandbox execution logs

## 2. Common Issues

### "Cannot read property" in component
→ Check if data query includes `tenantId`

### Type errors after schema change
```bash
npm run db:generate  # Regenerate Prisma types
```

### DBAL TypeScript/C++ divergence
```bash
python tools/conformance/run_all.py  # Find which test fails
```

### Lua script fails silently
→ Check for forbidden APIs: `os`, `io`, `require`, `loadfile`

## 3. Logging
```typescript
// Database queries
console.log('[DB]', query, { tenantId })

// Lua execution
const result = await renderer.executeLuaScript(id, params)
console.log('[Lua]', { result, logs: result.logs })
```

## 4. Test in Isolation
```bash
npm run test:unit -- path/to/test.ts
```
