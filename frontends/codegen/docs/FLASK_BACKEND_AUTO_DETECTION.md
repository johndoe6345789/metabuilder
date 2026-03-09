# Flask Backend Auto-Detection Implementation

## Summary

Implemented automatic detection and fallback between Flask backend (SQLite) and IndexedDB storage based on Docker environment variables. The system intelligently selects the appropriate storage backend at runtime without requiring code changes or rebuilds.

## Changes Made

### 1. Storage Adapter System (`src/lib/storage-adapter.ts`)

Created a new unified storage adapter with three implementations:

- **FlaskBackendAdapter**: HTTP client for Flask backend API
  - Health check with 3-second timeout
  - Full CRUD operations via REST API
  - Export/import capabilities
  - Statistics endpoint integration

- **IndexedDBAdapter**: Browser-side storage
  - Standard IndexedDB operations
  - Async/await interface
  - Object store management

- **AutoStorageAdapter**: Smart detection and routing
  - Checks environment variables (`USE_FLASK_BACKEND`, `VITE_USE_FLASK_BACKEND`)
  - Tests Flask backend availability via `/health` endpoint
  - Falls back to IndexedDB if Flask unavailable
  - Migration tools between backends

### 2. Updated Storage Library (`src/lib/storage.ts`)

Simplified the storage interface to use the new adapter:
- Removed complex dual-storage logic
- Clean async/await API
- Added `getBackendType()` to check current backend
- Migration methods for switching backends

### 3. Storage Management UI (`src/components/StorageSettings.tsx`)

Complete rewrite with:
- Backend type indicator (Flask vs IndexedDB)
- Storage statistics display
- Migration controls with URL input
- Clear backend-specific actions
- Real-time status updates

### 4. Docker Configuration

#### Environment Variables (`.env.example`)
```bash
VITE_USE_FLASK_BACKEND=false
VITE_FLASK_BACKEND_URL=http://localhost:5001
```

#### Docker Compose (`docker-compose.yml`)
```yaml
frontend:
  environment:
    - USE_FLASK_BACKEND=true
    - FLASK_BACKEND_URL=http://backend:5001
  depends_on:
    - backend
```

#### Entrypoint Script (`docker-entrypoint.sh`)
- Injects runtime environment variables into HTML
- Creates `runtime-config.js` with configuration
- No rebuild required for config changes

#### Updated HTML (`index.html`)
- Loads `runtime-config.js` before app initialization
- Environment variables available as `window.USE_FLASK_BACKEND` and `window.FLASK_BACKEND_URL`

### 5. Documentation

Created `docs/STORAGE_BACKEND.md` covering:
- Storage backend options and tradeoffs
- Configuration for development and production
- Docker deployment examples
- Migration procedures
- API reference
- Troubleshooting guide
- Performance considerations
- Security notes

Updated `README.md` with:
- Storage backend configuration section
- Quick start for both backends
- Migration information

## How It Works

### Automatic Detection Flow

1. **App Starts**
   ```
   StorageAdapter initializes
   ↓
   Check USE_FLASK_BACKEND environment variable
   ↓
   If true → Test Flask backend availability
   ↓
   Success → Use FlaskBackendAdapter (with IndexedDB fallback ready)
   ↓
   Failure → Use IndexedDBAdapter (with warning)
   ```

2. **Runtime Fallback** (NEW)
   ```
   Operation called (get/set/delete/keys/clear)
   ↓
   Try Flask backend operation
   ↓
   Success → Return result
   ↓
   Failure → Automatically retry with IndexedDB fallback
   ↓
   Log warning on first fallback (once per session)
   ↓
   Return result from IndexedDB
   ```

2. **Runtime Configuration**
   ```
   Docker container starts
   ↓
   docker-entrypoint.sh runs
   ↓
   Inject environment variables into runtime-config.js
   ↓
   HTML loads runtime-config.js
   ↓
   Variables available to StorageAdapter
   ```

3. **Storage Operations**
   ```
   App calls storage.get('key')
   ↓
   AutoStorageAdapter routes to active backend
   ↓
   Flask: HTTP request to /api/storage/key
   IndexedDB: IndexedDB transaction
   ↓
   Return data to app
   ```

### Environment Variable Priority

1. Docker runtime: `window.USE_FLASK_BACKEND` (set by entrypoint script)
2. Vite environment: `import.meta.env.VITE_USE_FLASK_BACKEND`
3. Default: `false` (use IndexedDB)

## Usage Examples

### Development with IndexedDB (Default)

```bash
npm run dev
```

No configuration needed. All data stored in browser.

### Development with Flask Backend

```bash
# Terminal 1: Start Flask backend
cd backend
python app.py

# Terminal 2: Configure and start frontend
echo "VITE_USE_FLASK_BACKEND=true" > .env
echo "VITE_FLASK_BACKEND_URL=http://localhost:5001" >> .env
npm run dev
```

### Production with Docker

```bash
# Start both services
docker-compose up -d

# Environment variables in docker-compose.yml:
# USE_FLASK_BACKEND=true
# FLASK_BACKEND_URL=http://backend:5001
```

### Migration Between Backends

```typescript
import { storage } from '@/lib/storage'

// Check current backend
const backend = storage.getBackendType() // 'flask' or 'indexeddb'

// Migrate IndexedDB → Flask
const count = await storage.migrateToFlask('http://localhost:5001')
console.log(`Migrated ${count} items`)
// Page reloads to use Flask backend

// Migrate Flask → IndexedDB
const count = await storage.migrateToIndexedDB()
console.log(`Migrated ${count} items`)
// Page reloads to use IndexedDB
```

## Flask Backend API

All endpoints work consistently regardless of storage backend:

```bash
# Health check
GET /health

# Storage operations
GET    /api/storage/keys         # List all keys
GET    /api/storage/<key>        # Get value
PUT    /api/storage/<key>        # Set value
DELETE /api/storage/<key>        # Delete key
POST   /api/storage/clear        # Clear all
GET    /api/storage/export       # Export JSON
POST   /api/storage/import       # Import JSON
GET    /api/storage/stats        # Statistics
```

## Benefits

### For Development
- **No server required**: Default IndexedDB works out of the box
- **Fast iteration**: Browser storage with instant updates
- **Offline capable**: Work without internet connection
- **Easy debugging**: Chrome DevTools IndexedDB inspector

### For Production
- **Persistent storage**: Data survives browser clears
- **Multi-device**: Access data from any browser
- **Backup ready**: SQLite file can be backed up
- **Scalable**: Easy to migrate to PostgreSQL later

### For Deployment
- **Zero configuration**: Works with or without backend
- **Flexible**: Change backend without rebuilding image
- **Graceful fallback**: If backend fails, uses IndexedDB
- **Docker-friendly**: Environment variables configure everything

## Testing

The implementation includes:

1. **Automatic fallback testing**: If Flask backend unavailable, falls back to IndexedDB with console warning
2. **Health check**: 3-second timeout prevents hanging
3. **Migration validation**: Confirms data integrity during migration
4. **Backend detection**: Logs selected backend to console for debugging

## Future Enhancements

Potential improvements identified:

1. **PostgreSQL/MySQL support**: Add database adapters
2. **Real-time sync**: WebSocket for live updates
3. **Authentication**: Add user auth to Flask backend
4. **Encryption**: Encrypt sensitive data at rest
5. **Caching**: Add Redis layer for performance
6. **Multi-tenancy**: Support multiple users/teams

## Breaking Changes

None. The implementation is fully backward compatible:
- Existing IndexedDB data continues to work
- No API changes required
- Optional feature that can be ignored

## Files Modified

- `src/lib/storage-adapter.ts` (NEW)
- `src/lib/storage.ts` (UPDATED)
- `src/components/StorageSettings.tsx` (UPDATED)
- `index.html` (UPDATED)
- `docker-compose.yml` (UPDATED)
- `.env.example` (NEW)
- `docker-entrypoint.sh` (NEW)
- `docs/STORAGE_BACKEND.md` (NEW)
- `README.md` (UPDATED)

## Success Criteria

✅ Auto-detects Flask backend via environment variable  
✅ Falls back to IndexedDB if backend unavailable  
✅ Works without any configuration (IndexedDB default)  
✅ Docker environment variables configure backend  
✅ Migration tools switch between backends  
✅ No code changes or rebuilds required  
✅ Full backward compatibility maintained  
✅ Comprehensive documentation provided  

## Conclusion

The implementation successfully provides flexible storage backend selection with intelligent auto-detection and graceful fallback. Users can now deploy CodeForge with or without a backend server, and switch between storage backends at any time through environment variables or the UI.
