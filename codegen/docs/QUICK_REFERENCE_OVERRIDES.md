# Quick Reference: npm Overrides Implementation

## ⚡ TL;DR

We replaced `--legacy-peer-deps` with npm's `overrides` feature. Just run `npm install` - no flags needed!

## 🔄 What Changed

### Before
```bash
npm install --legacy-peer-deps
npm ci # ❌ Failed in CI
```

### After
```bash
npm install  # ✅ Just works
npm ci       # ✅ Just works
```

## 📦 Package.json Changes

```json
{
  "dependencies": {
    "@github/spark": "file:./packages/spark-tools"  // Was: "workspace:*"
  },
  "overrides": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "vite": "^7.3.1"
  }
}
```

## ✅ Common Commands

| Task | Command | Notes |
|------|---------|-------|
| Install | `npm install` | No flags needed |
| Clean install | `npm ci` | Uses exact lock file versions |
| Update deps | `npm update` | Respects overrides |
| Clean slate | `rm -rf node_modules && npm install` | Nuclear option |

## 🏗️ CI/CD

All GitHub Actions workflows now use `npm ci`:

```yaml
- name: Install dependencies
  run: npm ci  # ✅ Clean and fast
```

## 🐳 Docker

Dockerfile updated to use `npm ci`:

```dockerfile
RUN npm ci  # ✅ Reproducible builds
```

## 🆘 Troubleshooting

### "Lock file out of sync"
```bash
npm install
git add package-lock.json
git commit -m "Update lock file"
```

### "Cannot find module @github/spark"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Peer dependency warnings
Check that override versions match main dependencies in `package.json`

## 📚 Full Documentation

- [DEPENDENCY_MANAGEMENT.md](./DEPENDENCY_MANAGEMENT.md) - Complete guide
- [CI_CD_FIX_OVERRIDES.md](./CI_CD_FIX_OVERRIDES.md) - CI/CD specifics
- [OVERRIDES_IMPLEMENTATION_SUMMARY.md](./OVERRIDES_IMPLEMENTATION_SUMMARY.md) - Full change log

## 🎯 Key Benefits

- ✅ No more `--legacy-peer-deps`
- ✅ CI/CD works out of the box
- ✅ Consistent dependency versions
- ✅ Faster installs
- ✅ Stable lock file

## 🔗 Quick Links

- npm overrides: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides
- npm workspaces: https://docs.npmjs.com/cli/v10/using-npm/workspaces
