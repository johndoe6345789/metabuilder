# Backend - C++/Drogon API

C++ (Drogon) backend for Docker container management.

## Features

- RESTful API for container management, backed directly by the Docker
  Engine API over its Unix socket (no Docker SDK dependency)
- Admin-only access: verifies the caller's DBAL OIDC bearer token via
  `/oidc/userinfo` and requires an `admin`/`god`/`supergod` role
- CORS enabled for frontend access

## Setup

1. Install dependencies and build:
```bash
conan install . --build=missing -s build_type=Release -s compiler.cppstd=20 -of build/conan
cmake -B build/out -G Ninja -DCMAKE_TOOLCHAIN_FILE=build/conan/conan_toolchain.cmake
cmake --build build/out
```

2. Configure environment (optional):
- `PORT` - listen port (default `5000`)
- `DBAL_ENDPOINT` - base URL of the DBAL OIDC provider (default `http://localhost:8080`)

3. Run the server:
```bash
./build/out/dockerterminal-server
```

The server will start on http://localhost:5000

## API Endpoints

### Containers
- `GET /api/containers` - List all containers (requires admin bearer token)
- `POST /api/containers/<id>/exec` - Run a one-shot command in a container (requires admin bearer token)

### Health
- `GET /api/health` - Health check

## Docker

Build the Docker image:
```bash
docker build -f Dockerfile -t dockerterminal-backend ..
```

Run the container:
```bash
docker run -p 5000:5000 -v /var/run/docker.sock:/var/run/docker.sock dockerterminal-backend
```

## Security

⚠️ This backend requires access to the Docker socket, which grants full
host access via container exec. Every request is verified against DBAL and
requires an admin-tier role -- do not weaken that check.
