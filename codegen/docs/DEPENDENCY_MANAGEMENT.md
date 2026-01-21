# Dependency Management Guide

## Overview

This project uses npm workspaces with custom overrides configuration to manage dependencies without requiring `--legacy-peer-deps`.

## Key Changes

### 1. Workspace Protocol Replacement

**Before:**
```json
"@github/spark": "workspace:*"
```

**After:**
```json
"@github/spark": "file:./packages/spark-tools"
```

**Why:** The `workspace:*` protocol is not supported by standard npm in CI/CD environments. Using `file:` protocol ensures compatibility across all npm versions and build contexts.

### 2. Dependency Overrides

The `overrides` field forces consistent versions across all dependencies, eliminating peer dependency conflicts:

```json
"overrides": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@types/react": "^19.0.10",
  "@types/react-dom": "^19.0.4",
  "vite": "^7.3.1",
  "@github/spark": {
    "react": "^19.0.0",
    "vite": "^7.3.1"
  },
  "@local/spark-wrapper": {
    "react": "^19.0.0"
  }
}
```

## Benefits

1. **No More `--legacy-peer-deps`**: Overrides resolve peer dependency conflicts automatically
2. **CI/CD Compatible**: Works with standard `npm ci` in GitHub Actions and other CI systems
3. **Version Consistency**: Ensures all packages use the same React and Vite versions
4. **Monorepo Support**: Maintains workspace functionality while improving compatibility

## Installation

### Local Development
```bash
npm install
```

### CI/CD
```bash
npm ci
```

Both commands now work without additional flags.

## Troubleshooting

### Lock File Out of Sync

If you see "lock file out of sync" errors in CI:

```bash
# Locally run:
npm install

# Commit the updated package-lock.json:
git add package-lock.json
git commit -m "Update lock file"
git push
```

### Peer Dependency Warnings

If you still see peer dependency warnings:

1. Check that the override versions match your main dependency versions
2. Update the override to match the required version
3. Run `npm install` to regenerate the lock file

### Workspace Package Not Found

If the workspace package isn't found:

1. Verify the path in the `file:` reference is correct
2. Ensure the workspace package has a valid `package.json`
3. Run `npm install` to rebuild workspace links

## Architecture

```
spark-template/
├── package.json (root with overrides)
├── packages/
│   ├── spark/ (@local/spark-wrapper)
│   └── spark-tools/ (@github/spark)
└── node_modules/
    └── @github/spark → ../packages/spark-tools
```

## References

- [npm overrides documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides)
- [npm workspaces documentation](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [file: protocol specification](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#local-paths)
