# Quality Validation CLI Tool - Quick Reference Guide

**Purpose:** Fast reference for key information during development
**Format:** Condensed reference material
**Last Updated:** January 20, 2025

---

## Tool Overview

**Name:** Quality Validation CLI Tool
**Type:** Standalone Node.js utility
**Purpose:** Validate code quality across 4 dimensions
**Users:** Developers, reviewers, managers
**Output:** Console, JSON, HTML, CSV reports

---

## 4 Quality Dimensions

### 1. Code Quality
| Metric | Good | Warning | Critical | Action |
|--------|------|---------|----------|--------|
| **Complexity (CC)** | ≤10 | 11-20 | >20 | Refactor functions |
| **Duplication** | <3% | 3-5% | >5% | Extract to components |
| **Linting Errors** | 0 | 1-3 | >3 | Fix violations |

### 2. Test Coverage
| Metric | Excellent | Acceptable | Poor |
|--------|-----------|-----------|------|
| **Line Coverage** | ≥80% | 60-79% | <60% |
| **Branch Coverage** | ≥80% | 60-79% | <60% |
| **Function Coverage** | ≥80% | 60-79% | <60% |

### 3. Architecture
| Check | Good | Warning | Critical |
|-------|------|---------|----------|
| **Component Size** | <300 LOC | 300-500 | >500 LOC |
| **Circular Deps** | 0 | Detected | Must fix |
| **Layer Violations** | None | Detected | Must fix |

### 4. Security
| Finding | Severity | Action |
|---------|----------|--------|
| **Critical CVE** | Critical | Fix before merge |
| **High CVE** | High | Fix soon |
| **Hard-coded Secret** | High | Remove immediately |
| **Unsafe Pattern** | Medium | Review and fix |

---

## Overall Scoring

### Grade Scale
```
A: 90-100 (Excellent) ✓ Pass
B: 80-89  (Good)      ✓ Pass
C: 70-79  (Acceptable) ⚠ Review
D: 60-69  (Poor)      ⚠ Review
F: <60    (Failing)   ✗ Fail
```

### Category Weights
- **Code Quality:** 30%
- **Test Coverage:** 35%
- **Architecture:** 20%
- **Security:** 15%

---

## 15 User Stories at a Glance

| ID | Feature | User | Value |
|----|---------|----|-------|
| US-001 | Quick quality check | Developer | Fast feedback |
| US-002 | Complexity analysis | Reviewer | Identify refactoring |
| US-003 | Duplication detection | Developer | Reduce duplication |
| US-004 | Linting review | Developer | Fix style issues |
| US-005 | Coverage status | Manager | Track progress |
| US-006 | Untested code | QA | Improve coverage |
| US-007 | Test effectiveness | Developer | Quality tests |
| US-008 | Architecture check | Architect | Enforce patterns |
| US-009 | Security scan | Security | Find vulnerabilities |
| US-010 | JSON export | DevOps | CI/CD integration |
| US-011 | HTML report | Manager | Share results |
| US-012 | Config thresholds | Team | Custom standards |
| US-013 | NPM scripts | Developer | Easy execution |
| US-014 | Trend tracking | Manager | Track progress |
| US-015 | Remediation steps | Developer | Actionable fixes |

---

## Key Algorithms

### Cyclomatic Complexity
```
CC = 1 + (Decision Points)

Decision Points:
- if/else if: +1 each
- switch case: +1 each
- loop (for/while): +1 each
- catch: +1
- logical && and ||: +1
- ternary ?: +1
```

### Duplication Detection
```
1. Extract 4+ line blocks
2. Normalize (remove comments, whitespace)
3. Hash blocks
4. Find matching hashes
5. Calculate: (duplicate lines / total lines) × 100
```

### Test Effectiveness
```
Score = (naming + assertions + isolation + mocking + coverage) / 5

- Naming Quality: 20%
- Assertions/Test: 20%
- Test Isolation: 20%
- Mock Usage: 20%
- Error Coverage: 20%
```

### Overall Scoring
```
Overall Score = (CC×0.30) + (TC×0.35) + (AC×0.20) + (SC×0.15)

Where:
- CC = Code Quality (0-100)
- TC = Test Coverage (0-100)
- AC = Architecture (0-100)
- SC = Security (0-100)
```

---

## Configuration Example

### .qualityrc.json
```json
{
  "codeQuality": {
    "complexity": {
      "good": 10,
      "warning": 15,
      "critical": 20
    },
    "duplication": {
      "warning": 3,
      "critical": 5
    },
    "linting": {
      "maxErrors": 3,
      "maxWarnings": 15
    }
  },
  "testCoverage": {
    "minimums": {
      "lines": 80,
      "branches": 75,
      "functions": 80,
      "statements": 80
    }
  },
  "architecture": {
    "maxComponentSize": 500,
    "warningComponentSize": 300
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

## CLI Commands

### Basic Commands
```bash
# Full analysis
npm run quality:check

# Quick summary (fast)
npm run quality:quick

# Detailed report
npm run quality:detailed

# Help
npm run quality:check -- --help
```

### Output Formats
```bash
# Console (default)
npm run quality:check

# JSON output
npm run quality:check --format json --output report.json

# HTML report
npm run quality:check --format html --output report.html

# CSV export
npm run quality:check --format csv --output report.csv
```

### Specific Analysis
```bash
# Code quality only
npm run quality:check --category codeQuality

# Coverage only
npm run quality:check --category testCoverage

# Verbose output
npm run quality:check --verbose
```

### Exit Codes
```
0 = Pass (all metrics pass thresholds)
1 = Fail (any metric fails threshold)
2 = Error (tool error or invalid args)
```

---

## Module Architecture

```
CLI Layer
  ↓
Configuration System → .qualityrc.json
  ↓
Analysis Pipeline (Parallel)
  ├─ Code Quality Analyzer
  │  ├─ Complexity Calculator
  │  ├─ Duplication Detector
  │  └─ Linting Analyzer
  ├─ Test Coverage Validator
  │  ├─ Metrics Parser
  │  ├─ Effectiveness Scorer
  │  └─ Gap Identifier
  ├─ Architecture Checker
  │  ├─ Component Validator
  │  └─ Dependency Analyzer
  └─ Security Scanner
     ├─ Vuln Detector
     └─ Pattern Scanner
  ↓
Metrics Aggregator
  ↓
Scoring Engine
  ↓
Report Generators
  ├─ Console Reporter
  ├─ JSON Reporter
  ├─ HTML Reporter
  └─ CSV Reporter
```

---

## Code Complexity Examples

### Good (CC = 3)
```typescript
function add(a: number, b: number): number {
  return a + b;  // 1 function = CC 1
}
```

### Acceptable (CC = 8)
```typescript
function validateEmail(email: string): boolean {
  if (!email) return false;        // +1 (if)
  if (!email.includes('@')) return false;  // +1 (if)
  if (!email.includes('.')) return false;  // +1 (if)
  return true;                     // Total: CC = 4
}
```

### Warning (CC = 16)
```typescript
function handleFormSubmit(data: FormData): void {
  if (!data.email) handleError();     // +1
  else if (!isValidEmail(data.email)) handleError();  // +1

  switch(data.type) {                 // +1
    case 'A': processA(); break;      // +1
    case 'B': processB(); break;      // +1
    case 'C': processC(); break;      // +1
  }

  if (data.newsletter) subscribe();   // +1
  if (data.privacy) acceptTerms();    // +1
  // ... more conditions
  // Total: CC = 16
}
```

---

## Typical Report Output

### Console Output
```
╔════════════════════════════════════════════════════════════╗
║          Quality Validation Report - snippet-pastebin       ║
╚════════════════════════════════════════════════════════════╝

Overall Score: 87 / 100  [GRADE: B]  ✓ PASS

CODE QUALITY                                            78/100
├─ Complexity ........................................ 85/100 ✓
├─ Duplication ........................................ 92/100 ✓
└─ Linting ............................................ 65/100 ⚠

TEST COVERAGE                                           92/100
├─ Line Coverage: 85% ✓
├─ Branch Coverage: 78% ⚠
└─ Effectiveness: 88/100 ✓

ARCHITECTURE                                            92/100
├─ Components ......................................... ✓ OK
└─ Dependencies ....................................... ✓ OK

SECURITY                                                85/100
├─ Vulnerabilities .................................... ✓ OK
└─ Anti-Patterns ...................................... ⚠

TOP IMPROVEMENTS:
1. Fix linting violations (4 errors)
2. Increase branch coverage
3. Review 2 oversized components
```

---

## JSON Schema (Key Fields)

```json
{
  "metadata": {
    "timestamp": "ISO date",
    "toolVersion": "x.x.x",
    "executionTime": 12.4
  },
  "overall": {
    "score": 87,
    "grade": "B",
    "status": "pass"
  },
  "categories": {
    "codeQuality": {
      "score": 78,
      "metrics": {
        "complexity": 85,
        "duplication": 92,
        "linting": 65
      }
    },
    "testCoverage": { ... },
    "architecture": { ... },
    "security": { ... }
  },
  "findings": [
    {
      "id": "COMPLEXITY-001",
      "severity": "warning",
      "file": "path/to/file.tsx",
      "line": 142,
      "message": "...",
      "remediation": "..."
    }
  ]
}
```

---

## Thresholds Quick Reference

### Complexity Thresholds
```
Function Complexity:
  1-4    → A (Simple)
  5-7    → B (Low)
  8-10   → C (Moderate)
  11-15  → D (High) - Review
  16-20  → E (Very High) - Refactor
  21+    → F (Critical) - Must Refactor

File Average:
  <5     → Excellent
  5-8    → Good
  8-10   → Acceptable
  10+    → High
```

### Duplication Thresholds
```
<1%     → Excellent
1-3%    → Good
3-5%    → Acceptable
5-10%   → High
>10%    → Critical
```

### Coverage Thresholds
```
≥90%    → Excellent
80-89%  → Good
70-79%  → Acceptable
60-69%  → Poor
<60%    → Critical
```

### Component Size
```
<150    → Excellent
150-300 → Good
300-500 → Acceptable
500-750 → Large (refactor)
>750    → Critical (must refactor)
```

---

## Implementation Timeline

```
Week 1-2: Foundation
  - CLI setup
  - Config system
  - Complexity analyzer
  - Coverage validator

Week 3-4: Core Analysis
  - Duplication detector
  - Linting analyzer
  - Architecture checker
  - Security scanner

Week 5: Reporting
  - Console reporter
  - JSON exporter
  - HTML generator
  - CSV exporter

Week 6-7: Polish
  - Performance optimization
  - Error handling
  - Documentation
  - CI/CD integration

Week 7-9: Beta & Launch
  - Pilot program
  - Feedback incorporation
  - Production deployment
```

---

## Key Files & Locations

### Documentation
```
docs/2025_01_20/
├── QUALITY_VALIDATOR_INDEX.md          [Master index]
├── SPECIFICATION_DELIVERY_SUMMARY.md   [Summary]
├── QUICK_REFERENCE_GUIDE.md            [This file]
├── specs/
│   ├── QUALITY_VALIDATOR_REQUIREMENTS.md
│   ├── QUALITY_VALIDATOR_USER_STORIES.md
│   └── PROJECT_BRIEF_QUALITY_VALIDATOR.md
└── design/
    ├── QUALITY_VALIDATOR_ARCHITECTURE.md
    └── QUALITY_METRICS_AND_VALIDATION.md
```

### Implementation (To be created)
```
src/
├── cli/
│   ├── index.ts
│   ├── commands.ts
│   └── cli-parser.ts
├── lib/quality-validator/
│   ├── code-quality-analyzer.ts
│   ├── test-coverage-validator.ts
│   ├── architecture-checker.ts
│   ├── security-scanner.ts
│   ├── metrics-aggregator.ts
│   ├── scoring-engine.ts
│   └── reporters/
│       ├── console-reporter.ts
│       ├── json-reporter.ts
│       ├── html-reporter.ts
│       └── csv-reporter.ts
└── __tests__/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Common Issues & Solutions

### Issue: Tool Too Slow
**Solution:** Parallel analysis, caching, lazy evaluation

### Issue: False Positives
**Solution:** Beta testing, threshold calibration, feedback loop

### Issue: Low Adoption
**Solution:** Manager sponsorship, clear benefits communication, training

### Issue: Configuration Complexity
**Solution:** Sensible defaults, optional customization, examples

---

## Success Criteria Checklist

### Functional
- [ ] All 4 quality dimensions analyzed
- [ ] All 4 report formats generated
- [ ] Configuration system working
- [ ] CLI commands functional
- [ ] Exit codes correct

### Quality
- [ ] < 5% false positive rate
- [ ] > 95% issue detection accuracy
- [ ] 80%+ tool test coverage
- [ ] Zero critical bugs

### Performance
- [ ] < 30 second analysis time
- [ ] < 512 MB memory usage
- [ ] < 5% build time impact

### Business
- [ ] > 75% developer adoption
- [ ] 15+ minute review time savings
- [ ] > 80% recommendation value

---

## Quick Command Reference

```bash
# Development
npm run dev                    # Start dev server
npm test                       # Run tests
npm run lint                   # Run linting
npm run build                  # Build project

# Quality Tool (once implemented)
npm run quality:check          # Full analysis
npm run quality:quick          # Fast summary
npm run quality:detailed       # Detailed report

# Export formats
npm run quality:check -- --format json --output report.json
npm run quality:check -- --format html --output report.html
npm run quality:check -- --format csv --output report.csv
```

---

## Metric Calculation Examples

### Complexity Example
```typescript
function processData(items: Item[]): Result {
  let result = [];

  for (let item of items) {              // CC +1
    if (item.valid) {                    // CC +1
      if (item.active) {                 // CC +1
        result.push(item);
      }
    } else if (item.pending) {           // CC +1
      queue.add(item);
    }
  }

  return result;
  // Total CC = 5
}
```

### Duplication Example
```typescript
// Block 1: src/components/Button.tsx
const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '4px',
  backgroundColor: '#007bff'
};

// Block 2: src/components/IconButton.tsx (DUPLICATE)
const iconButtonStyle = {
  padding: '8px 16px',
  borderRadius: '4px',
  backgroundColor: '#007bff'
};

// Should be extracted to:
const baseButtonStyle = {
  padding: '8px 16px',
  borderRadius: '4px',
  backgroundColor: '#007bff'
};
```

---

## Testing Strategy

### Unit Tests
- Test each analyzer module independently
- Mock external dependencies
- Test edge cases and error conditions
- Target: 80%+ coverage per module

### Integration Tests
- Test analyzer pipeline together
- Test with real codebase
- Test configuration loading
- Test report generation

### End-to-End Tests
- Full analysis on snippet-pastebin
- Verify report generation
- Test CI/CD integration
- Validate performance metrics

---

## Troubleshooting Guide

| Problem | Cause | Solution |
|---------|-------|----------|
| Slow analysis | Parallel not working | Check implementation |
| False positives | Thresholds too strict | Calibrate with team |
| Missing findings | Coverage incomplete | Check analyzer |
| Report errors | Template issue | Validate reporter |
| Config not loading | Path issue | Check file path |

---

## Performance Targets

```
Analysis Component          Target
────────────────────────────────────
Code Quality Analyzer       < 10s
Test Coverage Validator     < 8s
Architecture Checker        < 7s
Security Scanner            < 5s
Metrics Aggregation         < 2s
Report Generation           < 2s
────────────────────────────────────
Total                       < 30s
```

---

## Resources & References

**Documentation Files:**
- QUALITY_VALIDATOR_INDEX.md - Master index
- QUALITY_VALIDATOR_REQUIREMENTS.md - Detailed requirements
- QUALITY_VALIDATOR_USER_STORIES.md - Feature specifications
- QUALITY_VALIDATOR_ARCHITECTURE.md - Technical design
- QUALITY_METRICS_AND_VALIDATION.md - Metric definitions
- PROJECT_BRIEF_QUALITY_VALIDATOR.md - Business case

**External References:**
- TypeScript Compiler APIs - AST parsing
- ESLint Plugin Architecture - Extending linting
- Jest Coverage Format - Coverage data parsing
- npm audit - Vulnerability database

---

**Quick Reference Guide Version:** 1.0
**Last Updated:** January 20, 2025
**Status:** Ready for Development

---

**End of Quick Reference Guide**
