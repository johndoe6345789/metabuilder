# Deployment Checklist

Quick reference checklist for deploying CodeSnippet with separate frontend and backend domains.

## Pre-Deployment

- [ ] CapRover server is running and accessible
- [ ] Domain name configured in DNS provider (Cloudflare)
- [ ] CapRover CLI installed: `npm install -g caprover`
- [ ] Logged into CapRover: `caprover login`

## DNS Configuration (Cloudflare)

- [ ] A record for `frontend.example.com` → CapRover IP (Proxied ☁️)
- [ ] A record for `backend.example.com` → CapRover IP (Proxied ☁️)
- [ ] DNS records propagated (check with `dig` or `nslookup`)

## Backend Deployment

- [ ] Create app in CapRover: `codesnippet-backend`
- [ ] Enable "Has Persistent Data" with path: `/app/data`
- [ ] Set environment variable: `CORS_ALLOWED_ORIGINS=https://frontend.example.com`
- [ ] Set environment variable: `DATABASE_PATH=/app/data/snippets.db`
- [ ] Deploy code: `cd backend && caprover deploy -a codesnippet-backend`
- [ ] Enable HTTPS in CapRover
- [ ] Connect custom domain: `backend.example.com`
- [ ] Force HTTPS redirect enabled
- [ ] SSL certificate issued successfully
- [ ] Test health endpoint: `curl https://backend.example.com/health`

## Frontend Deployment

- [ ] Create app in CapRover: `codesnippet-frontend`
- [ ] Set environment variable: `VITE_FLASK_BACKEND_URL=https://backend.example.com`
- [ ] Deploy code: `caprover deploy -a codesnippet-frontend` (from project root)
- [ ] Enable HTTPS in CapRover
- [ ] Connect custom domain: `frontend.example.com`
- [ ] Force HTTPS redirect enabled
- [ ] SSL certificate issued successfully
- [ ] Test frontend loads: Visit `https://frontend.example.com`

## Cloudflare Configuration

- [ ] SSL/TLS mode set to "Full (strict)"
- [ ] "Always Use HTTPS" enabled
- [ ] "Automatic HTTPS Rewrites" enabled
- [ ] "Auto Minify" enabled (JS, CSS, HTML)
- [ ] "Brotli" compression enabled

## Testing

- [ ] Backend health check responds: `curl https://backend.example.com/health`
- [ ] CORS preflight test passes (see CORS-GUIDE.md)
- [ ] Frontend loads without errors
- [ ] Backend indicator shows "Backend" status (not "Local")
- [ ] Can create new snippet
- [ ] Can view existing snippet
- [ ] Can edit snippet
- [ ] Can delete snippet
- [ ] No CORS errors in browser console (F12)
- [ ] Mobile responsive layout works

## Post-Deployment

- [ ] Database backup strategy configured
- [ ] Monitoring enabled (CapRover metrics)
- [ ] Rate limiting configured (Cloudflare)
- [ ] Error logging reviewed
- [ ] Documentation updated with actual URLs

## Security Verification

- [ ] Both domains use HTTPS only
- [ ] `CORS_ALLOWED_ORIGINS` set to specific domain (not `*`)
- [ ] Flask debug mode disabled (`debug=False`)
- [ ] No sensitive data in environment variables
- [ ] CapRover firewall rules configured
- [ ] Cloudflare security features enabled

## Quick Commands

### Deploy Backend
```bash
cd backend
caprover deploy -a codesnippet-backend
```

### Deploy Frontend
```bash
caprover deploy -a codesnippet-frontend
```

### Check Backend Logs
```bash
caprover logs codesnippet-backend --lines 100 --follow
```

### Check Frontend Logs
```bash
caprover logs codesnippet-frontend --lines 100 --follow
```

### Test CORS
```bash
curl -X OPTIONS https://backend.example.com/api/snippets \
  -H "Origin: https://frontend.example.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

### Backup Database
```bash
docker cp captain--codesnippet-backend:/app/data/snippets.db ./backup-$(date +%Y%m%d).db
```

## Troubleshooting Quick Fixes

### Frontend can't connect to backend
1. Check `VITE_FLASK_BACKEND_URL` in frontend environment variables
2. Verify backend is running: `curl https://backend.example.com/health`
3. Check CORS configuration in backend

### CORS errors in browser
1. Verify `CORS_ALLOWED_ORIGINS` includes frontend URL exactly
2. Ensure both use HTTPS (not mixed HTTP/HTTPS)
3. Restart backend app after environment changes

### SSL certificate issues
1. Wait 5-10 minutes for Let's Encrypt
2. Verify DNS records point to CapRover
3. Disable and re-enable HTTPS in CapRover

### Data lost after restart
1. Verify "Has Persistent Data" enabled in backend app
2. Check persistent directory path: `/app/data`
3. Verify volume is mounted correctly

## Environment Variables Quick Reference

### Backend (codesnippet-backend)
```
CORS_ALLOWED_ORIGINS=https://frontend.example.com
DATABASE_PATH=/app/data/snippets.db
```

### Frontend (codesnippet-frontend)
```
VITE_FLASK_BACKEND_URL=https://backend.example.com
```

## Alternative: Single Domain Deployment

For single domain setup (`https://app.example.com`):

### Backend
- [ ] Deploy backend (internal only, no custom domain)
- [ ] Set `CORS_ALLOWED_ORIGINS=*` (not needed if proxied)

### Frontend
- [ ] Set `VITE_FLASK_BACKEND_URL=/api`
- [ ] nginx proxies `/api` to backend (already configured)
- [ ] Deploy with custom domain: `app.example.com`

Benefits: No CORS issues, simpler DNS
Drawbacks: Tightly coupled services

## Rollback Plan

If deployment fails:

1. **Frontend issues:** Redeploy previous version
2. **Backend issues:** Check logs, fix errors, redeploy
3. **Database corruption:** Restore from backup
4. **DNS issues:** Verify Cloudflare settings
5. **SSL issues:** Disable HTTPS temporarily, debug, re-enable

## Maintenance Schedule

- **Daily:** Check error logs
- **Weekly:** Review metrics and performance
- **Monthly:** Update dependencies, security patches
- **Quarterly:** Review and rotate secrets/keys

## Support Resources

- [Full Deployment Guide](./DEPLOYMENT.md)
- [CORS Configuration Guide](./CORS-GUIDE.md)
- [Backend Configuration](./BACKEND-CONFIG.md)
- [CapRover Documentation](https://caprover.com/docs/)
- [Cloudflare Documentation](https://developers.cloudflare.com/)
