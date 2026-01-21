# Cloudflare Configuration for CodeForge

This document outlines the recommended Cloudflare settings for deploying CodeForge with CapRover.

## DNS Configuration

### Frontend Domain
```
Type: A
Name: frontend (or @)
IPv4: <your-caprover-server-ip>
Proxy status: Proxied (orange cloud)
TTL: Auto
```

### Backend Domain
```
Type: A
Name: backend (or api)
IPv4: <your-caprover-server-ip>
Proxy status: Proxied (orange cloud)
TTL: Auto
```

### Optional: WWW Subdomain
```
Type: CNAME
Name: www
Target: frontend.example.com
Proxy status: Proxied (orange cloud)
TTL: Auto
```

## SSL/TLS Settings

Navigate to: **SSL/TLS** → **Overview**

### Encryption Mode
- **Recommended**: Full (strict)
- **Alternative**: Full
- **Never use**: Flexible (breaks HTTPS to origin)

### Edge Certificates
Navigate to: **SSL/TLS** → **Edge Certificates**

- ✅ **Always Use HTTPS**: On
- ✅ **HTTP Strict Transport Security (HSTS)**: Enable
  - Max Age: 12 months
  - Include subdomains: Yes
  - Preload: Yes (optional, but recommended)
- ✅ **Minimum TLS Version**: TLS 1.2
- ✅ **Opportunistic Encryption**: On
- ✅ **TLS 1.3**: On
- ✅ **Automatic HTTPS Rewrites**: On
- ✅ **Certificate Transparency Monitoring**: On

## Firewall Rules

Navigate to: **Security** → **WAF** → **Firewall rules**

### Rule 1: Allow Backend API Requests
```
Rule name: Allow API Access
Expression: 
  (http.host eq "backend.example.com" and http.request.uri.path starts_with "/api/")
Action: Allow
```

### Rule 2: Rate Limit (Optional)
```
Rule name: API Rate Limit
Expression:
  (http.host eq "backend.example.com" and http.request.uri.path starts_with "/api/")
Action: Rate Limit
Requests: 100 requests per minute
Duration: 1 minute
```

## Page Rules

Navigate to: **Rules** → **Page Rules**

### Rule 1: Backend API Caching
```
URL: backend.example.com/api/*
Settings:
  - Cache Level: Bypass
  - Security Level: Medium
  - Browser Integrity Check: Off (for API)
```

### Rule 2: Frontend Caching
```
URL: frontend.example.com/*
Settings:
  - Cache Level: Standard
  - Browser Cache TTL: 4 hours
  - Edge Cache TTL: 2 hours
```

### Rule 3: Frontend Assets Caching
```
URL: frontend.example.com/assets/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 month
```

## Speed Settings

Navigate to: **Speed** → **Optimization**

### Auto Minify
- ✅ JavaScript
- ✅ CSS
- ✅ HTML

### Brotli
- ✅ On

### Rocket Loader
- ⚠️ Off (can break SPA)

### Mirage
- ⚠️ Off (for modern SPAs)

### Polish
- Optional: Lossy or Lossless (for images)

## Network Settings

Navigate to: **Network**

### HTTP/3 (with QUIC)
- ✅ On

### HTTP/2
- ✅ On

### 0-RTT Connection Resumption
- ✅ On

### WebSockets
- ✅ On (required for backend WebSocket connections if used)

### gRPC
- Optional: On (if using gRPC)

## Caching Configuration

Navigate to: **Caching** → **Configuration**

### Caching Level
- Standard

### Browser Cache TTL
- 4 hours (adjust as needed)

### Always Online
- ✅ On (serves cached version when origin is down)

### Development Mode
- Use temporarily during testing (disables caching for 3 hours)

## Transform Rules (for CORS Headers)

Navigate to: **Rules** → **Transform Rules** → **Modify Response Header**

⚠️ **Important**: Only add these if nginx is NOT handling CORS headers.

### Add CORS Headers to Frontend
```
Rule name: Frontend CORS Headers
Expression: http.host eq "frontend.example.com"
Actions:
  Set dynamic header:
    - Header name: Access-Control-Allow-Origin
    - Value: *
  Set static header:
    - Header name: Access-Control-Allow-Methods
    - Value: GET, POST, PUT, DELETE, OPTIONS
  Set static header:
    - Header name: Access-Control-Allow-Headers
    - Value: Content-Type, Authorization
```

### Add CORS Headers to Backend
```
Rule name: Backend CORS Headers
Expression: http.host eq "backend.example.com"
Actions:
  Set dynamic header:
    - Header name: Access-Control-Allow-Origin
    - Value: https://frontend.example.com
  Set static header:
    - Header name: Access-Control-Allow-Methods
    - Value: GET, POST, PUT, DELETE, OPTIONS
  Set static header:
    - Header name: Access-Control-Allow-Credentials
    - Value: true
```

## Security Settings

Navigate to: **Security** → **Settings**

### Security Level
- Medium (for production)
- Low (for testing/development)

### Challenge Passage
- 30 minutes

### Browser Integrity Check
- ✅ On (for frontend)
- ⚠️ Off (for backend API to avoid blocking legitimate API clients)

### Privacy Pass Support
- ✅ On

## DDoS Protection

Navigate to: **Security** → **DDoS**

- Managed by Cloudflare automatically
- No configuration needed
- Monitor attacks in dashboard

## Bot Management (Enterprise/Business Plans)

Navigate to: **Security** → **Bots**

### Bot Fight Mode (Free/Pro/Business)
- ⚠️ Off for API endpoints (can block legitimate requests)
- ✅ On for frontend (protects against scrapers)

### Super Bot Fight Mode (Business+)
- Configure to allow verified bots
- Block definitely automated traffic

## Analytics & Monitoring

### Web Analytics
Navigate to: **Analytics & Logs** → **Web Analytics**
- Enable to track frontend traffic

### Health Checks
Navigate to: **Traffic** → **Health Checks**

#### Frontend Health Check
```
Name: Frontend Health
URL: https://frontend.example.com/health
Type: HTTPS
Method: GET
Expected Status: 200
Interval: 60 seconds
```

#### Backend Health Check
```
Name: Backend Health
URL: https://backend.example.com/health
Type: HTTPS
Method: GET
Expected Status: 200
Interval: 60 seconds
```

## Origin Rules (for CapRover)

Navigate to: **Rules** → **Origin Rules**

### Set Origin to CapRover
```
Rule name: Forward to CapRover
Expression: http.host in {"frontend.example.com" "backend.example.com"}
Actions:
  - Override origin: <caprover-server-ip>
  - Override port: 443
```

## Testing Cloudflare Configuration

### 1. Verify SSL
```bash
curl -I https://frontend.example.com
# Should return: HTTP/2 200
# Check for: strict-transport-security header
```

### 2. Verify CORS
```bash
curl -X OPTIONS https://backend.example.com/api/storage/keys \
  -H "Origin: https://frontend.example.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

### 3. Check Caching
```bash
curl -I https://frontend.example.com/assets/index.js
# Should return: cf-cache-status: HIT (after first request)
```

### 4. Test Rate Limiting
```bash
# Run multiple times quickly
for i in {1..150}; do
  curl https://backend.example.com/api/storage/keys
done
# Should eventually get rate limited
```

## Troubleshooting

### Issue: 520/521/522 Errors

**Cause**: Cloudflare can't connect to origin server

**Solutions**:
1. Verify CapRover server is running
2. Check firewall allows Cloudflare IPs
3. Verify SSL certificate on origin
4. Check Cloudflare SSL mode is not "Flexible"

### Issue: CORS Errors Still Occurring

**Cause**: Conflicting CORS headers from multiple sources

**Solutions**:
1. Remove CORS headers from Cloudflare Transform Rules if nginx handles them
2. Check both nginx and Flask CORS configs
3. Use browser DevTools to see which headers are present

### Issue: Assets Not Caching

**Cause**: Cache rules not properly configured

**Solutions**:
1. Verify page rules are in correct order (more specific first)
2. Check cache level is appropriate
3. Enable Development Mode temporarily to bypass cache
4. Purge cache and retry

### Issue: API Requests Being Blocked

**Cause**: Bot Fight Mode or firewall rules

**Solutions**:
1. Disable Bot Fight Mode for backend domain
2. Check firewall events for blocked requests
3. Whitelist your IP or API client user-agent
4. Disable Browser Integrity Check for API

## Recommended Setup Order

1. ✅ Set up DNS records (A records for both domains)
2. ✅ Configure SSL/TLS (Full or Full Strict mode)
3. ✅ Enable HTTPS redirects and HSTS
4. ✅ Configure firewall rules (if needed)
5. ✅ Set up page rules for caching
6. ✅ Configure health checks
7. ✅ Enable speed optimizations
8. ✅ Test thoroughly before going live
9. ✅ Monitor analytics and logs

## Additional Resources

- [Cloudflare Support](https://support.cloudflare.com/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Developers Docs](https://developers.cloudflare.com/)
- [Cloudflare Status](https://www.cloudflarestatus.com/)
