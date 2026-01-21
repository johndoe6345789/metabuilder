# Storage Backend Default: IndexedDB

## Summary

The storage system has been updated to **default to IndexedDB** instead of Flask backend. Flask backend is now opt-in only, requiring explicit configuration through UI settings or environment variables.

## Changes Made

### 1. **Updated Storage Initialization Logic** (`src/lib/unified-storage.ts`)

**Previous Behavior:**
- Checked for Flask backend preference first
- If `codeforge-prefer-flask` was set in localStorage, attempted Flask connection
- Fell back to IndexedDB only if Flask failed

**New Behavior:**
- **IndexedDB is now the default** - initialized first unless Flask is explicitly configured
- Flask backend is only used when:
  - `VITE_FLASK_BACKEND_URL` environment variable is set, OR
  - User explicitly enables Flask backend in UI settings
- Priority order:
  1. **Flask** (only if explicitly configured)
  2. **IndexedDB** (default)
  3. **SQLite** (if preferred)
  4. **Spark KV** (fallback)

### 2. **Environment Variable Support**

The Flask backend URL can be configured via environment variable:

```bash
# .env file
VITE_FLASK_BACKEND_URL=http://localhost:5001
```

Or for production:
```bash
VITE_FLASK_BACKEND_URL=https://backend.example.com
```

### 3. **Updated UI Components** (`src/components/StorageSettingsPanel.tsx`)

Added Flask backend switching functionality:
- Input field for Flask backend URL
- Button to switch to Flask backend
- Clear indication that IndexedDB is the default
- Improved descriptions explaining when to use each backend

### 4. **Updated Documentation** (`STORAGE.md`)

- Reorganized backend priority to show IndexedDB first as default
- Added clear "Default" label for IndexedDB
- Documented Flask backend configuration methods
- Clarified that Flask requires explicit configuration

## Usage

### Default Behavior (No Configuration)

By default, the app will use **IndexedDB** automatically:

```typescript
import { unifiedStorage } from '@/lib/unified-storage'

// Uses IndexedDB by default
await unifiedStorage.set('my-key', myData)
const data = await unifiedStorage.get('my-key')
```

Console output:
```
[Storage] Initializing default IndexedDB backend...
[Storage] ✓ Using IndexedDB (default)
```

### Enabling Flask Backend

#### Method 1: Environment Variable (Recommended for Production)

Create a `.env` file:
```bash
VITE_FLASK_BACKEND_URL=http://localhost:5001
```

Or set in Docker/Caprover:
```bash
docker run -e VITE_FLASK_BACKEND_URL=https://backend.example.com myapp
```

#### Method 2: UI Settings (User Preference)

1. Navigate to **Settings → Storage**
2. Enter Flask backend URL in the input field
3. Click **"Flask Backend"** button
4. System will migrate all data from IndexedDB to Flask

### Switching Back to IndexedDB

In UI Settings:
1. Navigate to **Settings → Storage**
2. Click **"IndexedDB (Default)"** button
3. System will migrate all data back to IndexedDB

## Benefits of IndexedDB Default

1. **No Setup Required** - Works immediately without backend server
2. **Offline First** - Full functionality without network connection
3. **Fast Performance** - Local storage is faster than network requests
4. **Privacy** - Data stays on user's device by default
5. **Simpler Deployment** - No backend infrastructure needed for basic usage

## When to Use Flask Backend

Enable Flask backend when you need:
- **Cross-device synchronization** - Share data across multiple devices
- **Centralized data management** - Admin access to all user data
- **Server-side processing** - Complex queries, analytics, backups
- **Team collaboration** - Multiple users sharing the same data
- **Production deployments** - Centralized data storage for SaaS applications

## Migration Path

The system automatically migrates data when switching backends:

```typescript
// Switch from IndexedDB to Flask
await switchToFlask('http://localhost:5001')

// Switch from Flask back to IndexedDB  
await switchToIndexedDB()
```

All existing data is preserved during migration.

## Backwards Compatibility

Existing projects with Flask backend configured will continue to use Flask backend:
- If `codeforge-prefer-flask` is set in localStorage
- If `VITE_FLASK_BACKEND_URL` is configured
- Data will not be lost or modified

## Testing

To verify the default behavior:

1. **Clear localStorage** (to remove any preferences):
   ```javascript
   localStorage.clear()
   ```

2. **Reload the app**

3. **Check console output**:
   ```
   [Storage] Initializing default IndexedDB backend...
   [Storage] ✓ Using IndexedDB (default)
   ```

4. **Open DevTools → Application → IndexedDB**
   - Should see `CodeForgeDB` database
   - Should see `keyvalue` object store

## Files Changed

1. `src/lib/unified-storage.ts` - Updated initialization logic
2. `src/components/StorageSettingsPanel.tsx` - Added Flask backend UI
3. `STORAGE.md` - Updated documentation
4. `.env.example` - Already documented VITE_FLASK_BACKEND_URL

## Related Documentation

- [STORAGE.md](./STORAGE.md) - Complete storage system documentation
- [FLASK_BACKEND_SETUP.md](./FLASK_BACKEND_SETUP.md) - Flask backend installation guide
- [.env.example](./.env.example) - Environment variable configuration
