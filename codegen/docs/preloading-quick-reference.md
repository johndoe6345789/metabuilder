# Route Preloading - Quick Reference

## For Developers

### Adding a New Preloadable Component

1. **Register in Component Registry** (`/src/lib/component-registry.ts`):
```typescript
MyNewComponent: lazyWithPreload(
  () => import('@/components/MyNewComponent').then(m => ({ default: m.MyNewComponent })),
  'MyNewComponent'  // Unique cache key
),
```

2. **Add to pages.json** (`/src/config/pages.json`):
```json
{
  "id": "my-route",
  "component": "MyNewComponent",
  "enabled": true
}
```

3. **Done!** The component will now preload on hover automatically.

### Manual Preloading in a Custom Component

```typescript
import { useRoutePreload } from '@/hooks/use-route-preload'

function MyComponent() {
  const { preloadRoute } = useRoutePreload({ delay: 150 })
  
  return (
    <button onMouseEnter={() => preloadRoute('editor')}>
      Go to Editor
    </button>
  )
}
```

### Checking Preload Status

```typescript
import { routePreloadManager } from '@/lib/route-preload-manager'

const isReady = routePreloadManager.isPreloaded('editor')
const stats = routePreloadManager.getStats()
console.log(stats)
// { preloadedCount: 5, queuedCount: 2, activePreloads: 1, currentRoute: 'dashboard' }
```

## For Users

### What is Route Preloading?

When you hover over a navigation item, the app starts loading that page in the background. When you click, the page appears instantly with no loading spinner.

### Visual Feedback

A small lightning icon appears in the bottom-right corner when routes are preloading. This is normal and indicates the app is preparing pages for you.

### Performance Tips

- **Hover before clicking**: Give the app a moment to preload by hovering over navigation items before clicking
- **Sequential navigation**: The app automatically preloads the next/previous pages when you navigate
- **First load**: Popular pages load in the background after initial app startup

## Configuration

### Adjust Hover Delay
In `/src/components/organisms/NavigationMenu.tsx`:
```typescript
const { preloadRoute, cancelPreload } = useRoutePreload({ delay: 100 }) // milliseconds
```

### Adjust Concurrent Preloads
In `/src/lib/route-preload-manager.ts`:
```typescript
const DEFAULT_STRATEGY = {
  maxConcurrentPreloads: 3, // Adjust based on bandwidth
}
```

### Customize Popular Routes
In `/src/lib/route-preload-manager.ts`:
```typescript
const popularRoutes = new Set(['dashboard', 'editor', 'models', 'components'])
```

### Disable Features
In `/src/lib/route-preload-manager.ts`:
```typescript
const DEFAULT_STRATEGY = {
  preloadAdjacent: false,  // Disable prev/next preloading
  preloadPopular: false,   // Disable popular route preloading
}
```

### Hide Preload Indicator
In `/src/App.tsx`, remove or comment out:
```typescript
<PreloadIndicator />
```

## Console Debugging

### Enable Verbose Logging
All preload operations log with `[PRELOAD]` or `[PRELOAD_MGR]` prefix:
- 🚀 = Initiating preload
- ✅ = Success
- ❌ = Error
- ⚠️ = Warning
- ⏳ = In progress
- 🎯 = Targeting specific route

### Filter Console
In browser DevTools:
```
[PRELOAD     // Show only preload logs
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Routes not preloading | Check component is using `lazyWithPreload` |
| Too many network requests | Reduce `maxConcurrentPreloads` |
| Slow initial load | Disable `preloadPopular` or increase delay |
| Memory concerns | Normal - browser manages cache automatically |
| Indicator always showing | Check for errors in console |

## Metrics to Track

- **Preload Hit Rate**: % of navigations that were preloaded
- **Average Preload Time**: Time from hover to bundle loaded
- **User Satisfaction**: Navigation feels instant vs. noticeable delay

## Related Documentation

- Full documentation: `/docs/hover-preloading.md`
- Code splitting docs: `/docs/code-splitting.md` (if exists)
- React Router docs: `/docs/routing.md` (if exists)
