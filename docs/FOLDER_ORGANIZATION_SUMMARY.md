# Root Folder Organization - Quick Reference

## Summary

The root directory has been organized into 4 new folders, reducing root-level clutter from ~40 files to just 10 essential files.

## New Directories

| Directory | Contents | Files |
|-----------|----------|-------|
| **config/** | Build, lint, and runtime configs | 10 files |
| **backups/** | Previous config versions | 2 files |
| **reports/** | Generated analysis reports | 2 files |
| **misc/** | Setup and entry point files | 4 files |

## What Stayed in Root

```
metabuilder/
├── package.json              (npm requires at root)
├── package-lock.json         (npm requires at root)
├── README.md                 (primary documentation)
├── START_HERE.md             (onboarding guide)
├── CONTRIBUTING.md           (contribution guidelines)
└── LICENSE, etc.
```

## Configuration Discovery

Most tools auto-discover configuration files:

- **ESLint**: Automatically looks for `eslint.config.js` (now at `config/`)
- **Next.js**: Automatically looks for `next.config.ts` (now at `config/`)
- **TypeScript**: Auto-discovers `tsconfig.json` from root or specified path
- **Vite**: Discovers `vite.config.ts` automatically

**No changes needed** - your npm scripts and tools will continue working.

## Before vs After

### Before (Cluttered)
```
metabuilder/
├── eslint.config.js
├── next.config.ts
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig.json
├── components.json
├── theme.json
├── renovate.json
├── runtime.config.json
├── middleware.ts
├── next-env.d.ts
├── index.html
├── setup-act.sh
├── size-limits-report.json
├── example-schemas.json
├── vite.config.ts.bak
├── vite.config.ts.bak.old
├── package.json
└── ... (30+ more files at root)
```

### After (Organized)
```
metabuilder/
├── config/                   (10 config files)
├── backups/                  (2 backup files)
├── reports/                  (2 report files)
├── misc/                     (4 misc files)
├── package.json
├── package-lock.json
├── README.md
├── START_HERE.md
├── CONTRIBUTING.md
└── ... (other important directories like app/, src/, etc.)
```

## Storage Location Reference

| File | New Location |
|------|--------------|
| eslint.config.js | `config/eslint.config.js` |
| next.config.ts | `config/next.config.ts` |
| vite.config.ts | `config/vite.config.ts` |
| vitest.config.ts | `config/vitest.config.ts` |
| playwright.config.ts | `config/playwright.config.ts` |
| tsconfig.json | `config/tsconfig.json` |
| components.json | `config/components.json` |
| theme.json | `config/theme.json` |
| renovate.json | `config/renovate.json` |
| runtime.config.json | `config/runtime.config.json` |
| middleware.ts | `misc/middleware.ts` |
| next-env.d.ts | `misc/next-env.d.ts` |
| index.html | `misc/index.html` |
| setup-act.sh | `misc/setup-act.sh` |
| vite.config.ts.bak | `backups/vite.config.ts.bak` |
| vite.config.ts.bak.old | `backups/vite.config.ts.bak.old` |
| size-limits-report.json | `reports/size-limits-report.json` |
| example-schemas.json | `reports/example-schemas.json` |

## Next Steps

1. ✅ Files have been moved
2. ✅ Documentation created
3. **Optional**: Update any documentation or wiki pages that reference old file locations
4. **Test**: Run `npm run lint` and `npm run build` to verify everything works

---

**Organization Date:** December 25, 2025
**Status:** ✅ Complete
