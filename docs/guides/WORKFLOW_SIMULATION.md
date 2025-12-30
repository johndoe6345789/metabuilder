# GitHub Actions Workflow Simulation & Validation

This document describes the tools and scripts available for simulating and validating GitHub Actions workflows locally.

## Overview

The MetaBuilder project includes comprehensive tooling for:
1. **Validating** workflow files for syntax and structural issues
2. **Simulating** workflows locally without Docker (fallback when `act` is unavailable)
3. **Running** workflows with `act` (when available)
4. **Diagnosing** workflow setup and configuration

## Quick Start

### Without `act` (Validation & Simulation)

```bash
# Validate all workflow files
npm run act:validate

# Simulate a specific job locally
npm run simulate:lint
npm run simulate:build

# Simulate all jobs in sequence
npm run simulate:all
```

### With `act` Installed (Full Workflow Testing)

```bash
# Run diagnostics
npm run act:diagnose

# Validate workflows
npm run act:validate

# Run specific jobs
npm run act:lint
npm run act:build
npm run act:e2e

# Run all CI jobs
npm run act:all
```

## Available Scripts

### Validation Scripts

#### `npm run act:validate`
Validates all workflow files without requiring `act` or Docker.

**Checks:**
- ✅ YAML syntax validation
- ✅ Required workflow fields (name, on, jobs)
- ✅ Job structure validation
- ✅ Step structure validation
- ⚠️  Security warnings (unpinned actions)
- ⚠️  Best practice recommendations

**Example output:**
```
🔍 GitHub Actions Workflow Validation
==================================================

Found 14 workflow file(s)

📄 Validating .github/workflows/ci/ci.yml
   ✅ Structure valid

==================================================
📊 Summary:
   Total files checked: 14
   Total issues: 0
   Total warnings: 0

✅ All workflows are valid!
```

### Simulation Scripts

#### `npm run simulate:lint`
Simulates the lint job locally by running the actual commands.

#### `npm run simulate:build`
Simulates the build job locally.

#### `npm run simulate:all`
Runs all jobs in sequence (prisma-check → typecheck → lint → test-unit → build).

**Available jobs:**
- `prisma-check` - Validate Prisma setup
- `typecheck` - Run TypeScript type check
- `lint` - Run ESLint
- `test-unit` - Run unit tests
- `build` - Build application
- `test-e2e` - Run E2E tests

### Act Scripts (Requires `act` Installation)

#### `npm run act:diagnose`
Checks if `act` is installed, Docker is running, validates workflow files, and lists available jobs.

#### `npm run act:lint`
Runs the lint job using `act` in a Docker container.

#### `npm run act:build`
Runs the build job using `act` in a Docker container.

#### `npm run act:e2e`
Runs the E2E test job using `act` in a Docker container.

#### `npm run act:all`
Runs the entire CI pipeline using `act`.

## Tools & Scripts

### 1. `validate-workflows.py`
Python script that validates all GitHub Actions workflow files.

**Features:**
- YAML syntax validation
- Workflow structure validation
- Security best practice checks
- No external dependencies (uses built-in Python YAML parser)

**Usage:**
```bash
python3 scripts/validate-workflows.py
```

### 2. `simulate-workflows.sh`
Bash script that simulates workflow jobs by running commands locally.

**Features:**
- Works without Docker or `act`
- Runs actual commands from workflow definitions
- Supports both `npm` and `bun`
- Can run individual jobs or all jobs in sequence

**Usage:**
```bash
bash scripts/simulate-workflows.sh lint
bash scripts/simulate-workflows.sh all
```

### 3. `diagnose-workflows.sh`
Diagnostic script that checks workflow setup.

**Checks:**
- `act` installation
- Docker status
- Workflow file existence
- Configuration files (.actrc, .secrets)
- Runs validation automatically

**Usage:**
```bash
bash scripts/diagnose-workflows.sh
```

### 4. `run-act.sh`
Wrapper script for running `act` with proper configuration.

**Features:**
- Automatically finds workflow files
- Uses optimized Docker images
- Loads secrets and environment files
- Configurable via command-line arguments

**Usage:**
```bash
bash scripts/run-act.sh -w ci/ci.yml -j lint
```

### 5. `test-workflows.sh`
Interactive testing script for workflows.

**Features:**
- Dry-run validation
- Interactive job testing
- Syntax validation for multiple jobs

**Usage:**
```bash
bash scripts/test-workflows.sh
```

## Workflow Files

The project has 14 workflow files organized by category:

### CI Workflows (`ci/`)
- `ci.yml` - Main CI/CD pipeline (lint, typecheck, build, test)
- `cli.yml` - CLI build workflow
- `cpp-build.yml` - C++ DBAL daemon build
- `detect-stubs.yml` - Stub implementation detection

### PR Workflows (`pr/`)
- `pr-management.yml` - PR labeling and management
- `merge-conflict-check.yml` - Merge conflict detection
- `auto-merge.yml` - Automatic PR merging
- `code-review.yml` - Automated code review

### Quality Workflows (`quality/`)
- `quality-metrics.yml` - Comprehensive quality metrics
- `size-limits.yml` - Code size limits
- `planning.yml` - Planning and design workflow
- `deployment.yml` - Deployment and monitoring

### Other Workflows
- `development.yml` - Development assistance
- `issue-triage.yml` - Issue triage and auto-fix

## Workflow Path Structure

**Important:** Workflows are organized in subdirectories:
- ✅ Correct: `.github/workflows/ci/ci.yml`
- ❌ Incorrect: `.github/workflows/ci.yml`

All scripts have been updated to use the correct paths.

## Common Issues & Solutions

### Issue: "act not found"
**Solution:** Either:
1. Install `act`: `brew install act` (macOS) or see [act installation guide](https://github.com/nektos/act#installation)
2. Use simulation scripts instead: `npm run simulate:lint`

### Issue: "Docker not running"
**Solution:** Start Docker Desktop or Docker daemon.

### Issue: "Workflow file not found"
**Solution:** Use the correct path with subdirectories:
```bash
# Correct
npm run act:lint  # Uses ci/ci.yml

# Or specify full path
bash scripts/run-act.sh -w ci/ci.yml -j lint
```

### Issue: "YAML parsing error"
**Solution:** Run validation to find the specific issue:
```bash
npm run act:validate
```

## Best Practices

### Before Committing
```bash
npm run act:validate  # Validate workflow syntax
npm run simulate:lint # Quick local check
```

### Before Pushing
```bash
npm run act:validate  # Validate workflows
npm run simulate:all  # Run all checks locally
# Or with act:
npm run act:all      # Full CI simulation (requires act)
```

### When Workflow Fails on GitHub
```bash
# 1. Validate locally
npm run act:validate

# 2. Simulate the failing job
npm run simulate:lint  # Or other job

# 3. Or use act for exact environment
npm run act:lint
```

## Security Considerations

### Pinned Action Versions
All GitHub Actions are pinned to specific commit SHAs for security:

```yaml
# ✅ Good - Pinned to specific SHA
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2

# ❌ Bad - Unpinned version
- uses: actions/checkout@v4
- uses: actions/checkout@main
```

The validation script will warn about unpinned actions.

### Secrets Management
- Never commit `.secrets` file
- Use `.secrets.example` as a template
- Secrets are automatically loaded by act scripts if `.secrets` exists

## Continuous Improvement

The validation script helps maintain workflow quality by:
1. Catching syntax errors before pushing
2. Ensuring consistent structure across workflows
3. Identifying security issues (unpinned actions)
4. Validating best practices

## Further Reading

- [Act Documentation](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

## Summary

| Task | Command | Requirements |
|------|---------|--------------|
| Validate workflows | `npm run act:validate` | Python 3 |
| Simulate locally | `npm run simulate:lint` | Node.js/Bun |
| Run with act | `npm run act:lint` | act + Docker |
| Diagnose setup | `npm run act:diagnose` | act + Docker |
| Quick check | `npm run simulate:lint` | Node.js/Bun |
| Full pipeline | `npm run simulate:all` | Node.js/Bun |

Choose the appropriate tool based on what you have available:
- **Python only:** Use `act:validate`
- **Node.js/Bun:** Use `simulate:*` commands
- **act + Docker:** Use `act:*` commands for full simulation
