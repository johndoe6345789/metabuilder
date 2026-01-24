# Phase 8: Nginx Reverse Proxy for Email Client

Email client deployment Phase 8 - Nginx reverse proxy with SSL/TLS termination, rate limiting, and gzip compression.

## Overview

This Nginx reverse proxy configuration provides:

- **SSL/TLS Termination**: HTTPS on port 443, HTTP redirect on port 80
- **Dual Service Routing**:
  - Port 5000: Email Service (Python Flask backend)
  - Port 3000: Email Client (Next.js frontend)
- **Rate Limiting**: 100 requests/min per IP (configurable)
- **Gzip Compression**: Enabled for all compressible content
- **Health Checks**: HTTP/443 endpoints for monitoring
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- **Caching**: API cache (5m), Static cache (24h)
- **Connection Pooling**: Upstream keepalive for performance

## Directory Structure

```
emailclient/deployment/docker/nginx/
├── Dockerfile              # Alpine-based Nginx image
├── nginx.conf              # Main configuration (this file)
├── README.md              # This documentation
├── SSL_SETUP.md           # SSL certificate generation
└── .dockerignore           # Docker build exclusions
```

## Prerequisites

1. Docker & Docker Compose installed
2. Email Service running on port 5000 (in container)
3. Email Client (Next.js) running on port 3000 (in container)
4. SSL certificates (self-signed for dev, Let's Encrypt for production)

## Building the Docker Image

### Development (Self-Signed Certificates)

```bash
# Build the Nginx image
cd emailclient/deployment/docker/nginx
docker build -t metabuilder-email-nginx:latest .

# Run with self-signed certificates (see SSL_SETUP.md)
docker run -d \
  --name emailclient-nginx \
  --network emailclient-network \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/ssl:/etc/nginx/ssl:ro \
  metabuilder-email-nginx:latest
```

### Production (Let's Encrypt Certificates)

See `SSL_SETUP.md` for automatic Let's Encrypt setup with Certbot.

## Docker Compose Integration

Add to `docker-compose.yml`:

```yaml
services:
  nginx:
    build:
      context: ./deployment/docker/nginx
      dockerfile: Dockerfile
    container_name: emailclient-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deployment/docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./deployment/docker/nginx/ssl:/etc/nginx/ssl:ro
      - nginx_cache:/var/cache/nginx
      - nginx_logs:/var/log/nginx
    depends_on:
      - email-service
      - emailclient
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - emailclient-network

volumes:
  nginx_cache:
    driver: local
  nginx_logs:
    driver: local

networks:
  emailclient-network:
    driver: bridge
```

## Configuration Sections

### 1. HTTP to HTTPS Redirect (Port 80)

```nginx
server {
  listen 80 default_server;
  location /.well-known/acme-challenge/ { ... }  # Let's Encrypt validation
  location /health { return 200 "healthy\n"; }   # Health check
  location / { return 301 https://$host$request_uri; }  # Redirect to HTTPS
}
```

- All HTTP traffic redirects to HTTPS
- ACME challenge path for Let's Encrypt cert renewal
- Health check available on HTTP for monitoring

### 2. Email Service API (Port 443, api.emailclient.*)

```nginx
upstream email_service {
  least_conn;  # Load balancing strategy
  server email-service:5000;
}

server {
  listen 443 ssl http2;
  server_name api.emailclient.* emailclient-api.*;

  # Specific endpoints with different rate limits:
  location /api/v1/sync { ... }      # 100 req/min, 60s timeout
  location /api/v1/search { ... }    # 100 req/min, 30s timeout
  location /api/ { ... }             # 100 req/min, 30s timeout
}
```

**Rate Limiting Per Endpoint:**
- `/api/v1/sync`: 100 req/min, burst 10
- `/api/v1/search`: 100 req/min, burst 20
- `/api/`: 100 req/min, burst 10
- Global: 200 req/min per IP

**Timeouts:**
- Sync: 30s connect, 60s read/write
- Search: 10s connect, 30s read
- Other: 10s connect, 30s read/write

### 3. Email Client Frontend (Port 443, emailclient.*)

```nginx
upstream emailclient_nextjs {
  least_conn;
  server emailclient:3000;
}

server {
  listen 443 ssl http2;
  server_name emailclient.* mail.* *.emailclient.*;

  # Static assets cached 1 year
  location /_next/ { cache 24h; }
  location ~* \.(jpg|css|js|svg)$ { cache 24h; }

  # HTML pages cached 1 minute
  location / { cache 1m; }
}
```

**Caching Strategy:**
- `/_next/*` (bundles): 24h (content-hashed by Next.js)
- Static files: 24h (immutable content)
- HTML pages: 1m (check for updates)
- API responses: 5m (stale-while-revalidating)

## Rate Limiting

### Configuration

Three rate limit zones defined:

```nginx
limit_req_zone $binary_remote_addr zone=email_service_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=emailclient_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=200r/m;
```

### Usage

```nginx
location /api/v1/sync {
  limit_req zone=email_service_limit burst=10 nodelay;
  limit_conn addr 10;  # Max 10 concurrent connections per IP
}
```

**Parameters:**
- `burst=10`: Allow up to 10 requests above the rate
- `nodelay`: Process burst immediately (instead of delaying)
- `limit_conn addr 10`: Max 10 concurrent connections per IP

### Monitoring Rate Limits

Check logs for rate limit violations:

```bash
# Show rate limit rejections
docker logs emailclient-nginx | grep "limiting requests"

# Count rate limit hits
docker exec emailclient-nginx grep "limiting requests" /var/log/nginx/access.log | wc -l
```

## SSL/TLS Configuration

### Protocols & Ciphers

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### Security Headers

```nginx
# HSTS - Force HTTPS for 1 year
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";

# CSP - Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline';";

# X-Frame-Options - Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN";

# X-Content-Type-Options - Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff";

# X-XSS-Protection - Browser XSS filter
add_header X-XSS-Protection "1; mode=block";
```

### Certificate Files Required

```
deployment/docker/nginx/ssl/
├── cert.pem          # SSL certificate
├── key.pem           # Private key
└── dhparam.pem       # DH parameters (generated on build)
```

See `SSL_SETUP.md` for certificate generation procedures.

## Gzip Compression

Enabled for:
- Text (HTML, CSS, JavaScript)
- JSON/XML APIs
- SVG images
- Web fonts (WOFF, TTF, etc.)

**Compression Levels:**
- `gzip_comp_level 6`: Balanced compression (default)
- Threshold: 256 bytes minimum
- Disabled for IE6

**Compressible Types:**
```
application/javascript
application/json
application/xml
image/svg+xml
text/css
text/javascript
text/plain
text/xml
```

Check compression in browser:
```javascript
// Browser DevTools → Network → Response Headers
Content-Encoding: gzip
```

## Health Checks

### HTTP Health Check (Port 80)

```bash
curl http://localhost/health
# Returns: "healthy"
```

### HTTPS Health Check (Port 443)

```bash
curl -k https://localhost/health
# Or with self-signed cert:
curl --insecure https://localhost/health
```

### Docker Health Check

```bash
docker ps | grep emailclient-nginx
# HEALTHCHECK shows (healthy) or (unhealthy)

# View health check logs
docker inspect --format='{{json .State.Health}}' emailclient-nginx | jq
```

### Monitoring Endpoint

```bash
# Email Service health
curl https://api.emailclient.local/health

# Email Client health
curl https://emailclient.local/

# Both should return HTTP 200
```

## Performance Tuning

### Worker Configuration

```nginx
worker_processes auto;        # Auto-detect CPU cores
worker_rlimit_nofile 65535;   # Max file descriptors
events {
  worker_connections 4096;    # Per worker
  use epoll;                   # Linux kernel efficiency
  multi_accept on;             # Accept multiple connections
}
```

### Connection Pooling

```nginx
upstream email_service {
  keepalive 32;  # Reuse connections
}

proxy_http_version 1.1;
proxy_set_header Connection "";  # Keep connection open
```

### Buffering

```nginx
proxy_buffering on;
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;
```

### Cache Performance

Check cache hit rates:

```bash
# Cache hits vs misses
docker exec emailclient-nginx grep "X-Cache-Status" /var/log/nginx/access.log | \
  awk '{print $NF}' | sort | uniq -c

# Expected output:
# 150 HIT
# 30 MISS
# 5 EXPIRED
```

## Troubleshooting

### Certificate Issues

```bash
# Check certificate validity
docker exec emailclient-nginx openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# Check key/cert match
docker exec emailclient-nginx bash -c \
  'openssl x509 -noout -modulus -in /etc/nginx/ssl/cert.pem | \
   openssl md5 && \
   openssl rsa -noout -modulus -in /etc/nginx/ssl/key.pem | \
   openssl md5'
# MD5 hashes should match
```

### Upstream Connection Issues

```bash
# Check if upstream servers are reachable
docker exec emailclient-nginx wget -O /dev/null http://email-service:5000
docker exec emailclient-nginx wget -O /dev/null http://emailclient:3000

# View upstream health status
docker exec emailclient-nginx curl http://localhost/admin/status 2>/dev/null || echo "Status module not enabled"
```

### Rate Limiting Issues

```bash
# Test rate limiting (make 105 requests in rapid succession)
for i in {1..105}; do curl -s https://api.emailclient.local/ > /dev/null & done

# Check logs for rejections
docker exec emailclient-nginx tail -50 /var/log/nginx/email_service_access.log | grep "limiting"
```

### High Memory Usage

```bash
# Check cache size
docker exec emailclient-nginx du -sh /var/cache/nginx

# Clear cache
docker exec emailclient-nginx rm -rf /var/cache/nginx/*
```

### Log Files

```bash
# Main access log
docker exec emailclient-nginx tail -f /var/log/nginx/access.log

# Email service logs
docker exec emailclient-nginx tail -f /var/log/nginx/email_service_access.log

# Error log
docker exec emailclient-nginx tail -f /var/log/nginx/error.log

# View all logs
docker logs -f emailclient-nginx
```

## Production Deployment Checklist

- [ ] Generate Let's Encrypt certificates (see `SSL_SETUP.md`)
- [ ] Update `server_name` directives with real domains
- [ ] Configure email-service upstream with real hostname/port
- [ ] Configure emailclient-nextjs upstream with real hostname/port
- [ ] Adjust rate limits based on expected traffic
- [ ] Set `gzip_comp_level` based on CPU available (6 is safe default)
- [ ] Monitor logs and cache hit rates for 48 hours
- [ ] Set up logrotate for `/var/log/nginx` files
- [ ] Enable SELinux/AppArmor policies if available
- [ ] Configure firewall rules for ports 80/443
- [ ] Set up monitoring/alerting for health checks

## Performance Benchmarks

### Expected Performance (Single Instance)

- **Throughput**: 5,000-10,000 req/sec (static assets)
- **Latency**: 10-50ms (upstream included)
- **Concurrent Connections**: 4,096+ per worker
- **Cache Hit Rate**: 70-90% for static assets

### Load Testing

```bash
# Install vegeta (HTTP load testing tool)
# brew install vegeta  (macOS)
# apt-get install vegeta  (Linux)

# Generate 1000 req/sec for 60 seconds
echo "GET https://emailclient.local/" | \
  vegeta attack -duration=60s -rate=1000 | \
  vegeta report
```

## Related Documents

- [SSL_SETUP.md](./SSL_SETUP.md) - Certificate generation for dev/production
- [Phase 7: Email Client Bootloader](../PHASE_7_BOOTLOADER.md)
- [Email Implementation Plan](../../../docs/plans/2026-01-23-email-client-implementation.md)
- [Main Docker Compose](../docker-compose.production.yml)

## Version History

- **v1.0.0** (2026-01-24): Initial Phase 8 implementation
  - Nginx 1.27 Alpine
  - Dual upstream routing
  - Rate limiting (100 req/min per IP)
  - SSL/TLS with security headers
  - Gzip compression
  - Static + API caching
  - Health checks on ports 80/443

## License

MetaBuilder - Email Client Project
Copyright 2026, All rights reserved.
