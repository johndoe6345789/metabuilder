# 📱 Progressive Web App (PWA) Guide

## Overview

CodeForge is a fully-featured Progressive Web App that can be installed on any device and works offline. This guide covers all PWA capabilities, installation instructions, and technical details.

## What is a PWA?

A Progressive Web App combines the best of web and native apps:
- **Installable** - Add to home screen or applications menu
- **Offline-First** - Works without internet connection
- **Fast** - Loads instantly from cache
- **Engaging** - Native app-like experience
- **Linkable** - Still a website with URLs
- **Safe** - Served over HTTPS

## Features

### 🚀 Installation

#### Desktop Installation
**Chrome/Edge/Brave:**
1. Visit CodeForge in your browser
2. Look for the install icon (⊕) in the address bar
3. Click "Install" or use the install prompt in the app
4. The app will be added to your applications

**Safari (macOS):**
1. Open CodeForge in Safari
2. Click File > Add to Dock
3. The app icon will appear in your Dock

**Firefox:**
1. Visit CodeForge
2. Click the install prompt when it appears
3. Or use the "Install" button in the app UI

#### Mobile Installation
**iOS (Safari):**
1. Open CodeForge in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

**Android (Chrome):**
1. Open CodeForge in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home screen"
4. Confirm installation

### 💾 Offline Support

CodeForge uses intelligent caching strategies to work offline:

#### What Works Offline:
- ✅ View and edit existing projects
- ✅ Browse saved files and code
- ✅ Use the code editor (Monaco)
- ✅ Navigate between all tabs
- ✅ View documentation
- ✅ Make changes to models, components, themes
- ✅ Create new files and components

#### What Requires Internet:
- ❌ AI-powered generation features
- ❌ Downloading external fonts
- ❌ Syncing projects to database
- ❌ Fetching external resources

#### Background Sync:
When you go offline and make changes:
1. Changes are stored locally
2. Network status indicator appears
3. When you reconnect, changes sync automatically
4. You'll see "Back online" notification

### 🔔 Push Notifications

Enable notifications to receive updates about:
- Project build completions
- Error detections
- New feature releases
- System updates

**To Enable Notifications:**
1. Go to **PWA** tab in settings
2. Toggle "Push Notifications"
3. Grant permission in browser prompt
4. You'll receive relevant notifications

**To Disable:**
- Use the toggle in PWA settings, or
- Manage in browser settings:
  - Chrome: Settings > Privacy > Site Settings > Notifications
  - Safari: Preferences > Websites > Notifications
  - Firefox: Settings > Privacy & Security > Notifications

### ⚡ Performance & Caching

#### Cache Strategy:
CodeForge uses a multi-tier caching system:

1. **Static Cache** - Core app files (HTML, CSS, JS)
   - Cached on install
   - Updated when new version deployed

2. **Dynamic Cache** - User files and components
   - Cached as you use them
   - Limited to 50 items (oldest removed first)

3. **Image Cache** - Icons and images
   - Cached on first load
   - Limited to 30 items

#### Cache Management:
View and manage cache in **PWA** settings tab:
- See current cache size
- Clear all cached data
- Force reload with fresh data

**Clear Cache:**
1. Navigate to **PWA** tab
2. Scroll to "Cache Management"
3. Click "Clear Cache & Reload"
4. App will reload with fresh data

### 🔄 Updates

#### Automatic Update Detection:
- App checks for updates every time you open it
- When an update is available, you'll see a notification
- Click "Update Now" to reload with the new version

#### Manual Update Check:
1. Go to **PWA** tab
2. Check "App Update" section
3. Click "Update Now" if available

#### Version Management:
- Current version displayed in PWA settings
- Service worker status shows if updates are pending
- Update notifications appear automatically

### ⚡ App Shortcuts

Quick access to common features from your OS:

**Desktop:**
- Right-click the app icon
- Select from shortcuts:
  - Dashboard
  - Code Editor
  - Models Designer

**Mobile:**
- Long-press the app icon
- Tap a shortcut for quick access

### 📤 Share Target API

Share code files directly to CodeForge:

**To Share Files:**
1. Right-click a code file in your OS
2. Select "Share" (Windows/Android) or "Share to..." (macOS/iOS)
3. Choose CodeForge
4. File will open in the code editor

**Supported File Types:**
- `.ts`, `.tsx` - TypeScript files
- `.js`, `.jsx` - JavaScript files
- `.json` - JSON configuration
- `.css`, `.scss` - Stylesheets
- Any text file

## Technical Implementation

### Service Worker

Location: `/public/sw.js`

**Features:**
- Install event: Precaches core assets
- Activate event: Cleans up old caches
- Fetch event: Intercepts requests with cache strategies
- Message event: Handles cache clearing commands
- Sync event: Background sync support
- Push event: Push notification handling

**Cache Versions:**
```javascript
const CACHE_VERSION = 'codeforge-v1.0.0'
const STATIC_CACHE = 'codeforge-v1.0.0-static'
const DYNAMIC_CACHE = 'codeforge-v1.0.0-dynamic'
const IMAGE_CACHE = 'codeforge-v1.0.0-images'
```

### Web App Manifest

Location: `/public/manifest.json`

**Key Properties:**
```json
{
  "name": "CodeForge - Low-Code App Builder",
  "short_name": "CodeForge",
  "display": "standalone",
  "theme_color": "#7c3aed",
  "background_color": "#0f0f14"
}
```

**Icon Sizes:**
- 72×72, 96×96, 128×128, 144×144, 152×152, 192×192, 384×384, 512×512
- Maskable icons for Android
- Shortcuts with 96×96 icons

### React Hook: `usePWA`

Location: `/src/hooks/use-pwa.ts`

**Usage:**
```typescript
import { usePWA } from '@/hooks/use-pwa'

function MyComponent() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline,
    isUpdateAvailable,
    installApp,
    updateApp,
    clearCache,
    showNotification
  } = usePWA()

  // Use PWA features
}
```

**State Properties:**
- `isInstallable`: Can the app be installed?
- `isInstalled`: Is the app currently installed?
- `isOnline`: Is the device connected to internet?
- `isUpdateAvailable`: Is a new version available?
- `registration`: Service Worker registration object

**Methods:**
- `installApp()`: Trigger install prompt
- `updateApp()`: Install pending update and reload
- `clearCache()`: Clear all cached data
- `requestNotificationPermission()`: Ask for notification permission
- `showNotification(title, options)`: Display a notification

### PWA Components

**PWAInstallPrompt** - `/src/components/PWAInstallPrompt.tsx`
- Appears after 3 seconds for installable apps
- Dismissible with local storage memory
- Animated card with install button

**PWAUpdatePrompt** - `/src/components/PWAUpdatePrompt.tsx`
- Appears when update is available
- Top-right notification card
- One-click update

**PWAStatusBar** - `/src/components/PWAStatusBar.tsx`
- Shows online/offline status
- Appears at top when status changes
- Auto-hides after 3 seconds when back online

**PWASettings** - `/src/components/PWASettings.tsx`
- Comprehensive PWA control panel
- Installation status
- Network status
- Update management
- Notification settings
- Cache management
- Feature availability

## Browser Support

### Full Support (Install + Offline):
- ✅ Chrome 90+ (Desktop & Android)
- ✅ Edge 90+ (Desktop)
- ✅ Safari 14+ (macOS & iOS)
- ✅ Firefox 90+ (Desktop & Android)
- ✅ Opera 76+ (Desktop & Android)
- ✅ Samsung Internet 14+

### Partial Support:
- ⚠️ Safari iOS 11.3-13 (Add to Home Screen, limited features)
- ⚠️ Firefox iOS (Limited by iOS restrictions)

### Not Supported:
- ❌ Internet Explorer
- ❌ Legacy browsers (Chrome <40, Firefox <44)

## Troubleshooting

### Installation Issues

**"Install" button doesn't appear:**
- Ensure you're using a supported browser
- Check that site is served over HTTPS (or localhost)
- Try refreshing the page
- Check browser console for errors

**App won't install on iOS:**
- Only Safari supports installation on iOS
- Use Share > Add to Home Screen method
- Ensure you're not in Private Browsing mode

### Offline Issues

**App won't work offline:**
- Check that service worker registered successfully (PWA settings tab)
- Visit pages while online first to cache them
- Clear cache and revisit pages online
- Check browser's offline storage isn't full

**Changes not syncing when back online:**
- Check network status indicator
- Manually save project after reconnecting
- Clear cache and reload if persists

### Notification Issues

**Notifications not appearing:**
- Check permission is granted in browser settings
- Ensure notifications enabled in PWA settings
- Check OS notification settings
- Some browsers require user interaction first

### Cache Issues

**App showing old content:**
1. Check for update notification
2. Go to PWA settings
3. Click "Clear Cache & Reload"
4. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

**Cache size too large:**
- Clear cache in PWA settings
- Limits: 50 dynamic items, 30 images
- Oldest items automatically removed

## Best Practices

### For Developers

1. **Test Offline:**
   - Use browser DevTools to simulate offline
   - Chrome: DevTools > Network > Offline
   - Test all critical user flows

2. **Cache Strategy:**
   - Static assets: Cache-first
   - Dynamic content: Network-first with cache fallback
   - Images: Cache with size limits

3. **Update Strategy:**
   - Notify users of updates
   - Don't force immediate reload
   - Allow "later" option for non-critical updates

4. **Icons:**
   - Provide multiple sizes (72px to 512px)
   - Include maskable variants for Android
   - Use SVG source for crisp rendering

### For Users

1. **Install the App:**
   - Better performance
   - Offline access
   - Native app experience

2. **Keep Updated:**
   - Install updates when prompted
   - Updates bring new features and fixes

3. **Manage Storage:**
   - Clear cache if experiencing issues
   - Be aware of storage limits on mobile

4. **Use Offline Wisely:**
   - Save work before going offline
   - AI features require internet
   - Projects sync when back online

## Security

### HTTPS Requirement:
- PWAs must be served over HTTPS
- Protects data in transit
- Required for service workers
- Exception: localhost for development

### Permissions:
- Notification permission is opt-in
- Location not used
- Camera/microphone not used
- Storage quota managed by browser

### Data Privacy:
- All data stored locally in browser
- Service worker can't access other sites
- Cache isolated per origin
- Clear cache removes all local data

## Performance Metrics

### Lighthouse PWA Score:
Target metrics for PWA:
- ✅ Fast and reliable (service worker)
- ✅ Installable (manifest)
- ✅ PWA optimized (meta tags, icons)
- ✅ Accessible (ARIA, contrast)

### Loading Performance:
- First load: ~2s (network dependent)
- Subsequent loads: <500ms (from cache)
- Offline load: <300ms (cache only)

### Cache Efficiency:
- Static cache: ~2-5 MB
- Dynamic cache: ~10-20 MB (varies with usage)
- Image cache: ~5-10 MB

## Future Enhancements

Planned PWA features:
- 🔮 Periodic background sync
- 🔮 Web Share API for projects
- 🔮 File System Access API for direct saves
- 🔮 Badging API for notification counts
- 🔮 Improved offline AI with local models
- 🔮 Background fetch for large exports
- 🔮 Contact picker integration
- 🔮 Clipboard API enhancements

## Resources

### Documentation:
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Tools:
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

### Testing:
- Chrome DevTools > Application tab
- Firefox DevTools > Application tab
- Safari Web Inspector > Storage tab

---

**Need Help?** Check the in-app documentation or open an issue on GitHub.
