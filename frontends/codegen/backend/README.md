# CodeForge Backend

A C++/Drogon storage backend for CodeForge, backed by PostgreSQL.

## Features

- RESTful API for key-value storage
- PostgreSQL for data persistence
- CORS enabled for frontend communication
- Data import/export functionality
- Health check endpoint
- Storage statistics
- One-time migration from a legacy SQLite database, if present

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
  "database": "postgres"
}
```

## Environment Variables

- `PORT`: Server port (default: 5001)
- `DATABASE_URL`: Postgres connection string (default: `host=codegen-db port=5432 dbname=codegen user=codegen password=codegen`)
- `MIGRATIONS_DIR`: SQL migrations directory (default: `/app/migrations`)
- `SQLITE_MIGRATION_PATH`: Path to a legacy SQLite database to one-time-migrate from, if present (default: `/data/codeforge.db`)
- `ALLOWED_ORIGINS`: CORS allowed origins (default: `*`)

## Building

Requires Conan 2 + CMake + Ninja (or Make).

```bash
cd backend
conan install . --output-folder=build --build=missing -s build_type=Release
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

### Running tests

```bash
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake -DBUILD_TESTING=ON
cmake --build build --target codegen-backend-tests
./build/codegen-backend-tests
```

## Running with Docker

This service is built and run as part of the monorepo's `deployment/metabuilder/compose.yml` stack (services `codegen-backend` + `codegen-db`):

```bash
docker compose -f deployment/metabuilder/compose.yml up -d codegen-backend codegen-db
```

## Data Persistence

Data lives in the `codegen-db` PostgreSQL service (see `codegen-db-data` volume in compose.yml). The `SQLITE_MIGRATION_PATH` volume (`codegen-backend-data`) only matters for a one-time migration from a legacy SQLite deployment, if one exists.

## Security Considerations

- No authentication is implemented on this API by default
- CORS is enabled for all origins
- For production use, consider adding:
  - Authentication/authorization
  - Rate limiting
  - HTTPS/TLS
  - Restricted CORS origins
  - Input validation/sanitization

## Troubleshooting

### Cannot connect from frontend
Check:
1. Backend is running and healthy: `curl http://localhost:5001/health`
2. CORS is enabled (it should be by default)
3. The `codegen` frontend's `FLASK_BACKEND_URL` build arg points at `http://codegen-backend:5001`
