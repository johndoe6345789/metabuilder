# Storage Backend Configuration

CodeForge supports two storage backends that can be configured at deployment time:

## Storage Options

### 1. IndexedDB (Default)
- **Type**: Client-side browser storage
- **Pros**: No server required, works offline, fast
- **Cons**: Data is stored in browser, not shared across devices
- **Use Case**: Development, single-user scenarios, offline work

### 2. Flask Backend with SQLite
- **Type**: Server-side persistent storage
- **Pros**: Data persists across browsers, shareable, more reliable
- **Cons**: Requires running backend server
- **Use Case**: Production deployments, multi-device access, team collaboration

## Configuration

### Environment Variables

The storage backend is configured using environment variables:

#### For Development (.env file)
```bash
# Use Flask backend instead of IndexedDB
VITE_USE_FLASK_BACKEND=true

# Flask backend URL
VITE_FLASK_BACKEND_URL=http://localhost:5001
```

#### For Docker Deployment
```yaml
services:
  frontend:
    environment:
      - USE_FLASK_BACKEND=true
      - FLASK_BACKEND_URL=http://backend:5001
```

## Usage

### Running with IndexedDB (Default)

No configuration needed. Just start the app:

```bash
npm run dev
```

All data will be stored in your browser's IndexedDB.

### Running with Flask Backend

#### Option 1: Using Docker Compose (Recommended)

```bash
# Start both frontend and backend
docker-compose up -d

# The frontend will automatically connect to the backend
# Data is stored in a Docker volume for persistence
```

#### Option 2: Manual Setup

1. Start the Flask backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

2. Configure the frontend:
```bash
# Create .env file
echo "VITE_USE_FLASK_BACKEND=true" > .env
echo "VITE_FLASK_BACKEND_URL=http://localhost:5001" >> .env

# Start the frontend
npm run dev
```

## Automatic Detection and Fallback

The storage adapter automatically:
1. Checks if Flask backend is configured (`USE_FLASK_BACKEND=true` or `VITE_USE_FLASK_BACKEND=true`)
2. If configured, tests backend availability by calling `/health` endpoint
3. Falls back to IndexedDB if backend is unavailable
4. Logs the selected backend to console

## Migration Between Backends

You can migrate data between backends using the Storage Management UI:

1. Navigate to **Settings → Storage Management**
2. View current backend type
3. Use migration tools to:
   - **Migrate to Flask**: Copies all IndexedDB data to Flask backend
   - **Migrate to IndexedDB**: Copies all Flask data to browser storage

### Migration Process

```typescript
import { storage } from '@/lib/storage'

// Migrate from IndexedDB to Flask
const count = await storage.migrateToFlask('http://localhost:5001')
console.log(`Migrated ${count} items`)

// Migrate from Flask to IndexedDB
const count = await storage.migrateToIndexedDB()
console.log(`Migrated ${count} items`)
```

## Storage API

The storage API is consistent regardless of backend:

```typescript
import { storage } from '@/lib/storage'

// Get backend type
const backend = storage.getBackendType() // 'flask' | 'indexeddb'

// Store data
await storage.set('my-key', { foo: 'bar' })

// Retrieve data
const data = await storage.get('my-key')

// Delete data
await storage.delete('my-key')

// List all keys
const keys = await storage.keys()

// Clear all data
await storage.clear()
```

## Flask Backend API

The Flask backend exposes a REST API for storage operations:

### Endpoints

- `GET /health` - Health check
- `GET /api/storage/keys` - List all keys
- `GET /api/storage/<key>` - Get value for key
- `PUT /api/storage/<key>` - Set value for key
- `DELETE /api/storage/<key>` - Delete key
- `POST /api/storage/clear` - Clear all data
- `GET /api/storage/export` - Export all data as JSON
- `POST /api/storage/import` - Import JSON data
- `GET /api/storage/stats` - Get storage statistics

### Example Requests

```bash
# Health check
curl http://localhost:5001/health

# Set a value
curl -X PUT http://localhost:5001/api/storage/my-key \
  -H "Content-Type: application/json" \
  -d '{"value": {"foo": "bar"}}'

# Get a value
curl http://localhost:5001/api/storage/my-key

# Get storage stats
curl http://localhost:5001/api/storage/stats
```

## Deployment Examples

### Docker Compose (Production)

```yaml
version: '3.8'

services:
  frontend:
    image: codeforge:latest
    environment:
      - USE_FLASK_BACKEND=true
      - FLASK_BACKEND_URL=http://backend:5001
    depends_on:
      - backend

  backend:
    image: codeforge-backend:latest
    volumes:
      - ./data:/data
    environment:
      - DATABASE_PATH=/data/codeforge.db
```

### Kubernetes

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: codeforge-config
data:
  USE_FLASK_BACKEND: "true"
  FLASK_BACKEND_URL: "http://codeforge-backend:5001"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: codeforge-frontend
spec:
  template:
    spec:
      containers:
      - name: frontend
        envFrom:
        - configMapRef:
            name: codeforge-config
```

### Standalone (IndexedDB Only)

```dockerfile
FROM codeforge:latest
# No environment variables needed
# IndexedDB is used by default
```

## Troubleshooting

### Backend Not Detected

If the Flask backend is configured but not being used:

1. Check backend is running: `curl http://localhost:5001/health`
2. Check browser console for connection errors
3. Verify `USE_FLASK_BACKEND` environment variable is set
4. Check CORS settings if frontend and backend are on different domains

### Migration Fails

If migration between backends fails:

1. Ensure both source and destination are accessible
2. Check browser console for detailed error messages
3. Try exporting data manually and importing to new backend
4. Check available storage space

### Data Loss Prevention

- Always backup data before migration
- Use the export API to create backups: `GET /api/storage/export`
- Keep both backends running during migration
- Test migration with sample data first

## Performance Considerations

### IndexedDB
- **Read**: ~1-5ms per operation
- **Write**: ~5-20ms per operation
- **Limit**: ~50MB-1GB (browser dependent)

### Flask Backend
- **Read**: ~10-50ms per operation (network latency)
- **Write**: ~20-100ms per operation (network + disk)
- **Limit**: Disk space limited only

## Security

### IndexedDB
- Data stored in browser, not encrypted
- Subject to browser security policies
- Cleared when browser data is cleared

### Flask Backend
- SQLite database file should be protected
- Use HTTPS in production
- Implement authentication if needed (not included by default)
- Consider encrypting sensitive data before storage

## Future Enhancements

Planned improvements:
- PostgreSQL/MySQL backend support
- Real-time sync between clients
- Encryption at rest
- Automatic backup scheduling
- Multi-tenancy support
