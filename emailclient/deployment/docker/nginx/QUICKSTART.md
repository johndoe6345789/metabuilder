# Nginx Reverse Proxy - Quick Start Guide

## 30-Second Setup (Development)

```bash
# 1. Generate SSL certificates
cd emailclient/deployment/docker/nginx
./generate-dev-certs.sh

# 2. Build Docker image
docker build -t metabuilder-email-nginx:latest .

# 3. Run reverse proxy
docker run -d \
  --name emailclient-nginx \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/ssl:/etc/nginx/ssl:ro \
  metabuilder-email-nginx:latest

# 4. Verify
curl -k https://localhost/health
```

## 5-Minute Full Setup (Docker Compose)

```bash
# 1. Generate certificates
cd emailclient/deployment/docker/nginx
./generate-dev-certs.sh

# 2. Merge docker-compose configuration
cat docker-compose-snippet.yml >> ../docker-compose.production.yml

# 3. Start all services
cd ..
docker-compose -f docker-compose.production.yml up -d

# 4. Verify health
docker-compose ps
docker logs emailclient-nginx | tail -20
```

## Common Commands

### Testing

```bash
# HTTP redirect to HTTPS
curl -i http://localhost
# → HTTP 301 to https://

# Health check
curl -k https://localhost/health
# → 200 OK "healthy"

# Email Service API
curl -k https://api.emailclient.local/health
# → 200 OK (from email-service upstream)

# Email Client Frontend
curl -k https://emailclient.local/
# → 200 OK (from emailclient upstream)

# Test rate limiting (make 105 rapid requests)
for i in {1..105}; do curl -s https://api.emailclient.local/ > /dev/null & done
# Should see "limiting requests" in logs
```

### Monitoring

```bash
# View access logs
docker logs -f emailclient-nginx

# View error logs
docker exec emailclient-nginx tail -f /var/log/nginx/error.log

# Check cache hit ratio
docker exec emailclient-nginx grep "X-Cache-Status" /var/log/nginx/access.log | \
  awk '{print $NF}' | sort | uniq -c

# Count rate limit violations
docker exec emailclient-nginx grep "limiting requests" /var/log/nginx/access.log | wc -l

# Check certificate expiration
openssl x509 -enddate -noout -in deployment/docker/nginx/ssl/cert.pem
```

### Troubleshooting

```bash
# Check Nginx configuration
docker exec emailclient-nginx nginx -t

# Restart Nginx
docker restart emailclient-nginx

# Reload Nginx (zero-downtime)
docker exec emailclient-nginx nginx -s reload

# Clear cache
docker exec emailclient-nginx rm -rf /var/cache/nginx/*

# Verify upstream connectivity
docker exec emailclient-nginx curl http://email-service:5000/health
docker exec emailclient-nginx curl http://emailclient:3000/
```

## File Structure

```
deployment/docker/nginx/
├── Dockerfile                        # Alpine Nginx image
├── nginx.conf                        # Main configuration
├── README.md                         # Full documentation (600+ lines)
├── SSL_SETUP.md                      # Certificate generation (650+ lines)
├── QUICKSTART.md                     # This file
├── generate-dev-certs.sh             # SSL cert generator script
├── docker-compose-snippet.yml        # Docker Compose template
├── .dockerignore                     # Build optimizations
└── ssl/                              # Generated certificates (optional)
    ├── cert.pem
    ├── key.pem
    └── dhparam.pem
```

## Configuration Overview

### Rate Limiting
- **Email Service**: 100 req/min per IP
- **Email Client**: 100 req/min per IP
- **General**: 200 req/min per IP

### SSL/TLS
- **Protocols**: TLS 1.2, TLS 1.3
- **Ciphers**: HIGH, no MD5/DES/RC4
- **HSTS**: 1 year

### Caching
- **Static** (/_next/, images): 24 hours
- **HTML** (/): 1 minute
- **API** (/api/): 5 minutes

### Compression
- **Gzip**: Enabled
- **Level**: 6 (balanced)
- **Min size**: 256 bytes

## Production Checklist

- [ ] Generate Let's Encrypt certificates (see SSL_SETUP.md)
- [ ] Update `server_name` in nginx.conf with real domains
- [ ] Update `upstream` servers with real hostnames
- [ ] Set `NEXT_PUBLIC_API_URL` in emailclient env
- [ ] Configure DNS to point to server
- [ ] Test HTTPS: `https://yourdomain.com`
- [ ] Set up certificate renewal
- [ ] Monitor logs and alerts
- [ ] Load test with vegeta or similar
- [ ] Security audit (SSL Labs grade A)

## Next Steps

1. **Development**: Run `generate-dev-certs.sh`, then `docker-compose up -d`
2. **Documentation**: Read `README.md` for detailed configuration
3. **SSL Setup**: See `SSL_SETUP.md` for production certificates
4. **Integration**: Merge `docker-compose-snippet.yml` into main compose file
5. **Monitoring**: Set up log aggregation and alerting

## Key Files to Know

| File | Purpose |
|------|---------|
| `Dockerfile` | Builds lightweight Nginx image |
| `nginx.conf` | ~950 lines of production config |
| `README.md` | Full feature documentation |
| `SSL_SETUP.md` | Certificate generation guide |
| `generate-dev-certs.sh` | Auto-generate dev certs |
| `docker-compose-snippet.yml` | Docker Compose template |

## Performance

- **Throughput**: 5,000-10,000 req/sec (static)
- **Latency**: 10-50ms (with upstream)
- **Cache Hit**: 70-90% (static assets)
- **Workers**: Auto-scale to CPU count

## Support

- Full documentation: `README.md` (600+ lines)
- Troubleshooting: Last section of `README.md`
- SSL issues: `SSL_SETUP.md`
- Configuration: Inline comments in `nginx.conf`

---

**Questions?** See `README.md` and `SSL_SETUP.md` for comprehensive guides.
