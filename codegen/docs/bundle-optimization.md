# Bundle Size Optimization

## Overview
This document describes the bundle size optimization strategies implemented in CodeForge, focusing on lazy-loading heavy components like Monaco Editor.

## Heavy Dependencies Identified

### Monaco Editor (~2.5MB)
Monaco Editor is one of the largest dependencies in the application. It's used in:
- CodeEditor component (main code editor)
- LambdaDesigner component (lambda function editor)
- WorkflowDesigner component (inline script editors)

### Optimization Strategy

#### 1. Lazy Loading Monaco Editor
Created lazy-loaded wrappers for Monaco Editor:

**LazyMonacoEditor** (`src/components/molecules/LazyMonacoEditor.tsx`)
- Full-featured Monaco Editor wrapper for main code editor
- Used in: CodeEditor component
- Includes loading fallback with spinner and status text
- Exports `preloadMonacoEditor()` function for manual preloading

**LazyInlineMonacoEditor** (`src/components/molecules/LazyInlineMonacoEditor.tsx`)
- Lightweight Monaco Editor wrapper for inline editors
- Used in: LambdaDesigner and WorkflowDesigner components
- Smaller loading fallback for inline contexts
- Configurable height, language, and options

#### 2. Component Registry Integration
Updated `src/lib/component-registry.ts` to automatically preload Monaco Editor when components that use it are loaded:

```typescript
CodeEditor: lazyWithPreload(
  () => {
    preloadMonacoEditor()
    return import('@/components/CodeEditor').then(m => ({ default: m.CodeEditor }))
  },
  'CodeEditor'
)
```

This ensures Monaco Editor starts loading as soon as the CodeEditor component is requested, improving perceived performance.

#### 3. Suspense Boundaries
All lazy-loaded Monaco Editor instances are wrapped in React Suspense with custom fallback components:
- Shows loading spinner
- Displays "Loading editor..." status text
- Prevents layout shift during loading

## Performance Impact

### Before Optimization
- Monaco Editor loaded eagerly with initial bundle
- ~2.5MB added to main bundle size
- Slower initial page load for all users

### After Optimization
- Monaco Editor loaded only when needed
- Main bundle size reduced by ~2.5MB
- Faster initial page load
- Slight delay when first opening editor (mitigated by preloading)

## Usage

### For New Components Using Monaco Editor

If you need to add Monaco Editor to a new component:

1. **For full-page editors**, use `LazyMonacoEditor`:
```typescript
import { LazyMonacoEditor } from '@/components/molecules'

<LazyMonacoEditor
  file={file}
  onChange={handleChange}
/>
```

2. **For inline editors**, use `LazyInlineMonacoEditor`:
```typescript
import { LazyInlineMonacoEditor } from '@/components/molecules'

<LazyInlineMonacoEditor
  height="300px"
  defaultLanguage="javascript"
  value={code}
  onChange={handleChange}
/>
```

3. **Update component registry** to preload Monaco:
```typescript
MyComponent: lazyWithPreload(
  () => {
    preloadMonacoEditor()
    return import('@/components/MyComponent').then(m => ({ default: m.MyComponent }))
  },
  'MyComponent'
)
```

## Other Optimization Opportunities

### Future Optimizations
1. **Chart libraries** (recharts, d3) - Consider lazy loading
2. **react-router-dom** - Already using route-based code splitting
3. **Three.js** - If 3D visualization is added, lazy load it
4. **Heavy utility libraries** - Audit lodash/date-fns usage

### Monitoring
Use the bundle metrics system to track bundle sizes:
```typescript
import { bundleMetrics } from '@/lib/bundle-metrics'

// Check current bundle size
const metrics = bundleMetrics.getMetrics()
console.log('Bundle size:', metrics.bundleSize)
```

## Related Files
- `src/components/molecules/LazyMonacoEditor.tsx`
- `src/components/molecules/LazyInlineMonacoEditor.tsx`
- `src/components/molecules/MonacoEditorPanel.tsx`
- `src/components/CodeEditor.tsx`
- `src/components/LambdaDesigner.tsx`
- `src/components/WorkflowDesigner.tsx`
- `src/lib/component-registry.ts`
- `src/lib/lazy-loader.ts`

## Best Practices
1. Always wrap lazy-loaded components in Suspense
2. Provide meaningful loading fallbacks
3. Preload heavy components when parent component loads
4. Test loading states in slow network conditions
5. Monitor bundle size changes in CI/CD
