# Act - Local GitHub Actions Testing

## Quick Start

Run diagnostics to identify workflow issues:

```bash
chmod +x scripts/diagnose-workflows.sh
./scripts/diagnose-workflows.sh
```

Test workflows locally with act:

```bash
chmod +x scripts/test-workflows.sh
./scripts/test-workflows.sh
```

## What Gets Tested

### 1. Diagnostic Script (`diagnose-workflows.sh`)

Checks for common issues **without** running workflows:

- ✅ Package.json structure and scripts
- ✅ Required dependencies (Prisma, Playwright)
- ✅ Prisma schema and migrations
- ✅ Playwright configuration
- ✅ Node modules installation
- ✅ Workflow file existence
- ✅ Environment files
- ✅ Git ignore configuration

**When to use:** Before installing act, or for quick project validation.

### 2. Workflow Testing Script (`test-workflows.sh`)

Runs workflows using act:

- 🔄 Prisma setup and migrations
- 🔄 Linting with ESLint
- 🔄 Production build
- 🔄 E2E tests with Playwright
- 🔄 Full CI pipeline simulation

**When to use:** After diagnostic passes, to test actual workflow execution.

## Installation

### Step 1: Install Act

**macOS:**
```bash
brew install act
```

**Linux:**
```bash
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**Windows:**
```powershell
choco install act-cli
```

### Step 2: Verify Docker is Running

```bash
docker info
```

If not running, start Docker Desktop.

### Step 3: Run Diagnostics

```bash
./scripts/diagnose-workflows.sh
```

Fix any reported issues before proceeding.

## Usage Examples

### Interactive Menu

```bash
./scripts/test-workflows.sh
```

Options:
1. List all workflows
2. Dry run (preview)
3. Test Prisma setup
4. Test linting
5. Test build
6. Test E2E tests
7. Run full CI pipeline
8. Run with verbose output
9. Diagnose issues

### Direct Act Commands

```bash
# List available jobs
act -l

# Run specific job
act -j lint
act -j build
act -j test-e2e

# Run all push event workflows
act push

# Run all pull request workflows
act pull_request

# Verbose output
act -v

# Dry run
act -n
```

## Common Issues & Solutions

### Issue: Missing Dependencies

**Symptom:**
```
npm ERR! missing: @prisma/client@^6.3.1
```

**Solution:**
```bash
npm install @prisma/client prisma @playwright/test
```

### Issue: Prisma Schema Not Found

**Symptom:**
```
Error: Could not find Prisma schema at prisma/schema.prisma
```

**Solution:**
```bash
npx prisma init
# Then edit prisma/schema.prisma with your models
npx prisma generate
```

### Issue: Docker Out of Memory

**Symptom:**
```
Error: Process completed with exit code 137
```

**Solution:**
- Open Docker Desktop
- Go to Settings → Resources
- Increase Memory to 8GB
- Click "Apply & Restart"

### Issue: npm ci Fails

**Symptom:**
```
npm ERR! The `npm ci` command can only install with an existing package-lock.json
```

**Solution:**
```bash
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

### Issue: Large Image Download

**Symptom:**
Act downloads very large Docker images (5GB+)

**Solution:**
Use smaller runner images:
```bash
act -P ubuntu-latest=catthehacker/ubuntu:act-latest
```

Or add to `~/.actrc`:
```
-P ubuntu-latest=catthehacker/ubuntu:act-latest
```

## Understanding the Output

### Green ✓ - Success
Everything passed, no action needed.

### Yellow ⚠ - Warning
Not critical, but should be addressed:
- Missing optional configuration
- Outdated lockfiles
- Missing documentation

### Red ✗ - Issue
Critical problems that prevent workflows from running:
- Missing required files
- Missing dependencies
- Invalid configuration

## Workflow Files

Our project has these workflows:

### `ci.yml` - Continuous Integration
- Validates Prisma setup
- Runs linting
- Builds production bundle
- Runs E2E tests

**Test with:**
```bash
act push -j prisma-check
act push -j lint
act push -j build
act push -j test-e2e
```

### `code-review.yml` - Automated PR Review
- Analyzes code changes
- Checks for security issues
- Validates code quality
- Auto-approves if clean

**Test with:**
```bash
act pull_request -W .github/workflows/code-review.yml
```

### `auto-merge.yml` - Automatic PR Merging
- Checks PR approval status
- Verifies CI passes
- Auto-merges when ready
- Cleans up branches

**Note:** Requires GitHub API, may not work fully with act.

### `pr-management.yml` - PR Labeling
- Auto-labels PRs by content
- Checks description quality
- Links related issues

**Test with:**
```bash
act pull_request -W .github/workflows/pr-management.yml
```

## Best Practices

### Before Every Commit

```bash
npm run lint
npm run build
```

### Before Every Push

```bash
./scripts/diagnose-workflows.sh
act -j lint -j build
```

### Before Creating PR

```bash
./scripts/test-workflows.sh
# Choose option 7 (full CI pipeline)
```

### When Workflow Fails on GitHub

```bash
# Run the same job locally
act -j <job-name> -v

# Check logs
tail -f /tmp/act_output_<job-name>.log
```

## Advanced Usage

### Custom Event Payloads

Create `event.json`:
```json
{
  "pull_request": {
    "number": 1,
    "title": "Test PR",
    "body": "Testing locally with act"
  }
}
```

Run:
```bash
act pull_request -e event.json
```

### Use Secrets

Create `.secrets` file:
```env
GITHUB_TOKEN=ghp_your_token_here
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

**⚠️ Never commit .secrets file!**

Add to `.gitignore`:
```gitignore
.secrets
```

Run with secrets:
```bash
act --secret-file .secrets
```

### Configuration File

Create `~/.actrc` for persistent settings:
```
-P ubuntu-latest=catthehacker/ubuntu:act-latest
--secret-file .secrets
--env ACT=true
-v
```

### Skip Steps in Local Environment

Modify workflows to detect act:

```yaml
- name: Upload to production
  if: ${{ !env.ACT }}
  run: ./deploy.sh
```

This step runs on GitHub but skips in act.

## Debugging Workflows

### Step 1: Identify Failure

```bash
act -j <job-name>
```

Look for red error messages.

### Step 2: Verbose Output

```bash
act -j <job-name> -v
```

Shows detailed execution logs.

### Step 3: Check Individual Commands

Run failing commands directly:

```bash
npm ci
npm run lint
npm run build
npx prisma generate
```

### Step 4: Interactive Container

```bash
act --bind
```

Access the running container to debug.

### Step 5: Check Logs

```bash
# Our scripts save logs to /tmp
cat /tmp/act_output_<job-name>.log
```

## Performance Tips

### 1. Use Smaller Images

```bash
act -P ubuntu-latest=catthehacker/ubuntu:act-20.04
```

### 2. Cache Docker Layers

Act reuses Docker layers, so subsequent runs are faster.

### 3. Run Specific Jobs

Don't run the full pipeline every time:
```bash
act -j lint  # Only lint
```

### 4. Skip Slow Steps

Add conditions to skip in local environment:
```yaml
- name: Slow step
  if: ${{ !env.ACT }}
```

## Continuous Integration Workflow

```
┌─────────────────────────────────┐
│ 1. Write Code                    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 2. Run: npm run lint            │
│    Run: npm run build           │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 3. Run: ./scripts/diagnose-     │
│         workflows.sh            │
└──────────────┬──────────────────┘
               │
               ▼ (if issues found)
┌─────────────────────────────────┐
│ 4. Fix Issues                    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 5. Run: act -j lint -j build   │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 6. Commit and Push              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 7. GitHub Actions Run           │
│    (should pass!)               │
└─────────────────────────────────┘
```

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] Act is installed (`act --version`)
- [ ] Docker is running (`docker info`)
- [ ] Diagnostic script passes (`./scripts/diagnose-workflows.sh`)
- [ ] Dependencies are installed (`npm install`)
- [ ] Prisma is configured (`prisma/schema.prisma` exists)
- [ ] Scripts exist in `package.json` (lint, build, test:e2e)
- [ ] Playwright is set up (`playwright.config.ts` exists)
- [ ] Docker has enough memory (8GB recommended)

## Quick Reference Card

```bash
# Diagnostics (no act required)
./scripts/diagnose-workflows.sh

# Interactive testing
./scripts/test-workflows.sh

# List jobs
act -l

# Dry run
act -n

# Test specific job
act -j <job-name>

# Test with verbose output
act -j <job-name> -v

# Run full CI
act push

# Run PR checks
act pull_request

# With smaller image
act -P ubuntu-latest=catthehacker/ubuntu:act-latest

# With secrets
act --secret-file .secrets
```

## Getting Help

### In Order of Preference:

1. **Run diagnostic script:** `./scripts/diagnose-workflows.sh`
2. **Check this README:** Most common issues are documented
3. **Check logs:** Look in `/tmp/act_output_*.log`
4. **Run with verbose:** `act -j <job-name> -v`
5. **Test commands locally:** Run failing npm scripts directly
6. **Check act docs:** https://github.com/nektos/act
7. **Open an issue:** Include diagnostic output and logs

## Additional Resources

- [Act GitHub Repository](https://github.com/nektos/act)
- [Act Documentation](https://github.com/nektos/act#readme)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Act Community Discussions](https://github.com/nektos/act/discussions)

## Contributing

If you find new issues or solutions:

1. Document them in this README
2. Update the diagnostic script if applicable
3. Share with the team

## License

These testing scripts are part of the MetaBuilder project.
