# 502 Bad Gateway Error Fix Guide

## Problem Summary

You're experiencing multiple related issues:

1. **502 Bad Gateway errors** - Vite dev server not accessible
2. **Port mismatch** - Server configured for port 5173, but Codespaces URL uses port 5000
3. **CI/CD failures** - workspace dependencies causing `npm ci` to fail
4. **Resource loading errors** - MIME type mismatches due to dev server being unreachable

## Root Causes

### 1. Port Mismatch (FIXED)
- **Problem**: Vite was configured to run on port 5173, but your Codespaces forwarded URL expects port 5000
- **Solution**: Updated `vite.config.ts` to use port 5000
- **Status**: ✅ FIXED

### 2. Workspace Dependencies Issue
- **Problem**: `package.json` uses `"@github/spark": "workspace:*"` which `npm ci` doesn't support
- **Impact**: CI/CD pipelines fail with `EUNSUPPORTEDPROTOCOL` error
- **Solutions**:
  - **Option A**: Use `npm install` instead of `npm ci` (loses lockfile validation)
  - **Option B**: Switch to `pnpm` (better workspace support)
  - **Option C**: Remove workspace protocol and use version numbers (breaks local development)

### 3. Server Not Running
- **Problem**: Dev server may not be started or may have crashed
- **Solution**: Ensure `npm run dev` is running in Codespaces terminal

## Quick Fix Steps

### Step 1: Restart the Dev Server
```bash
# Kill any existing processes on port 5000
npm run kill

# Start the dev server
npm run dev
```

The server should now start on port 5000 and bind to `0.0.0.0` (accessible externally).

### Step 2: Verify Port Forwarding
1. Open the **Ports** panel in VS Code/Codespaces
2. Verify that port **5000** is listed and forwarded
3. If not listed, the server isn't running - check Step 1
4. Click the globe icon to open the forwarded URL

### Step 3: Fix CI/CD (Choose One Option)

#### Option A: Use `npm install` (Quick Fix)
Update `.github/workflows/ci.yml` to replace all `npm ci` with `npm install`.

**Pros**: Works immediately with workspace dependencies
**Cons**: Doesn't validate lockfile, potentially slower

#### Option B: Switch to pnpm (Recommended)
1. Add pnpm setup to workflows:
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm install
```

2. Update all `npm` commands to `pnpm`
3. Commit `pnpm-lock.yaml` instead of `package-lock.json`

**Pros**: Native workspace support, faster, more reliable
**Cons**: Requires workflow updates

#### Option C: Remove Workspace Protocol (Not Recommended)
Change `package.json`:
```json
"@github/spark": "1.0.0"
```

**Pros**: Works with `npm ci`
**Cons**: Breaks local monorepo setup, requires manual version syncing

## Expected Results After Fix

### Dev Server (Local/Codespaces)
```
  VITE v7.3.1  ready in 1234 ms

  ➜  Local:   http://localhost:5000/
  ➜  Network: http://0.0.0.0:5000/
  ➜  press h + enter to show help
```

### Browser Console
- No 502 errors
- Vite client loads successfully
- React app renders properly
- HMR (Hot Module Replacement) works

### CI/CD Pipeline
- `npm install` (or `pnpm install`) succeeds
- Build completes without errors
- Tests run successfully

## Troubleshooting

### Still Getting 502 Errors?

1. **Check if server is running**:
   ```bash
   lsof -i :5000
   # Should show node/vite process
   ```

2. **Check server logs**:
   - Look for errors in terminal where `npm run dev` is running
   - Common issues: port conflicts, missing dependencies, syntax errors

3. **Verify network binding**:
   - Ensure vite.config.ts has `host: '0.0.0.0'`
   - Localhost-only binding (`127.0.0.1`) won't work in Codespaces

4. **Check Codespaces port visibility**:
   - In Ports panel, ensure port 5000 is set to "Public" or "Private to Organization"
   - "Private" (local only) won't work from browser

### MIME Type Errors?

These are usually secondary to 502 errors. Once the dev server is accessible:
- Vite serves files with correct MIME types
- `@vite/client` loads as JavaScript
- `.css` files load as stylesheets
- HMR works properly

If MIME errors persist after fixing 502s, check:
- `index.html` for incorrect `<link>` or `<script>` tags
- Vite config for asset handling issues

## Files Changed

- ✅ `vite.config.ts` - Changed port from 5173 to 5000
- ⏳ `.github/workflows/ci.yml` - Needs update for workspace dependencies
- ⏳ `.github/workflows/e2e-tests.yml` - May need similar updates

## Next Steps

1. **Immediate**: Restart dev server with `npm run dev`
2. **Short-term**: Test and verify app loads in browser
3. **Medium-term**: Fix CI/CD pipeline (choose Option A or B above)
4. **Long-term**: Consider migrating fully to pnpm for better monorepo support

## Additional Resources

- [Vite Server Options](https://vitejs.dev/config/server-options.html)
- [GitHub Codespaces Port Forwarding](https://docs.github.com/en/codespaces/developing-in-codespaces/forwarding-ports-in-your-codespace)
- [pnpm Workspace Protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
