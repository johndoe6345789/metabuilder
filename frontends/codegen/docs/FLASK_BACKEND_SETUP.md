# Flask Backend Integration - Quick Start

This guide explains how to use the Flask backend for persistent storage with CodeForge.

## Overview

CodeForge now supports multiple storage backends:
- **IndexedDB** (default) - Browser storage, works offline
- **Flask Backend** (optional) - Server storage, persistent across devices
- **SQLite** (optional) - Browser storage with SQL support
- **Spark KV** (fallback) - Cloud storage

## Setup Flask Backend

### Option 1: Docker (Recommended)

1. **Start the backend with Docker Compose:**
   ```bash
   docker-compose up -d backend
   ```

2. **Verify it's running:**
   ```bash
   curl http://localhost:5001/health
   ```

3. **Configure in the UI:**
   - Open CodeForge settings
   - Find "Storage Backend" section
   - Enter backend URL: `http://localhost:5001`
   - Click "Use Flask"

### Option 2: Run Locally

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   python app.py
   ```
   
   Or with gunicorn:
   ```bash
   gunicorn --bind 0.0.0.0:5001 --workers 4 app:app
   ```

3. **Configure in the UI** (same as Docker option)

### Option 3: Docker Only Backend

```bash
cd backend
docker build -t codeforge-backend .
docker run -d -p 5001:5001 -v codeforge-data:/data --name codeforge-backend codeforge-backend
```

## Using the Backend

### In the UI

1. **Open Settings** (or wherever StorageSettings component is added)
2. **Find "Storage Backend" section**
3. **Enter Flask URL:** `http://localhost:5001` (or your server URL)
4. **Click "Use Flask"**
5. All data will be migrated automatically

### Programmatically

```typescript
import { unifiedStorage } from '@/lib/unified-storage'

// Switch to Flask backend
await unifiedStorage.switchToFlask('http://localhost:5001')

// Check current backend
const backend = await unifiedStorage.getBackend()
console.log(backend) // 'flask'

// Use storage as normal
await unifiedStorage.set('my-key', { foo: 'bar' })
const value = await unifiedStorage.get('my-key')
```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5001
DEBUG=false
DATABASE_PATH=/data/codeforge.db
```

### Custom Port

```bash
# Docker
docker run -e PORT=8080 -p 8080:8080 ...

# Python
PORT=8080 python app.py
```

### Data Persistence

Data is stored in SQLite at `/data/codeforge.db`. Make sure to mount a volume:

```bash
docker run -v $(pwd)/data:/data ...
```

## Production Deployment

### Docker Compose (Full Stack)

```bash
# Start both frontend and backend
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

### Separate Deployment

1. **Deploy backend:**
   ```bash
   docker-compose up -d backend
   ```

2. **Deploy frontend with backend URL:**
   ```bash
   docker build -t codeforge-frontend .
   docker run -d -p 80:80 \
     -e VITE_BACKEND_URL=https://api.yourdomain.com \
     codeforge-frontend
   ```

3. **Configure CORS** if frontend and backend are on different domains

## Switching Backends

### From IndexedDB to Flask

1. Click "Use Flask" in settings
2. Enter backend URL
3. All data migrates automatically

### From Flask to IndexedDB

1. Click "Use IndexedDB" in settings
2. All data downloads to browser
3. Can work offline

### Export/Import

Always available regardless of backend:

```typescript
// Export backup
const data = await unifiedStorage.exportData()
const json = JSON.stringify(data, null, 2)
// Save to file

// Import backup
await unifiedStorage.importData(parsedData)
```

## Troubleshooting

### Backend not connecting

1. **Check backend is running:**
   ```bash
   curl http://localhost:5001/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Check CORS:** Backend has CORS enabled by default

3. **Check URL:** Make sure URL in settings matches backend

4. **Check network:** Browser console will show connection errors

### Data not persisting

1. **Check volume mount:**
   ```bash
   docker inspect codeforge-backend | grep Mounts -A 10
   ```

2. **Check permissions:**
   ```bash
   ls -la ./data
   ```

3. **Check database:**
   ```bash
   sqlite3 ./data/codeforge.db ".tables"
   ```

### Port conflicts

```bash
# Use different port
docker run -p 8080:5001 ...

# Update URL in settings to match
http://localhost:8080
```

## Security Considerations

⚠️ **The default Flask backend has no authentication!**

For production:
1. Add authentication (JWT, API keys, etc.)
2. Use HTTPS/TLS
3. Restrict CORS origins
4. Add rate limiting
5. Use environment-specific configs

## API Endpoints

The Flask backend exposes these endpoints:

- `GET /health` - Health check
- `GET /api/storage/keys` - List all keys
- `GET /api/storage/<key>` - Get value
- `PUT /api/storage/<key>` - Set/update value
- `DELETE /api/storage/<key>` - Delete value
- `POST /api/storage/clear` - Clear all data
- `GET /api/storage/export` - Export all data
- `POST /api/storage/import` - Import data
- `GET /api/storage/stats` - Get statistics

See `backend/README.md` for detailed API documentation.

## Benefits of Flask Backend

✅ **Persistent across devices** - Access data from any device
✅ **Team collaboration** - Share data with team members
✅ **Backup/restore** - Centralized backup location
✅ **No size limits** - Limited only by server disk space
✅ **SQL queries** - Server-side SQLite for complex queries
✅ **Scalable** - Add more storage as needed

## Comparison

| Feature | IndexedDB | Flask Backend | SQLite | Spark KV |
|---------|-----------|---------------|--------|----------|
| Offline | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| Cross-device | ❌ No | ✅ Yes | ❌ No | ✅ Yes |
| Size limit | ~50MB+ | Unlimited | ~5MB | Unlimited |
| Speed | Fast | Moderate | Fast | Moderate |
| Setup | None | Docker/Server | npm install | Spark only |
| SQL queries | ❌ No | ✅ Yes | ✅ Yes | ❌ No |

## Next Steps

1. **Add to settings page:**
   ```typescript
   import { StorageSettings } from '@/components/molecules'
   
   function SettingsPage() {
     return <StorageSettings />
   }
   ```

2. **Customize backend** - Modify `backend/app.py` as needed

3. **Add authentication** - Secure your backend for production

4. **Deploy to cloud** - Use AWS, Azure, DigitalOcean, etc.

5. **Monitor usage** - Use `/api/storage/stats` endpoint

## Support

- Full documentation: `STORAGE.md`
- Backend docs: `backend/README.md`
- Issues: Open a GitHub issue
