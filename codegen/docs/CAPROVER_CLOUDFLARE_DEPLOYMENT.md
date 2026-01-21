# CapRover & Cloudflare CORS Configuration Guide

This guide covers deploying CodeForge with separate frontend and backend domains, properly configured for CORS.

## Architecture

```
Frontend: https://frontend.example.com (nginx serving React SPA)
Backend:  https://backend.example.com  (Flask API)
```

## Frontend Configuration

### 1. Nginx CORS Setup

The `nginx.conf` has been configured with proper CORS headers:

- **Access-Control-Allow-Origin**: Allows all origins (can be restricted)
- **Access-Control-Allow-Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Access-Control-Allow-Headers**: All necessary headers including Authorization
- **Preflight Handling**: OPTIONS requests are handled with 204 response

### 2. CapRover Frontend Setup

Create a new app in CapRover for the frontend:

```bash
# App Settings
App Name: codeforge-frontend
Deployment Method: Docker Image Registry or Git
Port: 80
```

#### Environment Variables (Optional)
```env
# If you need to configure backend URL at build time
VITE_BACKEND_URL=https://backend.example.com
```

#### Captain Definition File
Create `captain-definition` in project root:
```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
```

### 3. Cloudflare Settings for Frontend

1. **SSL/TLS Mode**: Full (strict) or Full
2. **Always Use HTTPS**: Enabled
3. **Minimum TLS Version**: TLS 1.2
4. **Automatic HTTPS Rewrites**: Enabled

#### Security Headers (Optional but Recommended)
Go to Cloudflare Dashboard → Security → Settings → Security Headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
```

**Note**: Don't add CORS headers in Cloudflare if nginx is already handling them.

## Backend Configuration

### 1. Flask CORS Setup

The backend has been configured with `flask-cors`:

```python
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
CORS(app, 
     resources={r"/api/*": {
         "origins": ALLOWED_ORIGINS,
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
         "expose_headers": ["Content-Type", "X-Total-Count"],
         "supports_credentials": True,
         "max_age": 3600
     }})
```

### 2. CapRover Backend Setup

Create a new app in CapRover for the backend:

```bash
# App Settings
App Name: codeforge-backend
Deployment Method: Docker Image Registry or Git
Port: 5001 (or as configured)
```

#### Environment Variables
```env
# Required
ALLOWED_ORIGINS=https://frontend.example.com,https://www.frontend.example.com

# Optional
PORT=5001
DATABASE_PATH=/data/codeforge.db
DEBUG=false
```

#### Persistent Data Volume
Enable persistent storage for SQLite database:
```
Container Path: /data
Host Path: /captain/data/codeforge-backend
```

#### Captain Definition File for Backend
Create `backend/captain-definition`:
```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
```

### 3. Cloudflare Settings for Backend

1. **SSL/TLS Mode**: Full (strict) or Full
2. **Always Use HTTPS**: Enabled
3. **Minimum TLS Version**: TLS 1.2
4. **API Shield** (if available): Enable for API endpoints

## Frontend Code Configuration

### Environment-based Backend URL

Create `.env.production`:
```env
VITE_BACKEND_URL=https://backend.example.com
VITE_USE_BACKEND=true
```

### Runtime Configuration

The app auto-detects backend availability. Update your storage configuration:

```typescript
// src/lib/storage-config.ts
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
                    window.RUNTIME_CONFIG?.backendUrl || 
                    'http://localhost:5001'

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true' ||
                    window.RUNTIME_CONFIG?.useBackend === true
```

## Testing CORS Configuration

### 1. Test Frontend CORS

```bash
curl -X OPTIONS https://frontend.example.com \
  -H "Origin: https://other-domain.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Expected response should include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### 2. Test Backend CORS

```bash
curl -X OPTIONS https://backend.example.com/api/storage/keys \
  -H "Origin: https://frontend.example.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Expected response should include:
```
Access-Control-Allow-Origin: https://frontend.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Credentials: true
```

### 3. Test Cross-Origin Request

```bash
curl -X GET https://backend.example.com/api/storage/keys \
  -H "Origin: https://frontend.example.com" \
  -v
```

## Common Issues & Solutions

### Issue 1: CORS Error in Browser Console

**Error**: `No 'Access-Control-Allow-Origin' header is present`

**Solutions**:
1. Verify `ALLOWED_ORIGINS` environment variable is set correctly on backend
2. Check nginx config is properly loaded (restart CapRover app)
3. Ensure Cloudflare is not stripping CORS headers

### Issue 2: Preflight Request Failing

**Error**: `Response to preflight request doesn't pass access control check`

**Solutions**:
1. Verify OPTIONS method is allowed in both nginx and Flask
2. Check that preflight response includes all required headers
3. Increase `max_age` if requests are frequent

### Issue 3: Credentials Not Sent

**Error**: Cookies/credentials not sent with request

**Solutions**:
1. Enable `credentials: 'include'` in fetch requests
2. Set `supports_credentials: True` in Flask CORS config
3. Don't use wildcard `*` for origin when credentials are needed

### Issue 4: Cloudflare Blocking Requests

**Error**: `CF-RAY` header present with 403/520 errors

**Solutions**:
1. Whitelist your backend domain in Cloudflare Firewall
2. Disable "Browser Integrity Check" temporarily for testing
3. Check Cloudflare Security Level (set to "Low" for API endpoints)

## Security Best Practices

### 1. Restrict Origins in Production

Instead of `*`, specify exact origins:

```env
# Backend .env
ALLOWED_ORIGINS=https://frontend.example.com,https://www.frontend.example.com
```

### 2. Use HTTPS Only

Ensure all requests use HTTPS. Update nginx to redirect HTTP to HTTPS:

```nginx
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}
```

### 3. Implement Rate Limiting

Add rate limiting to backend:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per hour", "50 per minute"]
)

@app.route('/api/storage/<key>', methods=['GET'])
@limiter.limit("100 per minute")
def get_value(key):
    # ...
```

### 4. Add API Authentication

For production, add token-based authentication:

```python
from functools import wraps
from flask import request

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('Authorization')
        if not api_key or not verify_api_key(api_key):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/storage/<key>', methods=['PUT'])
@require_api_key
def set_value(key):
    # ...
```

## CapRover Deployment Steps

### Deploy Frontend

1. Ensure Docker image builds successfully locally
2. Push code to Git repository or Docker registry
3. In CapRover:
   - Create new app: `codeforge-frontend`
   - Enable HTTPS
   - Connect custom domain: `frontend.example.com`
   - Deploy from Git/Registry
   - Verify deployment via browser

### Deploy Backend

1. Build and test backend Docker image
2. In CapRover:
   - Create new app: `codeforge-backend`
   - Enable HTTPS
   - Connect custom domain: `backend.example.com`
   - Add environment variables (especially `ALLOWED_ORIGINS`)
   - Add persistent volume at `/data`
   - Deploy from Git/Registry
   - Verify health endpoint: `https://backend.example.com/health`

### Configure Cloudflare

1. Add DNS records for both domains (point to CapRover server)
2. Enable Cloudflare proxy (orange cloud)
3. Configure SSL/TLS settings
4. Test both domains

## Monitoring & Debugging

### Check Nginx Logs (Frontend)
```bash
# In CapRover app terminal
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Check Flask Logs (Backend)
```bash
# In CapRover app logs view or terminal
tail -f /var/log/app.log
```

### Browser DevTools
1. Open Network tab
2. Enable "Preserve log"
3. Filter by domain to see cross-origin requests
4. Check Response headers for CORS headers
5. Look for preflight (OPTIONS) requests

## Example Fetch Configuration

### Frontend API Client

```typescript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies if needed
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }
  
  return response.json()
}

// Usage
const data = await apiRequest('/api/storage/keys')
```

## Additional Resources

- [CapRover Documentation](https://caprover.com/docs/)
- [Cloudflare SSL/TLS Documentation](https://developers.cloudflare.com/ssl/)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Nginx CORS Configuration](https://enable-cors.org/server_nginx.html)
