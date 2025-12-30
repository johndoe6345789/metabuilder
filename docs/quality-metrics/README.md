# Comprehensive Quality Metrics System

This document describes the comprehensive quality metrics system implemented for MetaBuilder's CI/CD pipeline.

## Overview

The quality metrics workflow (`quality-metrics.yml`) runs on every pull request and push to main/master branches, collecting data across **8 major quality dimensions**. This ensures code meets professional standards for security, performance, maintainability, and reliability.

## Quality Dimensions

### 1. 🔍 Code Quality Analysis

**Measures**: Cyclomatic complexity, cognitive complexity, nesting levels, function metrics

**Script**: `scripts/check-code-complexity.ts`

**What it checks**:
- Cyclomatic complexity per function (target: ≤ 10)
- Cognitive complexity (target: ≤ 15)
- Nesting depth (target: ≤ 4)
- Lines of code per function
- Function count per file

**Why it matters**: High complexity indicates code is hard to test, maintain, and debug. Lower complexity correlates with fewer bugs.

**Artifacts**: `code-quality-reports/complexity-report.json`

### 2. 🧪 Test Coverage Analysis

**Measures**: Line coverage, statement coverage, function coverage, branch coverage

**Scripts**: 
- `npm run test:unit:coverage` (executes vitest)
- `scripts/extract-coverage-metrics.ts` (aggregates results)

**Coverage Goals**:
- Lines: ≥ 80%
- Statements: ≥ 80%
- Functions: ≥ 80%
- Branches: ≥ 75%

**Why it matters**: Tests prevent regressions and give confidence in refactoring. Coverage tracking ensures new code is tested.

**Artifacts**: 
- `coverage-reports/coverage-metrics.json`
- `coverage-reports/FUNCTION_TEST_COVERAGE.md`

### 3. 🔐 Security Scanning

**Measures**: Vulnerability scanning, anti-pattern detection, dependency audit

**Scripts**:
- `scripts/security-scanner.ts` (static analysis)
- `scripts/parse-npm-audit.ts` (dependency vulnerabilities)
- OWASP Dependency Check

**Checks for**:
- `eval()` usage (critical)
- Direct `innerHTML` assignment (high)
- `dangerouslySetInnerHTML` without sanitization (high)
- Hardcoded credentials (critical)
- SQL injection risks (high)
- Unvalidated fetch calls (medium)
- Missing input validation (medium)
- CORS security headers (medium)

**Why it matters**: Security vulnerabilities can expose user data or allow remote code execution. Early detection prevents breaches.

**Artifacts**: 
- `security-reports/security-report.json`
- `security-reports/npm-audit.json`

### 4. 📚 Documentation Quality

**Measures**: JSDoc coverage, README quality, markdown link validity, code examples

**Scripts**:
- `scripts/check-jsdoc-coverage.ts` (function documentation)
- `scripts/validate-readme-quality.ts` (README sections)
- `scripts/validate-markdown-links.ts` (broken links)
- `scripts/validate-code-examples.ts` (runnable examples)

**Documentation Targets**:
- Exported functions must have JSDoc (≥ 80%)
- README must include: Description, Installation, Usage, Contributing
- No broken links in documentation
- Code examples should be valid and runnable

**Why it matters**: Good docs reduce onboarding time, prevent misuse of APIs, and improve library adoption.

**Artifacts**:
- `documentation-reports/jsdoc-report.json`
- `documentation-reports/readme-report.json`
- `documentation-reports/markdown-links-report.json`

### 5. ⚡ Performance Metrics

**Measures**: Bundle size, performance budget, Lighthouse scores, render performance

**Scripts**:
- `scripts/analyze-bundle-size.ts` (webpack analysis)
- `scripts/check-performance-budget.ts` (size thresholds)
- `scripts/run-lighthouse-audit.ts` (web vitals)
- `scripts/analyze-render-performance.ts` (React render times)

**Performance Budgets**:
- Main bundle: ≤ 500KB (gzipped ≤ 150KB)
- CSS: ≤ 100KB
- Images: ≤ 200KB per route

**Lighthouse Targets**:
- Performance: ≥ 80
- Accessibility: ≥ 90
- Best Practices: ≥ 85
- SEO: ≥ 90

**Why it matters**: Fast sites improve user experience and SEO. Slow sites lose users and revenue.

**Artifacts**:
- `performance-reports/bundle-analysis.json`
- `performance-reports/performance-budget.json`
- `performance-reports/lighthouse-report.json`

### 6. 📦 File Size & Architecture

**Measures**: Component size, file count, import chains, code duplication

**Scripts**:
- `scripts/check-file-sizes.ts` (component/file limits)
- `scripts/analyze-directory-structure.ts` (org analysis)
- `scripts/detect-code-duplication.ts` (DRY violations)
- `scripts/analyze-import-chains.ts` (dependency depth)

**Size Limits**:
- React components: ≤ 300 lines
- Utilities: ≤ 200 lines
- Any file: ≤ 500 lines
- Functions: ≤ 50 lines

**Architecture Goals**:
- No circular dependencies
- Import chain depth ≤ 5
- Code duplication ≤ 5%

**Why it matters**: Large files are hard to test and refactor. Deep dependencies are hard to debug. Duplication wastes maintenance effort.

**Artifacts**:
- `size-reports/file-sizes-report.json`
- `size-reports/directory-structure.json`
- `size-reports/duplication-report.json`

### 7. 📚 Dependency Health

**Measures**: Outdated packages, license compliance, circular deps, tree analysis

**Scripts**:
- `npm outdated --json` (version tracking)
- `scripts/check-license-compliance.ts` (license audit)
- `scripts/detect-circular-dependencies.ts` (dep cycles)
- `scripts/analyze-dependency-tree.ts` (complexity)

**Dependency Goals**:
- All licenses compatible with project
- No circular dependencies
- Dependency tree depth ≤ 8
- No critical vulnerabilities

**Why it matters**: Outdated packages miss security fixes. License issues create legal risk. Circular deps are hard to debug.

**Artifacts**:
- `dependency-reports/outdated-deps.json`
- `dependency-reports/license-report.json`
- `dependency-reports/circular-deps.json`

### 8. 🎯 Type Safety & Code Style

**Measures**: TypeScript strict mode, ESLint violations, `@ts-ignore` usage, `any` types

**Scripts**:
- `scripts/check-typescript-strict.ts` (type checking)
- `scripts/parse-eslint-report.ts` (linting)
- `scripts/find-ts-ignores.ts` (suppress count)
- `scripts/find-any-types.ts` (type safety)

**Type Safety Goals**:
- Zero TypeScript strict mode violations
- Zero critical ESLint errors
- Minimize `@ts-ignore` usage (should have comments)
- Minimize `any` types (should be specific types)

**ESLint Priority**:
- Errors: ≥ 0 (fail on any errors)
- Warnings: Report but don't fail

**Why it matters**: Type safety catches bugs at compile time. Strict linting prevents hard-to-debug runtime issues.

**Artifacts**:
- `type-reports/ts-strict-report.json`
- `type-reports/eslint-report.json`
- `type-reports/ts-ignore-report.json`
- `type-reports/any-types-report.json`

## Workflow Jobs

The `quality-metrics.yml` workflow runs **8 parallel jobs** for different metrics categories:

1. **code-quality** - Analyzes complexity (5 min)
2. **coverage-metrics** - Runs tests with coverage (10 min)
3. **security-scan** - Security vulnerability scanning (5 min)
4. **documentation-quality** - Docs validation (3 min)
5. **performance-metrics** - Bundle analysis (8 min)
6. **size-metrics** - File size checks (3 min)
7. **dependency-analysis** - Dependency health (3 min)
8. **type-and-lint-metrics** - Type checking & linting (8 min)
9. **quality-summary** - Aggregates all results (2 min) - **Runs after all jobs**

**Total time**: ~15-20 minutes parallel (vs 40+ minutes if serial)

## Reading the Reports

Each job uploads artifacts containing JSON reports:

```bash
quality-reports/
├── code-quality-reports/
│   ├── complexity-report.json
│   ├── function-metrics.json
│   └── maintainability-report.json
├── coverage-reports/
│   ├── coverage-metrics.json
│   └── FUNCTION_TEST_COVERAGE.md
├── security-reports/
│   ├── security-report.json
│   └── npm-audit.json
├── documentation-reports/
│   ├── jsdoc-report.json
│   ├── readme-report.json
│   ├── markdown-links-report.json
│   └── api-docs-report.json
├── performance-reports/
│   ├── bundle-analysis.json
│   ├── performance-budget.json
│   └── lighthouse-report.json
├── size-reports/
│   ├── file-sizes-report.json
│   ├── directory-structure.json
│   ├── duplication-report.json
│   └── import-analysis.json
├── dependency-reports/
│   ├── outdated-deps.json
│   ├── license-report.json
│   └── circular-deps.json
└── type-reports/
    ├── ts-strict-report.json
    ├── eslint-report.json
    ├── ts-ignore-report.json
    └── any-types-report.json
```

### Sample Report Format

Each report is JSON for easy parsing:

```json
{
  "coverage": 85,
  "byType": {
    "lines": "85%",
    "statements": "85%",
    "functions": "80%",
    "branches": "75%"
  },
  "goals": {
    "lines": 80,
    "statements": 80,
    "functions": 80,
    "branches": 75
  },
  "status": {
    "lines": "pass",
    "statements": "pass",
    "functions": "pass",
    "branches": "pass"
  },
  "timestamp": "2025-12-25T10:30:00Z"
}
```

## PR Comment Integration

The workflow posts a comprehensive summary as a PR comment:

```markdown
## 📊 Quality Metrics Report

| Metric | Status | Details |
|--------|--------|---------|
| 🔍 Code Quality | ✅ Pass | Average complexity: 5.2 |
| 🧪 Test Coverage | ⚠️ Warning | 78% coverage (goal: 80%) |
| 🔐 Security | ✅ Pass | 0 critical issues |
| 📚 Documentation | ✅ Good | 85% documented |
| ⚡ Performance | ✅ Pass | 450KB gzipped |
| 📦 File Size | ✅ Pass | 0 violations |
| 📚 Dependencies | ✅ OK | All licenses compatible |
| 🎯 Type Safety | ✅ Pass | 0 critical errors |

## Recommendations
- Maintain test coverage above 80%
- Add JSDoc comments to exported functions
- Monitor bundle size to prevent performance degradation
```

## Local Testing

Run individual metric checks locally:

```bash
# Code complexity
npx tsx scripts/check-code-complexity.ts

# Security scan
npx tsx scripts/security-scanner.ts

# JSDoc coverage
npx tsx scripts/check-jsdoc-coverage.ts

# File sizes
npx tsx scripts/check-file-sizes.ts

# All metrics (as in CI)
npm run test:unit:coverage
npm run lint
npx tsc --noEmit
```

## Extending Metrics

To add a new quality metric:

1. **Create a script** in `scripts/my-metric.ts`
2. **Output JSON** with metric data
3. **Add a job** to `.github/workflows/quality-metrics.yml`
4. **Update the summary** script to parse your metrics

Example:

```bash
# scripts/my-metric.ts
#!/usr/bin/env tsx
console.log(JSON.stringify({
  myMetric: 95,
  status: 'pass',
  timestamp: new Date().toISOString()
}, null, 2))
```

Then add to workflow:

```yaml
- name: Check my metric
  run: npx tsx scripts/my-metric.ts > my-metric.json
  continue-on-error: true
```

## CI Integration

The workflow is configured to:

- ✅ Run on every PR to main/develop
- ✅ Run on every push to main/master
- ✅ Post results as PR comments
- ✅ Create check runs in GitHub
- ✅ Upload artifacts for 30 days
- ✅ Continue on errors (doesn't block merges)
- ✅ Run in parallel for speed

## Best Practices

1. **Act on warnings** - Fix issues before they become critical
2. **Trend metrics** - Track metrics over time to spot regressions
3. **Set realistic goals** - Don't aim for 100% on everything
4. **Automate fixes** - Use `npm run lint:fix` before committing
5. **Review artifacts** - Download reports to analyze failures
6. **Educate team** - Share report insights in retrospectives

## Troubleshooting

**"Artifacts not generated"**: Check job logs for errors. Some scripts may need dependencies installed.

**"Report shows zero metrics"**: The analysis script may have failed silently. Check the job log.

**"PR comment not posted"**: Workflow needs `pull-requests: write` permission. Check workflow permissions.

**"Bundle analysis fails"**: Ensure `npm run build` completes successfully before bundle analysis runs.

## References

- [Quality Metrics Workflow](../../.github/workflows/quality-metrics.yml)
- [ESLint Configuration](../../.eslintrc.json)
- [TypeScript Configuration](../../tsconfig.json)
- [Test Coverage Configuration](../../vitest.config.ts)

---

**Last updated**: December 25, 2025
