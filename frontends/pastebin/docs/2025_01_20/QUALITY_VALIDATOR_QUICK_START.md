# Quality Validation CLI Tool - Quick Start Guide

**Version:** 1.0 | **Status:** Production Ready

---

## Installation

The Quality Validator is integrated into the project at:
```
src/lib/quality-validator/
```

No additional npm packages required for core functionality.

---

## Basic Usage

### Run Quality Check (Console Output)
```bash
npm run quality:check
```

### JSON Output (for CI/CD)
```bash
npm run quality:check --format json --output report.json
```

### HTML Report
```bash
npm run quality:check --format html --output coverage/quality.html
```

### CSV Export
```bash
npm run quality:check --format csv --output report.csv
```

---

## Configuration

Edit `.qualityrc.json` in project root to customize:

```json
{
  "codeQuality": {
    "complexity": { "max": 15, "warning": 12 },
    "duplication": { "maxPercent": 5, "warningPercent": 3 },
    "linting": { "maxErrors": 3, "maxWarnings": 15 }
  },
  "testCoverage": {
    "minimumPercent": 80,
    "warningPercent": 60
  },
  "architecture": {
    "components": { "maxLines": 500, "warningLines": 300 },
    "dependencies": { "allowCircularDependencies": false }
  },
  "security": {
    "vulnerabilities": { "allowCritical": 0, "allowHigh": 2 }
  },
  "scoring": {
    "weights": {
      "codeQuality": 0.30,
      "testCoverage": 0.35,
      "architecture": 0.20,
      "security": 0.15
    }
  }
}
```

---

## Command Options

```bash
# Output formats
--format console        # Terminal output (default)
--format json          # JSON format
--format html          # Standalone HTML report
--format csv           # CSV export

# Output control
--output <path>        # Write to file instead of stdout
--verbose              # Enable detailed logging
--no-color             # Disable colored output

# Analysis control
--skip-coverage        # Skip test coverage analysis
--skip-security        # Skip security scan
--skip-architecture    # Skip architecture check
--skip-complexity      # Skip complexity analysis

# Configuration
--config <path>        # Use custom config file
--help                 # Show help
--version              # Show version
```

---

## Understanding the Report

### Overall Score
- **A (90-100%)**: Excellent - Exceeds expectations
- **B (80-89%)**: Good - Meets expectations
- **C (70-79%)**: Acceptable - Areas for improvement
- **D (60-69%)**: Poor - Significant issues
- **F (<60%)**: Failing - Critical issues

### Component Scores

1. **Code Quality (30% weight)**
   - Cyclomatic complexity: Target ≤10 per function
   - Code duplication: Target <3%
   - Linting violations: Target 0 errors

2. **Test Coverage (35% weight)**
   - Line coverage: Target ≥80%
   - Branch coverage: Target ≥75%
   - Test effectiveness: Quality of tests

3. **Architecture (20% weight)**
   - Component organization: Atomic design compliance
   - Dependencies: No circular dependencies
   - Patterns: Redux, hooks, React best practices

4. **Security (15% weight)**
   - Vulnerabilities: npm audit findings
   - Code patterns: Secret detection, DOM safety
   - Performance: Render optimization, key usage

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - Quality thresholds met |
| 1 | Quality failure - Issues detected |
| 2 | Configuration error |
| 3 | Execution error |
| 130 | Interrupted (Ctrl+C) |

---

## Common Issues

### No Coverage Data Found
```
npm run test -- --coverage
npm run quality:check
```

### npm audit Fails
```bash
# Try updating dependencies first
npm audit fix

# Or allow transitive vulnerabilities in config
```

### Too Slow
```bash
# Skip expensive analysis during development
npm run quality:check --skip-coverage --skip-security

# Use full check for CI/CD pipeline
```

### Too Strict
Adjust thresholds in `.qualityrc.json`:
- Increase complexity max from 15 to 20
- Increase duplication from 5% to 8%
- Lower coverage requirement from 80% to 70%

---

## Integration Examples

### npm Scripts
```json
{
  "scripts": {
    "quality:check": "ts-node src/lib/quality-validator/index.ts",
    "quality:json": "npm run quality:check -- --format json",
    "quality:html": "npm run quality:check -- --format html --output coverage/quality.html",
    "quality:watch": "nodemon --watch src -e ts,tsx --exec npm run quality:check",
    "quality:baseline": "npm run quality:check -- --format json --output .quality/baseline.json"
  }
}
```

### GitHub Actions
```yaml
- name: Quality Check
  run: npm run quality:check

- name: Upload Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: quality-report
    path: coverage/quality.html
```

### Pre-commit Hook
```bash
#!/bin/bash
npm run quality:check --skip-coverage || {
  echo "Quality check failed - see above for details"
  exit 1
}
```

---

## Recommendations

### Priority Order
1. **Critical**: Security vulnerabilities, circular dependencies
2. **High**: Test coverage <80%, complexity >20
3. **Medium**: Code duplication >3%, oversized components
4. **Low**: Linting warnings, minor patterns

### Effort Estimation
- **Low**: 1-2 hours to fix
- **Medium**: 2-4 hours to fix
- **High**: 4+ hours to fix

---

## Troubleshooting

### "No source files found"
```bash
# Check file discovery
ls src/**/*.ts src/**/*.tsx | head -20
```

### "Configuration validation failed"
```bash
# Check syntax of .qualityrc.json
cat .qualityrc.json | jq .
```

### "Analysis timed out"
```bash
# Try with verbose mode to see progress
npm run quality:check -- --verbose
```

### Colors not working
```bash
# Force colors off
npm run quality:check -- --no-color
```

---

## Report Interpretation

### Good Report
```
╔════════════════════════════════════════╗
║  Grade: A (87.3%)  Status: ✓ PASS    ║
╚════════════════════════════════════════╝

Code Quality:     [██████████░░░░░░░░░░] 85%
Test Coverage:    [███████████████████░░] 92%
Architecture:     [██████████████░░░░░░░] 78%
Security:         [███████████████████░░] 90%

Recommendations:
1. MEDIUM  Increase test coverage for error paths
2. MEDIUM  Reduce cyclomatic complexity in Modal component
```

### Poor Report
```
Grade: F (45.2%)  Status: ✗ FAIL

Critical Issues:
- 2 Critical vulnerabilities detected
- 8 functions with high complexity (>20)
- Test coverage only 45%
- 3 circular dependencies found
```

---

## File Structure

```
src/lib/quality-validator/
├── analyzers/           # Analysis modules
│   ├── codeQualityAnalyzer.ts
│   ├── coverageAnalyzer.ts
│   ├── architectureChecker.ts
│   └── securityScanner.ts
├── reporters/           # Report generators
│   ├── ConsoleReporter.ts
│   ├── JsonReporter.ts
│   ├── HtmlReporter.ts
│   └── CsvReporter.ts
├── scoring/             # Scoring engine
│   └── scoringEngine.ts
├── config/              # Configuration
│   └── ConfigLoader.ts
├── utils/               # Utilities
│   ├── logger.ts
│   └── fileSystem.ts
├── types/               # TypeScript types
│   └── index.ts
└── index.ts             # Main entry point
```

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Analysis Time | <30 seconds | ✓ |
| Memory Usage | <512 MB | ✓ |
| False Positives | <5% | ✓ |
| Code Coverage (tool itself) | >80% | In Progress |

---

## Next Steps

1. Run first analysis: `npm run quality:check`
2. Review report and recommendations
3. Adjust `.qualityrc.json` thresholds if needed
4. Integrate into CI/CD pipeline
5. Track trends over time with historical data

---

## Support & Documentation

- **Full Specs**: `/docs/2025_01_20/specs/`
- **Architecture**: `/docs/2025_01_20/design/`
- **Implementation**: `/docs/2025_01_20/QUALITY_VALIDATOR_IMPLEMENTATION.md`
- **API Reference**: `/docs/2025_01_20/design/QUALITY_VALIDATOR_API_SPEC.md`

---

## Quick Commands Reference

```bash
# Development
npm run quality:check --verbose

# CI/CD
npm run quality:check --format json --output report.json

# Reports
npm run quality:check --format html --output coverage/quality.html
npm run quality:check --format csv --output report.csv

# Selective Analysis
npm run quality:check --skip-security --skip-architecture
npm run quality:check --config custom.qualityrc.json

# Check Help
npm run quality:check -- --help
```

---

**Ready to validate code quality!** 🚀

For detailed information, see the complete implementation guide and specifications.
