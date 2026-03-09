# CodeSnippet - Code Snippet Manager

A powerful code snippet management application with flexible storage backends and an integrated component library showcase.

## 🚀 Quick Start

Choose the setup that works best for you:

### Option 1: Full Stack with Docker (Recommended)
```bash
docker-compose up -d
```
Access at: http://localhost:3000 (auto-configured with Flask backend)

### Option 2: Local Development
```bash
# Start backend
docker-compose -f docker-compose.backend-only.yml up -d

# Configure frontend
echo "VITE_FLASK_BACKEND_URL=http://localhost:5000" > .env

# Start frontend
npm install
npm run dev
```
Access at: http://localhost:5173

### Option 3: Frontend Only (No Backend)
```bash
npm install
npm run dev
```
Access at: http://localhost:5173 (uses local IndexedDB storage)

📖 **[See detailed setup instructions →](./QUICKSTART.md)**

## 🔑 Key Features

- 📝 **Snippet Management** - Create, edit, and organize code snippets with syntax highlighting
- 🔍 **Smart Search** - Real-time search across title, description, language, and code
- 👁️ **Live Preview** - Split-screen editor with live React component preview
- 💾 **Flexible Storage** - Choose between local IndexedDB or Flask backend
- 🔄 **Auto-Configuration** - Automatically use Flask backend via environment variable
- 🗂️ **Component Library** - Showcase organized by atomic design principles
- 📤 **Export/Import** - Backup and restore your entire database
- 🎨 **Beautiful UI** - Modern dark theme with purple and cyan accents

## 🎯 Storage Backends

CodeSnippet supports two storage backends:

### IndexedDB (Default)
- Local browser storage
- No server required
- Perfect for personal use

### Flask Backend (Optional)
- Remote server storage
- Multi-device sync
- Requires Flask backend

**🔧 Auto-Configuration:**  
Set `VITE_FLASK_BACKEND_URL` environment variable to automatically use Flask backend:

```bash
# .env file
VITE_FLASK_BACKEND_URL=http://localhost:5000
```

When set, the app automatically connects to Flask backend and disables manual configuration.

📖 **[Complete backend configuration guide →](./BACKEND-CONFIG.md)**

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running quickly
- **[Application Guide](./README-APP.md)** - Features and usage

### Backend & Storage
- **[Backend Configuration](./BACKEND-CONFIG.md)** - Detailed backend setup and environment variables
- **[Backend API](./backend/README.md)** - Flask API documentation

### Production Deployment
- **[CI/CD Workflows](./docs/CI-CD.md)** - GitHub Actions workflows for GHCR and GitHub Pages
- **[Deployment Guide](./DEPLOYMENT.md)** - Complete CapRover/Cloudflare deployment walkthrough
- **[CORS Configuration](./CORS-GUIDE.md)** - CORS setup and troubleshooting
- **[Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)** - Quick deployment reference
- **[Docker Examples](./docker-compose.README.md)** - Docker deployment options

## 🛠️ Technology Stack

- React 19 + TypeScript
- SQL.js (SQLite in WebAssembly)
- Flask (Python backend)
- Monaco Editor (VS Code editor)
- Framer Motion (animations)
- Shadcn UI (component library)
- Tailwind CSS (styling)

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
