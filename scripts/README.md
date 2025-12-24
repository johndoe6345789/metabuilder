# Scripts Directory

This directory contains utility scripts for development and testing.

## Available Scripts

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
