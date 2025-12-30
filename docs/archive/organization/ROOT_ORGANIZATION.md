# Root Folder Organization

The root directory has been reorganized into logical groups for better maintainability and clarity.

## Directory Structure

```
metabuilder/
├── config/                        # All configuration files
│   ├── eslint.config.js          # ESLint rules
│   ├── next.config.ts            # Next.js configuration
│   ├── playwright.config.ts       # Playwright E2E configuration
│   ├── vite.config.ts            # Vite build configuration
│   ├── vitest.config.ts          # Vitest testing configuration
│   ├── tsconfig.json             # TypeScript configuration
│   ├── components.json           # Component registry
│   ├── renovate.json             # Dependency management
│   ├── runtime.config.json       # Runtime configuration
│   └── theme.json                # Theme configuration
│
├── backups/                       # Backup files
│   ├── vite.config.ts.bak        # Vite config backup
│   └── vite.config.ts.bak.old    # Vite config old backup
│
├── reports/                       # Generated reports
│   ├── size-limits-report.json   # Bundle size analysis
│   └── example-schemas.json      # Example data schemas
│
├── misc/                          # Miscellaneous setup files
│   ├── middleware.ts             # Next.js middleware
│   ├── next-env.d.ts             # Next.js type definitions
│   ├── setup-act.sh              # GitHub Actions setup
│   └── index.html                # HTML entry point
│
├── package.json                  # Project dependencies (keep in root)
├── package-lock.json             # Locked dependencies (keep in root)
├── README.md                      # Main documentation (keep in root)
├── START_HERE.md                  # Getting started guide (keep in root)
├── CONTRIBUTING.md               # Contribution guidelines (keep in root)
│
└── [Other directories...]
    ├── app/                       # Next.js app directory
    ├── src/                       # TypeScript source
    ├── dbal/                      # Database abstraction layer
    ├── packages/                  # Package modules
    └── ...
```

## Organization Rationale

### Config Directory (`/config`)
All project configuration files are centralized for easy access and management. This includes:
- Build tools (Vite, Vitest, Next.js)
- Linting (ESLint)
- Testing (Playwright)
- Runtime settings

### Backups Directory (`/backups`)
Old configuration versions are preserved for reference and rollback capability.

### Reports Directory (`/reports`)
Generated analysis reports are separated from source code, reducing root-level clutter.

### Misc Directory (`/misc`)
Setup and entry point files that don't fit other categories are grouped here.

### Root Level (Preserved)
Essential project files remain at root:
- `package.json` & `package-lock.json` - npm requires these at root
- `README.md` - primary documentation
- `START_HERE.md` - onboarding guide
- `CONTRIBUTING.md` - contribution guidelines

## Update Notes

When using these tools, remember to reference the new paths:

**Before:**
```bash
npm run lint  # Uses eslint.config.js (at root)
```

**Now:**
```bash
npm run lint  # ESLint finds config automatically
# Config is at: config/eslint.config.js
```

The tools automatically discover configuration files, so most workflows continue without changes. However, explicit path references in documentation or scripts should be updated to point to the `config/` folder.

## Migration Status

- ✅ Configuration files moved to `config/`
- ✅ Backup files moved to `backups/`
- ✅ Report files moved to `reports/`
- ✅ Misc files moved to `misc/`
- ⚠️ Documentation references may need updates (manual review recommended)

---

**Date Organized:** December 25, 2025
