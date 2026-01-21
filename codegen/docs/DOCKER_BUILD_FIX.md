# Docker Build Fix - Workspace Protocol Resolution

## Problem Summary

The Docker build was failing with the error:
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```

This occurred because:
1. The `package.json` uses `"@github/spark": "workspace:*"` to reference the local workspace package
2. npm's standard install doesn't properly resolve workspace protocols without the full workspace structure
3. The Dockerfile wasn't copying the complete workspace setup needed for proper dependency resolution

## Solution Implemented

### 1. Updated Dockerfile

The Dockerfile now properly handles npm workspaces:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace configuration and all package files
COPY package*.json ./

# Copy spark-tools package (the actual @github/spark implementation)
COPY packages/spark-tools/package.json ./packages/spark-tools/package.json
COPY packages/spark-tools/dist ./packages/spark-tools/dist

# Copy spark wrapper package
COPY packages/spark/package.json ./packages/spark/package.json
COPY packages/spark/src ./packages/spark/src
COPY packages/spark/tsconfig.json ./packages/spark/tsconfig.json

# Install dependencies using npm workspaces
RUN npm install --workspaces --include-workspace-root

# Copy remaining application files
COPY . .

# Build the application
RUN npm run build
```

**Key changes:**
- Copies the complete workspace structure (both `packages/spark` and `packages/spark-tools`)
- Uses `npm install --workspaces --include-workspace-root` to properly resolve workspace dependencies
- Includes the pre-built `dist` folder from `spark-tools` (required for the build)

### 2. Updated .dockerignore

Modified to exclude build artifacts but preserve the essential `spark-tools/dist`:

```
node_modules
npm-debug.log
.git
.github
*.md
!README.md

# Keep the dist folder in packages/spark-tools (needed for build)
!packages/spark-tools/dist
```

### 3. Updated GitHub Actions Workflows

All npm install commands in `.github/workflows/ci.yml` now use:
```bash
npm install --workspaces --legacy-peer-deps
```

This ensures:
- Proper workspace resolution in CI
- Consistent behavior between local development and CI
- Avoids peer dependency conflicts

## Why This Works

1. **Workspace Protocol**: npm workspaces require the full workspace structure to resolve `workspace:*` dependencies
2. **Pre-built Assets**: The `spark-tools/dist` folder contains the compiled @github/spark package that the main app depends on
3. **Consistent Commands**: Using `--workspaces` flag ensures npm properly links local packages

## Testing the Fix

### Local Docker Build
```bash
docker build -t codeforge:test .
```

### GitHub Actions
The fix will automatically apply when you push to main or develop branches. The workflow will:
1. Install dependencies with workspace support
2. Build the Docker image using the updated Dockerfile
3. Push to GitHub Container Registry

## Alternative Solutions Considered

1. **Remove workspace protocol**: Replace `workspace:*` with file paths - rejected because it breaks the monorepo structure
2. **Use pnpm**: Better workspace support - rejected because it requires changing the entire toolchain
3. **Flatten dependencies**: Copy spark into node_modules - rejected because it's a workaround, not a fix

## Maintenance Notes

- Always ensure `packages/spark-tools/dist` is built before creating Docker images
- If you modify workspace structure, update the Dockerfile COPY commands accordingly
- The `--legacy-peer-deps` flag may be removed once all peer dependencies are resolved
