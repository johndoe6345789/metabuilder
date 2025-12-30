# Testing GitHub Actions Locally with Act

This guide explains how to use [act](https://github.com/nektos/act) to run GitHub Actions workflows locally, helping diagnose and fix issues before pushing to GitHub.

## What is Act?

Act allows you to run GitHub Actions workflows on your local machine using Docker. This enables rapid iteration and debugging without polluting your GitHub commit history with "fix CI" commits.

## Installation

### Linux
```bash
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

### macOS
```bash
brew install act
```

### Windows
```powershell
choco install act-cli
```

Or download from: https://github.com/nektos/act/releases

## Prerequisites

- Docker must be installed and running
- Sufficient disk space for runner images (~2-5GB)

## Quick Start

### 1. List Available Workflows

```bash
act -l
```

This lists all jobs defined in `.github/workflows/`

### 2. Run All Jobs (Dry Run)

```bash
act -n
```

The `-n` flag performs a dry run without executing steps.

### 3. Run Specific Workflow

```bash
# Run push event workflows
act push

# Run pull request workflows
act pull_request

# Run a specific job
act -j lint
act -j build
act -j test-e2e
```

## Our Project Workflows

### CI/CD Workflow (`ci.yml`)

Tests linting, building, and e2e tests:

```bash
# Run entire CI pipeline
act push

# Run specific jobs
act -j prisma-check
act -j lint
act -j build
act -j test-e2e
```

### Code Review Workflow (`code-review.yml`)

Automated PR review:

```bash
act pull_request -W .github/workflows/code-review.yml
```

### Auto Merge Workflow (`auto-merge.yml`)

```bash
act workflow_run -W .github/workflows/auto-merge.yml
```

### PR Management Workflow (`pr-management.yml`)

```bash
act pull_request -W .github/workflows/pr-management.yml
```

## Common Issues and Solutions

### Issue 1: Missing Secrets

**Error:**
```
Error: Required secret not found
```

**Solution:**
Create a `.secrets` file in the project root:

```env
GITHUB_TOKEN=your_github_token_here
```

Then run:
```bash
act --secret-file .secrets
```

### Issue 2: Docker Image Size

Act downloads large Docker images. To use smaller images:

```bash
# Use medium-sized image (recommended)
act -P ubuntu-latest=catthehacker/ubuntu:act-latest

# Use smaller image (faster but may be missing some tools)
act -P ubuntu-latest=catthehacker/ubuntu:act-20.04
```

### Issue 3: Insufficient Resources

**Error:**
```
Error: Process completed with exit code 137
```

**Solution:**
Increase Docker's memory limit in Docker Desktop settings (recommend 8GB+).

### Issue 4: Node/NPM Cache Issues

Some workflows use `cache: 'npm'` which may fail locally:

```bash
# Skip cache-related steps
act push --env ACT=true
```

Then modify workflows to skip cache when `ACT` env var is set.

### Issue 5: Missing `npm ci` Dependencies

**Error:**
```
npm ERR! The `npm ci` command can only install with an existing package-lock.json
```

**Solution:**
Ensure `package-lock.json` is committed and up-to-date:

```bash
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

## Workflow-Specific Testing

### Testing Prisma Setup

```bash
act -j prisma-check
```

Expected issues to check:
- Missing `prisma/schema.prisma`
- Incorrect DATABASE_URL
- Missing Prisma dependencies

### Testing Linting

```bash
act -j lint
```

This runs ESLint against the codebase. Fix errors before pushing.

### Testing Build

```bash
act -j build
```

Simulates production build. Check for:
- TypeScript compilation errors
- Missing imports
- Build optimization issues

### Testing E2E Tests

```bash
act -j test-e2e
```

**Note:** Playwright tests may not work perfectly in act due to browser dependencies. Consider:
- Running Playwright tests directly: `npm run test:e2e`
- Using GitHub Actions for full E2E validation

## Advanced Usage

### Run with Verbose Output

```bash
act -v
```

### Run in Interactive Mode

```bash
act --bind
```

This allows you to inspect the container interactively.

### Use Custom Event Payload

Create `event.json`:
```json
{
  "pull_request": {
    "number": 1,
    "title": "Test PR",
    "body": "Testing locally"
  }
}
```

Run with:
```bash
act pull_request -e event.json
```

### Set Environment Variables

```bash
act -e NODE_ENV=production -e DEBUG=true
```

### Platform Specification

```bash
# Create .actrc file for consistent settings
cat > ~/.actrc << EOF
-P ubuntu-latest=catthehacker/ubuntu:act-latest
--secret-file .secrets
--env ACT=true
EOF
```

## Debugging Workflows

### Step 1: Identify the Failing Step

```bash
act -j <job-name> -v
```

Look for red error messages indicating which step failed.

### Step 2: Check Logs

Act outputs detailed logs. Search for:
- `Error:`
- `exit code 1`
- `Process completed with exit code`

### Step 3: Test Locally

If a command fails in act, test it directly:

```bash
# Example: If npm ci fails
npm ci

# Example: If lint fails
npm run lint

# Example: If build fails
npm run build
```

### Step 4: Iterate

Make changes, then re-run:
```bash
act -j <job-name>
```

## Current Known Issues in Our Workflows

### CI/CD (`ci.yml`)

1. **Prisma Dependencies Missing**
   - Status: ❌ Failing
   - Issue: `@prisma/client` and `prisma` packages not installed
   - Fix: `npm install @prisma/client prisma`

2. **Prisma Schema Missing**
   - Status: ❌ Failing
   - Issue: No `prisma/schema.prisma` file
   - Fix: Create Prisma schema file

3. **Test Script Missing**
   - Status: ❌ Failing
   - Issue: `test:e2e` script not in package.json
   - Fix: Verify `package.json` has the script

### Code Review (`code-review.yml`)

- Status: ⚠️ Requires PR context
- Can be tested with custom event payload

### Auto Merge (`auto-merge.yml`)

- Status: ⚠️ Requires GitHub API access
- May not work fully in local environment

## Best Practices

1. **Run workflows before pushing:**
   ```bash
   act -j lint && act -j build
   ```

2. **Use specific job testing:**
   Only run the jobs relevant to your changes.

3. **Keep workflows simple:**
   Complex workflows are harder to debug locally.

4. **Mock external services:**
   Use `if: ${{ !env.ACT }}` to skip steps that require GitHub-specific features.

5. **Test incrementally:**
   After fixing one job, test the next.

## Continuous Integration Best Practices

### Before Every Push

```bash
# Quick validation
npm run lint
npm run build
npm run test:e2e

# Or use act to validate workflows
act push -j lint -j build
```

### Before Creating PR

```bash
# Full CI simulation
act push

# Simulate PR checks
act pull_request
```

## Troubleshooting Checklist

- [ ] Docker is running
- [ ] Act is installed (`act --version`)
- [ ] `.secrets` file exists (if secrets needed)
- [ ] `package-lock.json` is committed
- [ ] All dependencies are installed (`npm install`)
- [ ] Prisma schema exists (if using Prisma)
- [ ] Scripts in `package.json` match workflow expectations

## Additional Resources

- [Act Documentation](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Act Variables and Secrets](https://github.com/nektos/act#secrets)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

## Getting Help

If workflows still fail after testing with act:

1. Check the [project issues](../../issues)
2. Review recent commits for workflow changes
3. Compare with working workflows in other projects
4. Test commands individually outside of workflows

## Quick Reference

```bash
# List all workflows
act -l

# Dry run
act -n

# Run push workflows
act push

# Run PR workflows
act pull_request

# Run specific job
act -j <job-name>

# Verbose output
act -v

# With secrets
act --secret-file .secrets

# Custom platform
act -P ubuntu-latest=catthehacker/ubuntu:act-latest
```
