# Backend Configuration Guide

This guide explains how to configure CodeSnippet to use different storage backends.

## Storage Options

CodeSnippet supports two storage backends:

### 1. IndexedDB (Default)
- **Local browser storage** using SQLite compiled to WebAssembly
- No server required
- Data persists only on the current device/browser
- Best for personal use or offline scenarios

### 2. Flask Backend
- **Remote server storage** with a Flask REST API
- Requires running a Flask backend server
- Data accessible from any device
- Best for team use or multi-device access

## Configuration Methods

### Method 1: Automatic Configuration (Environment Variable)

The simplest way to configure Flask backend is using the `VITE_FLASK_BACKEND_URL` environment variable.

**When to use:**
- Production deployments
- Docker/containerized environments
- When you want to enforce backend usage

**How it works:**
- App automatically connects to Flask backend on startup
- Manual backend selection is disabled in Settings UI
- Overrides any saved user preferences

**Setup:**

Create `.env` file in project root:
```bash
VITE_FLASK_BACKEND_URL=http://localhost:5000
```

Or set in Docker:
```yaml
# docker-compose.yml
services:
  frontend:
    environment:
      - VITE_FLASK_BACKEND_URL=http://backend:5000
```

Or for Docker build:
```bash
docker build --build-arg VITE_FLASK_BACKEND_URL=http://api.example.com .
```

### Method 2: Manual Configuration (Settings Page)

Users can manually switch backends in the Settings page.

**When to use:**
- Development/testing
- User preference scenarios
- When Flask backend is optional

**How it works:**
- Navigate to Settings → Storage Backend
- Select "Flask Backend (Remote Server)"
- Enter Flask backend URL
- Test connection
- Save settings

**Note:** Manual configuration is automatically disabled when `VITE_FLASK_BACKEND_URL` is set.

## Backend Deployment Scenarios

### Scenario 1: Full Docker Stack (Recommended for Production)

Both frontend and backend in Docker with automatic configuration:

```bash
docker-compose up -d
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5000`

The frontend automatically connects to backend via internal Docker network.

### Scenario 2: Local Development

Backend in Docker, frontend in dev mode:

```bash
# Terminal 1: Start backend
docker-compose up backend

# Terminal 2: Start frontend with env var
echo "VITE_FLASK_BACKEND_URL=http://localhost:5000" > .env
npm run dev
```

### Scenario 3: Backend Only

Run backend separately, users configure manually:

```bash
cd backend
python app.py
```

Users go to Settings and configure `http://localhost:5000` manually.

### Scenario 4: Remote Backend

Point frontend to a remote Flask API:

```bash
# .env
VITE_FLASK_BACKEND_URL=https://api.example.com
```

Or configure manually in Settings with the remote URL.

## Data Migration

### From IndexedDB to Flask

1. Ensure Flask backend is running
2. Go to Settings → Storage Backend
3. Select "Flask Backend"
4. Enter backend URL and test connection
5. Click "Migrate IndexedDB Data to Flask"
6. Save storage settings

### From Flask to IndexedDB

1. Ensure you have Flask backend URL configured
2. Go to Settings → Storage Backend
3. Click "Migrate Flask Data to IndexedDB"
4. Select "IndexedDB (Local Browser Storage)"
5. Save storage settings

**Note:** Migration copies data, it doesn't move it. Original data remains in the source.

## Environment Variable Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_FLASK_BACKEND_URL` | Flask backend URL. When set, forces Flask backend usage. | (none) | `http://localhost:5000` or `https://backend.example.com` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins for CORS. | `*` | `https://frontend.example.com` |
| `DATABASE_PATH` | Path to SQLite database file in backend. | `/app/data/snippets.db` | `/app/data/snippets.db` |

## Troubleshooting

### "Connection failed" error

**Causes:**
- Backend server not running
- Incorrect URL
- CORS issues
- Network/firewall blocking

**Solutions:**
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check URL spelling and port number
3. Review backend logs for errors
4. Ensure CORS is enabled in Flask app (see CORS-GUIDE.md)
5. For production deployments, see DEPLOYMENT.md

### Environment variable not working

**Causes:**
- File named incorrectly (must be `.env`)
- Variable not prefixed with `VITE_`
- Server not restarted after change

**Solutions:**
1. Ensure file is named `.env` (not `.env.local` or `.env.txt`)
2. Restart dev server: `npm run dev`
3. For production builds: rebuild with `npm run build`
4. Verify with: `console.log(import.meta.env.VITE_FLASK_BACKEND_URL)`

### Settings page is read-only

This is expected when `VITE_FLASK_BACKEND_URL` is set. To enable manual configuration:
1. Remove the environment variable from `.env`
2. Restart the application
3. Settings will become editable

### Data not syncing between devices

Ensure:
1. All devices are configured to use the same Flask backend URL
2. Backend server is accessible from all devices (not localhost if remote)
3. Backend has persistent storage (volume mounted in Docker)

## Security Considerations

### Production Deployment

1. **Use HTTPS:** Always use `https://` URLs in production
2. **Authentication:** Consider adding authentication to Flask backend
3. **CORS:** Configure CORS to allow only your frontend domain
4. **Network:** Run backend in private network, not exposed to internet

### Example secure configuration:

```python
# backend/app.py
from flask_cors import CORS

CORS(app, origins=['https://your-frontend-domain.com'])
```

```bash
# .env (production)
VITE_FLASK_BACKEND_URL=https://api.your-domain.com
```

## Best Practices

1. **Development:** Use IndexedDB or local Flask backend
2. **Staging:** Use Flask backend with test data
3. **Production:** Use Flask backend with environment variable
4. **Backup:** Regularly export database from Settings page
5. **Migration:** Test data migration with small dataset first

## Architecture Diagram

```
┌─────────────────────────────────────┐
│         React Frontend              │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Storage Config Layer       │  │
│  │  (checks env var first)      │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│      ┌──────┴──────┐               │
│      │             │               │
│  ┌───▼───┐    ┌───▼───────┐       │
│  │ IDB   │    │  Flask    │       │
│  │Adapter│    │  Adapter  │       │
│  └───────┘    └─────┬─────┘       │
└────────────────────┼───────────────┘
                     │
                     │ HTTP
                     │
              ┌──────▼──────┐
              │   Flask     │
              │   Backend   │
              │   + SQLite  │
              └─────────────┘
```

## Additional Resources

- [Flask Backend README](./backend/README.md)
- [Backend API Documentation](./backend/README.md#api-endpoints)
- [Docker Compose Configuration](./docker-compose.yml)
- [Example .env file](./.env.example)
- [CORS Configuration Guide](./CORS-GUIDE.md)
- [Production Deployment Guide](./DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)
