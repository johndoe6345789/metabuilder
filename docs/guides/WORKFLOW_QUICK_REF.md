# Workflow Simulation - Quick Reference

## Commands

### Validation (No dependencies required)
```bash
npm run act:validate           # Validate all workflow files
```

### Simulation (No Docker required)
```bash
npm run simulate:lint          # Simulate lint job
npm run simulate:build         # Simulate build job
npm run simulate:all           # Simulate all jobs
```

### Diagnostics
```bash
npm run act:diagnose           # Check setup and validate workflows
```

### With act (requires act + Docker)
```bash
npm run act:lint               # Run lint in Docker
npm run act:build              # Run build in Docker
npm run act:all                # Run full CI in Docker
```

## What Each Tool Does

| Tool | Purpose | Requirements | When to Use |
|------|---------|--------------|-------------|
| `act:validate` | Check YAML syntax & structure | Python 3 | Before commit |
| `simulate:*` | Run commands locally | Node.js/Bun | Quick checks |
| `act:diagnose` | Check setup & validate | Python 3 | Troubleshooting |
| `act:*` | Run in Docker container | act + Docker | Full simulation |

## Workflow Files Fixed

All workflow path references updated from `ci.yml` to `ci/ci.yml`:
- ✅ package.json scripts
- ✅ run-act.sh default path
- ✅ diagnose-workflows.sh
- ✅ test-workflows.sh

## Security Improvements

- ✅ Pinned all GitHub Actions to specific commit SHAs
- ✅ Fixed unpinned `dependency-check/Dependency-Check_Action@main`
- ✅ Validation script warns about unpinned actions

## New Files

1. `validate-workflows.py` - Workflow validation without act
2. `simulate-workflows.sh` - Local job simulation
3. `docs/guides/WORKFLOW_SIMULATION.md` - Full documentation

## Common Use Cases

### Before Committing
```bash
npm run act:validate
```

### Quick Local Check
```bash
npm run simulate:lint
```

### Full Local CI Run
```bash
npm run simulate:all
```

### With Docker (if act installed)
```bash
npm run act:all
```

## Exit Codes

- `0` - Success
- `1` - Validation/execution failed

## Tips

- Use `simulate:*` for fast iteration
- Use `act:*` for exact GitHub environment
- Run `act:validate` in CI/pre-commit hooks
- Check `docs/guides/WORKFLOW_SIMULATION.md` for details
