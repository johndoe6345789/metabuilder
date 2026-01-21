# Quick Start Guide

## Choose Your Setup

### 🚀 Full Stack with Docker (Easiest)

Everything runs in Docker with automatic backend configuration.

```bash
docker-compose up -d
```

✅ Frontend: http://localhost:3000  
✅ Backend: http://localhost:5000  
✅ Auto-configured to use Flask backend

---

### 💻 Local Development

Backend in Docker, frontend in development mode.

```bash
# Terminal 1: Start backend
docker-compose -f docker-compose.backend-only.yml up -d

# Terminal 2: Configure and start frontend
echo "VITE_FLASK_BACKEND_URL=http://localhost:5000" > .env
npm install
npm run dev
```

✅ Frontend: http://localhost:5173 (Vite dev server)  
✅ Backend: http://localhost:5000  
✅ Auto-configured to use Flask backend

---

### 🌐 Frontend Only (Local Storage)

No backend required - uses browser IndexedDB.

```bash
npm install
npm run dev
```

✅ Frontend: http://localhost:5173  
✅ Data stored locally in browser  
✅ No server needed

---

### ⚙️ Backend Only

Run backend separately, configure frontend manually.

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Then in a separate terminal:
```bash
npm install
npm run dev
```

✅ Backend: http://localhost:5000  
✅ Frontend: http://localhost:5173  
⚠️ Must configure backend URL in Settings page

---

## Key Features by Setup

| Feature | Full Stack Docker | Local Dev | Frontend Only | Backend Only |
|---------|------------------|-----------|---------------|--------------|
| Auto-configured backend | ✅ | ✅ | ❌ | ❌ |
| Hot reload | ❌ | ✅ | ✅ | ✅ |
| Multi-device sync | ✅ | ✅ | ❌ | ✅* |
| No dependencies | ❌ | ❌ | ✅ | ❌ |
| Production-ready | ✅ | ❌ | ❌ | ⚠️ |

*Requires manual configuration

---

## Environment Variables

### `VITE_FLASK_BACKEND_URL`

**What it does:**  
Automatically configures the app to use a Flask backend instead of IndexedDB.

**When set:**
- App connects to Flask backend on startup
- Settings page backend selection is disabled
- Overrides any manual configuration

**Examples:**

Local backend:
```bash
VITE_FLASK_BACKEND_URL=http://localhost:5000
```

Docker internal:
```bash
VITE_FLASK_BACKEND_URL=http://backend:5000
```

Remote backend:
```bash
VITE_FLASK_BACKEND_URL=https://api.example.com
```

**Setup methods:**

`.env` file:
```bash
echo "VITE_FLASK_BACKEND_URL=http://localhost:5000" > .env
```

Docker Compose:
```yaml
services:
  frontend:
    environment:
      - VITE_FLASK_BACKEND_URL=http://backend:5000
```

Docker build:
```bash
docker build --build-arg VITE_FLASK_BACKEND_URL=http://api.example.com .
```

---

## Common Commands

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build

# Start backend only
docker-compose -f docker-compose.backend-only.yml up -d
```

### NPM

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Backend (Python)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py

# Run with custom database path
DB_PATH=/custom/path/snippets.db python app.py
```

---

## Troubleshooting

### "Connection failed" in Settings

**Problem:** Can't connect to Flask backend

**Solutions:**
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check URL is correct (include `http://`)
3. Ensure no firewall is blocking port 5000
4. Check backend logs: `docker-compose logs backend`

### Environment variable not working

**Problem:** `VITE_FLASK_BACKEND_URL` not taking effect

**Solutions:**
1. Restart dev server after creating/modifying `.env`
2. Ensure file is named `.env` (not `.env.txt`)
3. Variable must start with `VITE_`
4. For production builds: rebuild with `npm run build`

### Settings page is read-only

**This is expected** when `VITE_FLASK_BACKEND_URL` is set.

**To enable manual configuration:**
1. Remove the variable from `.env`
2. Restart the application

### Port already in use

**Problem:** "Port 3000 (or 5000) is already in use"

**Solutions:**

Change frontend port:
```yaml
# docker-compose.yml
services:
  frontend:
    ports:
      - "8080:3000"  # Access at http://localhost:8080
```

Change backend port:
```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "8000:5000"  # Access at http://localhost:8000
    environment:
      - VITE_FLASK_BACKEND_URL=http://backend:5000  # Keep internal port same
```

Or stop the conflicting service:
```bash
# Find process using port
lsof -i :3000

# Kill process (replace PID)
kill -9 <PID>
```

---

## Next Steps

- 📖 [Full documentation](./README-APP.md)
- 🔧 [Backend configuration guide](./BACKEND-CONFIG.md)
- 🐳 [Docker examples](./docker-compose.README.md)
- 🚀 [Backend API docs](./backend/README.md)
