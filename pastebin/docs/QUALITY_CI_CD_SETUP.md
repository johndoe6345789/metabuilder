# Quality CI/CD Setup Documentation

## Overview

This document describes the CI/CD integration for automated quality validator checks in the snippet-pastebin project. The implementation enables continuous quality monitoring throughout the development pipeline, from local pre-commit checks to automated GitHub Actions workflows.

## Architecture

The quality CI/CD system consists of four main components:

```
┌─────────────────────────────────────────────────────────────┐
│                  Developer Workflow                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Pre-commit Hook (.git/hooks/pre-commit)          │   │
│  │     scripts/pre-commit-quality-check.sh              │   │
│  │     - Local quick feedback                           │   │
│  │     - Prevent commits with critical issues           │   │
│  │     - Bypass with --no-verify flag                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  2. GitHub Actions Workflow                          │   │
│  │     .github/workflows/quality-check.yml              │   │
│  │     - Runs on push and pull requests                 │   │
│  │     - Enforces quality gates (≥85 score)             │   │
│  │     - Generates reports and artifacts                │   │
│  │     - Posts results to PR comments                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  3. Quality Gate Configuration                       │   │
│  │     .quality/gates.json                              │   │
│  │     - Overall score threshold: 85%                   │   │
│  │     - Component-level thresholds                     │   │
│  │     - Fail conditions defined                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4. Badge Generation                                 │   │
│  │     scripts/generate-badge.sh                        │   │
│  │     - SVG badge with current score                   │   │
│  │     - Color-coded by score range                     │   │
│  │     - Trend indicator (↑↓→)                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. GitHub Actions Workflow (.github/workflows/quality-check.yml)

#### Triggers
- **Push to main/develop**: Runs quality check on every commit
- **Pull Request**: Validates code quality before merging
- **Concurrency Control**: Cancels previous runs for same ref to save CI minutes

#### Steps

1. **Checkout Code**: Clones repository with full history for comparison
2. **Setup Node.js**: Installs Node.js 18 with npm cache
3. **Install Dependencies**: Installs project dependencies
4. **Run Tests**: Executes test suite with coverage reporting
5. **Run Quality Validator**: Executes quality validation tool
6. **Generate Reports**: Creates JSON and HTML reports
7. **Parse Results**: Extracts quality metrics from JSON report
8. **Check Quality Gate**: Validates overall score ≥ 85%
9. **Generate Badge**: Creates SVG quality badge
10. **Create PR Comment**: Posts quality results to PR (if applicable)
11. **Upload Artifacts**: Stores reports for 30 days, coverage for 7 days
12. **Comment on Failure**: Notifies PR about failed checks

#### Exit Codes

- **0 (SUCCESS)**: All checks passed, quality gate met
- **1 (FAILURE)**: Quality gate not met or critical issues found
- **Artifacts**: Automatically uploaded regardless of exit code

#### Permissions

```yaml
permissions:
  contents: read        # Read repository contents
  checks: write        # Write check status
  pull-requests: write # Write PR comments
```

### 2. Quality Gate Configuration (.quality/gates.json)

#### Thresholds

```json
{
  "minOverallScore": 85,
  "minCodeQuality": 80,
  "minTestCoverage": 70,
  "minArchitecture": 80,
  "minSecurity": 85
}
```

#### Metrics Definition

- **Code Quality**: Cyclomatic complexity, code duplication, linting errors
- **Test Coverage**: Line, branch, function, and statement coverage
- **Architecture**: Component size, dependency violations, design patterns
- **Security**: Vulnerability count, dangerous patterns, input validation

#### Fail Conditions

A build fails if:
1. Overall score drops below 85%
2. Critical security vulnerabilities are found
3. Test coverage decreases by more than 5%
4. Critical architecture violations are detected

#### Trend Tracking

- Compares current run against previous runs
- Tracks up to 10 historical runs
- Alerts on score decline exceeding 5%

### 3. Pre-commit Hook (scripts/pre-commit-quality-check.sh)

#### Installation

Auto-installed on `npm install` via Husky (if configured) or manually:

```bash
cp scripts/pre-commit-quality-check.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

#### Behavior

**On Pass:**
```
Quality Check Results:
┌────────────────────────────────────────────┐
│ Overall Score: 92.5%                       │
│ Grade: A+                                  │
│ Status: pass                               │
├────────────────────────────────────────────┤
│ Code Quality:  85.0%                       │
│ Test Coverage: 95.5%                       │
│ Architecture:  88.0%                       │
│ Security:      90.0%                       │
└────────────────────────────────────────────┘

✓ Pre-commit quality check PASSED
```

**On Fail:**
```
✗ Overall score (78%) is below minimum threshold (85%)
✗ Pre-commit quality check FAILED
To bypass this check, run: git commit --no-verify
Note: The quality check will still be required before merging to main.
```

#### Options

- **--no-verify**: Bypass pre-commit checks
  ```bash
  git commit --no-verify
  ```

#### Features

- Quick feedback loop (local execution only)
- Color-coded output (green/yellow/red)
- Displays component-level scores
- Shows warnings when approaching threshold
- Skips checks if score > 70% but < 85% (warning only)
- Generates .quality/pre-commit-report.json for CI correlation

### 4. Badge Generation (scripts/generate-badge.sh)

#### Output

Generates `.quality/badge.svg` with:
- Current quality score
- Grade letter (A+, A, B, etc.)
- Trend indicator (↑ improving, ↓ declining, → stable)
- Color coding based on score

#### Color Scheme

| Score | Color | Status |
|-------|-------|--------|
| ≥90   | Green (#4CAF50) | Excellent |
| 80-89 | Light Green (#8BC34A) | Good |
| 70-79 | Yellow (#FFC107) | Acceptable |
| 60-69 | Orange (#FF9800) | Poor |
| <60   | Red (#F44336) | Critical |

#### Usage

Display badge in README:

```markdown
![Quality Badge](.quality/badge.svg)
```

Example badge: `Quality 92.5% A+ ↑`

## Setup Instructions

### Initial Setup

1. **Create quality gate configuration:**
   ```bash
   mkdir -p .quality
   cp .quality/gates.json .quality/gates.json
   ```

2. **Add npm scripts:**
   Already added to `package.json`:
   ```json
   {
     "quality-check": "node run-quality-check.mjs",
     "quality-check:json": "node run-quality-check.mjs --format json",
     "quality-check:html": "node run-quality-check.mjs --format html",
     "quality-check:verbose": "node run-quality-check.mjs --verbose"
   }
   ```

3. **Install pre-commit hook:**
   ```bash
   chmod +x scripts/pre-commit-quality-check.sh
   cp scripts/pre-commit-quality-check.sh .git/hooks/pre-commit
   ```

4. **Verify setup:**
   ```bash
   npm run quality-check
   ```

### Local Development

#### Running Quality Checks Locally

```bash
# Quick console output
npm run quality-check

# Generate JSON report
npm run quality-check:json

# Generate HTML report
npm run quality-check:html

# Verbose mode with detailed info
npm run quality-check:verbose
```

#### Before Committing

The pre-commit hook runs automatically:

```bash
git add .
git commit -m "Your message"  # Pre-commit hook runs automatically
```

To bypass (not recommended):

```bash
git commit --no-verify
```

#### Viewing Reports

After running quality checks:

```bash
# Open HTML report in browser
open .quality/report.html

# View JSON report
cat .quality/report.json | jq .
```

### CI/CD Integration

#### GitHub Actions Configuration

The workflow is already configured in `.github/workflows/quality-check.yml`

**Triggers:**
- All pushes to `main` and `develop` branches
- All pull requests to `main` and `develop` branches

**Artifacts:**
- `quality-reports/`: Quality validation reports (30 days retention)
- `coverage-report/`: Test coverage reports (7 days retention)

**PR Comments:**
Automatically posts quality check results to each PR:
```
## Quality Check Results ✅

| Metric | Value |
|--------|-------|
| Overall Score | 92.5% |
| Grade | A+ |
| Status | PASS |
| Threshold | 85% |

✅ Quality gate **passed**
```

#### Required Branch Protection Rules

In GitHub repository settings, add branch protection for `main`:

1. **Require status checks to pass:**
   - Enable "Quality Validation" check

2. **Require PR reviews:**
   - Minimum 1 review before merge

3. **Require branches to be up to date:**
   - Before merging

4. **Include administrators:**
   - Enforce rules for admins too

Configuration example:

```yaml
# .github/settings.yml (if using GitHub Settings Sync)
branches:
  - name: main
    protection:
      required_status_checks:
        strict: true
        contexts:
          - Quality Validation
      required_pull_request_reviews:
        required_approving_review_count: 1
      enforce_admins: true
```

## Quality Scoring

### Overall Score Calculation

```
Overall Score = (
  (CodeQuality × 0.30) +
  (TestCoverage × 0.35) +
  (Architecture × 0.20) +
  (Security × 0.15)
)
```

### Component Scores

#### Code Quality (30% weight)
- Cyclomatic Complexity: Max 15, warning at 12
- Code Duplication: Max 5%, warning at 3%
- Linting: Max 3 errors, max 15 warnings

#### Test Coverage (35% weight, highest weight)
- Line Coverage: Min 80%
- Branch Coverage: Min 75%
- Function Coverage: Min 80%
- Statement Coverage: Min 80%

#### Architecture (20% weight)
- Component Size: Max 500 lines, warning at 300
- Circular Dependencies: Not allowed
- Cross-layer Dependencies: Discouraged
- React Best Practices: Validated

#### Security (15% weight)
- Critical Vulnerabilities: Max 0 allowed
- High Vulnerabilities: Max 2 allowed
- Secret Detection: Enforced
- XSS Risk Validation: Checked

### Grade Mapping

| Score | Grade | Status |
|-------|-------|--------|
| 95-100 | A+ | Excellent |
| 90-94 | A | Very Good |
| 85-89 | B+ | Good |
| 80-84 | B | Satisfactory |
| 70-79 | C | Acceptable |
| 60-69 | D | Poor |
| <60 | F | Fail |

## Workflows

### Developer Workflow

```
1. Make code changes locally
   ↓
2. Run tests: npm test
   ↓
3. Stage changes: git add .
   ↓
4. Attempt commit: git commit -m "..."
   ↓
5. Pre-commit hook runs quality check
   ├─ PASS: Commit proceeds
   └─ FAIL: Commit blocked (can use --no-verify)
   ↓
6. Push to feature branch
   ↓
7. Create pull request
   ↓
8. GitHub Actions workflow runs
   ├─ Tests
   ├─ Quality validator
   ├─ Generate reports
   └─ Post comment to PR
   ↓
9. Code review + quality check results
   ├─ PASS: Can merge
   └─ FAIL: Address issues and push again
   ↓
10. Merge to main (if approved)
```

### Release Workflow

Before releasing:

```bash
# Ensure all checks pass
npm test
npm run quality-check

# Verify score meets threshold
npm run quality-check:json | jq '.overall.score'

# View badge
open .quality/badge.svg

# Create release notes with quality metrics
```

## Troubleshooting

### Pre-commit Hook Not Running

**Problem**: Changes committed without quality check

**Solutions**:
```bash
# Re-install hook
cp scripts/pre-commit-quality-check.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Verify hook exists
ls -l .git/hooks/pre-commit

# Test hook manually
.git/hooks/pre-commit
```

### Quality Check Takes Too Long

**Problem**: Pre-commit hook takes >30 seconds

**Solutions**:
- Skip specific checks: `--skip-complexity --skip-security`
- Optimize configuration in `.qualityrc.json`
- Check for large files in analysis

```bash
# Modify hook to skip certain checks:
# Edit .git/hooks/pre-commit and add flags to quality-check call
```

### Badge Not Updating

**Problem**: Badge shows old score

**Solutions**:
```bash
# Regenerate badge
bash scripts/generate-badge.sh

# Verify report exists
ls -l .quality/report.json

# Check Git cache
git rm --cached .quality/badge.svg
git add .quality/badge.svg
```

### GitHub Actions Failing

**Problem**: Quality check passes locally but fails in CI

**Common Causes**:
1. **Different Node version**: CI uses 18, local uses different
2. **Different dependencies**: Run `npm ci` instead of `npm install`
3. **Cache issues**: Clear GitHub actions cache
4. **Environment variables**: Check workflow for missing configs

**Debug Steps**:
```bash
# Match CI Node version locally
nvm install 18
nvm use 18

# Clean install like CI does
npm ci --legacy-peer-deps

# Run same commands as workflow
npm test -- --coverage
node run-quality-check.mjs --format json --no-color
```

## Advanced Configuration

### Custom Quality Thresholds

Edit `.quality/gates.json`:

```json
{
  "minOverallScore": 80,  # Lowered from 85
  "minCodeQuality": 75,   # Lowered from 80
  "minTestCoverage": 60,  # Lowered from 70
  "minArchitecture": 75,  # Lowered from 80
  "minSecurity": 80       # Lowered from 85
}
```

### Exclude Files from Quality Check

Edit `.qualityrc.json`:

```json
{
  "excludePaths": [
    "node_modules/**",
    "dist/**",
    "coverage/**",
    "**/*.spec.ts",
    "**/*.test.ts",
    "src/components/legacy/**",  # Add excluded directory
    "src/lib/deprecated/**"       # Add another excluded path
  ]
}
```

### Different Thresholds for Different Branches

Modify `.github/workflows/quality-check.yml`:

```yaml
jobs:
  quality:
    steps:
      - name: Set quality threshold
        id: threshold
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/develop" ]]; then
            echo "threshold=75" >> $GITHUB_OUTPUT
          else
            echo "threshold=85" >> $GITHUB_OUTPUT
          fi

      - name: Check quality gate
        run: |
          THRESHOLD=${{ steps.threshold.outputs.threshold }}
          # Use $THRESHOLD in comparison
```

## Monitoring & Analytics

### Quality History

Quality history is stored in `.quality/history.json`:

```json
[
  {
    "timestamp": "2025-01-20T12:00:00Z",
    "overall": {
      "score": 92.5,
      "grade": "A+",
      "status": "pass"
    },
    "components": {
      "codeQuality": {"score": 85},
      "testCoverage": {"score": 95},
      "architecture": {"score": 88},
      "security": {"score": 90}
    }
  }
]
```

### Trend Analysis

Track quality over time:

```bash
# View last 10 runs
jq '.[-10:]' .quality/history.json | jq '.[].overall.score'

# Compare first vs last
jq '[.[0].overall.score, .[-1].overall.score]' .quality/history.json

# Calculate average score
jq 'map(.overall.score) | add / length' .quality/history.json
```

### Visualize Trends

Use the HTML report which includes:
- Score trend chart
- Component score breakdown
- Finding counts over time
- Issue breakdown by category

## Best Practices

### Before Committing

1. Always run quality check locally: `npm run quality-check`
2. Fix issues before committing, don't use `--no-verify`
3. Run full test suite: `npm test`
4. Review quality metrics: `npm run quality-check:verbose`

### For Code Reviews

1. Check quality check results in PR comment
2. Request changes if score below 85%
3. Ensure no new critical security issues
4. Review HTML report for detailed findings

### For CI/CD Pipeline

1. Monitor quality trend over time
2. Investigate sudden score drops
3. Update thresholds if needed (with team consensus)
4. Archive quality reports for compliance

### For Team Standards

1. Document quality standards in CONTRIBUTING.md
2. Use quality metrics in sprint planning
3. Create alerts for score drops exceeding 10%
4. Review quality metrics in retrospectives

## Performance Impact

### Local Development

- Pre-commit hook: ~5-10 seconds
- Quality check command: ~10-15 seconds
- Can be optimized by skipping specific checks

### CI/CD Pipeline

- Workflow adds ~2-3 minutes to build time
- Artifacts storage: minimal impact
- No significant cost implications

## Integration with Other Tools

### VS Code Integration

Add to `.vscode/tasks.json`:

```json
{
  "tasks": [
    {
      "label": "Quality Check",
      "type": "shell",
      "command": "npm",
      "args": ["run", "quality-check"],
      "problemMatcher": [],
      "group": {
        "kind": "test",
        "isDefault": true
      }
    }
  ]
}
```

### Pre-push Hook

Create `.git/hooks/pre-push`:

```bash
#!/bin/bash
npm run quality-check:json
if [ $? -ne 0 ]; then
  echo "Quality check failed. Push aborted."
  exit 1
fi
```

### Slack Notifications

Add to workflow for important events:

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    payload: |
      {
        "text": "Quality check failed on ${{ github.ref }}"
      }
```

## Summary

This CI/CD quality check system provides:

- **Local Feedback**: Pre-commit hook gives instant feedback
- **Automated Enforcement**: GitHub Actions enforces quality gates on all PRs
- **Visibility**: Reports and badges show quality status at a glance
- **Trend Tracking**: Historical data shows quality improvement over time
- **Flexibility**: Configurable thresholds and exclusions
- **Integration**: Works seamlessly with existing development workflow

By using this system consistently, the project maintains high code quality, reduces technical debt, and ensures reliable software delivery.
