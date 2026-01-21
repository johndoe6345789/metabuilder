# CI/CD Quick Fix Guide

This document provides quick solutions for common CI/CD issues in this project.

## Quick Start - Running CI/CD Locally

```bash
# Install dependencies (use --legacy-peer-deps for workspace: protocol)
npm install --legacy-peer-deps

# Run all CI checks
npm run lint          # ESLint with auto-fix
npx tsc --noEmit      # TypeScript type checking
npm run build         # Build the application

# Run E2E tests (requires dev server)
npm run test:e2e

# Build Docker image
docker build -t codeforge:local .
docker run -p 3000:80 codeforge:local
```

## Common Issues and Fixes

### 1. "npm ci" fails with workspace: protocol

**Symptom**: `npm error code EUNSUPPORTEDPROTOCOL` or `npm ci` fails with workspace dependencies

**Solution**: Use `npm install --legacy-peer-deps` instead of `npm ci`:
```bash
npm install --legacy-peer-deps
```

All CI/CD workflows have been updated to use this command.

### 2. "Cannot find module '@github/spark'"

**Symptom**: Import errors for `@github/spark`

**Solution**: The spark package is workspace dependency. Run:
```bash
npm install --legacy-peer-deps
```

### 3. "ESLint couldn't find an eslint.config.js file"

**Symptom**: ESLint fails with config not found

**Solution**: The project now uses ESLint v9 flat config format. File is at `eslint.config.js`.

### 4. "Property 'spark' does not exist on type 'Window'"

**Symptom**: TypeScript errors about window.spark

**Solution**: Type definitions are in `packages/spark/src/types.d.ts` and auto-imported. Run:
```bash
npx tsc --noEmit
```

Should show 0 errors.

### 5. "Unknown file extension .ts for vite plugin"

**Symptom**: Vite can't load TypeScript plugin files

**Solution**: Plugins are TypeScript files and compiled to dist:
- `packages/spark-tools/src/sparkVitePlugin.ts`
- `packages/spark-tools/src/vitePhosphorIconProxyPlugin.ts`

### 6. Docker Build Fails at npm run build

**Symptom**: "devDependencies not found" or workspace protocol errors during Docker build

**Solution**: Dockerfile uses `npm install` (not `npm ci`). Rebuild:
```bash
docker build -t codeforge:latest .
```

### 7. Build warns about large chunks (>500kB)

**Symptom**: Vite build completes but shows warnings about chunk sizes

**Solution**: This is a warning, not an error. The app works fine. To optimize:
- Enable code splitting in vite.config.ts
- Use dynamic imports for large components
- Configure manual chunks in rollup options

The warning can be safely ignored for now.

## Auto-Fix Lint Issues

The lint command now includes auto-fix by default:

```bash
npm run lint        # Runs with --fix
npm run lint:check  # Check only, no auto-fix (for CI)
```

## Package Structure

```
/
├── packages/
│   └── spark/              # @github/spark workspace package
│       ├── src/
│       │   ├── hooks/
│       │   │   └── index.ts           # useKV hook
│       │   ├── spark-runtime.ts        # Core runtime
│       │   ├── spark.ts                # Initialization module
│       │   ├── types.d.ts              # TypeScript definitions
│       │   ├── spark-vite-plugin.mjs   # Vite plugin
│       │   └── vitePhosphorIconProxyPlugin.mjs
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
├── src/                    # Application source
├── e2e/                    # Playwright E2E tests
├── eslint.config.js        # ESLint v9 flat config
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose setup
└── .github/workflows/      # GitHub Actions CI/CD

```

## CI/CD Workflow Commands

### GitHub Actions
```yaml
- npm install --legacy-peer-deps  # Install dependencies
- npm run lint                     # Lint with auto-fix
- npx tsc --noEmit                 # Type check
- npm run build                    # Build application
- npm run test:e2e                 # E2E tests
```

### Local Development
```bash
npm run dev                        # Start dev server
npm run preview                    # Preview production build
npm run lint                       # Lint with auto-fix
npm run build                      # Production build
```

## Environment Variables

No environment variables required for build. All configuration is in:
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - Linting configuration
- `playwright.config.ts` - E2E test configuration

## Debugging Build Issues

### Enable Verbose Logging
```bash
npm run build -- --debug
```

### Check TypeScript Compilation
```bash
npx tsc --noEmit --listFiles | grep error
```

### Check Bundle Size
```bash
npm run build
ls -lh dist/assets/
```

### Test Production Build Locally
```bash
npm run build
npm run preview
# Visit http://localhost:4173
```

## Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all to latest compatible versions
npm update

# Update package-lock.json
npm install
```

## Troubleshooting Workspace

If workspace dependencies cause issues:

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
npm install --legacy-peer-deps

# Verify workspace is linked
ls -la node_modules/@github/
# Should show: spark -> ../../packages/spark-tools
```

## CI/CD Platform-Specific Notes

### GitHub Actions
- Uses Node.js 20.x
- Caches node_modules automatically
- Runs on ubuntu-latest
- Docker builds push to GHCR

### GitLab CI
- Uses node:20-alpine image
- Manual cache configuration required
- Supports parallel stages
- Docker builds push to GitLab Registry

### Jenkins
- Requires Node.js 20 installation configured
- Uses NodeJS plugin
- Needs Docker plugin for builds
- Manual workspace cleanup

### CircleCI
- Uses cimg/node:20.11 executor
- Docker layer caching available (paid)
- Requires environment variables for secrets
- Workflow dependencies via `requires`

## Performance Tips

1. **Faster npm install**: Use `npm install --legacy-peer-deps` for workspace dependencies
2. **Cache dependencies**: All CI configs include caching
3. **Parallel jobs**: Use where available (lint + test)
4. **Skip optional deps**: Not needed for this project
5. **Docker layer caching**: Enable in CI for faster builds

## Verified Working Commands

All CI/CD pipelines have been updated and tested with these commands:

```bash
# Install (required for workspace: protocol)
npm install --legacy-peer-deps

# Lint
npm run lint

# Type check  
npx tsc --noEmit

# Build
npm run build

# The build produces these warnings (safe to ignore):
# - "Some chunks are larger than 500 kB" - code splitting can be added later
# - Bundle size warnings - app works fine, optimization is future work
```

## Getting Help

1. Check `CI_CD_SIMULATION_RESULTS.md` for detailed test results
2. Check `CI_CD_GUIDE.md` for platform-specific setup
3. Review workflow files in `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/config.yml`
4. Check build logs for specific error messages

## Verification Checklist

Before pushing to CI, verify locally:

- [ ] `npm install --legacy-peer-deps` - Completes without errors
- [ ] `npm run lint` - No errors (warnings OK)
- [ ] `npx tsc --noEmit` - 0 errors
- [ ] `npm run build` - Generates dist/ folder (warnings about chunk size OK)
- [ ] `npm run preview` - App loads at http://localhost:4173
- [ ] Git status clean (no uncommitted changes)

## Quick Reference

| Command | Purpose | Duration |
|---------|---------|----------|
| `npm install --legacy-peer-deps` | Install all dependencies | ~15s |
| `npm run lint` | ESLint with auto-fix | ~3s |
| `npx tsc --noEmit` | Type checking | ~5s |
| `npm run build` | Production build | ~8s |
| `npm run test:e2e` | E2E tests | ~30s |
| `docker build` | Docker image | ~2min |

---

**Last Updated**: 2026-01-17  
**Project**: CodeForge Low-Code React App Builder  
**CI/CD Status**: ✅ FIXED - All workflows updated for workspace: protocol
