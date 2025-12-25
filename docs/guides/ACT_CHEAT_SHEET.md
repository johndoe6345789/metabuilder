# Act Cheat Sheet - Quick Reference

## Installation (One-Time)

```bash
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows
choco install act-cli
```

## Essential Commands

### Quick Start (Most Common)

```bash
npm run act              # Run full CI pipeline
npm run act:lint        # Lint only
npm run act:build       # Build only
npm run act:e2e         # E2E tests only
npm run act:typecheck   # Type checking only
npm run act:prisma      # Database setup only
```

### List & Preview

```bash
npm run act:list        # Show available workflows
act -l                  # List all jobs in current workflow
npm run act:test        # Interactive menu
npm run act:diagnose    # Pre-flight diagnostics (no Docker)
```

### Advanced

```bash
act push                        # Run push event workflows
act pull_request                # Run PR workflows
act -j lint                     # Run specific job
act -n                          # Dry run (preview only)
act -w deployment.yml           # Run specific workflow file
act --secret-file .secrets      # Use secrets from file
```

## Performance Tips

| Situation | Command | Why |
|-----------|---------|-----|
| **First run** | `npm run act:lint` | Test single job, faster first run |
| **Testing changes** | `npm run act:lint` | Individual job runs 2-3x faster |
| **Before push** | `npm run act` | Run everything matching GitHub CI |
| **Preview only** | `act -n` | No Docker needed, instant feedback |
| **Debugging failure** | `npm run act -- --verbose` | See detailed logs |

## Workflow-Specific Commands

### Testing Linting
```bash
npm run act:lint
# or
act -j lint
```

### Testing Build
```bash
npm run act:build
# or
act -j build
```

### Testing E2E
```bash
npm run act:e2e
# or
act -j test-e2e
```

### Full CI Pipeline
```bash
npm run act
# or
npm run act:all
```

### Simulate Pull Request
```bash
act pull_request -W .github/workflows/code-review.yml
```

## Troubleshooting

### Issue: "act not found"
```bash
# Install act first
brew install act  # macOS
# or equivalent for your OS
```

### Issue: "Docker not running"
```bash
# Start Docker
# macOS/Windows: Open Docker Desktop
# Linux: sudo systemctl start docker
```

### Issue: Workflows are slow
```bash
# Use smaller Docker image
act -P ubuntu-latest=catthehacker/ubuntu:act-20.04

# Or test individual jobs
npm run act:lint
```

### Issue: Need to debug
```bash
# Run with verbose output
act --verbose

# Or check logs (saved automatically)
tail -f /tmp/act-logs/*.log
```

### Issue: Need GitHub secrets
```bash
# Create .secrets file (git-ignored)
cp .secrets.example .secrets
# Edit .secrets and add real values

# Run with secrets
act --secret-file .secrets
```

## Configuration

### .actrc (Auto-loaded)
```bash
# Configured in .actrc - no manual setup needed
# Uses optimized Docker image for faster downloads
# Automatically enables verbose output
```

### .secrets (Optional)
```bash
# Copy template
cp .secrets.example .secrets

# Edit with your values
GITHUB_TOKEN=ghp_your_token_here
DATABASE_URL=file:./dev.db

# Use in workflows
act --secret-file .secrets
```

## Git Hooks (Optional)

### Install pre-commit hook
```bash
cp scripts/pre-commit.hook .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### This will:
- Validate workflow files before commits
- Catch issues early
- Run diagnostics automatically

## Logs & Debugging

### View logs
```bash
# Real-time
tail -f /tmp/act-logs/*.log

# List all logs
ls -lh /tmp/act-logs/

# View specific log
cat /tmp/act-logs/act-*.log
```

### Save logs explicitly
```bash
act push > my_run.log 2>&1
```

## Pre-Push Checklist

```bash
# 1. Run diagnostics (no Docker needed)
npm run act:diagnose

# 2. Test critical paths
npm run act:lint
npm run act:build
npm run act:e2e

# 3. Run full CI to match GitHub
npm run act

# 4. Push with confidence
git push origin my-branch
```

## Common Workflows

### Before Every Commit
```bash
npm run act:lint    # Fast, catches style issues
```

### Before Pushing
```bash
npm run act        # Full CI, matches GitHub behavior
```

### After Making Changes
```bash
npm run act:build  # Ensure build still works
npm run act:e2e    # Ensure tests still pass
```

### Debugging CI Failure
```bash
npm run act:diagnose        # Check setup issues
npm run act -- --verbose    # See detailed logs
cat /tmp/act-logs/*.log     # Review logs
```

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | ✓ Success | Good to push |
| 1 | ✗ Failure | Fix errors shown |
| 137 | ✗ Out of memory | Increase Docker memory |
| Other | ✗ Error | Check logs: `/tmp/act-logs/` |

## Memory Issues

If you see "exit code 137":

```bash
# Increase Docker memory:
# macOS/Windows: Docker Desktop → Settings → Resources → Memory → 8GB+

# Then retry
npm run act
```

## More Help

```bash
npm run act -- --help          # Show help
npm run act:test               # Interactive menu
npm run act:diagnose           # Diagnose issues
cat docs/guides/ACT_TESTING.md # Full documentation
```

## Aliases (Optional)

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
alias act-ci='npm run act'
alias act-lint='npm run act:lint'
alias act-build='npm run act:build'
alias act-test='npm run act:e2e'
alias act-diagnose='npm run act:diagnose'
```

Then use:
```bash
act-lint        # Instead of: npm run act:lint
act-ci          # Instead of: npm run act
```

---

**Need more details?** See `docs/guides/ACT_TESTING.md` for the comprehensive guide.
