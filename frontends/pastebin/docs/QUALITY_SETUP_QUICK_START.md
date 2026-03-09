# Quality CI/CD Quick Start Guide

This guide gets you up and running with the automated quality checks in just a few minutes.

## What is This?

The quality CI/CD system automatically checks your code for quality issues at multiple stages:
- **Locally**: Before you commit (pre-commit hook)
- **On GitHub**: When you push to main/develop or open a PR (GitHub Actions)
- **Reporting**: Generates quality reports and scores

## Quick Setup (5 minutes)

### 1. Install Pre-commit Hook

```bash
cp scripts/pre-commit-quality-check.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Verify it works:
```bash
.git/hooks/pre-commit
```

### 2. Install npm Scripts

Already installed! Just use:
```bash
npm run quality-check          # Quick check
npm run quality-check:json     # Generate JSON report
npm run quality-check:html     # Generate HTML report
npm run quality-check:verbose  # Detailed output
```

### 3. Done!

Your CI/CD is now set up. That's it!

## Common Commands

```bash
# Check code quality locally
npm run quality-check

# Create detailed reports
npm run quality-check:json
npm run quality-check:html

# Bypass pre-commit check (use cautiously!)
git commit --no-verify

# View quality badge
cat .quality/badge.svg
```

## Quality Thresholds

- **Overall Score**: Must be ≥ 85%
- **Code Quality**: Must be ≥ 80%
- **Test Coverage**: Must be ≥ 70%
- **Architecture**: Must be ≥ 80%
- **Security**: Must be ≥ 85%

## What Happens When I Commit?

### Passing Quality Check ✓
```
Pre-commit quality check PASSED
[main 1234567] My awesome feature
```

### Failing Quality Check ✗
```
✗ Overall score (78%) is below minimum threshold (85%)
✗ Pre-commit quality check FAILED
To bypass this check, run: git commit --no-verify
```

## What Happens in GitHub?

When you push or open a PR, GitHub Actions automatically:
1. Runs tests
2. Runs quality validator
3. Generates reports
4. Posts results to your PR
5. Blocks merge if score < 85% (if configured)

Example PR comment:
```
## Quality Check Results ✅

| Metric | Value |
|--------|-------|
| Overall Score | 92.5% |
| Grade | A+ |
| Threshold | 85% |

✅ Quality gate **passed**
```

## Fixing Quality Issues

If your quality check fails:

1. **View the detailed report**:
   ```bash
   npm run quality-check:verbose
   npm run quality-check:html && open .quality/report.html
   ```

2. **Fix the issues** (common ones):
   - Run tests: `npm test`
   - Fix linting: `npm run lint:fix`
   - Reduce complexity: Refactor complex functions
   - Improve test coverage: Add more tests

3. **Re-check**:
   ```bash
   npm run quality-check
   ```

4. **Commit**:
   ```bash
   git commit -m "Fix quality issues"
   ```

## Need to Bypass Checks?

```bash
# Skip pre-commit hook (NOT recommended - CI will still check)
git commit --no-verify

# But note: GitHub Actions will still validate the code
# and block merge if quality gate not met
```

## View Reports

After running quality checks:

```bash
# Console output (default)
npm run quality-check

# JSON report (for scripts/automation)
cat .quality/report.json | jq .

# HTML report (most detailed)
open .quality/report.html

# Quality badge
cat .quality/badge.svg
```

## Badge in README

Add this to your README.md to show quality status:

```markdown
![Quality Badge](.quality/badge.svg)
```

## Troubleshooting

### Pre-commit hook not running?
```bash
# Check if file exists
ls -l .git/hooks/pre-commit

# Make executable
chmod +x .git/hooks/pre-commit

# Test manually
.git/hooks/pre-commit
```

### GitHub Actions failing but local passes?
```bash
# Use same Node version as CI (18)
nvm install 18 && nvm use 18

# Use same install method
npm ci --legacy-peer-deps

# Run same commands as workflow
npm test -- --coverage
```

### Badge not updating?
```bash
# Regenerate badge
bash scripts/generate-badge.sh

# Verify report exists
ls .quality/report.json
```

## Full Documentation

For detailed information, see: [QUALITY_CI_CD_SETUP.md](./QUALITY_CI_CD_SETUP.md)

## Architecture at a Glance

```
┌─ Pre-commit Hook (local, quick feedback)
│  └─ .git/hooks/pre-commit
│
├─ GitHub Actions (automated on push/PR)
│  └─ .github/workflows/quality-check.yml
│
├─ Configuration
│  ├─ .quality/gates.json (thresholds)
│  └─ .qualityrc.json (detailed rules)
│
├─ Scripts
│  ├─ scripts/pre-commit-quality-check.sh
│  └─ scripts/generate-badge.sh
│
└─ Reports
   ├─ .quality/report.json
   ├─ .quality/report.html
   └─ .quality/badge.svg
```

## Key Points

✓ Quality checks run **before** you commit locally
✓ Quality checks run again on GitHub for every PR
✓ Can't merge to main if score < 85% (if enforced)
✓ Scores & trends are tracked over time
✓ All tools are open source & configured in this repo

## Next Steps

1. **Run a check**: `npm run quality-check`
2. **View reports**: Open `.quality/report.html`
3. **Fix any issues**: Follow the report recommendations
4. **Commit with confidence**: Your code passes quality gates!

Questions? See the full documentation in [QUALITY_CI_CD_SETUP.md](./QUALITY_CI_CD_SETUP.md)
