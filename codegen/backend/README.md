# CodeForge Flask Backend

A Flask-based storage backend for CodeForge that provides persistent storage using SQLite.

## Features

- RESTful API for key-value storage
- SQLite database for data persistence
- CORS enabled for frontend communication
- Data import/export functionality
- Health check endpoint
- Storage statistics

## API Endpoints

### Health Check
```
GET /health
```

### Storage Operations

#### Get all keys
```
GET /api/storage/keys
Response: { "keys": ["key1", "key2", ...] }
```

#### Get value by key
```
GET /api/storage/<key>
Response: { "value": {...} }
```

#### Set/Update value
```
PUT /api/storage/<key>
POST /api/storage/<key>
Body: { "value": {...} }
Response: { "success": true }
```

#### Delete value
```
DELETE /api/storage/<key>
Response: { "success": true }
```

#### Clear all data
```
POST /api/storage/clear
Response: { "success": true }
```

#### Export all data
```
GET /api/storage/export
Response: { "key1": value1, "key2": value2, ... }
```

#### Import data
```
POST /api/storage/import
Body: { "key1": value1, "key2": value2, ... }
Response: { "success": true, "imported": count }
```

#### Get storage statistics
```
GET /api/storage/stats
Response: {
  "total_keys": 42,
  "total_size_bytes": 123456,
  "database_path": "/data/codeforge.db"
}
```

## Environment Variables

- `PORT`: Server port (default: 5001)
- `DEBUG`: Enable debug mode (default: false)
- `DATABASE_PATH`: SQLite database file path (default: /data/codeforge.db)

## Running with Docker

### Build the image
```bash
docker build -t codeforge-backend ./backend
```

### Run the container
```bash
docker run -d \
  -p 5001:5001 \
  -v codeforge-data:/data \
  --name codeforge-backend \
  codeforge-backend
```

### With custom settings
```bash
docker run -d \
  -p 8080:8080 \
  -e PORT=8080 \
  -e DEBUG=true \
  -v $(pwd)/data:/data \
  --name codeforge-backend \
  codeforge-backend
```

## Running without Docker

### Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Development mode
```bash
python app.py
```

### Production mode with gunicorn
```bash
gunicorn --bind 0.0.0.0:5001 --workers 4 app:app
```

## Docker Compose

Add to your `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    volumes:
      - codeforge-data:/data
    environment:
      - PORT=5001
      - DEBUG=false
      - DATABASE_PATH=/data/codeforge.db
    restart: unless-stopped

volumes:
  codeforge-data:
```

Run with:
```bash
docker-compose up -d
```

## Data Persistence

The SQLite database is stored in `/data/codeforge.db` inside the container. Mount a volume to persist data:

```bash
# Named volume (recommended)
-v codeforge-data:/data

# Bind mount
-v $(pwd)/data:/data
```

## Security Considerations

- This backend is designed for local/internal use
- No authentication is implemented by default
- CORS is enabled for all origins
- For production use, consider adding:
  - Authentication/authorization
  - Rate limiting
  - HTTPS/TLS
  - Restricted CORS origins
  - Input validation/sanitization

## Troubleshooting

### Port already in use
Change the port mapping:
```bash
docker run -p 8080:5001 ...
```

### Permission denied on /data
Ensure the volume has proper permissions:
```bash
docker run --user $(id -u):$(id -g) ...
```

### Cannot connect from frontend
Check:
1. Backend is running: `curl http://localhost:5001/health`
2. CORS is enabled (it should be by default)
3. Frontend BACKEND_URL environment variable is set correctly
