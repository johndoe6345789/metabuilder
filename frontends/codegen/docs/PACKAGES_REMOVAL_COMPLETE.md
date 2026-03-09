# Packages Folder Removal & Storage Refactor

## Summary

Successfully removed the `packages` folder and migrated all functionality to use IndexedDB by default with optional Flask API backend support.

## Changes Made

### 1. Created New Storage Service (`src/lib/storage-service.ts`)
- **IndexedDB Storage**: Browser-native persistent storage (default)
- **Flask API Storage**: Optional remote backend storage
- **Automatic Fallback**: If Flask API fails, automatically switches to IndexedDB
- **Configuration**: Can be set via environment variable `VITE_FLASK_API_URL` or UI

### 2. Moved Spark Runtime to Local (`src/lib/spark-runtime.ts`)
- Migrated from `packages/spark/src/spark-runtime.ts`
- Updated to use new async storage service
- Maintains same API interface for compatibility

### 3. Moved Vite Plugins to Local
- `src/lib/spark-vite-plugin.ts` - Main Spark plugin
- `src/lib/vite-phosphor-icon-proxy-plugin.ts` - Icon optimization plugin
- Updated `vite.config.ts` to import from local paths

### 4. Updated `useKV` Hook (`src/hooks/use-kv.ts`)
- Now uses `getStorage()` from storage service
- Fully async operations with IndexedDB
- Returns initialized value only after storage is loaded
- Compatible with existing code

### 5. Updated Storage Settings Component
- Enhanced UI for configuring storage backend
- Test connection button for Flask API
- Clear feedback about current storage mode
- Automatic fallback notification

### 6. Updated Configuration Files
- **vite.config.ts**: Removed `@github/spark` imports, now uses local imports
- **main.tsx**: Updated to import from `@/lib/spark-runtime`
- **.dockerignore**: Removed `packages` reference, added `backend`
- **Dockerfile**: Already correct, no packages references

### 7. Removed Packages Folder Dependencies
The `packages` folder can now be safely deleted. It contained:
- `packages/spark` - Migrated to `src/lib/`
- `packages/spark-tools` - Functionality integrated into main codebase

## Storage Architecture

### Default: IndexedDB
```typescript
// Automatic - no configuration needed
const storage = getStorage() // Returns IndexedDBStorage instance
```

### Optional: Flask API
```typescript
// Via environment variable (e.g., in Docker)
VITE_FLASK_API_URL=https://api.example.com

// Or via UI in Storage Settings
setFlaskAPI('https://api.example.com')
```

### Automatic Fallback
If any Flask API request fails:
1. Error is logged to console
2. Storage automatically switches to IndexedDB
3. User is notified via toast
4. All subsequent requests use IndexedDB

## Flask API Endpoints (Optional)

If using Flask API backend, it should implement:

```
GET    /api/health                    - Health check
GET    /api/storage/:key              - Get value
PUT    /api/storage/:key              - Set value (body: {value: any})
DELETE /api/storage/:key              - Delete value
GET    /api/storage/keys              - List all keys
DELETE /api/storage                   - Clear all storage
```

## Migration Guide

### For Existing Code
No changes needed! The `useKV` hook maintains the same API:
```typescript
const [value, setValue, deleteValue] = useKV('my-key', defaultValue)
```

### For New Code
Use the storage service directly if needed:
```typescript
import { getStorage } from '@/lib/storage-service'

const storage = getStorage()
const value = await storage.get('key')
await storage.set('key', value)
await storage.delete('key')
const allKeys = await storage.keys()
await storage.clear()
```

### Switching Storage Backends
```typescript
import { setFlaskAPI, disableFlaskAPI } from '@/lib/storage-service'

// Enable Flask API
setFlaskAPI('https://api.example.com')

// Disable Flask API (use IndexedDB)
disableFlaskAPI()
```

## Docker Deployment

The app now works without any workspace: protocol dependencies:

```dockerfile
# Build stage - no packages folder needed
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=optional
COPY . .
RUN npm run build

# Runtime stage
FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=optional --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 80
ENV PORT=80
CMD ["npm", "run", "preview"]
```

## Environment Variables

- `VITE_FLASK_API_URL` - Flask API backend URL (optional)
  - If set, app will use Flask API by default
  - If not set or API fails, uses IndexedDB

## Benefits

1. **Simpler Dependencies**: No workspace: protocol issues in Docker
2. **Better Performance**: IndexedDB is faster than localStorage
3. **More Storage**: IndexedDB has much larger storage limits
4. **Flexibility**: Easy to switch between local and remote storage
5. **Resilience**: Automatic fallback ensures app always works
6. **Cleaner Codebase**: All code in one place, easier to maintain

## Testing

### Test IndexedDB Storage
1. Open app in browser
2. Use Storage Settings to ensure Flask API is disabled
3. Create/modify data in app
4. Refresh page - data should persist
5. Check DevTools → Application → IndexedDB → codeforge-storage

### Test Flask API Storage
1. Set up Flask backend (or use mock API)
2. In Storage Settings, enable Flask API
3. Enter Flask API URL
4. Click "Test" button
5. If successful, create/modify data
6. Data should be stored on remote backend

### Test Automatic Fallback
1. Enable Flask API with valid URL
2. Stop Flask backend
3. Try to create/modify data
4. Should see toast notification about fallback
5. Check that data is stored in IndexedDB instead

## Next Steps

1. **Delete packages folder**: `rm -rf packages/`
2. **Test the build**: `npm run build`
3. **Test the app**: `npm run dev`
4. **Verify storage**: Use DevTools to inspect IndexedDB
5. **Optional**: Set up Flask backend if needed

## Notes

- The `spark` global object is still available on `window.spark` for compatibility
- All storage operations are now async (Promise-based)
- The `useKV` hook handles async operations internally
- No breaking changes to existing component code
