# Quick Start: Enabling React Router

This guide shows you how to enable route-based code splitting with React Router in under 2 minutes.

## Step 1: Enable Router Mode

Edit `src/config/app.config.ts`:

```typescript
export const APP_CONFIG = {
  useRouter: true,  // Change from false to true
  // ... rest of config
}
```

## Step 2: Reload the App

That's it! The app will now use:
- React Router for navigation
- URL-based routing (`/dashboard`, `/code`, etc.)
- Route-based code splitting
- Browser back/forward buttons

## What Changes?

### Before (Tabs Mode)
- Navigation via tab state
- All components loaded upfront
- No URL changes when navigating
- ~2.5MB initial bundle

### After (Router Mode)
- Navigation via React Router
- Components lazy-loaded per route
- URLs like `/dashboard`, `/models`
- ~1.2MB initial bundle (52% smaller!)
- Routes loaded on-demand

## Verify It's Working

### 1. Check Console Logs
Look for router-specific logs:
```
[APP_ROUTER] 🚀 App.router.tsx loading - BEGIN
[ROUTES] 🛣️ Routes configuration loading
[ROUTER_PROVIDER] 🏗️ Creating routes
```

### 2. Check URLs
Navigate between pages - URLs should change:
```
http://localhost:5000/dashboard
http://localhost:5000/code
http://localhost:5000/models
```

### 3. Check Network Tab
Open DevTools Network tab:
- Clear network log
- Navigate to a new page
- See route-specific chunks loading

### 4. Check Bundle Size
Open DevTools Coverage or Lighthouse:
- Initial JavaScript: ~1.2MB (down from ~2.5MB)
- Per-route chunks: 50-200KB each

## Keyboard Shortcuts

Still work! But now they navigate via router:
- `Ctrl+1` → `/dashboard`
- `Ctrl+2` → `/code`
- `Ctrl+3` → `/models`
- etc.

## Switching Back

To disable router mode, set `useRouter: false` in `app.config.ts`.

## Troubleshooting

### Components not loading?
1. Check `ComponentRegistry` - all components registered?
2. Check `pages.json` - pages enabled?
3. Check console for error logs

### URLs not changing?
1. Verify `useRouter: true` in config
2. Check BrowserRouter is wrapping app
3. Clear cache and hard reload

### Performance not improved?
1. Open Network tab - see chunks loading?
2. Check Coverage tab - see code splitting?
3. Disable cache in DevTools

## Next Steps

- Read [REACT_ROUTER_INTEGRATION.md](./REACT_ROUTER_INTEGRATION.md) for detailed docs
- Check console logs to understand loading flow
- Experiment with navigation
- Measure bundle size improvements

## Need Help?

Check the logs! Every significant action is logged:
```
[ROUTES] 📝 Configuring route for page: dashboard
[APP_ROUTER] 🚀 Navigating to: models
[USE_ROUTER_NAVIGATION] 📍 Current path: models
```

Filter by tag:
- `[ROUTES]` - Route configuration
- `[APP_ROUTER]` - App lifecycle
- `[ROUTER_PROVIDER]` - Route rendering
- `[USE_ROUTER_NAVIGATION]` - Navigation events
