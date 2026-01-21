# CapRover/Cloudflare Deployment Checklist

Quick reference guide for deploying CodeForge to CapRover with Cloudflare.

## Pre-Deployment

- [ ] CapRover server is running and accessible
- [ ] Domains registered and pointing to Cloudflare nameservers
- [ ] Docker is installed locally (for testing builds)
- [ ] Git repository is ready for deployment

## Frontend Deployment

### 1. Configuration
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Update `VITE_BACKEND_URL` with your backend domain
- [ ] Update `VITE_USE_BACKEND=true` if using backend

### 2. CapRover App Setup
- [ ] Create new app: `codeforge-frontend`
- [ ] Enable HTTPS in CapRover app settings
- [ ] Connect custom domain: `frontend.example.com`
- [ ] Configure environment variables (if any)

### 3. Deploy
- [ ] Push code to Git repository
- [ ] Deploy via CapRover (Git/Registry/Upload)
- [ ] Wait for build to complete
- [ ] Check build logs for errors

### 4. Verify
- [ ] Visit `https://frontend.example.com`
- [ ] Check browser console for errors
- [ ] Verify assets load correctly
- [ ] Test app functionality

## Backend Deployment

### 1. Configuration
- [ ] Copy `backend/.env.production.example` to `backend/.env.production`
- [ ] Update `ALLOWED_ORIGINS` with frontend domains
- [ ] Set `DEBUG=false` for production
- [ ] Configure `DATABASE_PATH=/data/codeforge.db`

### 2. CapRover App Setup
- [ ] Create new app: `codeforge-backend`
- [ ] Enable HTTPS in CapRover app settings
- [ ] Connect custom domain: `backend.example.com`
- [ ] Add environment variables:
  - [ ] `ALLOWED_ORIGINS=https://frontend.example.com`
  - [ ] `PORT=5001`
  - [ ] `DATABASE_PATH=/data/codeforge.db`
  - [ ] `DEBUG=false`
- [ ] Configure persistent volume:
  - [ ] Container path: `/data`
  - [ ] Label: `backend-data`

### 3. Deploy
- [ ] Deploy backend via CapRover
- [ ] Wait for build to complete
- [ ] Check build logs for errors

### 4. Verify
- [ ] Visit `https://backend.example.com/health`
- [ ] Should return: `{"status": "ok", "timestamp": "..."}`
- [ ] Test API endpoint: `https://backend.example.com/api/storage/keys`
- [ ] Check response includes CORS headers

## Cloudflare Configuration

### DNS
- [ ] Add A record for frontend pointing to CapRover server IP
- [ ] Add A record for backend pointing to CapRover server IP
- [ ] Enable proxy (orange cloud) for both records

### SSL/TLS
- [ ] Set encryption mode to "Full (strict)" or "Full"
- [ ] Enable "Always Use HTTPS"
- [ ] Enable HSTS (optional but recommended)
- [ ] Set minimum TLS version to 1.2

### Speed & Caching
- [ ] Enable Auto Minify (JS, CSS, HTML)
- [ ] Enable Brotli compression
- [ ] Disable Rocket Loader (can break SPA)
- [ ] Configure page rules:
  - [ ] Backend API: Cache Level = Bypass
  - [ ] Frontend: Cache Level = Standard
  - [ ] Frontend Assets: Cache Everything, TTL = 1 month

### Security
- [ ] Set security level to "Medium"
- [ ] Disable "Browser Integrity Check" for backend
- [ ] Configure firewall rules (if needed)
- [ ] Set up rate limiting (optional)

### Health Checks
- [ ] Add health check for frontend: `https://frontend.example.com/health`
- [ ] Add health check for backend: `https://backend.example.com/health`

## Testing

### CORS Testing
```bash
# Test backend CORS
curl -X OPTIONS https://backend.example.com/api/storage/keys \
  -H "Origin: https://frontend.example.com" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Expected: Access-Control-Allow-Origin header in response
```

### SSL Testing
```bash
# Test SSL
curl -I https://frontend.example.com
curl -I https://backend.example.com

# Expected: HTTP/2 200 with security headers
```

### Functionality Testing
- [ ] Open frontend in browser
- [ ] Open DevTools → Network tab
- [ ] Test creating/reading/updating data
- [ ] Verify API calls to backend succeed
- [ ] Check for CORS errors in console
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices

### Performance Testing
- [ ] Run Lighthouse audit on frontend
- [ ] Check page load times
- [ ] Verify assets are cached (cf-cache-status: HIT)
- [ ] Test from multiple geographic locations

## Post-Deployment

### Monitoring
- [ ] Set up Cloudflare alerts for downtime
- [ ] Monitor CapRover logs for errors
- [ ] Check health endpoints regularly
- [ ] Review Cloudflare Analytics

### Backups
- [ ] Verify database backups are working
- [ ] Test database restore procedure
- [ ] Export project data via API
- [ ] Document backup schedule

### Documentation
- [ ] Document custom configuration
- [ ] Update team on deployment URLs
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

## Rollback Procedure

If deployment fails:

1. [ ] Check CapRover logs for errors
2. [ ] Review Cloudflare Firewall events
3. [ ] Disable Cloudflare proxy temporarily (gray cloud)
4. [ ] Test direct connection to CapRover server
5. [ ] Revert to previous Docker image
6. [ ] Re-enable Cloudflare proxy after fix

## Common Issues

### Frontend loads but API calls fail
- Check CORS configuration in backend
- Verify `ALLOWED_ORIGINS` environment variable
- Check Cloudflare firewall isn't blocking requests
- Verify backend domain is accessible

### 502/520 Errors
- Check CapRover app is running
- Verify SSL certificates are valid
- Check Cloudflare SSL mode (should be Full or Full Strict)
- Verify origin server accepts connections on port 443

### Assets not loading
- Check nginx configuration is correct
- Verify Vite build completed successfully
- Check Cloudflare caching rules
- Purge Cloudflare cache and retry

### Database not persisting
- Verify persistent volume is mounted
- Check `DATABASE_PATH` environment variable
- Verify `/data` directory has write permissions
- Check CapRover volume configuration

## Quick Reference

### Frontend URL
```
https://frontend.example.com
```

### Backend URL
```
https://backend.example.com
```

### Health Endpoints
```
Frontend: https://frontend.example.com/health
Backend:  https://backend.example.com/health
```

### API Base URL
```
https://backend.example.com/api
```

### CapRover Apps
```
Frontend: codeforge-frontend
Backend:  codeforge-backend
```

## Support Resources

- **CapRover Docs**: https://caprover.com/docs/
- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Project Docs**: `/docs/CAPROVER_CLOUDFLARE_DEPLOYMENT.md`
- **Cloudflare Config**: `/docs/CLOUDFLARE_CONFIGURATION.md`

## Emergency Contacts

Document your team's contact information:

- DevOps Lead: _____________
- Backend Developer: _____________
- Frontend Developer: _____________
- CapRover Admin: _____________

---

**Last Updated**: [Date]
**Deployed By**: [Name]
**Deployment Date**: [Date]
