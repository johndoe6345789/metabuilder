# Library Utilities

Core utility functions and modules for the CodeForge application.

## Module Overview

### `bundle-metrics.ts`

Bundle size and performance monitoring utilities.

**Key Functions:**
- `trackBundleLoad(chunkName, size)` - Track loaded chunks
- `getBundleMetrics()` - Get current bundle statistics
- `analyzePerformance()` - Analyze page load performance
- `startPerformanceMonitoring()` - Start monitoring resource loads
- `formatSize(bytes)` - Format byte sizes human-readable

**Usage:**
```typescript
import { startPerformanceMonitoring, analyzePerformance } from '@/lib/bundle-metrics'

// Start monitoring on app init
startPerformanceMonitoring()

// Analyze after page load
window.addEventListener('load', () => {
  setTimeout(analyzePerformance, 1000)
})
```

### `component-registry.ts`

Centralized lazy-loaded component registry with preloading support.

**Registries:**
- `ComponentRegistry` - Main page components
- `DialogRegistry` - Dialog/modal components
- `PWARegistry` - PWA-related components

**Key Functions:**
- `preloadCriticalComponents()` - Preload dashboard & file explorer
- `preloadComponentByName(name)` - Preload specific component

**Usage:**
```typescript
import { ComponentRegistry, preloadCriticalComponents } from '@/lib/component-registry'

// Get a component
const Dashboard = ComponentRegistry.ProjectDashboard

// Preload on init
preloadCriticalComponents()

// Render lazily
<Suspense fallback={<Loading />}>
  <Dashboard {...props} />
</Suspense>
```

### `lazy-loader.ts`

Advanced lazy loading utilities with retry logic and preload support.

**Key Functions:**

#### `lazyWithRetry<T>(componentImport, options)`
Lazy load with automatic retry on failure.

**Options:**
- `timeout` - Load timeout in ms (default: 10000)
- `retries` - Number of retry attempts (default: 3)

**Usage:**
```typescript
import { lazyWithRetry } from '@/lib/lazy-loader'

const HeavyComponent = lazyWithRetry(
  () => import('./HeavyComponent'),
  { retries: 3, timeout: 15000 }
)
```

#### `lazyWithPreload<T>(componentImport, preloadKey)`
Lazy load with manual preload capability.

**Usage:**
```typescript
import { lazyWithPreload } from '@/lib/lazy-loader'

const Dashboard = lazyWithPreload(
  () => import('./Dashboard'),
  'Dashboard'
)

// Later, trigger preload
Dashboard.preload()
```

#### `preloadComponent(componentImport)`
Preload a component without rendering it.

**Usage:**
```typescript
import { preloadComponent } from '@/lib/lazy-loader'

// Preload on hover
<button onMouseEnter={() => preloadComponent(() => import('./Modal'))}>
  Open Modal
</button>
```

#### `createComponentLoader()`
Create a component loader with caching and tracking.

**Usage:**
```typescript
import { createComponentLoader } from '@/lib/lazy-loader'

const loader = createComponentLoader()

// Load component
const component = await loader.load('MyComponent', () => import('./MyComponent'))

// Check status
if (loader.isLoaded('MyComponent')) {
  // Component ready
}

// Reset cache
loader.reset()
```

### `library-loader.ts`

Lazy loading utilities for heavy chart and visualization libraries.

**Supported Libraries:**
- Recharts (~450KB)
- D3 (~500KB)
- Three.js (~600KB)
- ReactFlow (~300KB)

**Key Functions:**

#### `loadRecharts()`, `loadD3()`, `loadThree()`, `loadReactFlow()`
Load libraries with retry logic and caching.

**Usage:**
```typescript
import { loadRecharts, loadD3 } from '@/lib/library-loader'

async function loadChart() {
  const recharts = await loadRecharts()
  // Use recharts
}
```

#### `preloadLibrary(libraryName)`
Preload library before it's needed.

**Usage:**
```typescript
import { preloadLibrary } from '@/lib/library-loader'

// Preload on hover
<button onMouseEnter={() => preloadLibrary('recharts')}>
  View Charts
</button>
```

#### `clearLibraryCache()`
Clear all cached library imports.

**React Hooks:**
Use with hooks for automatic loading state management:

```typescript
import { useRecharts, useD3 } from '@/hooks'

function Chart() {
  const { library: recharts, loading, error } = useRecharts()
  
  if (loading) return <Skeleton />
  if (error) return <Alert>Failed to load</Alert>
  if (!recharts) return null
  
  const { LineChart } = recharts
  return <LineChart />
}
```

**See `/docs/LAZY_LOADING_CHARTS.md` for complete documentation.**

### `utils.ts`

General utility functions (shadcn standard).

**Key Functions:**
- `cn(...inputs)` - Merge Tailwind class names with clsx + tailwind-merge

**Usage:**
```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)} />
```

## Performance Best Practices

### 1. Choose the Right Lazy Loading Strategy

**Use `lazy()` for:**
- Standard components
- Low-priority features
- Small components

**Use `lazyWithRetry()` for:**
- Heavy components (Monaco Editor, D3 visualizations)
- Network-dependent components
- Critical but slow-loading features

**Use `lazyWithPreload()` for:**
- Frequently accessed components
- Components that benefit from hover preload
- Critical path components that need fast render

### 2. Preloading Strategy

**Immediate Preload:**
```typescript
// On app initialization
preloadCriticalComponents()
```

**Predictive Preload:**
```typescript
// Preload next likely components
useEffect(() => {
  const nextPages = getAdjacentPages(currentPage)
  nextPages.forEach(page => preloadComponentByName(page.component))
}, [currentPage])
```

**Interaction Preload:**
```typescript
// Preload on hover/focus
<button
  onMouseEnter={() => MyDialog.preload()}
  onFocus={() => MyDialog.preload()}
>
  Open Dialog
</button>
```

### 3. Bundle Monitoring

Always monitor bundle performance in development:

```typescript
import { startPerformanceMonitoring } from '@/lib/bundle-metrics'

// In main.tsx or App.tsx
startPerformanceMonitoring()
```

Watch console for:
- `[BUNDLE] 📦 Chunk loaded` - Individual chunk loads
- `[BUNDLE] 📊 Performance Analysis` - Overall metrics
- `[LOADER] 🔄 Loading component` - Component load attempts
- `[REGISTRY] 🚀 Preloading` - Preload operations

## Common Patterns

### Pattern 1: Dialog with Preload on Hover

```typescript
import { lazyWithPreload } from '@/lib/lazy-loader'

const SettingsDialog = lazyWithPreload(
  () => import('./SettingsDialog'),
  'SettingsDialog'
)

function App() {
  return (
    <button
      onMouseEnter={() => SettingsDialog.preload()}
      onClick={() => setOpen(true)}
    >
      Settings
    </button>
  )
}
```

### Pattern 2: Heavy Component with Retry

```typescript
import { lazyWithRetry } from '@/lib/lazy-loader'

const CodeEditor = lazyWithRetry(
  () => import('@monaco-editor/react'),
  { retries: 3, timeout: 20000 }
)

function EditorPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <CodeEditor {...props} />
    </Suspense>
  )
}
```

### Pattern 3: Component Loader for Dynamic Imports

```typescript
import { createComponentLoader } from '@/lib/lazy-loader'

const loader = createComponentLoader()

async function loadPlugin(pluginName: string) {
  try {
    const plugin = await loader.load(
      pluginName,
      () => import(`./plugins/${pluginName}`)
    )
    return plugin
  } catch (error) {
    console.error(`Failed to load plugin: ${pluginName}`)
    return null
  }
}
```

## Troubleshooting

### Issue: Components not loading

**Check:**
1. Console for `[LOADER] ❌ Load failed` messages
2. Network tab for failed chunk requests
3. Chunk files exist in `dist/assets/` after build

**Solution:**
- Increase retry count or timeout
- Check network conditions
- Verify import paths are correct

### Issue: Slow initial load

**Check:**
1. Bundle size with `npm run build`
2. Number of synchronous imports
3. Critical path components

**Solution:**
- Move more components to lazy loading
- Reduce vendor bundle size
- Use code splitting more aggressively

### Issue: Preload not working

**Check:**
1. Console for `[REGISTRY] 🎯 Preloading` messages
2. Component has `preload()` method (use `lazyWithPreload`)
3. Preload called before render

**Solution:**
- Use `lazyWithPreload` instead of `lazy`
- Call `.preload()` method explicitly
- Check browser network tab for prefetch

## Testing

### Manual Testing

1. Open DevTools → Network tab
2. Filter by JS files
3. Interact with app and verify chunks load on-demand
4. Check console for bundle metrics

### Performance Testing

```typescript
// In test environment
import { analyzePerformance } from '@/lib/bundle-metrics'

window.addEventListener('load', () => {
  const metrics = analyzePerformance()
  expect(metrics.loadComplete).toBeLessThan(3000)
  expect(metrics.resources.total.size).toBeLessThan(500000)
})
```

## Migration Guide

### From Eager Loading to Lazy Loading

**Before:**
```typescript
import HeavyComponent from './HeavyComponent'

function App() {
  return <HeavyComponent />
}
```

**After:**
```typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### From Basic Lazy to Lazy with Retry

**Before:**
```typescript
const Editor = lazy(() => import('./Editor'))
```

**After:**
```typescript
import { lazyWithRetry } from '@/lib/lazy-loader'

const Editor = lazyWithRetry(
  () => import('./Editor'),
  { retries: 3 }
)
```
