# CodeSnippet Backend

Flask-based REST API for managing code snippets with SQLite database.

## Quick Start

### Option 1: Docker (Recommended)

```bash
# From project root
docker-compose up -d
```

The backend will be available at `http://localhost:5000`

### Option 2: Local Python

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Server runs on `http://localhost:5000` by default.

## Configuration

Set the `DB_PATH` environment variable to change the database location:

```bash
export DB_PATH=/path/to/snippets.db
python app.py
```

Default: `/data/snippets.db`

## API Endpoints

### Health Check
- `GET /health` - Returns server health status

### Snippets
- `GET /api/snippets` - Get all snippets
- `GET /api/snippets/:id` - Get a specific snippet
- `POST /api/snippets` - Create a new snippet
- `PUT /api/snippets/:id` - Update a snippet
- `DELETE /api/snippets/:id` - Delete a snippet

### Request/Response Format

#### Snippet Object
```json
{
  "id": "unique-id",
  "title": "Snippet Title",
  "code": "const example = 'code';",
  "language": "javascript",
  "description": "Optional description",
  "tags": ["array", "of", "tags"],
  "category": "general",
  "componentName": "ComponentName",
  "previewParams": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Frontend Integration

### Automatic Configuration (Recommended)

The frontend can be automatically configured to use the Flask backend via environment variable:

**For Docker Compose (full stack):**
```bash
docker-compose up -d
```

The frontend will automatically connect to the backend at `http://backend:5000`.

**For local development:**
```bash
# .env file in project root
VITE_FLASK_BACKEND_URL=http://localhost:5000
```

When `VITE_FLASK_BACKEND_URL` is set:
- Frontend automatically uses Flask backend
- Manual backend selection in Settings is disabled
- Perfect for production deployments

### Manual Configuration

In the CodeSnippet app:
1. Navigate to Settings page
2. Select "Flask Backend (Remote Server)"
3. Enter backend URL (e.g., `http://localhost:5000`)
4. Click "Test" to verify connection
5. Click "Save Storage Settings"
6. Optionally migrate existing IndexedDB data to Flask

See [BACKEND-CONFIG.md](../BACKEND-CONFIG.md) for detailed configuration guide.

## Docker Details

### Building the Image

```bash
docker build -t codesnippet-backend ./backend
```

### Running the Container

```bash
# With volume for persistent data
docker run -p 5000:5000 -v $(pwd)/data:/app/data codesnippet-backend

# With custom database path and CORS
docker run -p 5000:5000 \
  -e DATABASE_PATH=/app/data/custom.db \
  -e CORS_ALLOWED_ORIGINS=https://frontend.example.com \
  -v $(pwd)/data:/app/data \
  codesnippet-backend
```

### Using Docker Compose

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild after changes
docker-compose up -d --build
```

## Development

The backend uses:
- **Flask 3.0** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **SQLite3** - Database (built into Python)

### Database Schema

```sql
CREATE TABLE snippets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    category TEXT,
    componentName TEXT,
    previewParams TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
)
```

## Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DATABASE_PATH` | Path to SQLite database file | `/app/data/snippets.db` | `/app/data/snippets.db` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins | `*` (all origins) | `https://frontend.example.com` |

### Production Configuration

For production deployments, always set specific CORS origins:

```bash
# Single origin
export CORS_ALLOWED_ORIGINS=https://frontend.example.com

# Multiple origins
export CORS_ALLOWED_ORIGINS=https://frontend.example.com,https://app.example.com
```

**Important:** Using `*` for CORS in production is a security risk. Only use in development.

## Troubleshooting

### Connection Refused
- Ensure the Flask server is running
- Check firewall settings
- Verify the port (5000) is not in use

### CORS Errors
- The backend allows all origins by default in development (`CORS_ALLOWED_ORIGINS=*`)
- For production, set specific origins: `CORS_ALLOWED_ORIGINS=https://frontend.example.com`
- See [CORS-GUIDE.md](../CORS-GUIDE.md) for detailed CORS configuration and testing
- Verify frontend URL matches exactly (including https:// and no trailing slash)

### Database Locked
- Ensure only one instance of the backend is running
- Check file permissions on the database file

## Production Deployment

For deploying to production with separate frontend and backend domains:

1. **See [DEPLOYMENT.md](../DEPLOYMENT.md)** - Complete CapRover/Cloudflare deployment guide
2. **See [CORS-GUIDE.md](../CORS-GUIDE.md)** - CORS configuration and testing
3. **See [DEPLOYMENT-CHECKLIST.md](../DEPLOYMENT-CHECKLIST.md)** - Quick deployment checklist

### Quick Production Setup

```bash
# Build and deploy backend to CapRover
cd backend
caprover deploy -a codesnippet-backend

# Set environment variables in CapRover dashboard:
# - CORS_ALLOWED_ORIGINS=https://frontend.example.com
# - DATABASE_PATH=/app/data/snippets.db

# Enable persistent storage at /app/data
# Enable HTTPS and connect custom domain
```
