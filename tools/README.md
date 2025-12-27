# Scripts Directory

This directory contains utility scripts for development, testing, database management, and quality assurance.

## 📋 Overview

Scripts organized by function:

### Quality & Documentation

- **`doc-quality-checker.sh`** - Documentation quality assessment tool (0-100% scoring)

### Database

- **`migrate-to-prisma.sh`** - Migrate existing database to Prisma ORM
- **`migrate-to-prisma.cjs`** - CJS-based migration utility
- **`setup-packages.cjs`** - Initialize package structure
- **`generate-package-index.cjs`** - Build `packages/index.json` from package metadata
- **`generate-mega-seed.cjs`** - Generate large forum seed data for demos

### Testing & Deployment

- **`run-act.sh`** - Run GitHub Actions workflows locally
- **`test-workflows.sh`** - Validate workflow definitions

### Debugging

- **`diagnose-workflows.sh`** - Diagnose workflow issues
- **`capture-screenshot.ts`** - Capture UI screenshots

### Refactors & Analysis

- **`analysis/function_isolation_refactor.py`** - Build one-function-per-file refactor plans for TypeScript/C++ and generate TODO stub files with intentional errors for later cleanup.

### Project Management

- **`project-management/populate-kanban.py`** - Populate GitHub project board from TODO files

## 🚀 Common Tasks

### Populate GitHub Project Kanban

```bash
# Preview what issues would be created
python3 tools/project-management/populate-kanban.py --dry-run --limit 10

# Create all issues and add to project board
gh auth login  # First time only
python3 tools/project-management/populate-kanban.py --create --project-id 2
```

See [project-management/README.md](project-management/README.md) for detailed documentation.

### Check Documentation Quality

```bash
# Basic check
./scripts/doc-quality-checker.sh /workspaces/metabuilder

# Detailed output
./scripts/doc-quality-checker.sh /workspaces/metabuilder true
```

Returns:
- README Coverage (%)
- Documentation Structure (%)
- Code Comments (%)
- JSDoc Coverage (%)
- Type Annotations (%)
- Examples/Guides (%)
- Architecture Docs (%)
- Security Docs (%)
- **Overall Quality Score & Recommendations**

Quality Rating:
- 90-100%: Excellent
- 80-89%: Good
- 70-79%: Fair
- 60-69%: Poor
- 0-59%: Very Poor

### Run GitHub Actions Locally

```bash
# Run all workflows
./scripts/run-act.sh

# Requires 'act' tool: https://github.com/nektos/act
```

### Migrate to Prisma

```bash
./scripts/migrate-to-prisma.sh
```

## 📚 Available Scripts

### `run-act.sh`

Run GitHub Actions workflows locally using [act](https://github.com/nektos/act).

**Prerequisites:**
- Docker installed and running
- `act` CLI tool installed

**Installing act:**

```bash
# macOS (Homebrew)
brew install act

# Linux (curl)
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows (Chocolatey)
choco install act-cli
```

**Usage:**

```bash
# Run default CI workflow
npm run act

# Or directly:
./scripts/run-act.sh

# Run specific workflow
./scripts/run-act.sh -w ci.yml

# Run only a specific job
./scripts/run-act.sh -w ci.yml -j lint
./scripts/run-act.sh -w ci.yml -j test-e2e

# Simulate different events
./scripts/run-act.sh -e pull_request

# List available workflows
./scripts/run-act.sh -l

# Show help
./scripts/run-act.sh -h
```

### `generate-package-index.cjs`

Generate `packages/index.json` so the package loader can discover packages dynamically.

**Usage:**

```bash
node tools/generate-package-index.cjs
```

### `generate-mega-seed.cjs`

Generate a deterministic, large seed dataset for `forum_forge` examples.

**Usage:**

```bash
node tools/generate-mega-seed.cjs
```

**Common Use Cases:**

1. **Test CI pipeline before pushing:**
   ```bash
   npm run act
   ```

2. **Debug e2e test failures:**
   ```bash
   ./scripts/run-act.sh -w ci.yml -j test-e2e
   ```

3. **Test lint fixes:**
   ```bash
   ./scripts/run-act.sh -w ci.yml -j lint
   ```

4. **Simulate PR checks:**
   ```bash
   ./scripts/run-act.sh -e pull_request
   ```

**Notes:**
- First run will be slow as Docker images are downloaded
- Act runs workflows in Docker containers that simulate GitHub Actions runners
- Some features may not work exactly like GitHub Actions (e.g., certain actions, secrets)
- Check `.actrc` or pass `-P` flag to customize Docker images used

**Troubleshooting:**

If you encounter issues:

1. **Docker not running:**
   ```bash
   # Make sure Docker is running
   docker ps
   ```

2. **Permission issues:**
   ```bash
   # Make sure script is executable
   chmod +x scripts/run-act.sh
   ```

3. **Out of disk space:**
   ```bash
   # Clean up Docker images
   docker system prune -a
   ```

4. **Workflow doesn't run:**
   ```bash
   # List workflows to verify name
   ./scripts/run-act.sh -l
   ```

### `setup-packages.cjs`

Sets up the package system for the project. This script is automatically run during `postinstall`.

**Usage:**
```bash
npm run setup-packages
```

## Adding New Scripts

When adding new scripts:
1. Make them executable: `chmod +x scripts/your-script.sh`
2. Add appropriate help/usage information
3. Document them in this README
4. Consider adding npm script aliases in `package.json`
