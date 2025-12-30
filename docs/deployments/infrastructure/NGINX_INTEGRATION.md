# Nginx Integration for DBAL Daemon

## Overview

The DBAL C++ daemon now includes a production-ready HTTP/1.1 server that is fully compatible with nginx reverse proxy configurations. This allows the daemon to run behind nginx for load balancing, SSL termination, and advanced routing.

## Quick Start

### Start the Daemon

```bash
# Default configuration (127.0.0.1:8080)
./dbal_daemon

# Custom bind address and port
./dbal_daemon --bind 0.0.0.0 --port 8080

# With configuration file
./dbal_daemon --config /etc/dbal/config.yaml --bind 127.0.0.1 --port 8080
```

### Command Line Options

- `--bind <address>` - Bind address (default: 127.0.0.1)
- `--port <port>` - Port number (default: 8080)
- `--config <file>` - Configuration file (default: config.yaml)
- `--mode <mode>` - Run mode: production or development (default: production)
- `--help, -h` - Show help message

## Nginx Configuration

### Basic Reverse Proxy

```nginx
upstream dbal_backend {
    server 127.0.0.1:8080;
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;

    location /api/ {
        proxy_pass http://dbal_backend/;
        proxy_http_version 1.1;
        
        # Forward client information
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        
        # Connection settings
        proxy_set_header Connection "";
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://dbal_backend/health;
        access_log off;
    }
}
```

### SSL/TLS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    ssl_certificate /etc/ssl/certs/api.example.com.crt;
    ssl_certificate_key /etc/ssl/private/api.example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location /api/ {
        proxy_pass http://dbal_backend/;
        proxy_http_version 1.1;
        
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Host $host;
        proxy_set_header Connection "";
    }
}
```

### Load Balancing (Multiple Instances)

```nginx
upstream dbal_backend {
    least_conn;
    
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8081 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8082 max_fails=3 fail_timeout=30s;
    
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://dbal_backend/;
        proxy_http_version 1.1;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
        proxy_next_upstream_tries 2;
        
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        proxy_set_header Connection "";
    }
}
```

### Health Checks

```nginx
server {
    listen 80;
    server_name api.example.com;
    
    # Health check endpoint (no authentication)
    location /health {
        proxy_pass http://dbal_backend/health;
        proxy_http_version 1.1;
        access_log off;
    }
    
    # Nginx Plus health checks (if using Nginx Plus)
    location /nginx_status {
        health_check;
    }
}
```

## API Endpoints

The daemon provides the following endpoints:

### GET /health

Health check endpoint for monitoring and load balancer health checks.

**Response:**
```json
{
  "status": "healthy",
  "service": "dbal"
}
```

**Status Code:** 200 OK

### GET /version

Get daemon version information.

**Response:**
```json
{
  "version": "1.0.0",
  "service": "DBAL Daemon"
}
```

**Status Code:** 200 OK

### GET /status

Get current server status including nginx proxy information.

**Response:**
```json
{
  "status": "running",
  "address": "127.0.0.1:8080",
  "real_ip": "203.0.113.45",
  "forwarded_proto": "https"
}
```

**Status Code:** 200 OK

**Note:** `real_ip` and `forwarded_proto` are extracted from nginx `X-Real-IP`, `X-Forwarded-For`, and `X-Forwarded-Proto` headers.

## Proxy Headers

The daemon recognizes and uses the following nginx proxy headers:

- **X-Real-IP**: Original client IP address
- **X-Forwarded-For**: Chain of proxy IP addresses
- **X-Forwarded-Proto**: Original protocol (http/https)
- **Host**: Original host header

These headers are automatically parsed and can be accessed through the `HttpRequest` object in request handlers.

## Production Deployment

### Systemd Service (Linux)

Create `/etc/systemd/system/dbal-daemon.service`:

```ini
[Unit]
Description=DBAL Daemon
After=network.target

[Service]
Type=simple
User=dbal
Group=dbal
WorkingDirectory=/opt/dbal
ExecStart=/opt/dbal/bin/dbal_daemon --bind 127.0.0.1 --port 8080 --config /etc/dbal/config.yaml
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable dbal-daemon
sudo systemctl start dbal-daemon
sudo systemctl status dbal-daemon
```

### Docker with Nginx

**Dockerfile:**
```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    g++ cmake ninja-build \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN cd dbal/production && \
    cmake -B build -G Ninja && \
    ninja -C build && \
    cp build/dbal_daemon /usr/local/bin/

EXPOSE 8080
CMD ["dbal_daemon", "--bind", "0.0.0.0", "--port", "8080"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  dbal:
    build: .
    container_name: dbal-daemon
    expose:
      - "8080"
    networks:
      - dbal-network
    restart: always

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - dbal
    networks:
      - dbal-network
    restart: always

networks:
  dbal-network:
    driver: bridge
```

## Monitoring

### Health Check Script

```bash
#!/bin/bash
# health-check.sh

HEALTH_URL="http://localhost:8080/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$RESPONSE" = "200" ]; then
    echo "Healthy"
    exit 0
else
    echo "Unhealthy (HTTP $RESPONSE)"
    exit 1
fi
```

### Prometheus Metrics (Future)

The daemon architecture supports adding Prometheus metrics endpoint at `/metrics` for monitoring:

- Request count and latency
- Active connections
- Memory usage
- Error rates

## Performance Tuning

### Daemon Settings

- **Socket backlog**: Currently set to 128 connections
- **Receive timeout**: 30 seconds
- **Thread pool**: Each connection handled in separate thread (consider thread pool for high load)

### Nginx Settings

```nginx
# Worker processes
worker_processes auto;

# Worker connections
events {
    worker_connections 4096;
    use epoll;
}

# Proxy buffering
http {
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}
```

## Troubleshooting

### Connection Refused

**Symptom:** nginx returns 502 Bad Gateway

**Check:**
1. Daemon is running: `systemctl status dbal-daemon`
2. Port is open: `netstat -tln | grep 8080`
3. Firewall rules allow connection

### Slow Response Times

**Check:**
1. Daemon CPU usage: `top -p $(pgrep dbal_daemon)`
2. Nginx error logs: `/var/log/nginx/error.log`
3. Increase proxy timeouts in nginx config

### Out of Connections

**Symptom:** Daemon stops accepting connections

**Solution:**
1. Increase socket backlog in daemon
2. Add connection pooling/thread pool
3. Scale horizontally with load balancer

## Security Considerations

1. **Bind to localhost only** when behind nginx: `--bind 127.0.0.1`
2. **Use firewall rules** to restrict direct access to daemon port
3. **SSL/TLS termination** should be handled by nginx
4. **Request rate limiting** can be configured in nginx
5. **DDoS protection** through nginx or external WAF

## Future Enhancements

- [ ] WebSocket support for real-time features
- [ ] HTTP/2 support
- [ ] Metrics endpoint (/metrics)
- [ ] Connection pooling and thread pool
- [ ] Request logging middleware
- [ ] CORS headers configuration
- [ ] Authentication middleware

## References

- [Nginx HTTP Proxy Module](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Nginx Load Balancing](http://nginx.org/en/docs/http/load_balancing.html)
- [HTTP/1.1 RFC 7230](https://tools.ietf.org/html/rfc7230)
