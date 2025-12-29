# Atomic Gated Workflow Architecture

## Overview

The atomic gated workflow breaks down each gate into individual, granular validation steps. This provides superior visibility into the CI/CD pipeline and creates a comprehensive audit trail.

## Atomic Steps by Gate

### Gate 1: Code Quality (7 Atomic Steps)

Each validation runs as a separate job with its own status:

1. **1.1 Prisma Validation** - Database schema validation
2. **1.2 TypeScript Check** - Type checking + strict mode analysis
3. **1.3 ESLint** - Linting + any-type detection + ts-ignore detection
4. **1.4 Security Scan** - Security pattern detection + dependency audit
5. **1.5 File Size Check** - File size limits enforcement
6. **1.6 Code Complexity** - Complexity analysis
7. **1.7 Stub Detection** - Incomplete implementation detection

### Gate 2: Testing (3 Atomic Steps)

1. **2.1 Unit Tests** - Unit test execution + coverage analysis
2. **2.2 E2E Tests** - Playwright end-to-end tests
3. **2.3 DBAL Daemon Tests** - Database abstraction layer tests

### Gate 3: Build & Package (2 Atomic Steps)

1. **3.1 Application Build** - Production build + bundle analysis
2. **3.2 Quality Metrics** - console.log detection + TODO analysis + quality summary

## Atomic Validation Tools Used

The workflow leverages existing atomic tools from the `/tools` directory:

### Quality Tools
- `tools/quality/code/check-typescript-strict.ts` - TypeScript strict mode checker
- `tools/quality/code/check-code-complexity.ts` - Code complexity analyzer
- `tools/quality/code/check-function-coverage.js` - Function test coverage
- `tools/quality/files/check-file-sizes.ts` - File size validator

### Security Tools
- `tools/security/security-scanner.ts` - Security pattern detector
- `tools/misc/metrics/parse-npm-audit.ts` - Audit result parser

### Detection Tools
- `tools/detection/detect-stub-implementations.ts` - Stub implementation detector
- `tools/detection/detect-circular-dependencies.ts` - Circular dependency detector
- `tools/detection/detect-code-duplication.ts` - Code duplication detector

### Lint Tools
- `tools/misc/lint/find-any-types.ts` - Any type usage detector
- `tools/misc/lint/find-ts-ignores.ts` - ts-ignore comment detector

### Analysis Tools
- `tools/analysis/bundle/analyze-bundle-size.ts` - Bundle size analyzer
- `tools/analysis/bundle/analyze-dependency-tree.ts` - Dependency tree analyzer
- `tools/analysis/code/analyze-function-metrics.ts` - Function metrics analyzer

### Generation Tools
- `tools/generation/generate-quality-summary.ts` - Quality summary generator
- `tools/generation/generate-test-coverage-report.js` - Coverage report generator

## Gate Artifacts & Persistent Storage

Each atomic step generates artifacts that are persisted using GitHub Actions artifacts:

### Artifact Structure

```
gate-artifacts/
├── gate-1/                          # Gate 1 artifacts
│   ├── status.txt                   # Gate status
│   ├── start-time.txt               # Gate start timestamp
│   ├── end-time.txt                 # Gate end timestamp
│   ├── prisma-check.txt             # Step 1.1 result
│   ├── prisma-check-time.txt        # Step 1.1 timestamp
│   ├── typecheck.txt                # Step 1.2 result
│   ├── typescript-strict.json       # TypeScript strict analysis
│   ├── lint.txt                     # Step 1.3 result
│   ├── any-types.json               # Any type usage
│   ├── ts-ignores.json              # ts-ignore comments
│   ├── security-scan.txt            # Step 1.4 result
│   ├── security-scan.json           # Security issues
│   ├── audit-results.json           # npm audit results
│   ├── audit-summary.json           # Parsed audit summary
│   ├── file-size-check.txt          # Step 1.5 result
│   ├── file-sizes.json              # File size analysis
│   ├── complexity-check.txt         # Step 1.6 result
│   ├── complexity.json              # Complexity analysis
│   ├── stub-detection.txt           # Step 1.7 result
│   └── stubs.json                   # Stub implementations
├── gate-2/                          # Gate 2 artifacts
│   ├── status.txt
│   ├── start-time.txt
│   ├── end-time.txt
│   ├── test-unit.txt                # Step 2.1 result
│   ├── test-unit-time.txt
│   ├── coverage-report.json         # Test coverage
│   ├── function-coverage.json       # Function coverage
│   ├── test-e2e.txt                 # Step 2.2 result
│   ├── test-e2e-time.txt
│   ├── test-dbal-daemon.txt         # Step 2.3 result
│   └── test-dbal-daemon-time.txt
├── gate-3/                          # Gate 3 artifacts
│   ├── status.txt
│   ├── start-time.txt
│   ├── end-time.txt
│   ├── build.txt                    # Step 3.1 result
│   ├── build-time.txt
│   ├── bundle-size.json             # Bundle analysis
│   ├── quality-check.txt            # Step 3.2 result
│   ├── quality-check-time.txt
│   └── quality-summary.json         # Quality metrics
└── complete-gate-audit-trail/       # Consolidated report
    └── [all artifacts merged]
```

### Artifact Retention

- **Individual step results**: 7 days
- **Complete audit trail**: 30 days
- **Test reports (coverage, playwright)**: 7 days
- **Build artifacts**: 7 days

## Benefits of Atomic Steps

### 1. Superior Visualization

Each validation step appears as a separate job in the GitHub Actions UI, providing:
- Clear visual progress through gates
- Individual step status (✓ or ✗)
- Precise failure identification
- Step-by-step execution time

### 2. Granular Failure Detection

When a gate fails, you immediately see:
- Which specific validation failed
- Exact time of failure
- Detailed logs for that step only
- No need to dig through monolithic logs

### 3. Parallel Execution

Within each gate, independent steps run in parallel:
- Gate 1: All 7 quality checks run simultaneously
- Gate 2: All 3 test suites run simultaneously  
- Gate 3: Build and quality check run simultaneously

### 4. Audit Trail

Complete artifact chain provides:
- Forensic analysis of what was checked
- Historical trend analysis
- Compliance documentation
- Debugging historical issues

### 5. Progressive Enhancement

Easy to add new atomic steps:
- Add new validation tool to `/tools`
- Add new step to workflow
- Artifact collection happens automatically
- No disruption to existing steps

## Usage

### Running Locally with Act

Test individual atomic steps:

```bash
# Test specific atomic step
npm run act -- -j prisma-check -W ../.github/workflows/gated-ci-atomic.yml
npm run act -- -j security-scan -W ../.github/workflows/gated-ci-atomic.yml
npm run act -- -j stub-detection -W ../.github/workflows/gated-ci-atomic.yml

# Test complete gate
npm run act -- -j gate-1-complete -W ../.github/workflows/gated-ci-atomic.yml
npm run act -- -j gate-2-complete -W ../.github/workflows/gated-ci-atomic.yml

# Test full workflow
npm run act pull_request -W ../.github/workflows/gated-ci-atomic.yml
```

### Viewing Gate Artifacts

After workflow completion:

1. Navigate to workflow run in GitHub Actions
2. Scroll to "Artifacts" section at bottom
3. Download artifact bundles:
   - `gate-1-complete-report` - All Gate 1 validation results
   - `gate-2-complete-report` - All Gate 2 test results
   - `gate-3-complete-report` - All Gate 3 build results
   - `complete-gate-audit-trail` - Complete audit trail (30 days)

### Analyzing Results

Each JSON artifact can be analyzed:

```bash
# Security scan results
cat gate-1/security-scan.json | jq '.issues[] | select(.severity == "critical")'

# Stub implementations
cat gate-1/stubs.json | jq '.stubs[] | select(.severity == "high")'

# Test coverage
cat gate-2/coverage-report.json | jq '.summary'

# Bundle size
cat gate-3/bundle-size.json | jq '.totalSize'

# Quality summary
cat gate-3/quality-summary.json | jq '.score'
```

## Comparison: Monolithic vs Atomic

### Monolithic Approach (Original)

```
Gate 1: Code Quality [RUNNING]
  ├─ All validation in one job
  ├─ Failure = need to read full log
  └─ No intermediate artifacts
```

### Atomic Approach (New)

```
Gate 1: Code Quality
  ├─ 1.1 Prisma Validation ✓ [artifact]
  ├─ 1.2 TypeScript Check ✓ [artifact]
  ├─ 1.3 ESLint ✗ [artifact + detailed error]
  ├─ 1.4 Security Scan ✓ [artifact]
  ├─ 1.5 File Size Check ✓ [artifact]
  ├─ 1.6 Code Complexity ✓ [artifact]
  └─ 1.7 Stub Detection ✓ [artifact]
```

**Immediate benefit**: You know ESLint failed, not something else.

## Workflow Selection

The repository now has two gated workflows:

### `gated-ci.yml` - Consolidated Gates
- Fewer jobs (simpler for small teams)
- Faster execution (less orchestration overhead)
- Good for: Small teams, simple projects

### `gated-ci-atomic.yml` - Atomic Gates  
- More jobs (better visibility)
- Detailed audit trail
- Individual step artifacts
- Good for: Large teams, compliance requirements, complex projects

**Recommendation**: Use `gated-ci-atomic.yml` for better visualization and audit trail.

## Migration from Original Gated Workflow

To switch to atomic workflow:

1. **Update branch protection rules**: Change required checks to atomic step names
2. **Update auto-merge workflow**: Add atomic step names to check list
3. **Test with sample PR**: Verify all atomic steps run correctly
4. **Monitor first few PRs**: Ensure parallel execution works as expected

## Future Enhancements

Potential additions to atomic workflow:

1. **Artifact Dashboard**: Web UI for browsing gate artifacts
2. **Trend Analysis**: Historical charts of validation metrics
3. **Smart Retry**: Automatic retry of flaky atomic steps
4. **Conditional Steps**: Skip irrelevant validations based on changed files
5. **Custom Tools**: Add project-specific atomic validators
6. **Performance Budgets**: Enforce performance metrics per atomic step
7. **Notification Hooks**: Slack/email alerts for specific atomic step failures

## Troubleshooting

### Artifact Not Found

If gate artifacts are missing:
- Check artifact retention period (7-30 days)
- Verify step completed (check job logs)
- Ensure upload step ran (check for upload errors)

### Step Takes Too Long

If an atomic step is slow:
- Check if parallel execution is enabled
- Review tool implementation for efficiency
- Consider caching dependencies
- Split into smaller atomic steps if possible

### Validation Tool Fails

If atomic validation tool crashes:
- Steps have `continue-on-error: true` for resilience
- Check tool logs in step output
- Verify tool has required dependencies
- Test tool locally: `tsx tools/path/to/tool.ts`

## Related Documentation

- [Enterprise Gated Workflow](ENTERPRISE_GATED_WORKFLOW.md) - Original gated workflow
- [Testing Gated Workflows](guides/TESTING_GATED_WORKFLOWS.md) - Local testing guide
- [Legacy Pipeline Cruft Report](LEGACY_PIPELINE_CRUFT_REPORT.md) - Cleanup analysis
- [Tools README](../tools/README.md) - Available atomic validation tools

---

**Version:** 1.0.0  
**Last Updated:** December 27, 2025  
**Status:** Active - Recommended for Enterprise Use
