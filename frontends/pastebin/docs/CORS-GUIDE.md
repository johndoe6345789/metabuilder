# CORS Configuration & Testing Guide

This guide covers Cross-Origin Resource Sharing (CORS) configuration for CodeSnippet when deployed with separate frontend and backend domains.

## Understanding CORS

CORS is a security feature that controls which domains can make requests to your backend API. When your frontend (`https://frontend.example.com`) makes requests to your backend (`https://backend.example.com`), the browser enforces CORS policies.

## Backend CORS Configuration

### Environment Variable: `CORS_ALLOWED_ORIGINS`

The backend Flask application uses the `CORS_ALLOWED_ORIGINS` environment variable to control which origins can access the API.

#### Development (Allow All Origins)

```bash
CORS_ALLOWED_ORIGINS=*
```

**Warning:** Only use `*` in development. This allows ANY website to access your backend API.

#### Production (Specific Origins)

```bash
# Single origin
CORS_ALLOWED_ORIGINS=https://frontend.example.com

# Multiple origins (comma-separated)
CORS_ALLOWED_ORIGINS=https://frontend.example.com,https://app.example.com,https://staging.example.com
```

**Important:** Do NOT include trailing slashes in URLs.

### How It Works

The Flask backend (`backend/app.py`) reads this environment variable and configures CORS accordingly:

```python
ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '*')
if ALLOWED_ORIGINS == '*':
    CORS(app, origins='*', ...)  # Development mode
else:
    origins_list = [origin.strip() for origin in ALLOWED_ORIGINS.split(',')]
    CORS(app, origins=origins_list, ...)  # Production mode
```

### CORS Headers Returned

When properly configured, the backend returns these headers:

```
Access-Control-Allow-Origin: https://frontend.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## Testing CORS Configuration

### Test 1: Health Check (No CORS)

Simple GET request to verify backend is running:

```bash
curl https://backend.example.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00"
}
```

### Test 2: Preflight Request (OPTIONS)

Browsers send an OPTIONS request before the actual request to check CORS permissions:

```bash
curl -X OPTIONS https://backend.example.com/api/snippets \
  -H "Origin: https://frontend.example.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Expected headers in response:
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: https://frontend.example.com
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization
```

### Test 3: Actual API Request with Origin

Test a real API request with Origin header:

```bash
curl https://backend.example.com/api/snippets \
  -H "Origin: https://frontend.example.com" \
  -v
```

Should return `Access-Control-Allow-Origin` header and snippet data.

### Test 4: Wrong Origin (Should Fail)

Test that unauthorized origins are blocked:

```bash
curl https://backend.example.com/api/snippets \
  -H "Origin: https://malicious-site.com" \
  -v
```

Expected: No `Access-Control-Allow-Origin` header (or browser would block).

### Test 5: Browser DevTools Test

1. Open frontend in browser: `https://frontend.example.com`
2. Open DevTools (F12) → Network tab
3. Create a new snippet or load snippets
4. Check the API request:
   - Should show status 200 OK
   - Response headers should include `Access-Control-Allow-Origin`
   - No CORS errors in Console

## Common CORS Errors & Solutions

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause:** Backend is not returning CORS headers

**Solutions:**
1. Verify `CORS_ALLOWED_ORIGINS` is set correctly in backend
2. Check backend logs for errors
3. Ensure Flask-CORS is installed: `pip install flask-cors`
4. Restart backend after environment variable changes

### Error: "CORS policy: Origin 'https://frontend.example.com' not allowed"

**Cause:** Frontend origin not in allowed list

**Solutions:**
1. Check `CORS_ALLOWED_ORIGINS` includes exact frontend URL
2. Ensure no trailing slash: `https://frontend.example.com` not `https://frontend.example.com/`
3. Verify HTTPS vs HTTP matches exactly
4. Check for typos in domain name

### Error: "CORS policy: Request header 'content-type' not allowed"

**Cause:** Backend not allowing required headers

**Solutions:**
1. Verify backend allows `Content-Type` header
2. Check Flask-CORS configuration in `app.py`
3. Ensure `allow_headers` includes `Content-Type`

### Error: Mixed Content (HTTP/HTTPS)

**Cause:** Frontend uses HTTPS but backend uses HTTP (or vice versa)

**Solutions:**
1. Ensure both frontend and backend use HTTPS in production
2. Update `VITE_FLASK_BACKEND_URL` to use `https://`
3. Enable HTTPS in CapRover for both apps
4. Verify Cloudflare SSL/TLS mode is "Full (strict)"

### Error: "CORS policy: Credential is not supported if origin is '*'"

**Cause:** Using `CORS_ALLOWED_ORIGINS=*` with `supports_credentials=True`

**Solutions:**
1. Set specific origins instead of `*`
2. Or disable credentials if not needed

## Deployment Scenarios

### Scenario 1: Separate Domains (Recommended for Production)

```
Frontend: https://frontend.example.com
Backend:  https://backend.example.com
```

**Frontend Config:**
```bash
VITE_FLASK_BACKEND_URL=https://backend.example.com
```

**Backend Config:**
```bash
CORS_ALLOWED_ORIGINS=https://frontend.example.com
```

**Pros:** Clean separation, independent scaling
**Cons:** Requires CORS configuration

### Scenario 2: Single Domain with Proxy

```
Frontend: https://app.example.com
Backend:  https://app.example.com/api (proxied)
```

**Frontend Config:**
```bash
VITE_FLASK_BACKEND_URL=/api
```

**Backend Config:**
```bash
CORS_ALLOWED_ORIGINS=*  # Not needed if proxied through nginx
```

**Nginx Config:** (already configured in `nginx.conf`)
```nginx
location /api {
    proxy_pass http://backend:5000;
}
```

**Pros:** No CORS issues (same-origin), simpler configuration
**Cons:** Tight coupling, single domain

### Scenario 3: Multiple Frontends

```
Frontend 1: https://app.example.com
Frontend 2: https://staging.example.com
Backend:    https://api.example.com
```

**Frontend Config (both):**
```bash
VITE_FLASK_BACKEND_URL=https://api.example.com
```

**Backend Config:**
```bash
CORS_ALLOWED_ORIGINS=https://app.example.com,https://staging.example.com
```

## Cloudflare-Specific Configuration

### Cloudflare SSL/TLS Mode

Set to **"Full (strict)"** to ensure end-to-end encryption:

1. Cloudflare Dashboard → SSL/TLS → Overview
2. Select "Full (strict)"
3. Ensures both Cloudflare-to-origin and client-to-Cloudflare use SSL

### Cloudflare Always Use HTTPS

1. SSL/TLS → Edge Certificates
2. Enable "Always Use HTTPS"
3. Automatically redirects HTTP to HTTPS

### Cloudflare Transform Rules (Optional)

Add security headers using Transform Rules:

```
Header: Strict-Transport-Security
Value: max-age=31536000; includeSubDomains

Header: X-Content-Type-Options
Value: nosniff

Header: X-Frame-Options
Value: DENY
```

## Automated CORS Testing Script

Save this as `test-cors.sh`:

```bash
#!/bin/bash

FRONTEND_URL="https://frontend.example.com"
BACKEND_URL="https://backend.example.com"

echo "Testing CORS Configuration..."
echo "================================"

echo -e "\n1. Testing Health Endpoint..."
curl -s "$BACKEND_URL/health" | jq .

echo -e "\n2. Testing OPTIONS Preflight..."
curl -X OPTIONS "$BACKEND_URL/api/snippets" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -i -s | grep -i "access-control"

echo -e "\n3. Testing GET with Origin..."
curl -s "$BACKEND_URL/api/snippets" \
  -H "Origin: $FRONTEND_URL" \
  -i | grep -i "access-control"

echo -e "\n4. Testing POST with Origin..."
curl -X POST "$BACKEND_URL/api/snippets" \
  -H "Origin: $FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -d '{"id":"test","title":"Test","code":"test","language":"JavaScript","createdAt":"2024-01-01T00:00:00","updatedAt":"2024-01-01T00:00:00"}' \
  -i -s | grep -i "access-control"

echo -e "\nCORS tests complete!"
```

Make it executable and run:
```bash
chmod +x test-cors.sh
./test-cors.sh
```

## Frontend Storage Config Helper

The frontend automatically handles backend configuration through the `getStorageConfig()` function:

### Automatic Configuration

If `VITE_FLASK_BACKEND_URL` is set, the app automatically uses Flask backend:

```typescript
// src/lib/storage.ts
function getDefaultConfig(): StorageConfig {
  const flaskUrl = import.meta.env.VITE_FLASK_BACKEND_URL
  
  if (flaskUrl) {
    return { backend: 'flask', flaskUrl: flaskUrl }
  }
  
  return { backend: 'indexeddb' }
}
```

### Manual Configuration

Users can also manually configure in Settings page (if no env var is set).

## Debugging Tips

### Enable Verbose Logging

Add logging to backend `app.py`:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

@app.after_request
def after_request(response):
    app.logger.debug(f"Response headers: {response.headers}")
    return response
```

### Browser DevTools

1. Open DevTools (F12)
2. Network tab → Enable "Preserve log"
3. Filter by "Fetch/XHR"
4. Look for OPTIONS and GET/POST requests
5. Check Response Headers for `Access-Control-Allow-Origin`
6. Check Console for CORS error messages

### CapRover Logs

View real-time backend logs:

```bash
# Via CapRover CLI
caprover logs codesnippet-backend --lines 100 --follow

# Via Dashboard
Apps → codesnippet-backend → Logs
```

## Security Best Practices

### Production CORS Checklist

- [ ] Set specific origins (not `*`)
- [ ] Use HTTPS for all URLs
- [ ] Enable Cloudflare proxy (orange cloud)
- [ ] Set Cloudflare SSL mode to "Full (strict)"
- [ ] Remove trailing slashes from origin URLs
- [ ] Test with automated script
- [ ] Monitor for CORS errors in production logs
- [ ] Document allowed origins

### Regular Audits

Periodically review:
1. Which origins are allowed
2. Whether all origins are still needed
3. CORS-related errors in logs
4. Unauthorized access attempts

## Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)
- [Cloudflare SSL/TLS Documentation](https://developers.cloudflare.com/ssl/)
- [CapRover Environment Variables](https://caprover.com/docs/app-configuration.html)
