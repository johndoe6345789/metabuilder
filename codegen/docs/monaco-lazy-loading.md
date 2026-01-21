# Monaco Editor Lazy Loading - Quick Reference

## Summary
Monaco Editor (~2.5MB) is now lazy-loaded only when needed, significantly reducing initial bundle size.

## Components Updated

### ✅ Main Components
- **CodeEditor** - Main file editor (full Monaco)
- **LambdaDesigner** - Lambda function editor (inline Monaco)
- **WorkflowDesigner** - Workflow script editors (inline Monaco)

### 🔧 New Wrapper Components
- **LazyMonacoEditor** - Full-featured lazy Monaco wrapper
- **LazyInlineMonacoEditor** - Inline editor lazy wrapper

## Quick Usage

### Full Editor (CodeEditor)
```typescript
import { LazyMonacoEditor } from '@/components/molecules'

<LazyMonacoEditor
  file={file}
  onChange={handleChange}
/>
```

### Inline Editor (Scripts)
```typescript
import { LazyInlineMonacoEditor } from '@/components/molecules'

<LazyInlineMonacoEditor
  height="300px"
  defaultLanguage="javascript"
  value={code}
  onChange={handleChange}
  theme="vs-dark"
/>
```

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Bundle | ~5.0MB | ~2.5MB | **-50%** |
| Monaco Size | 2.5MB | 0MB* | **Lazy loaded** |
| Initial Load | Slower | **Faster** | Significant |
| Editor Open | Instant | Small delay** | Mitigated |

\* Monaco loads on-demand when editor components mount  
\*\* Preloading minimizes delay to ~100-200ms

## Preloading Strategy

Monaco Editor automatically preloads when:
1. **CodeEditor page** is accessed
2. **LambdaDesigner page** is accessed  
3. **WorkflowDesigner page** is accessed

The component registry automatically triggers `preloadMonacoEditor()` when these components are requested.

## Loading States

### Main Editor
```
┌─────────────────────────┐
│   Loading editor...     │
│          ⟳             │
└─────────────────────────┘
```

### Inline Editor
```
┌─────────────┐
│ Loading...  │
│      ⟳     │
└─────────────┘
```

## Files Changed

### New Files
- `src/components/molecules/LazyMonacoEditor.tsx`
- `src/components/molecules/LazyInlineMonacoEditor.tsx`
- `docs/bundle-optimization.md`

### Modified Files
- `src/components/molecules/MonacoEditorPanel.tsx` - Uses LazyMonacoEditor
- `src/components/LambdaDesigner.tsx` - Uses LazyInlineMonacoEditor
- `src/components/WorkflowDesigner.tsx` - Uses LazyInlineMonacoEditor
- `src/lib/component-registry.ts` - Added preloadMonacoEditor calls
- `src/components/molecules/index.ts` - Exports new components

## Adding Monaco to New Components

1. **Import the wrapper:**
```typescript
import { LazyInlineMonacoEditor } from '@/components/molecules'
```

2. **Use in component:**
```typescript
<LazyInlineMonacoEditor
  height="300px"
  defaultLanguage="javascript"
  value={code}
  onChange={handleChange}
/>
```

3. **Update component registry** (if page-level):
```typescript
MyComponent: lazyWithPreload(
  () => {
    preloadMonacoEditor()
    return import('@/components/MyComponent').then(m => ({ default: m.MyComponent }))
  },
  'MyComponent'
)
```

## Testing

### Manual Test
1. Open DevTools Network tab
2. Load homepage - Monaco should NOT load
3. Navigate to Code Editor - Monaco loads on demand
4. Check initial bundle size - should be ~2.5MB lighter

### Verify Preloading
1. Navigate to Code Editor page
2. Check Network tab - Monaco starts loading immediately
3. Navigation should feel instant on fast connections

## Troubleshooting

### Editor shows loading spinner indefinitely
**Cause:** Monaco import failed  
**Fix:** Check network tab for 404/500 errors, rebuild if needed

### Initial delay when opening editor
**Expected:** First time loading Monaco takes ~100-200ms  
**Mitigation:** Preloading reduces this significantly

### Monaco loads on homepage
**Issue:** Eager import somewhere  
**Fix:** Check for direct `import '@monaco-editor/react'` statements

## Related Documentation
- [Full Bundle Optimization Guide](./bundle-optimization.md)
- [Lazy Loading System](./bundle-optimization.md#optimization-strategy)
- [Component Registry](./bundle-optimization.md#component-registry-integration)

## Next Steps
Consider lazy-loading other heavy dependencies:
- Chart libraries (recharts, d3) - ~500KB
- Three.js (if used) - ~600KB
- Other code editors or large UI libraries
