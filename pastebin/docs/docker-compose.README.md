# Docker Compose Examples

This directory contains example Docker Compose configurations for different deployment scenarios.

## Files

- `docker-compose.yml` - Default full stack with auto-configured backend
- `docker-compose.backend-only.yml` - Backend service only
- `docker-compose.dev.yml` - Development setup with hot reload

## Usage

### Full Stack (Frontend + Backend)

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Backend Only

```bash
docker-compose -f docker-compose.backend-only.yml up -d
```

Access:
- Backend API: http://localhost:5000

Then run frontend locally:
```bash
npm run dev
```

Configure frontend manually in Settings to use `http://localhost:5000`.

### Development Mode

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This runs:
- Backend in Docker
- Frontend expects you to run `npm run dev` locally with env var set

## Environment Variables

All configurations support these environment variables:

### Backend
- `DB_PATH` - SQLite database path (default: `/data/snippets.db`)

### Frontend
- `VITE_FLASK_BACKEND_URL` - Flask backend URL (enables auto-configuration)

## Persistence

All configurations use a Docker volume `snippet-data` for persistent storage.

To backup:
```bash
docker run --rm -v codesnippet_snippet-data:/data -v $(pwd):/backup alpine tar czf /backup/snippets-backup.tar.gz /data
```

To restore:
```bash
docker run --rm -v codesnippet_snippet-data:/data -v $(pwd):/backup alpine tar xzf /backup/snippets-backup.tar.gz -C /
```
