# Hover-Based Route Preloading

## Overview

The application now implements intelligent hover-based preloading for instant page navigation. When users hover over navigation items, the route components are preloaded in the background, making subsequent navigation feel instantaneous.

## Architecture

### Components

1. **`useRoutePreload` Hook** (`/src/hooks/use-route-preload.ts`)
   - React hook for triggering route preloading
   - Manages preload cache and timers
   - Provides `preloadRoute`, `cancelPreload`, and status checking functions
   - Configurable delay (default: 100ms) before preload starts

2. **`RoutePreloadManager` Class** (`/src/lib/route-preload-manager.ts`)
   - Singleton manager for intelligent preloading strategies
   - Implements queue-based preloading with concurrency control
   - Supports multiple preload strategies:
     - **Adjacent Routes**: Preloads previous/next routes in the navigation order
     - **Popular Routes**: Preloads frequently accessed routes (dashboard, editor, models, components)
   - Tracks preload stats and provides insights

3. **`lazyWithPreload` Utility** (`/src/lib/lazy-loader.ts`)
   - Enhanced lazy loading wrapper with preload support
   - All components in `ComponentRegistry` now support `.preload()` method
   - Caches preload promises to avoid duplicate loads

4. **`PreloadIndicator` Component** (`/src/components/PreloadIndicator.tsx`)
   - Visual feedback for active preloading
   - Shows when routes are being preloaded in the background
   - Animated lightning icon with queue count

5. **Enhanced Navigation Menu** (`/src/components/organisms/NavigationMenu.tsx`)
   - Wrapped navigation items with hover detection
   - Triggers preload on `mouseenter` with configurable delay
   - Cancels preload on `mouseleave` if not yet started

## How It Works

### 1. Hover Detection
```typescript
<div
  onMouseEnter={() => handleItemHover(item.value)}
  onMouseLeave={() => handleItemLeave(item.value)}
>
  <NavigationItem ... />
</div>
```

### 2. Preload Initiation
When a user hovers over a navigation item:
1. A 100ms timer starts (configurable)
2. If hover continues, the route's component is queued for preload
3. The `RoutePreloadManager` processes the queue with concurrency control (max 3 concurrent)
4. Component bundle is fetched and cached by the browser

### 3. Navigation
When the user clicks to navigate:
1. If the route was preloaded, the component renders instantly (no loading spinner)
2. If not preloaded, standard lazy loading occurs

### 4. Adjacent Route Preloading
On route change:
1. The previous and next routes in the navigation order are automatically queued for preload
2. This ensures smooth forward/backward navigation

### 5. Popular Route Preloading
After initial app load:
1. A 1-second delay occurs
2. Popular routes (dashboard, editor, models, components) are preloaded in the background

## Configuration

### Preload Strategy
```typescript
// In route-preload-manager.ts
const DEFAULT_STRATEGY = {
  preloadAdjacent: true,        // Preload prev/next routes
  preloadPopular: true,          // Preload popular routes
  maxConcurrentPreloads: 3,      // Max parallel preloads
}
```

### Hover Delay
```typescript
// In NavigationMenu.tsx
const { preloadRoute, cancelPreload } = useRoutePreload({ delay: 100 })
```

### Popular Routes
```typescript
// In route-preload-manager.ts
const popularRoutes = new Set(['dashboard', 'editor', 'models', 'components'])
```

## Performance Benefits

### Before
- Navigation: Click → Loading spinner (1-3s) → Content
- User experience: Noticeable delay on every navigation
- Bundle loading: On-demand when user navigates

### After
- Navigation: Click → Instant content (0ms perceived)
- User experience: Feels like a native desktop app
- Bundle loading: Proactive, during idle hover time

### Metrics
- **Instant navigation**: Routes preloaded on hover load in ~0ms
- **Adjacent preloading**: Next/prev routes ready for sequential navigation
- **Smart concurrency**: Max 3 concurrent downloads prevent network saturation
- **Cache efficiency**: Preloaded components stay in browser cache

## Console Logging

All preloading operations are thoroughly logged for debugging:

```
[PRELOAD] 🚀 Initiating preload for route: editor
[PRELOAD_MGR] 🎯 Queuing preload for route: editor (priority: low)
[PRELOAD_MGR] 🚀 Preloading editor → CodeEditor
[REGISTRY] 🎯 Preloading component: CodeEditor
[LAZY] 🎯 Preloading CodeEditor
[LAZY] ✅ CodeEditor preloaded
[PRELOAD] ✅ Route editor preload initiated
[PRELOAD_MGR] ✅ Route editor preloaded
```

## Future Enhancements

1. **Predictive Preloading**: Use navigation history to predict likely next routes
2. **Network-Aware**: Reduce preloading on slow connections
3. **Priority Levels**: User-triggered hovers get higher priority than automatic adjacent preloads
4. **Analytics Integration**: Track preload hit rates and navigation patterns
5. **Configurable UI**: Allow users to toggle preloading strategies in settings

## API Reference

### `useRoutePreload(options?)`
Hook for manual route preloading.

**Options:**
- `delay?: number` - Delay before preload starts (default: 100ms)

**Returns:**
- `preloadRoute(pageId: string)` - Initiate preload
- `cancelPreload(pageId: string)` - Cancel pending preload
- `clearAllPreloads()` - Clear all pending preloads
- `isPreloaded(pageId: string)` - Check if route is preloaded

### `RoutePreloadManager`
Global manager for preload strategies.

**Methods:**
- `setFeatureToggles(toggles)` - Configure enabled routes
- `setCurrentRoute(route)` - Update current route (triggers adjacent preload)
- `preloadRoute(pageId, priority?)` - Queue route for preload
- `preloadPopularRoutes()` - Preload all popular routes
- `isPreloaded(pageId)` - Check preload status
- `getStats()` - Get current preload statistics
- `reset()` - Clear all state

### `lazyWithPreload(importFn, key)`
Create a preloadable lazy component.

**Parameters:**
- `importFn: () => Promise<{default: Component}>` - Component import function
- `key: string` - Unique identifier for caching

**Returns:**
- Lazy component with `.preload()` method

## Best Practices

1. **Use hover delay**: Don't preload on every hover - use a short delay (100-200ms)
2. **Limit concurrency**: Cap concurrent preloads to avoid bandwidth issues
3. **Prioritize critical routes**: Preload dashboard and main routes first
4. **Monitor performance**: Use console logs and PreloadIndicator during development
5. **Test on slow connections**: Ensure preloading doesn't hurt initial load time

## Troubleshooting

### Components not preloading
- Check that component is using `lazyWithPreload` in `component-registry.ts`
- Verify component name matches page config in `pages.json`
- Check console for preload errors

### Preloading too aggressive
- Increase hover delay: `useRoutePreload({ delay: 200 })`
- Reduce max concurrent preloads in `route-preload-manager.ts`
- Disable popular route preloading

### Memory concerns
- Preloaded components stay in browser cache (managed by browser)
- Cache is cleared on page refresh
- Use `routePreloadManager.reset()` to manually clear

## Related Files

- `/src/hooks/use-route-preload.ts` - React hook
- `/src/lib/route-preload-manager.ts` - Manager class
- `/src/lib/lazy-loader.ts` - Lazy loading utilities
- `/src/lib/component-registry.ts` - Component registry with preload support
- `/src/components/organisms/NavigationMenu.tsx` - Navigation with hover detection
- `/src/components/PreloadIndicator.tsx` - Visual feedback component
- `/src/App.tsx` - Integration point
