# Testing Enterprise Gated Workflows with Act

This guide shows how to test the Enterprise Gated CI/CD workflows locally using [act](https://github.com/nektos/act).

## Prerequisites

```bash
# Install act (if not already installed)
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows
choco install act-cli
```

## Quick Start

```bash
cd frontends/nextjs

# List all workflow jobs
npm run act -- -l

# List gated CI jobs specifically
npm run act -- -W ../.github/workflows/gated-ci.yml -l

# List gated deployment jobs
npm run act -- -W ../.github/workflows/gated-deployment.yml -l
```

## Testing Individual Gates

### Gate 1: Code Quality

```bash
# Test entire Gate 1
npm run act -- -j gate-1-start -W ../.github/workflows/gated-ci.yml
npm run act -- -j prisma-check -W ../.github/workflows/gated-ci.yml
npm run act -- -j typecheck -W ../.github/workflows/gated-ci.yml
npm run act -- -j lint -W ../.github/workflows/gated-ci.yml
npm run act -- -j security-scan -W ../.github/workflows/gated-ci.yml
npm run act -- -j gate-1-complete -W ../.github/workflows/gated-ci.yml
```

### Gate 2: Testing

```bash
# Test entire Gate 2
npm run act -- -j gate-2-start -W ../.github/workflows/gated-ci.yml
npm run act -- -j test-unit -W ../.github/workflows/gated-ci.yml
npm run act -- -j test-e2e -W ../.github/workflows/gated-ci.yml
npm run act -- -j test-dbal-daemon -W ../.github/workflows/gated-ci.yml
npm run act -- -j gate-2-complete -W ../.github/workflows/gated-ci.yml
```

### Gate 3: Build & Package

```bash
# Test entire Gate 3
npm run act -- -j gate-3-start -W ../.github/workflows/gated-ci.yml
npm run act -- -j build -W ../.github/workflows/gated-ci.yml
npm run act -- -j quality-check -W ../.github/workflows/gated-ci.yml
npm run act -- -j gate-3-complete -W ../.github/workflows/gated-ci.yml
```

### Gate 4: Review & Approval

```bash
# Test Gate 4 (PR only)
npm run act -- -j gate-4-review-required -W ../.github/workflows/gated-ci.yml -e pr-event.json
npm run act -- -j gate-4-complete -W ../.github/workflows/gated-ci.yml -e pr-event.json
```

### Gate 5: Deployment

```bash
# Test staging deployment
npm run act -- -j deploy-staging -W ../.github/workflows/gated-deployment.yml

# Test production approval gate
npm run act -- -j production-approval-gate -W ../.github/workflows/gated-deployment.yml

# Test production deployment (requires approval simulation)
npm run act -- -j deploy-production -W ../.github/workflows/gated-deployment.yml
```

## Testing Complete Workflows

### Test Entire Gated CI Workflow

```bash
# Simulate pull request event
npm run act pull_request -W ../.github/workflows/gated-ci.yml

# Simulate push to main event
npm run act push -W ../.github/workflows/gated-ci.yml
```

### Test Entire Gated Deployment Workflow

```bash
# Simulate push to main (triggers staging)
npm run act push -W ../.github/workflows/gated-deployment.yml

# Simulate manual production deployment
npm run act workflow_dispatch -W ../.github/workflows/gated-deployment.yml \
  --input environment=production
```

## Creating Event Files

For testing workflows that need specific event data, create JSON event files:

### `pr-event.json` (Pull Request Event)

```json
{
  "pull_request": {
    "number": 1,
    "head": {
      "sha": "abc123def456",
      "ref": "feature/test-branch"
    },
    "base": {
      "ref": "main"
    },
    "state": "open",
    "draft": false
  },
  "issue": {
    "number": 1
  }
}
```

### `push-event.json` (Push Event)

```json
{
  "ref": "refs/heads/main",
  "repository": {
    "default_branch": "main"
  }
}
```

### `workflow-dispatch-event.json` (Manual Trigger)

```json
{
  "inputs": {
    "environment": "production",
    "skip_tests": false
  }
}
```

## Testing with Event Files

```bash
# Test with PR event
npm run act pull_request -W ../.github/workflows/gated-ci.yml \
  -e pr-event.json

# Test with push event
npm run act push -W ../.github/workflows/gated-deployment.yml \
  -e push-event.json

# Test with workflow dispatch
npm run act workflow_dispatch -W ../.github/workflows/gated-deployment.yml \
  -e workflow-dispatch-event.json
```

## Debugging

### Verbose Output

```bash
# Run with verbose output
npm run act -- -j gate-1-start -W ../.github/workflows/gated-ci.yml -v
```

### Dry Run

```bash
# Show what would run without executing
npm run act -- -W ../.github/workflows/gated-ci.yml -n
```

### Container Shell Access

```bash
# Open shell in workflow container for debugging
npm run act -- -j lint -W ../.github/workflows/gated-ci.yml \
  --container-architecture linux/amd64 \
  --bind
```

## Common Issues

### Issue: "Error: unable to get git diff"

**Solution:** Ensure you're running from the repository root or specify the correct path.

```bash
# Run from repository root
cd /home/runner/work/metabuilder/metabuilder
act -W .github/workflows/gated-ci.yml
```

### Issue: "Error: Job 'X' depends on job 'Y' which is not in the workflow"

**Solution:** Test dependent jobs together or test the entire workflow.

```bash
# Instead of testing individual jobs with dependencies,
# test the entire workflow
npm run act pull_request -W ../.github/workflows/gated-ci.yml
```

### Issue: Secrets not available

**Solution:** Create a `.secrets` file or pass secrets via command line.

```bash
# Create .secrets file
echo "DATABASE_URL=file:./dev.db" > .secrets

# Use with act
npm run act -- -W ../.github/workflows/gated-ci.yml --secret-file .secrets
```

### Issue: Platform architecture mismatch (Apple Silicon)

**Solution:** Use the correct container architecture.

```bash
# For Apple Silicon Macs
npm run act -- -W ../.github/workflows/gated-ci.yml \
  --container-architecture linux/amd64
```

## Configuration File

Create `.actrc` in repository root for default settings:

```bash
# .actrc
--container-architecture linux/amd64
--secret-file .secrets
-P ubuntu-latest=catthehacker/ubuntu:act-latest
```

## Validation Checklist

Before submitting a PR, test these scenarios:

- [ ] Gate 1 passes (Prisma, TypeScript, Lint, Security)
- [ ] Gate 2 passes (Unit, E2E, DBAL Daemon tests)
- [ ] Gate 3 passes (Build, Quality checks)
- [ ] Complete workflow runs successfully on PR event
- [ ] Auto-merge workflow detects gated checks correctly
- [ ] Deployment workflow triggers on push to main

```bash
# Quick validation script
cd frontends/nextjs

echo "Testing Gate 1..."
npm run act -- -j gate-1-complete -W ../.github/workflows/gated-ci.yml

echo "Testing Gate 2..."
npm run act -- -j gate-2-complete -W ../.github/workflows/gated-ci.yml

echo "Testing Gate 3..."
npm run act -- -j gate-3-complete -W ../.github/workflows/gated-ci.yml

echo "Testing complete workflow..."
npm run act pull_request -W ../.github/workflows/gated-ci.yml

echo "✅ All gates validated locally!"
```

## Performance Tips

### Use Docker Layer Caching

```bash
# Pull images beforehand
docker pull catthehacker/ubuntu:act-latest

# This speeds up subsequent runs
```

### Test Changed Jobs Only

```bash
# If you only changed lint configuration, test just that gate
npm run act -- -j lint -W ../.github/workflows/gated-ci.yml
```

### Use GitHub Cache

```bash
# Enable caching to speed up dependency installation
npm run act -- -W ../.github/workflows/gated-ci.yml --use-gitignore
```

## Resources

- [act Documentation](https://github.com/nektos/act)
- [GitHub Actions Events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Enterprise Gated Workflow Guide](../docs/ENTERPRISE_GATED_WORKFLOW.md)

## Getting Help

1. Check act logs for error details
2. Verify workflow YAML syntax
3. Test individual jobs before full workflow
4. Review GitHub Actions documentation
5. Ask team for assistance

---

**Last Updated:** December 27, 2025
