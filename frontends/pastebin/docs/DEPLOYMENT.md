# CapRover / Cloudflare Deployment Guide

This guide explains how to deploy CodeSnippet with separate frontend and backend domains using CapRover and Cloudflare.

## Architecture

```
┌─────────────────────────────────────────────┐
│          Cloudflare DNS & Proxy             │
│  https://frontend.example.com               │
│  https://backend.example.com                │
└─────────────┬───────────────────────────────┘
              │
              │ HTTPS (Cloudflare SSL)
              │
┌─────────────▼───────────────────────────────┐
│             CapRover Server                 │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │   Frontend   │      │    Backend      │ │
│  │   (Nginx)    │      │    (Flask)      │ │
│  │   Port 3000  │      │   Port 5000     │ │
│  └──────────────┘      └─────────────────┘ │
└─────────────────────────────────────────────┘
```

## Prerequisites

1. CapRover server installed and configured
2. Domain name configured in Cloudflare
3. DNS records pointing to your CapRover server
4. CapRover CLI installed: `npm install -g caprover`

## Step 1: Configure DNS in Cloudflare

Add these DNS records in Cloudflare:

| Type | Name     | Content              | Proxy Status |
|------|----------|----------------------|--------------|
| A    | frontend | YOUR_CAPROVER_IP     | Proxied      |
| A    | backend  | YOUR_CAPROVER_IP     | Proxied      |

**Important:** Enable "Proxied" (orange cloud) to use Cloudflare's CDN and SSL.

## Step 2: Deploy Backend to CapRover

### Create Backend App

1. Login to CapRover dashboard
2. Go to "Apps" → "One-Click Apps/Databases"
3. Create a new app named `codesnippet-backend`
4. Enable "Has Persistent Data" and set persistent directory to `/app/data`

### Configure Backend Environment Variables

In the backend app settings, add these environment variables:

```bash
CORS_ALLOWED_ORIGINS=https://frontend.example.com
DATABASE_PATH=/app/data/snippets.db
```

### Deploy Backend Code

From the `backend` directory:

```bash
cd backend
caprover deploy -a codesnippet-backend
```

### Enable HTTPS for Backend

1. In CapRover dashboard → Apps → codesnippet-backend
2. Go to "HTTP Settings"
3. Enable "HTTPS"
4. Connect domain: `backend.example.com`
5. Enable "Force HTTPS by redirecting all HTTP traffic to HTTPS"
6. Wait for SSL certificate to be issued

## Step 3: Deploy Frontend to CapRover

### Create Frontend App

1. In CapRover dashboard, create new app: `codesnippet-frontend`
2. No persistent data needed for frontend

### Configure Frontend Environment Variables

In the frontend app settings, add:

```bash
VITE_FLASK_BACKEND_URL=https://backend.example.com
```

### Deploy Frontend Code

From the project root:

```bash
caprover deploy -a codesnippet-frontend
```

### Enable HTTPS for Frontend

1. In CapRover dashboard → Apps → codesnippet-frontend
2. Go to "HTTP Settings"
3. Enable "HTTPS"
4. Connect domain: `frontend.example.com`
5. Enable "Force HTTPS by redirecting all HTTP traffic to HTTPS"
6. Wait for SSL certificate to be issued

## Step 4: Configure Cloudflare Settings

### SSL/TLS Settings

1. Go to Cloudflare dashboard → SSL/TLS
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

### Security Settings

1. Go to Security → WAF
2. Consider enabling Bot Fight Mode for backend
3. Set up rate limiting rules if needed

### Speed Settings

1. Enable "Auto Minify" for JavaScript, CSS, HTML
2. Enable "Brotli" compression
3. Set Browser Cache TTL appropriately

## Step 5: Verify Deployment

### Test Backend

```bash
curl https://backend.example.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

### Test CORS

```bash
curl -H "Origin: https://frontend.example.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://backend.example.com/api/snippets
```

Should return CORS headers:
```
Access-Control-Allow-Origin: https://frontend.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Test Frontend

Visit `https://frontend.example.com` and verify:
- Frontend loads correctly
- Backend indicator shows "Backend" status
- Can create, edit, and delete snippets
- No CORS errors in browser console

## Environment Variables Reference

### Backend Environment Variables

| Variable              | Description                                    | Example                          |
|-----------------------|------------------------------------------------|----------------------------------|
| `CORS_ALLOWED_ORIGINS`| Comma-separated list of allowed frontend URLs | `https://frontend.example.com`   |
| `DATABASE_PATH`       | Path to SQLite database file                  | `/app/data/snippets.db`          |

**Note:** Use `*` for `CORS_ALLOWED_ORIGINS` only in development. In production, always specify exact origins.

### Frontend Environment Variables

| Variable                  | Description                  | Example                        |
|---------------------------|------------------------------|--------------------------------|
| `VITE_FLASK_BACKEND_URL`  | Backend API URL             | `https://backend.example.com`  |

## Alternative: Single Domain Setup

If you prefer a single domain (e.g., `https://app.example.com`), you can deploy frontend with nginx proxying to backend:

### Deploy Both Services

1. Deploy backend as before (internal only, no custom domain)
2. Frontend proxies `/api` requests to backend via nginx

### Frontend Configuration

```bash
# Frontend environment variables
VITE_FLASK_BACKEND_URL=/api
```

### Nginx Configuration

The included `nginx.conf` already handles this:

```nginx
location /api {
    proxy_pass http://backend:5000;
    # ... proxy headers
}
```

### Benefits

- Simplified DNS (single domain)
- No CORS issues (same-origin requests)
- Easier SSL management

### Drawbacks

- Frontend and backend tightly coupled
- Can't independently scale services
- Single point of failure

## Troubleshooting

### CORS Errors

**Problem:** Browser console shows CORS errors

**Solutions:**
1. Verify `CORS_ALLOWED_ORIGINS` in backend matches frontend URL exactly
2. Ensure both domains use HTTPS (not mixed HTTP/HTTPS)
3. Check Cloudflare proxy status is enabled for both domains
4. Clear browser cache and hard refresh

### Backend Connection Failed

**Problem:** Frontend shows "Connection failed" error

**Solutions:**
1. Verify backend is running: `curl https://backend.example.com/health`
2. Check CapRover logs for backend app
3. Verify `VITE_FLASK_BACKEND_URL` in frontend matches backend URL
4. Test from command line: `curl -v https://backend.example.com/api/snippets`

### SSL Certificate Issues

**Problem:** SSL certificate not issued or invalid

**Solutions:**
1. Wait 5-10 minutes for Let's Encrypt to issue certificate
2. Verify DNS records are correct and propagated
3. Check CapRover can reach Let's Encrypt (port 80 open)
4. Try disabling and re-enabling HTTPS in CapRover

### Data Persistence Issues

**Problem:** Backend loses data after restart

**Solutions:**
1. Verify "Has Persistent Data" is enabled in CapRover
2. Check persistent directory path is `/app/data`
3. Verify `DATABASE_PATH` environment variable is correct
4. Check CapRover volume is properly mounted

### Multiple Origins

**Problem:** Need to allow multiple frontend domains

**Solution:** Set comma-separated origins:
```bash
CORS_ALLOWED_ORIGINS=https://frontend.example.com,https://app.example.com,https://staging.example.com
```

## Security Best Practices

### Production Checklist

- [ ] HTTPS enabled for both frontend and backend
- [ ] `CORS_ALLOWED_ORIGINS` set to specific domains (not `*`)
- [ ] Cloudflare proxy enabled (orange cloud)
- [ ] Rate limiting configured in Cloudflare
- [ ] Backend database backed up regularly
- [ ] Environment variables stored securely (not in code)
- [ ] Debug mode disabled in Flask (`debug=False`)
- [ ] Cloudflare WAF rules configured
- [ ] HTTPS-only cookies enabled
- [ ] Security headers configured in nginx

### Recommended Cloudflare Rules

1. **Rate Limiting:** Limit API requests to 100 per minute per IP
2. **Bot Protection:** Challenge or block known bad bots
3. **Geographic Restrictions:** Block countries you don't serve (optional)
4. **DDoS Protection:** Enable automatic DDoS mitigation

## Monitoring

### CapRover Monitoring

1. Enable app metrics in CapRover dashboard
2. Monitor CPU and memory usage
3. Set up alerts for app crashes
4. Review logs regularly for errors

### Cloudflare Analytics

1. Monitor traffic patterns
2. Check for unusual spikes or attacks
3. Review security events
4. Analyze performance metrics

## Backup Strategy

### Automated Backups

Set up a cron job in CapRover to backup database:

```bash
# In backend app settings, add a schedule:
0 2 * * * tar -czf /app/data/backup-$(date +%Y%m%d).tar.gz /app/data/snippets.db
```

### Manual Backup

1. SSH into CapRover server
2. Copy database file:
   ```bash
   docker cp captain--codesnippet-backend:/app/data/snippets.db ./backup.db
   ```

### Restore from Backup

1. Copy backup to container:
   ```bash
   docker cp ./backup.db captain--codesnippet-backend:/app/data/snippets.db
   ```
2. Restart backend app in CapRover

## Scaling Considerations

### Vertical Scaling

Increase resources in CapRover:
1. Go to app settings → "Resources"
2. Increase CPU and memory limits
3. Restart app

### Horizontal Scaling

For high traffic:
1. Deploy multiple backend instances in CapRover
2. Use CapRover's load balancing
3. Consider shared database (PostgreSQL instead of SQLite)
4. Use Redis for session management

## Cost Optimization

### Cloudflare

- Free plan includes SSL, CDN, and basic DDoS protection
- Pro plan ($20/mo) adds WAF and additional performance features

### CapRover

- Single VPS can run both frontend and backend
- Recommended: 2 CPU / 4GB RAM minimum
- Estimated cost: $10-20/month (DigitalOcean, Linode, Vultr)

## Support

For issues specific to:
- **CapRover:** https://caprover.com/docs/
- **Cloudflare:** https://support.cloudflare.com/
- **CodeSnippet:** Check the main README.md and BACKEND-CONFIG.md
