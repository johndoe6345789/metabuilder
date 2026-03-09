# Backend - Flask API

Python Flask backend for Docker container management.

## Features

- RESTful API for container management
- Docker SDK integration
- Session-based authentication
- CORS enabled for frontend access

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment (optional):
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Run the server:
```bash
python app.py
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout current session

### Containers
- `GET /api/containers` - List all containers (requires auth)
- `POST /api/containers/<id>/exec` - Execute command in container (requires auth)

### Health
- `GET /api/health` - Health check

## Docker

Build the Docker image:
```bash
docker build -t docker-swarm-backend .
```

Run the container:
```bash
docker run -p 5000:5000 -v /var/run/docker.sock:/var/run/docker.sock docker-swarm-backend
```

## Security

⚠️ This backend requires access to the Docker socket. Ensure proper security measures are in place in production environments.
