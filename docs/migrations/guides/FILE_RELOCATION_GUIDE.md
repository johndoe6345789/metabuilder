# Documentation File Relocation Guide

## Overview

This document provides instructions for moving all documentation files from the project root into the `/docs` folder with proper organization.

## Files to Move

### Iteration History → docs/iterations/

Move these iteration summary files:
```bash
mv COMPLETE_ITERATION_25.md docs/iterations/iteration-25-complete.md
mv ITERATION_24_SUMMARY.md docs/iterations/iteration-24-summary.md
mv ITERATION_25_SUMMARY.md docs/iterations/iteration-25-summary.md
mv ITERATION_26_SUMMARY.md docs/iterations/iteration-26-summary.md
mv THE_TRANSFORMATION.md docs/iterations/the-transformation.md
```

### Architecture Documentation → docs/architecture/

Move these architectural guides:
```bash
mv DATA_DRIVEN_ARCHITECTURE.md docs/architecture/data-driven-architecture.md
mv DECLARATIVE_COMPONENTS.md docs/architecture/declarative-components.md
mv GENERIC_PAGE_SYSTEM.md docs/architecture/generic-page-system.md
```

### Package System Documentation → docs/packages/

Move these package-related guides:
```bash
mv PACKAGE_SYSTEM.md docs/packages/package-system.md
mv PACKAGE_IMPORT_EXPORT.md docs/packages/import-export.md
mv PACKAGE_SCRIPTS_GUIDE.md docs/packages/scripts-guide.md
mv MODULAR_PACKAGES_GUIDE.md docs/packages/modular-packages-guide.md
mv MODULAR_SEED_DATA_GUIDE.md docs/packages/modular-seed-data-guide.md
mv IRC_CONVERSION_GUIDE.md docs/packages/irc-conversion-guide.md
```

### Lua Documentation → docs/lua/

Move these Lua-related guides:
```bash
mv LUA_INTEGRATION.md docs/lua/integration.md
mv LUA_SNIPPETS_GUIDE.md docs/lua/snippets-guide.md
```

### Development Guides → docs/development/

Move these development guides:
```bash
mv TYPESCRIPT_REDUCTION_GUIDE.md docs/development/typescript-reduction-guide.md
mv CRUFT_REMOVAL_REPORT.md docs/development/cruft-removal-report.md
mv IMPROVEMENTS.md docs/development/improvements.md
```

### Database Documentation → docs/database/

Move database documentation:
```bash
mv DATABASE.md docs/database/overview.md
```

### Security Documentation → docs/security/

Move security guides:
```bash
mv SECURITY_GUIDE.md docs/security/guide.md
```

### Reference Documentation → docs/reference/

Move reference materials:
```bash
mv QUICK_REFERENCE.md docs/reference/quick-reference.md
mv DOCUMENTATION_INDEX.md docs/reference/documentation-index.md
mv PLATFORM_GUIDE.md docs/reference/platform-guide.md
```

## Files to Keep in Root

TODO: This repo does not have root README/PRD/SECURITY/LIMITED files as listed; update for current structure (docs/* locations).
These files should remain in the project root:
- `README.md` - Main project readme
- `PRD.md` - Product Requirements Document
- `LICENSE` - Project license
- `SECURITY.md` - GitHub security policy

## Directory Structure After Move

TODO: Example path uses /workspaces/spark-template and root file list no longer matches this repo.

```
/workspaces/spark-template/
├── README.md (keep)
├── PRD.md (keep)
├── LICENSE (keep)
├── SECURITY.md (keep)
└── docs/
    ├── README.md (existing)
    ├── architecture/
    │   ├── data-driven-architecture.md
    │   ├── declarative-components.md
    │   └── generic-page-system.md
    ├── database/
    │   └── overview.md
    ├── development/
    │   ├── typescript-reduction-guide.md
    │   ├── cruft-removal-report.md
    │   └── improvements.md
    ├── iterations/
    │   ├── iteration-24-summary.md
    │   ├── iteration-25-summary.md
    │   ├── iteration-25-complete.md
    │   ├── iteration-26-summary.md
    │   └── the-transformation.md
    ├── lua/
    │   ├── integration.md
    │   └── snippets-guide.md
    ├── packages/
    │   ├── package-system.md
    │   ├── import-export.md
    │   ├── scripts-guide.md
    │   ├── modular-packages-guide.md
    │   ├── modular-seed-data-guide.md
    │   └── irc-conversion-guide.md
    ├── reference/
    │   ├── quick-reference.md
    │   ├── documentation-index.md
    │   └── platform-guide.md
    └── security/
        └── guide.md
```

## Bash Script for Relocation

Create and run this bash script to move all files at once:

```bash
#!/bin/bash

# Navigate to project root
cd /workspaces/spark-template

# Create directories
mkdir -p docs/iterations
mkdir -p docs/architecture
mkdir -p docs/packages
mkdir -p docs/lua
mkdir -p docs/development
mkdir -p docs/database
mkdir -p docs/security
mkdir -p docs/reference

# Move iteration history
mv COMPLETE_ITERATION_25.md docs/iterations/iteration-25-complete.md 2>/dev/null
mv ITERATION_24_SUMMARY.md docs/iterations/iteration-24-summary.md 2>/dev/null
mv ITERATION_25_SUMMARY.md docs/iterations/iteration-25-summary.md 2>/dev/null
mv ITERATION_26_SUMMARY.md docs/iterations/iteration-26-summary.md 2>/dev/null
mv THE_TRANSFORMATION.md docs/iterations/the-transformation.md 2>/dev/null

# Move architecture docs
mv DATA_DRIVEN_ARCHITECTURE.md docs/architecture/data-driven-architecture.md 2>/dev/null
mv DECLARATIVE_COMPONENTS.md docs/architecture/declarative-components.md 2>/dev/null
mv GENERIC_PAGE_SYSTEM.md docs/architecture/generic-page-system.md 2>/dev/null

# Move package docs
mv PACKAGE_SYSTEM.md docs/packages/package-system.md 2>/dev/null
mv PACKAGE_IMPORT_EXPORT.md docs/packages/import-export.md 2>/dev/null
mv PACKAGE_SCRIPTS_GUIDE.md docs/packages/scripts-guide.md 2>/dev/null
mv MODULAR_PACKAGES_GUIDE.md docs/packages/modular-packages-guide.md 2>/dev/null
mv MODULAR_SEED_DATA_GUIDE.md docs/packages/modular-seed-data-guide.md 2>/dev/null
mv IRC_CONVERSION_GUIDE.md docs/packages/irc-conversion-guide.md 2>/dev/null

# Move Lua docs
mv LUA_INTEGRATION.md docs/lua/integration.md 2>/dev/null
mv LUA_SNIPPETS_GUIDE.md docs/lua/snippets-guide.md 2>/dev/null

# Move development docs
mv TYPESCRIPT_REDUCTION_GUIDE.md docs/development/typescript-reduction-guide.md 2>/dev/null
mv CRUFT_REMOVAL_REPORT.md docs/development/cruft-removal-report.md 2>/dev/null
mv IMPROVEMENTS.md docs/development/improvements.md 2>/dev/null

# Move database docs
mv DATABASE.md docs/database/overview.md 2>/dev/null

# Move security docs
mv SECURITY_GUIDE.md docs/security/guide.md 2>/dev/null

# Move reference docs
mv QUICK_REFERENCE.md docs/reference/quick-reference.md 2>/dev/null
mv DOCUMENTATION_INDEX.md docs/reference/documentation-index.md 2>/dev/null
mv PLATFORM_GUIDE.md docs/reference/platform-guide.md 2>/dev/null

echo "✅ Documentation files moved successfully!"
echo "📁 Check the /docs directory for the organized documentation"
```

## Verification

After running the script, verify the move with:

```bash
# List root directory - should only show key files
ls -1 *.md

# Should show:
# README.md
# PRD.md
# SECURITY.md

# List docs directory structure
tree docs/ -L 2

# Should show the organized structure
```

## Update References

After moving files, you may need to update internal references in:
1. README.md links
2. PRD.md links
3. Any cross-references between documentation files

## Notes

- The `2>/dev/null` redirects suppress "file not found" errors if a file doesn't exist
- All files are renamed to lowercase with hyphens for consistency
- The directory structure provides clear categorization
- This organization matches modern documentation best practices
