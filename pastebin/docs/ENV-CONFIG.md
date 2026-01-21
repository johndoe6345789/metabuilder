# Environment Configuration Examples

This directory contains example environment configurations for different deployment scenarios.

## Quick Reference

Copy the appropriate example to `.env` in the project root:

```bash
cp .env.example .env
# Edit .env with your values
```

## Scenarios

### 1. Local Development (Default)

**Use case:** Developing frontend only with local browser storage

```bash
# No backend URL - uses IndexedDB
VITE_FLASK_BACKEND_URL=
```

### 2. Local Development with Backend

**Use case:** Developing with local Flask backend

```bash
# Frontend (.env)
VITE_FLASK_BACKEND_URL=http://localhost:5000

# Backend (environment or .env)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
DATABASE_PATH=/app/data/snippets.db
```

### 3. Docker Compose (Full Stack)

**Use case:** Running both frontend and backend with Docker

```bash
# Frontend automatically connects to backend via nginx proxy
# No .env needed - configured in docker-compose.yml
```

**docker-compose.yml already includes:**
```yaml
environment:
  - VITE_FLASK_BACKEND_URL=http://localhost:5000
  - CORS_ALLOWED_ORIGINS=http://localhost:3000
  - DATABASE_PATH=/app/data/snippets.db
```

### 4. Production - Separate Domains (CapRover)

**Use case:** Frontend and backend on different domains

```bash
# Frontend environment variables (in CapRover)
VITE_FLASK_BACKEND_URL=https://backend.example.com

# Backend environment variables (in CapRover)
CORS_ALLOWED_ORIGINS=https://frontend.example.com
DATABASE_PATH=/app/data/snippets.db
```

### 5. Production - Multiple Frontend Domains

**Use case:** Multiple frontend deployments (prod, staging, dev)

```bash
# Backend environment variables
CORS_ALLOWED_ORIGINS=https://app.example.com,https://staging.example.com,https://dev.example.com
DATABASE_PATH=/app/data/snippets.db

# Frontend 1 (Production)
VITE_FLASK_BACKEND_URL=https://api.example.com

# Frontend 2 (Staging)
VITE_FLASK_BACKEND_URL=https://api.example.com

# Frontend 3 (Development)
VITE_FLASK_BACKEND_URL=https://api.example.com
```

### 6. Production - Single Domain (Proxied)

**Use case:** Frontend and backend on same domain, nginx proxy

```bash
# Frontend environment variables
VITE_FLASK_BACKEND_URL=/api

# Backend environment variables
CORS_ALLOWED_ORIGINS=*
# Note: CORS not needed since nginx proxies requests (same-origin)
DATABASE_PATH=/app/data/snippets.db
```

**nginx.conf includes:**
```nginx
location /api {
    proxy_pass http://backend:5000;
}
```

## Environment Variables Reference

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FLASK_BACKEND_URL` | Backend API URL. When set, forces Flask backend usage. | `https://backend.example.com` |

**Notes:**
- Must start with `VITE_` to be exposed to frontend
- If not set, app uses IndexedDB (local storage)
- Can be relative (`/api`) if using nginx proxy
- Requires rebuild for production: `npm run build`

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `https://frontend.example.com` |
| `DATABASE_PATH` | Path to SQLite database file | `/app/data/snippets.db` |

**Notes:**
- Use `*` only in development
- In production, always specify exact origins
- No trailing slashes on URLs
- Must match frontend URL exactly (including https://)

## Setting Environment Variables

### Local Development (.env file)

```bash
# Create .env file
cat > .env << EOF
VITE_FLASK_BACKEND_URL=http://localhost:5000
EOF

# Start dev server
npm run dev
```

### Docker Build

```bash
# Build with environment variable
docker build --build-arg VITE_FLASK_BACKEND_URL=https://backend.example.com -t frontend .
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  frontend:
    environment:
      - VITE_FLASK_BACKEND_URL=https://backend.example.com
```

### CapRover

1. Go to CapRover dashboard
2. Select your app
3. Click "App Configs" tab
4. Add environment variables in "Environment Variables" section
5. Redeploy app

### Kubernetes

```yaml
# deployment.yaml
env:
  - name: VITE_FLASK_BACKEND_URL
    value: "https://backend.example.com"
  - name: CORS_ALLOWED_ORIGINS
    value: "https://frontend.example.com"
```

## Testing Configuration

### Test Frontend Backend Connection

```bash
# Check if environment variable is set
echo $VITE_FLASK_BACKEND_URL

# Check in browser console
console.log(import.meta.env.VITE_FLASK_BACKEND_URL)
```

### Test Backend CORS

```bash
# Quick test
curl -H "Origin: https://frontend.example.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://backend.example.com/api/snippets

# Full test suite
./test-cors.sh https://backend.example.com https://frontend.example.com
```

## Common Mistakes

### ❌ Wrong: Missing VITE_ Prefix

```bash
FLASK_BACKEND_URL=http://localhost:5000  # Won't work!
```

### ✅ Correct: VITE_ Prefix Required

```bash
VITE_FLASK_BACKEND_URL=http://localhost:5000
```

---

### ❌ Wrong: Trailing Slash in CORS

```bash
CORS_ALLOWED_ORIGINS=https://frontend.example.com/  # Won't work!
```

### ✅ Correct: No Trailing Slash

```bash
CORS_ALLOWED_ORIGINS=https://frontend.example.com
```

---

### ❌ Wrong: HTTP/HTTPS Mismatch

```bash
# Frontend
VITE_FLASK_BACKEND_URL=https://backend.example.com

# Backend
CORS_ALLOWED_ORIGINS=http://frontend.example.com  # Wrong protocol!
```

### ✅ Correct: Matching Protocols

```bash
# Frontend
VITE_FLASK_BACKEND_URL=https://backend.example.com

# Backend
CORS_ALLOWED_ORIGINS=https://frontend.example.com
```

---

### ❌ Wrong: Using * in Production

```bash
CORS_ALLOWED_ORIGINS=*  # Security risk in production!
```

### ✅ Correct: Specific Origins

```bash
CORS_ALLOWED_ORIGINS=https://frontend.example.com
```

## Troubleshooting

### Environment variable not working

1. **Frontend not rebuilding:**
   - Vite requires rebuild for env vars: `npm run build`
   - Dev server: Restart `npm run dev`

2. **Variable not prefixed correctly:**
   - Must start with `VITE_` for frontend
   - Backend vars don't need prefix

3. **Docker not picking up changes:**
   - Rebuild: `docker-compose up -d --build`
   - Check: `docker-compose config`

### CORS errors persist

1. **Backend not restarted:**
   - Restart after env changes
   - Check logs: `docker-compose logs backend`

2. **URL mismatch:**
   - Frontend URL must match CORS_ALLOWED_ORIGINS exactly
   - Check browser console for actual origin

3. **Cloudflare issues:**
   - Verify proxy status (orange cloud)
   - Check SSL/TLS mode: "Full (strict)"

## Security Best Practices

### Development
- ✅ Use `*` for CORS_ALLOWED_ORIGINS
- ✅ Use http:// for local URLs
- ✅ Keep .env out of version control

### Staging
- ✅ Use specific origins for CORS
- ✅ Use https:// for all URLs
- ✅ Test with production-like configuration

### Production
- ✅ Always use specific origins
- ✅ Always use https://
- ✅ Store secrets in secure environment
- ✅ Never commit .env files
- ✅ Rotate credentials regularly
- ✅ Monitor access logs

## Additional Resources

- [Backend Configuration Guide](./BACKEND-CONFIG.md)
- [CORS Configuration & Testing](./CORS-GUIDE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)
