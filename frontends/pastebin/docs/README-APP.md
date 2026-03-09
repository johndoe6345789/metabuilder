# CodeSnippet - Code Snippet Manager

A powerful code snippet management application with an integrated component library showcase, organized using atomic design principles.

## Features

- 📝 **Snippet Management** - Create, edit, and organize code snippets with syntax highlighting
- 🔍 **Smart Search** - Real-time search across title, description, language, and code content
- 👁️ **Live Preview** - Split-screen editor with live React component preview
- 🗂️ **Component Library** - Showcase components organized by atomic design (Atoms, Molecules, Organisms, Templates)
- 💾 **Local Storage** - All data stored locally in your browser using SQLite (IndexedDB/localStorage)
- 📤 **Export/Import** - Backup and restore your entire snippet database
- 🎨 **Beautiful UI** - Modern dark theme with purple and cyan accents

## Data Storage

CodeSnippet offers flexible data storage with two backend options:

### Storage Backends

#### 1. **IndexedDB (Local Browser Storage)** - Default
- All data stored locally in your browser
- No server required
- Data persists on this device only
- Uses SQLite compiled to WebAssembly for full SQL capabilities
- Primary: IndexedDB for better performance and larger storage capacity (typically 50MB+)
- Fallback: localStorage when IndexedDB is unavailable (typically 5-10MB limit)

#### 2. **Flask Backend (Remote Server)** - Optional
- Snippets stored on a remote Flask server with SQLite database
- Access your snippets from any device
- Requires running the Flask backend (see Backend Setup below)
- Supports data migration between IndexedDB and Flask

### Switching Storage Backends

#### Manual Configuration

Visit the **Settings** page to:
- Choose between IndexedDB and Flask backend
- Configure Flask backend URL
- Test connection to Flask server
- Migrate data between storage backends
- View database statistics
- Export/import database backups

#### Automatic Configuration with Environment Variable

You can automatically configure the Flask backend using a Docker environment variable. When `VITE_FLASK_BACKEND_URL` is set, the app will:
- Automatically use the Flask backend instead of IndexedDB
- Override any manual configuration
- Disable manual backend selection in the Settings page

**Setup:**

1. Create a `.env` file in the project root:
```bash
VITE_FLASK_BACKEND_URL=http://localhost:5000
```

2. Or set it in your Docker environment:
```yaml
# docker-compose.yml
services:
  frontend:
    environment:
      - VITE_FLASK_BACKEND_URL=http://backend:5000
```

**Note:** When the environment variable is set, the storage backend configuration in Settings becomes read-only. To change backends, remove the environment variable and restart the application.

## Backend Setup

### Running Flask Backend Locally

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Server runs on `http://localhost:5000` by default.

### Running with Docker Compose (Full Stack)

The easiest way to run both frontend and backend with automatic Flask backend configuration:

```bash
# Start both frontend and backend
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the app at `http://localhost:3000`. The frontend is automatically configured to use the Flask backend at `http://backend:5000`.

### Running Backend Only with Docker

Build and run:
```bash
docker build -t codesnippet-backend ./backend
docker run -p 5000:5000 -v $(pwd)/data:/data codesnippet-backend
```

Then configure the frontend manually in Settings to use `http://localhost:5000`.

### Environment Variable Configuration

When deploying, you can set the `VITE_FLASK_BACKEND_URL` environment variable to automatically configure the Flask backend:

**For Docker Compose:**
```yaml
services:
  frontend:
    environment:
      - VITE_FLASK_BACKEND_URL=http://backend:5000
```

**For Local Development (.env file):**
```bash
VITE_FLASK_BACKEND_URL=http://localhost:5000
```

When this variable is set:
- The app automatically uses Flask backend instead of IndexedDB
- Manual backend configuration in Settings is disabled
- Perfect for production deployments where backend is always available

### Backend API

The Flask backend provides a REST API:
- `GET /health` - Health check
- `GET /api/snippets` - Get all snippets
- `GET /api/snippets/:id` - Get a specific snippet
- `POST /api/snippets` - Create a new snippet
- `PUT /api/snippets/:id` - Update a snippet
- `DELETE /api/snippets/:id` - Delete a snippet

See `backend/README.md` for more details.

## Getting Started

1. Click "New Snippet" to create your first code snippet
2. Enable "Split-screen preview" for React components to see live previews
3. Use the search bar to quickly find snippets
4. Visit the "Settings" page to manage your data
5. Check out the "Split-Screen Demo" to see the live preview in action

## Technology Stack

- React 19 + TypeScript
- SQL.js (SQLite in WebAssembly)
- Monaco Editor (VS Code editor)
- Framer Motion (animations)
- Shadcn UI (component library)
- Tailwind CSS (styling)
- React Router (navigation)

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
