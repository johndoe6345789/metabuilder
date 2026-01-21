# Quality Validation CLI - Metrics Definitions and Validation Criteria

**Document ID:** QUAL-METRICS-001
**Version:** 1.0
**Date:** January 20, 2025
**Status:** APPROVED FOR DEVELOPMENT

---

## Table of Contents

1. [Code Quality Metrics](#code-quality-metrics)
2. [Test Coverage Metrics](#test-coverage-metrics)
3. [Architecture Metrics](#architecture-metrics)
4. [Security Metrics](#security-metrics)
5. [Validation Criteria](#validation-criteria)
6. [Scoring and Grading](#scoring-and-grading)
7. [Threshold Configuration](#threshold-configuration)
8. [Reporting Standards](#reporting-standards)

---

## Code Quality Metrics

### 1. Cyclomatic Complexity (CC)

#### Definition
Cyclomatic complexity is a quantitative measure of the number of linearly independent paths through source code. It indicates how many test cases are needed to achieve branch coverage.

#### Formula
```
CC = E - N + 2P
Where:
  E = Number of edges in control flow graph
  N = Number of nodes in control flow graph
  P = Number of connected components (usually 1)

Simplified: Count decision points + 1
  - Each if statement: +1
  - Each else if: +1
  - Each else: +0 (already counted in if)
  - Each for/while loop: +1
  - Each case in switch: +1
  - Each catch clause: +1
  - Each logical AND/OR operator: +1
  - Each ternary operator: +1
```

#### Measurement Approach
1. Parse each function into AST
2. Count control flow decision points
3. Sum all decision paths
4. Report per-function and file-average CC

#### Thresholds and Interpretation

| Complexity | Rating | Interpretation | Recommendation |
|------------|--------|----------------|-----------------|
| 1-4 | A | Simple, low risk | No action needed |
| 5-7 | B | Low complexity | Acceptable |
| 8-10 | C | Moderate complexity | Monitor |
| 11-15 | D | High complexity | Review & refactor |
| 16-20 | E | Very high complexity | Should refactor |
| 21+ | F | Extremely complex | Must refactor |

#### Project Configuration

```json
{
  "codeQuality": {
    "complexity": {
      "threshold": {
        "good": 10,
        "warning": 15,
        "critical": 20
      },
      "measurementType": "cyclomatic",
      "includeNested": true
    }
  }
}
```

#### Validation Criteria

- [ ] All functions with CC > 20 identified and reported
- [ ] Average CC per file calculated
- [ ] Distribution histogram provided
- [ ] Specific refactoring suggestions included
- [ ] Function names and line numbers provided
- [ ] Parameter complexity not counted separately

#### Example Output

```
Complexity Analysis Results:

CRITICAL ISSUES (CC > 20):
- SnippetManager.tsx:142-198
  Function: handleComplexSnippetCreation
  CC: 24 (exceeds threshold of 20)
  Decision points:
    - 8 if statements
    - 3 switch cases
    - 2 loops
    - 1 try-catch
  Suggestion: Extract input validation, error handling into separate functions

HIGH COMPLEXITY (11-20):
- CodeEditor.tsx:89-134
  Function: renderEditor
  CC: 16 (within warning threshold)
  Suggestion: Consider extracting conditional rendering blocks
```

---

### 2. Code Duplication

#### Definition
Code duplication is the existence of identical or nearly identical code in multiple locations. Duplication increases maintenance burden and risk of introducing inconsistencies.

#### Measurement Approach

1. **Block Extraction**
   - Extract all code blocks (minimum 4 consecutive lines)
   - Parse TypeScript/TSX into normalized form
   - Remove comments and whitespace variations

2. **Normalization**
   - Remove all comments
   - Standardize whitespace (multiple spaces → single space)
   - Normalize indentation
   - Ignore variable name changes (partial credit)

3. **Hashing & Matching**
   - Hash normalized blocks
   - Find exact matches
   - Find near-matches (> 80% similarity)

4. **Calculation**
   ```
   Duplication % = (Total duplicate lines / Total lines) × 100
   ```

#### Thresholds and Interpretation

| Duplication | Rating | Interpretation | Recommendation |
|-------------|--------|----------------|-----------------|
| < 1% | A | Excellent | Maintain |
| 1-3% | B | Good | Acceptable |
| 3-5% | C | Acceptable | Review |
| 5-10% | D | High | Refactor |
| > 10% | F | Very High | Must refactor |

#### Project Configuration

```json
{
  "codeQuality": {
    "duplication": {
      "enabled": true,
      "minBlockSize": 4,
      "similarityThreshold": 0.8,
      "threshold": {
        "warning": 3,
        "critical": 5
      },
      "excludePatterns": [
        "**/node_modules/**",
        "**/dist/**",
        "**/coverage/**"
      ]
    }
  }
}
```

#### Validation Criteria

- [ ] All blocks ≥ 4 lines are checked for duplication
- [ ] Exact duplicates identified
- [ ] Near-duplicates identified (configurable similarity)
- [ ] Duplication percentage calculated
- [ ] Duplicate locations reported with line numbers
- [ ] Refactoring suggestions provided

#### Example Output

```
Code Duplication Analysis:

Overall Duplication: 2.4% (GOOD - below 3% threshold)

Duplicate Blocks Found: 3

BLOCK 1: Button styling pattern
Size: 8 lines, Found 2 times, Total duplication: 8 lines
Location 1: src/components/atoms/Button.tsx:45-52
Location 2: src/components/atoms/IconButton.tsx:38-45
Suggestion: Extract to shared style utility function

BLOCK 2: Redux slice creation boilerplate
Size: 12 lines, Found 3 times, Total duplication: 24 lines
Locations:
  1. src/store/slices/snippetsSlice.ts:1-12
  2. src/store/slices/namespacesSlice.ts:1-12
  3. src/store/slices/uiSlice.ts:1-12
Suggestion: Create factory function for slice creation boilerplate

Near-Duplicates (80%+ similarity):
[None detected]
```

---

### 3. Code Style Compliance (Linting)

#### Definition
Code style compliance measures adherence to project coding standards as defined by ESLint configuration.

#### Measurement Approach

1. Run ESLint with project configuration
2. Capture all violations
3. Categorize by severity (error, warning, info)
4. Group by rule
5. Calculate aggregates

#### Severity Levels

| Severity | Meaning | Action | Block Merge |
|----------|---------|--------|------------|
| Error | Critical standards violation | Must fix | Yes |
| Warning | Should follow standard | Should fix | Configurable |
| Info | Nice-to-have improvement | Consider | No |

#### Thresholds and Interpretation

| Errors | Warnings | Rating | Recommendation |
|--------|----------|--------|-----------------|
| 0 | 0-5 | A | Excellent |
| 0 | 6-10 | B | Good |
| 1-2 | 11-20 | C | Acceptable |
| 3-5 | 21+ | D | Poor |
| 6+ | Any | F | Critical |

#### Project Configuration

```json
{
  "codeQuality": {
    "linting": {
      "enabled": true,
      "config": "eslint.config.mjs",
      "threshold": {
        "maxErrors": 3,
        "maxWarnings": 15
      },
      "fixableCount": true,
      "excludePatterns": [
        "node_modules",
        ".next",
        "dist"
      ]
    }
  }
}
```

#### Validation Criteria

- [ ] All ESLint violations captured
- [ ] Violations categorized by severity
- [ ] Violations grouped by rule
- [ ] Auto-fixable violations identified
- [ ] Most common rules highlighted
- [ ] Files with most violations listed

#### Example Output

```
Code Style Analysis (ESLint):

Summary:
  Total Violations: 18
  Errors: 2
  Warnings: 12
  Info: 4
  Pass Status: WARNING (2 errors exceeds threshold)

Top Violations by Rule:
1. @typescript-eslint/no-unused-vars (8 occurrences)
   Files: MonacoEditor.tsx, SnippetManager.tsx, useSnippetForm.ts
   Fixable: Yes (auto-fix available)

2. react-hooks/exhaustive-deps (6 occurrences)
   Files: MonacoEditor.tsx, PythonTerminal.tsx, useStorageMigration.ts
   Fixable: No

3. @typescript-eslint/no-explicit-any (4 occurrences)
   Fixable: No

Critical Issues (Errors):
- src/components/SnippetManager.tsx:42
  Rule: no-unsafe-optional-chaining
  Message: Optional chaining should not be chained with non-optional values
  Fix: Review assignment chain

- src/lib/db.ts:158
  Rule: @typescript-eslint/no-floating-promises
  Message: Promise returned but not awaited
  Fix: Add 'await' or handle promise
```

---

## Test Coverage Metrics

### 1. Coverage Percentages

#### Definitions

- **Line Coverage:** Percentage of executable lines executed by tests
- **Branch Coverage:** Percentage of branches (if/else paths) executed
- **Function Coverage:** Percentage of functions called at least once
- **Statement Coverage:** Percentage of statements executed

#### Measurement Approach

1. Read Jest coverage-final.json output
2. Parse coverage data for each file
3. Calculate aggregate percentages
4. Aggregate by file and by project

#### Thresholds and Interpretation

| Coverage Level | Rating | Status | Recommendation |
|---|---|---|---|
| ≥ 90% | A | Excellent | Maintain |
| 80-89% | B | Good | Maintain, target improvement |
| 70-79% | C | Acceptable | Improve coverage |
| 60-69% | D | Poor | Significant improvement needed |
| < 60% | F | Critical | Major coverage effort required |

#### Project Configuration

```json
{
  "testCoverage": {
    "enabled": true,
    "coverageDataPath": "coverage/coverage-final.json",
    "minimums": {
      "lines": 80,
      "branches": 75,
      "functions": 80,
      "statements": 80
    },
    "byFileMinimum": 50,
    "excludeFiles": [
      "**/*.d.ts",
      "**/node_modules/**",
      "**/.next/**"
    ]
  }
}
```

#### Validation Criteria

- [ ] All coverage types reported (lines, branches, functions, statements)
- [ ] Project-level aggregates calculated
- [ ] File-level breakdown provided
- [ ] Lowest coverage files identified
- [ ] Comparison with thresholds shown
- [ ] Uncovered line counts provided

#### Example Output

```
Test Coverage Analysis:

Overall Coverage:
├─ Line Coverage:      85% ✓ (GOOD - above 80% threshold)
├─ Branch Coverage:    78% ⚠ (WARNING - below 80% threshold)
├─ Function Coverage:  88% ✓ (GOOD)
└─ Statement Coverage: 85% ✓ (GOOD)

Files Below Threshold (< 80% lines):

1. src/components/features/python-runner/PythonTerminal.tsx
   Line Coverage: 65% (11 uncovered lines)
   Branches: 45%
   Status: Critical - needs test coverage

2. src/hooks/useDatabaseOperations.ts
   Line Coverage: 72% (8 uncovered lines)
   Branches: 68%
   Status: Warning - improve coverage

Top Uncovered Paths:
- Error handling paths in PythonTerminal (5 uncovered lines)
- Edge cases in useDatabaseOperations (3 uncovered lines)
```

---

### 2. Test Effectiveness

#### Definition
Test effectiveness measures the quality of tests beyond coverage percentages. It evaluates whether tests actually catch bugs and validate behavior properly.

#### Metrics

| Metric | How Measured | Interpretation |
|--------|--------------|-----------------|
| **Test Count** | Total number of test cases | Validates scope coverage |
| **Assertions/Test** | Average assertions per test | Higher = more thorough |
| **Naming Quality** | Test name clarity and specificity | Readable tests are better maintained |
| **Mock Usage** | Ratio of mocks to real code | Excessive mocking may miss bugs |
| **Test Isolation** | Tests don't depend on each other | Prevents cascading failures |
| **Negative Cases** | Tests for error/failure paths | Better bug detection |

#### Calculation

```
Test Effectiveness Score = (Criteria Met / Total Criteria) × 100

Criteria:
1. Meaningful test names (present/readable) = 20%
2. Adequate assertions per test (avg >= 2) = 20%
3. Low mock usage ratio (< 50%) = 20%
4. Good test isolation (no shared state) = 20%
5. Error path coverage (> 30% of tests) = 20%
```

#### Thresholds

| Score | Rating | Interpretation |
|-------|--------|-----------------|
| 90-100 | A | Excellent test quality |
| 80-89 | B | Good test quality |
| 70-79 | C | Acceptable test quality |
| 60-69 | D | Poor test quality |
| < 60 | F | Critical test quality issues |

#### Validation Criteria

- [ ] Total test count captured
- [ ] Average assertions per test calculated
- [ ] Test naming conventions evaluated
- [ ] Mock usage patterns identified
- [ ] Tests without assertions flagged
- [ ] Positive and negative case ratio calculated

#### Example Output

```
Test Effectiveness Analysis:

Summary:
├─ Total Test Files: 45
├─ Total Test Cases: 1,247
├─ Average Tests per File: 27.7
└─ Effectiveness Score: 84/100 (GOOD)

Test Naming Quality:
├─ Descriptive Names: 92% ✓
├─ Poor Names (generic): 8% ⚠
│  └─ Examples: "test 1", "works", "fail case"
└─ Suggestion: Use descriptive names indicating what is tested

Assertion Analysis:
├─ Average Assertions/Test: 2.3
├─ Tests with 0 Assertions: 12 ⚠
│  └─ Files: MonacoEditor.test.tsx (5), useStorageConfig.test.ts (7)
└─ Suggestion: Add assertions or remove placeholder tests

Mock Usage:
├─ Files with Heavy Mocking (>50% mocks): 8
│  └─ SnippetManager.test.tsx: 68% mocks
│  └─ PersistenceExample.test.tsx: 64% mocks
└─ Suggestion: Consider testing real implementations where possible

Test Isolation:
├─ Tests with Shared State: 3 ⚠
├─ Tests Dependent on Order: 1 ⚠
└─ Suggestion: Use beforeEach, afterEach for setup/teardown

Coverage Mapping:
├─ Positive Paths Tested: 72%
├─ Error Paths Tested: 45% ⚠
├─ Edge Cases Tested: 38% ⚠
└─ Recommendation: Increase error path and edge case coverage
```

---

## Architecture Metrics

### 1. Component Organization

#### Definition
Measures whether React components are organized according to atomic design principles and best practices.

#### Metrics

| Metric | Evaluation | Target |
|--------|-----------|--------|
| **Correct Placement** | Components in right atomic level folder | 100% |
| **File Size** | Average lines per component | < 300 LOC (good) |
| **Component Types** | Proper separation of atoms/molecules/organisms | Clear organization |
| **Props Complexity** | Number and complexity of props | Reasonable (< 10 props) |
| **Naming Consistency** | File/component naming conventions | Consistent pattern |

#### Thresholds

| Component Size | Rating | Status | Recommendation |
|---|---|---|---|
| < 150 LOC | A | Excellent | Maintain |
| 150-300 LOC | B | Good | Maintain |
| 300-500 LOC | C | Acceptable | Consider splitting |
| 500-750 LOC | D | Large | Should split |
| > 750 LOC | F | Critical | Must split |

#### Validation Criteria

- [ ] Components classified by atomic level
- [ ] Misplaced components identified
- [ ] Oversized components flagged
- [ ] Prop count analyzed
- [ ] Naming conventions validated
- [ ] Refactoring suggestions provided

#### Example Output

```
Component Architecture Analysis:

Organization Summary:
├─ Total Components: 127
├─ Atoms: 45
├─ Molecules: 38
├─ Organisms: 28
└─ Templates: 16

Size Distribution:
├─ Excellent (< 150 LOC): 78 components ✓
├─ Good (150-300 LOC): 35 components ✓
├─ Acceptable (300-500 LOC): 10 components ⚠
├─ Large (500-750 LOC): 3 components ⚠
│  └─ SnippetManager.tsx (687 LOC)
│  └─ ComponentShowcase.tsx (523 LOC)
│  └─ PythonTerminal.tsx (519 LOC)
└─ Critical (> 750 LOC): 1 component ⚠
   └─ SplitScreenEditor.tsx (812 LOC) - Should be refactored

Misplaced Components:
├─ None detected ✓

Props Complexity:
├─ Average Props/Component: 6.2
├─ Max Props on Component: 14 (MonacoEditor)
├─ Components with > 10 props: 7
└─ Suggestion: Some components have many props; consider prop destructuring or context
```

---

### 2. Dependency Analysis

#### Definition
Analyzes module dependencies to detect anti-patterns like circular dependencies and layer violations.

#### Metrics

| Finding | Type | Severity | Impact |
|---------|------|----------|--------|
| **Circular Dependency** | Dependency issue | High | Prevents tree-shaking, increases coupling |
| **Layer Violation** | Architectural | Medium | Breaks separation of concerns |
| **Deep Imports** | Coupling | Medium | Brittle to refactoring |
| **Unused Imports** | Code quality | Low | Bloats bundle |

#### Detection Approach

1. Build dependency graph from all imports
2. Perform cycle detection (DFS algorithm)
3. Classify modules by layer (components, hooks, store, utils)
4. Detect violations (e.g., component importing from store)
5. Identify deeply nested imports

#### Validation Criteria

- [ ] Dependency graph generated
- [ ] All circular dependencies identified
- [ ] Layer violations detected
- [ ] Specific file paths provided
- [ ] Impact assessment provided
- [ ] Refactoring suggestions included

#### Example Output

```
Dependency Analysis:

Circular Dependencies Found: 1

CRITICAL - Must Fix:
Path: A -> B -> C -> A
Files:
  1. src/components/SnippetManager.tsx
     ├─ imports from useDatabaseOperations
  2. src/hooks/useDatabaseOperations.ts
     ├─ imports from store/slices/snippetsSlice
  3. src/store/slices/snippetsSlice.ts
     └─ imports from components/SnippetManager (TYPE ONLY)

Impact: Prevents tree-shaking, potential init order issues
Suggestion: Move type imports to separate file or use type-only imports

Layer Violations: 0 ✓

Import Depth Analysis:
├─ Maximum Import Depth: 4
├─ Files with Deep Imports (> 3 levels): 12
└─ Example: src/components/atoms/Button.tsx imports from ../../../store
   Suggestion: Use barrel exports (index.ts) or path aliases
```

---

## Security Metrics

### 1. Vulnerability Detection

#### Definition
Identifies security vulnerabilities from dependencies and code patterns.

#### Metric Types

| Type | Source | Severity | Example |
|------|--------|----------|---------|
| **Dependency Vuln** | npm audit | Critical/High/Medium/Low | Outdated lodash version |
| **Hard-coded Secret** | Code scanning | High | Password in code |
| **Unsafe DOM** | Pattern detection | High | dangerouslySetInnerHTML |
| **Unvalidated Input** | Pattern detection | High | Direct URL usage |
| **Anti-pattern** | Code analysis | Medium | Missing HTTPS check |

#### Thresholds

| Critical | High | Medium | Low | Rating |
|----------|------|--------|-----|--------|
| 0 | 0 | Any | Any | A ✓ |
| 0 | 1-2 | Any | Any | B ⚠ |
| 0 | 3+ | Any | Any | C ⚠ |
| 1+ | Any | Any | Any | F ✗ |

#### Validation Criteria

- [ ] npm audit results captured
- [ ] Vulnerable packages identified with versions
- [ ] Severity levels assigned
- [ ] Remediation versions provided
- [ ] Code pattern anti-patterns detected
- [ ] Hard-coded secrets flagged

#### Example Output

```
Security Analysis:

Vulnerability Summary:
├─ Critical: 0
├─ High: 1
├─ Medium: 2
└─ Low: 1
Overall Rating: B (Acceptable - requires fix)

Critical & High Vulnerabilities:

HIGH - Regular Expression DoS (ReDoS)
Package: minimatch@3.0.4
Affected Module: @babel/core
Issue: ReDoS vulnerability in glob pattern matching
Fix: Upgrade to minimatch@3.1.2+
Impact: Moderate - used in build pipeline

Medium Vulnerabilities:

MEDIUM - Prototype Pollution
Package: lodash@4.17.20
Affected Module: lodash (direct)
Issue: Potential prototype pollution
Fix: Upgrade to lodash@4.17.21+
Impact: Low - data only from trusted sources

Code Pattern Scan:

dangerouslySetInnerHTML Usage: 1
├─ File: src/components/error/MarkdownRenderer.tsx:45
├─ Risk: Potential XSS if content not sanitized
└─ Check: Verify markdown parser escapes output

Hard-coded Secrets/Credentials: 0 ✓

Recommendations:
1. Update minimatch to address ReDoS
2. Update lodash to latest
3. Review MarkdownRenderer for sanitization
```

---

## Validation Criteria

### Quality Assurance Checks

#### Metric Accuracy Validation

For each metric reported, verify:

1. **Calculation Correctness**
   - [ ] Formula applied correctly
   - [ ] Edge cases handled
   - [ ] Rounding consistent

2. **Data Completeness**
   - [ ] All relevant files included
   - [ ] No false negatives
   - [ ] False positives < 5%

3. **Consistency**
   - [ ] Metric values consistent across runs
   - [ ] Threshold logic consistent
   - [ ] Severity levels appropriate

#### Manual Validation Sample

For production release:
- Manually verify 10% of flagged issues
- Cross-check complexity calculations with manual count
- Validate duplication blocks are actual duplicates
- Confirm security findings are real risks

---

## Scoring and Grading

### Overall Quality Score Calculation

```
Weighted Score = (CC × Complexity) + (TC × TestCoverage) +
                 (AC × Architecture) + (SC × Security)

Where:
  CC = Category coefficient (30% = 0.30)
  TC = Test Coverage coefficient (35% = 0.35)
  AC = Architecture coefficient (20% = 0.20)
  SC = Security coefficient (15% = 0.15)

Grade Assignment:
  90-100: A (Excellent)
  80-89:  B (Good)
  70-79:  C (Acceptable)
  60-69:  D (Poor)
  < 60:   F (Failing)
```

### Per-Category Score Normalization

Each metric normalized to 0-100 scale:

```
Normalized = (Actual Value / Target Value) × 100

Examples:
- Complexity: (10 / target_10) × 100 = 100
- Coverage: (85 / target_80) × 100 = 106 (capped at 100)
- Duplication: (3% / target_5%) × 100 = 60
```

### Grade Interpretation

| Grade | Score | Meaning | Action |
|-------|-------|---------|--------|
| **A** | 90-100 | Excellent | Maintain standards |
| **B** | 80-89 | Good | Minor improvements |
| **C** | 70-79 | Acceptable | Plan improvements |
| **D** | 60-69 | Poor | Urgent action needed |
| **F** | < 60 | Failing | Halt work, fix issues |

---

## Threshold Configuration

### Default Thresholds

```json
{
  "defaults": {
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
      "good": 80,
      "acceptable": 60
    },
    "componentSize": {
      "good": 300,
      "warning": 500,
      "critical": 750
    },
    "security": {
      "allowCritical": 0,
      "allowHigh": 1
    }
  }
}
```

### Customization

Teams can override defaults in `.qualityrc.json`:

```json
{
  "codeQuality": {
    "complexity": {
      "critical": 25
    },
    "linting": {
      "maxErrors": 5
    }
  }
}
```

---

## Reporting Standards

### Information Required Per Finding

Every reported finding must include:

1. **Identification**
   - Issue ID (e.g., COMPLEXITY-001)
   - Category (code quality, test, architecture, security)
   - Severity (critical, high, medium, low)

2. **Location**
   - File path
   - Line number (if applicable)
   - Function/component name

3. **Details**
   - Current value
   - Threshold/target
   - Specific issue description

4. **Impact**
   - Why this matters
   - Potential consequences

5. **Remediation**
   - Specific actionable steps
   - Estimated effort
   - Example of fix

### Severity Definition

| Severity | Criteria | Must Address |
|----------|----------|--------------|
| **Critical** | Prevents merge / High risk | Before commit |
| **High** | Significant issue | Before merge |
| **Medium** | Should address | Within sprint |
| **Low** | Nice to have | As time allows |

---

**End of Document**
