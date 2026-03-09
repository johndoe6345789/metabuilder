# CI/CD Quick Reference

## Working with npm Workspaces

This project uses npm workspaces to manage the `@github/spark` monorepo package. Always use the correct install command:

### ✅ Correct Commands

```bash
# Local development
npm install --workspaces --legacy-peer-deps

# CI/CD (already configured in workflows)
npm install --workspaces --legacy-peer-deps

# Docker builds (already configured in Dockerfile)
npm install --workspaces --include-workspace-root
```

### ❌ Commands to Avoid

```bash
# Will fail with workspace protocol error
npm ci

# Will not properly link workspace packages
npm install
```

## Docker Build

### Build Locally
```bash
docker build -t codeforge:local .
```

### Test Locally
```bash
docker run -p 8080:80 codeforge:local
# Open http://localhost:8080
```

### Prerequisites
- Ensure `packages/spark-tools/dist` exists and is built
- If missing, run: `cd packages/spark-tools && npm run build`

## GitHub Actions Status

All workflows are configured to use workspace-aware commands:

- ✅ **ci.yml** - Main CI/CD pipeline
- ✅ **e2e-tests.yml** - End-to-end tests
- ✅ **release.yml** - Release automation

## Troubleshooting

### "Unsupported URL Type: workspace:"
**Cause**: Using `npm ci` or `npm install` without workspace flags

**Fix**: Use `npm install --workspaces --legacy-peer-deps`

### Docker build fails with dependency errors
**Cause**: Missing `packages/spark-tools/dist` folder

**Fix**: 
```bash
cd packages/spark-tools
npm install
npm run build
cd ../..
```

### Peer dependency conflicts
**Cause**: React 19 and some packages have peer dependency mismatches

**Fix**: Always use `--legacy-peer-deps` flag (already in all workflows)

## Common Tasks

### Add a new dependency
```bash
npm install <package> --workspaces --legacy-peer-deps
```

### Update dependencies
```bash
npm update --workspaces --legacy-peer-deps
```

### Clean install (reset node_modules)
```bash
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
npm install --workspaces --legacy-peer-deps
```

### Build for production
```bash
npm run build
```

### Run locally
```bash
npm run dev
```

## Links

- [Docker Build Fix Documentation](./DOCKER_BUILD_FIX.md)
- [Main CI/CD Workflow](./.github/workflows/ci.yml)
- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
