# Troubleshooting Guide

## Common Errors and Solutions

### Vite Module Resolution Error

**Error Message:**
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

**Cause:** This error occurs when npm's workspace dependencies are not properly resolved or the node_modules cache is corrupted.

**Solutions:**

1. **Quick Fix (Recommended):**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Alternative Fix:**
   ```bash
   npm clean-install
   ```

3. **If using npm workspaces:**
   ```bash
   npm install --force
   ```

4. **For persistent issues:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove all modules
   rm -rf node_modules package-lock.json
   rm -rf packages/*/node_modules
   
   # Reinstall
   npm install
   ```

### TypeScript Duplicate Export Errors

**Error:** Ambiguous re-exports of `StatCard`, `EmptyState`, or `LoadingState`

**Solution:** Already fixed in `src/components/index.ts` - exports are now explicitly separated to avoid naming conflicts.

### Build/CI Errors

#### npm ci fails with workspace protocol

**Error:** `Unsupported URL Type "workspace:": workspace:*`

**Solution:** The `package.json` uses `file:./packages/spark-tools` instead of `workspace:*` protocol. This is already configured correctly.

### E2E Test Errors

#### Playwright not found

**Error:** `sh: 1: playwright: not found`

**Solution:** Run `npx playwright install` or update the test script to use `npx`:
```json
"test:e2e": "npx playwright test"
```

#### Timeout waiting for webServer

**Error:** `Timed out waiting 180000ms from config.webServer`

**Solution:** Check that:
1. Port 5000 is available
2. Vite dev server starts successfully
3. Increase timeout in `playwright.config.ts` if needed

### Docker Build Errors

#### workspace protocol not supported

**Fix Applied:** Dockerfile uses `npm install` instead of `npm ci`

### Preview Mode Issues (Codespaces)

#### 502 Bad Gateway errors

**Cause:** Dev server not bound to external interface or wrong port

**Solution:**
1. Ensure `vite.config.ts` has:
   ```typescript
   server: {
     host: '0.0.0.0',
     port: 5000,
   }
   ```
2. Forward port 5000 in Codespaces
3. Use the forwarded URL, not localhost

### SASS/CSS Warnings

Warnings about unknown at-rules (`@include respond-to`) are expected - they're processed by Sass before Tailwind sees them.

### Linting Issues

Run `npm run lint` to automatically fix most linting issues.

For manual fixes:
- Empty blocks: Add a comment or remove the block
- Unused variables: Prefix with underscore `_variableName` or remove

## Development Tips

### Fast Refresh Not Working

1. Ensure all components are exported as named exports
2. Check that files are within the `src` directory
3. Restart the dev server

### Slow Build Times

The app uses code splitting and lazy loading. First build may be slow, but subsequent builds are faster.

### Memory Issues

If you encounter memory errors during build:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## Getting Help

1. Check this document first
2. Review error logs carefully
3. Try the quick fixes above
4. Check GitHub Actions logs for CI issues
5. Ensure all dependencies are up to date
