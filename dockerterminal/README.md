# Docker Swarm Container Terminal WebUI

A modern, secure web interface for managing Docker containers with interactive terminal access.

## Features

- 🔐 **Secure Authentication** - Username/password authentication to protect container access
- 📦 **Container Management** - View all active containers with real-time status updates
- 💻 **Interactive Terminal** - Execute commands directly in running containers
- 🎨 **Modern UI** - Built with Material UI and Next.js for a polished experience
- 🐳 **Docker Native** - Direct integration with Docker API
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **Material UI (MUI)** - Modern component library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Backend
- **Flask** - Python web framework
- **Docker SDK** - Python Docker integration
- **Flask-CORS** - Cross-origin resource sharing

### Deployment
- **Docker** - Containerized deployment
- **Docker Compose** - Multi-container orchestration
- **GHCR** - GitHub Container Registry for images

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/johndoe6345789/docker-swarm-termina.git
cd docker-swarm-termina
```

2. Start the application:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

4. Login with default credentials:
- Username: `admin`
- Password: `admin123`

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file (optional):
```bash
cp .env.example .env
# Edit .env to set custom credentials
```

4. Run the Flask application:
```bash
python app.py
```

The backend will be available at http://localhost:5000

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
# Edit if backend is running on a different URL
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Configuration

### Backend Environment Variables

- `ADMIN_USERNAME` - Admin username (default: `admin`)
- `ADMIN_PASSWORD` - Admin password (default: `admin123`)
- `FLASK_ENV` - Flask environment (default: `development`)

### Frontend Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:5000`)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Logout user

### Containers
- `GET /api/containers` - List all containers
- `POST /api/containers/<id>/exec` - Execute command in container

### Health
- `GET /api/health` - Health check endpoint

## Docker Images

Images are automatically built and pushed to GitHub Container Registry on every push to main:

- Backend: `ghcr.io/johndoe6345789/docker-swarm-termina-backend`
- Frontend: `ghcr.io/johndoe6345789/docker-swarm-termina-frontend`

## Security Considerations

⚠️ **Important Security Notes:**

1. **Change Default Credentials** - Always change the default admin credentials in production
2. **Docker Socket Access** - The backend requires access to Docker socket (`/var/run/docker.sock`)
3. **Network Security** - Use proper firewall rules and network isolation
4. **HTTPS** - Use HTTPS in production (reverse proxy recommended)
5. **Session Management** - Current implementation uses simple token-based auth; consider implementing JWT or OAuth for production

## Development

### Project Structure

```
.
├── backend/                 # Flask backend
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend Docker image
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/                # Utility functions and API client
│   └── Dockerfile          # Frontend Docker image
├── docker-compose.yml      # Docker Compose configuration
└── .github/
    └── workflows/
        └── docker-publish.yml  # GHCR publishing workflow
```

### Building for Production

#### Build Docker Images
```bash
docker-compose build
```

#### Push to GHCR
Images are automatically pushed when code is merged to main. To manually push:

```bash
docker tag docker-swarm-termina-backend ghcr.io/johndoe6345789/docker-swarm-termina-backend:latest
docker tag docker-swarm-termina-frontend ghcr.io/johndoe6345789/docker-swarm-termina-frontend:latest
docker push ghcr.io/johndoe6345789/docker-swarm-termina-backend:latest
docker push ghcr.io/johndoe6345789/docker-swarm-termina-frontend:latest
```

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or contributions, please open an issue on GitHub.
