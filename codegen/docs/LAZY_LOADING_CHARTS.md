# Lazy-Loaded Chart Libraries

This project implements lazy-loading for heavy chart libraries (Recharts, D3, Three.js, ReactFlow) to reduce the initial bundle size and improve page load performance.

## Overview

Instead of importing these libraries directly, which would include them in the main bundle, we dynamically import them only when needed. This can reduce the initial bundle size by hundreds of kilobytes.

## Benefits

- **Smaller Initial Bundle**: Chart libraries are only loaded when components that use them are rendered
- **Faster Initial Load**: Users see the page faster, with charts loading in progressively
- **Better Caching**: Libraries are cached separately and only re-downloaded when they change
- **Automatic Retry**: Built-in retry logic handles temporary network failures
- **Preloading Support**: Libraries can be preloaded on hover or route change

## Usage

### Using Hooks

The recommended way to use lazy-loaded libraries is through the provided hooks:

```typescript
import { useRecharts, useD3, useThree, useReactFlow } from '@/hooks'

function MyChartComponent() {
  const { library: recharts, loading, error } = useRecharts()

  if (loading) {
    return <Skeleton className="h-[300px]" />
  }

  if (error) {
    return <Alert>Failed to load chart library</Alert>
  }

  if (!recharts) {
    return null
  }

  const { LineChart, Line, XAxis, YAxis } = recharts

  return (
    <LineChart data={data}>
      <XAxis />
      <YAxis />
      <Line dataKey="value" />
    </LineChart>
  )
}
```

### Using Pre-built Components

For common use cases, we provide pre-built lazy-loaded chart components:

```typescript
import { LazyLineChart, LazyBarChart, LazyD3BarChart } from '@/components/molecules'

function Dashboard() {
  const data = [
    { month: 'Jan', value: 100 },
    { month: 'Feb', value: 150 },
    { month: 'Mar', value: 200 },
  ]

  return (
    <div>
      <LazyLineChart 
        data={data} 
        xKey="month" 
        yKey="value"
        height={300}
        color="#8884d8"
      />
    </div>
  )
}
```

### Direct Library Loading

For more control, you can use the library loader directly:

```typescript
import { loadRecharts, loadD3 } from '@/lib/library-loader'

async function loadChart() {
  try {
    const recharts = await loadRecharts()
    // Use recharts
  } catch (error) {
    console.error('Failed to load recharts:', error)
  }
}
```

### Preloading Libraries

To improve perceived performance, you can preload libraries before they're needed:

```typescript
import { preloadLibrary } from '@/lib/library-loader'
import { routePreloadManager } from '@/lib/route-preload-manager'

// Preload on hover
<button 
  onMouseEnter={() => preloadLibrary('recharts')}
  onClick={navigateToDashboard}
>
  View Dashboard
</button>

// Preload multiple libraries
routePreloadManager.preloadLibraries(['recharts', 'd3'])
```

## Available Libraries

### Recharts
- **Size**: ~450KB
- **Use Case**: Business charts (line, bar, pie, area)
- **Hook**: `useRecharts()`
- **Preload**: `preloadLibrary('recharts')`

### D3
- **Size**: ~500KB
- **Use Case**: Custom data visualizations, complex charts
- **Hook**: `useD3()`
- **Preload**: `preloadLibrary('d3')`

### Three.js
- **Size**: ~600KB
- **Use Case**: 3D graphics and visualizations
- **Hook**: `useThree()`
- **Preload**: `preloadLibrary('three')`

### ReactFlow
- **Size**: ~300KB
- **Use Case**: Flow charts, node graphs, diagrams
- **Hook**: `useReactFlow()`
- **Preload**: `preloadLibrary('reactflow')`

## Performance Tips

1. **Use Preloading**: Preload libraries when users hover over navigation items or during idle time
2. **Show Loading States**: Always show skeleton loaders while libraries are loading
3. **Handle Errors**: Provide fallbacks or retry options when library loading fails
4. **Batch Loads**: If multiple charts use the same library, they'll automatically share the cached import
5. **Avoid Over-preloading**: Only preload libraries for routes users are likely to visit

## Implementation Details

### Caching
Libraries are cached after the first load, so subsequent components using the same library load instantly.

### Retry Logic
The loader automatically retries failed imports up to 3 times with exponential backoff (1s, 2s, 3s).

### Timeout
Library loads timeout after 10 seconds to prevent indefinite hangs.

### Bundle Analysis
To see the impact of lazy loading, run:
```bash
npm run build
# Check the dist/ folder - chart libraries will be in separate chunks
```

## Migration Guide

### Before (Eager Loading)
```typescript
import { LineChart, Line } from 'recharts'

function Chart() {
  return <LineChart><Line /></LineChart>
}
```

### After (Lazy Loading)
```typescript
import { useRecharts } from '@/hooks'

function Chart() {
  const { library: recharts, loading } = useRecharts()
  
  if (loading) return <Skeleton />
  if (!recharts) return null
  
  const { LineChart, Line } = recharts
  return <LineChart><Line /></LineChart>
}
```

Or use pre-built components:
```typescript
import { LazyLineChart } from '@/components/molecules'

function Chart() {
  return <LazyLineChart data={data} xKey="x" yKey="y" />
}
```

## Console Logging

All library loading is logged to the console with the `[LIBRARY]` prefix for debugging:

- `🎯 Preloading {library}` - Preload started
- `📦 Loading {library}...` - Load started
- `✅ {library} loaded successfully` - Load complete
- `❌ {library} load failed` - Load error
- `🔁 Retrying {library}` - Retry attempt

## Best Practices

1. **Always handle loading states** - Show skeletons or spinners
2. **Always handle error states** - Provide user feedback and retry options
3. **Preload strategically** - On route hover, during idle time, or based on user behavior
4. **Use pre-built components when possible** - They handle all edge cases
5. **Monitor bundle size** - Use `npm run build` and check chunk sizes

## Troubleshooting

### Charts not loading
- Check browser console for `[LIBRARY]` logs
- Verify network requests are completing (DevTools Network tab)
- Check for Content Security Policy issues

### Slow loading
- Ensure libraries are being preloaded on route change
- Check network conditions and CDN performance
- Consider reducing the timeout or retry settings

### Type errors
- The hooks return typed libraries, so TypeScript will help
- Use `if (!library) return null` before destructuring
- Check that you're using the correct import path
