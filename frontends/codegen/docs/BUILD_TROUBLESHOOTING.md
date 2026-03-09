# Build Troubleshooting Guide

## Common Build Issues

### "cp: cannot create regular file '/tmp/dist/proxy.js': No such file or directory"

**Symptoms:**
- Build completes successfully with all assets generated in `dist/` folder
- Final line shows error: `cp: cannot create regular file '/tmp/dist/proxy.js': No such file or directory`
- Message "Copying extra files..." appears before the error

**Root Cause:**
This error occurs when the Spark runtime build orchestration system attempts to copy runtime proxy files to a temporary directory that doesn't exist. This is an external post-build step that happens AFTER the Vite build completes successfully.

**Impact:**
- **Low to None**: The actual application build succeeds completely
- All application assets are correctly generated in the `dist/` folder
- The error occurs during optional runtime file copying
- The built application will function normally

**Solutions:**

1. **Ignore the error** (Recommended for development):
   - The Vite build succeeded and generated all necessary files
   - The `dist/` folder contains a complete, working build
   - This error does not affect application functionality

2. **Fix for CI/CD pipelines**:
   - Ensure the CI/CD system creates the `/tmp/dist/` directory before building
   - Add to your CI/CD workflow:
     ```yaml
     - name: Pre-build setup
       run: mkdir -p /tmp/dist
     ```

3. **Fix for local builds**:
   - Create the directory manually:
     ```bash
     mkdir -p /tmp/dist
     npm run build
     ```

**Related Files:**
- Build output: `dist/` (application build - this is what matters)
- Runtime proxy: `packages/spark-tools/dist/runtimeProxy.js`
- Vite config: `vite.config.ts`

### Successful Build Indicators

Even with the proxy.js copying error, your build is successful if you see:

✓ All these asset files in `dist/`:
  - `index.html`
  - `assets/index-*.js` (main bundle)
  - `assets/react-vendor-*.js`
  - `assets/ui-core-*.js`
  - `assets/*.css`
  - And other chunked assets

✓ Message: `✓ built in X.XXs`

✓ No TypeScript compilation errors

## Other Common Issues

### TypeScript Compilation Errors

If you see TypeScript errors during build:
```bash
npm run build
```

Fix by addressing the specific TypeScript errors shown, or temporarily bypass with:
```bash
npm run build -- --force
```

### Out of Memory Errors

If Node.js runs out of memory during build:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Vite Port Already in Use (Dev Server)

```bash
npm run kill  # Kills process on port 5000
npm run dev
```

### Missing Dependencies

```bash
npm install --legacy-peer-deps
```

## Build Performance

Current build produces:
- **Main bundle**: ~474 KB (148 KB gzipped)
- **React vendor**: Separated chunk
- **UI components**: Split into core and extended chunks
- **Icons**: ~241 KB (55 KB gzipped)
- **Total build time**: ~16s

Code splitting ensures users only download what they need for each route.
