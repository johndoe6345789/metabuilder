/**
 * Test Fixtures and Sample Data
 * Reusable test data for all test suites
 */

import {
  Finding,
  Vulnerability,
  SecurityAntiPattern,
  ComplexityFunction,
  LintingViolation,
  CoverageGap,
  Recommendation,
} from '../../src/lib/quality-validator/types/index.js';

// ============================================================================
// SAMPLE FINDINGS
// ============================================================================

export const SAMPLE_CODE_QUALITY_FINDINGS: Finding[] = [
  {
    id: 'cc-001',
    severity: 'high',
    category: 'codeQuality',
    title: 'High cyclomatic complexity',
    description: 'Function "calculateTotal" has complexity of 25, exceeding threshold of 20',
    location: {
      file: 'src/utils/calculator.ts',
      line: 42,
    },
    remediation: 'Extract complex logic into smaller functions',
    evidence: 'Complexity: 25',
  },
  {
    id: 'dup-001',
    severity: 'medium',
    category: 'codeQuality',
    title: 'High code duplication',
    description: '7.5% of code appears to be duplicated',
    remediation: 'Extract duplicated code into reusable utilities',
    evidence: 'Duplication: 7.5%',
  },
  {
    id: 'lint-001',
    severity: 'low',
    category: 'codeQuality',
    title: 'Linting warnings',
    description: 'Found 8 linting warnings',
    remediation: 'Run eslint --fix to auto-fix issues',
    evidence: 'Warnings: 8',
  },
];

export const SAMPLE_TEST_COVERAGE_FINDINGS: Finding[] = [
  {
    id: 'cov-001',
    severity: 'high',
    category: 'testCoverage',
    title: 'Low test coverage',
    description: 'Overall line coverage is 68.5%, target is 80%',
    remediation: 'Add tests for uncovered code paths to increase coverage',
    evidence: 'Lines: 68.5%, Branches: 62.3%',
  },
  {
    id: 'cov-gap-001',
    severity: 'medium',
    category: 'testCoverage',
    title: 'Low coverage in services/auth.ts',
    description: 'File has only 45% coverage with 120 uncovered lines',
    location: {
      file: 'src/services/auth.ts',
    },
    remediation: 'Add integration tests for auth service methods',
    evidence: 'Coverage: 45%, Uncovered: 120',
  },
];

export const SAMPLE_ARCHITECTURE_FINDINGS: Finding[] = [
  {
    id: 'arch-001',
    severity: 'medium',
    category: 'architecture',
    title: 'Oversized component',
    description: 'Component "DashboardPage" has 850 lines, recommended max is 500',
    location: {
      file: 'src/components/organisms/DashboardPage.tsx',
    },
    remediation: 'Split into smaller, focused components',
    evidence: 'Lines: 850',
  },
  {
    id: 'circ-001',
    severity: 'high',
    category: 'architecture',
    title: 'Circular dependency detected',
    description: 'Circular dependency: utils/auth.ts → services/user.ts → utils/auth.ts',
    remediation: 'Restructure modules to break the circular dependency',
    evidence: 'Cycle: utils/auth.ts → services/user.ts → utils/auth.ts',
  },
];

export const SAMPLE_SECURITY_FINDINGS: Finding[] = [
  {
    id: 'sec-vuln-001',
    severity: 'critical',
    category: 'security',
    title: 'Vulnerability in lodash',
    description: 'Prototype pollution vulnerability in lodash',
    remediation: 'Update lodash to version >=4.17.21',
    evidence: 'critical severity in ReDoS',
  },
  {
    id: 'sec-secret-001',
    severity: 'critical',
    category: 'security',
    title: 'Possible hard-coded secret detected',
    description: 'Hard-coded API key found in source code',
    location: {
      file: 'src/config/api.ts',
      line: 15,
    },
    remediation: 'Use environment variables or secure configuration management',
    evidence: 'apiKey = "sk_live_...',
  },
  {
    id: 'sec-xss-001',
    severity: 'high',
    category: 'security',
    title: 'dangerouslySetInnerHTML used',
    description: 'Potential XSS vulnerability: unescaped user input in HTML',
    location: {
      file: 'src/components/RichText.tsx',
      line: 28,
    },
    remediation: 'Use safe HTML rendering methods or sanitize with DOMPurify',
    evidence: 'dangerouslySetInnerHTML',
  },
];

// ============================================================================
// SAMPLE VULNERABILITIES
// ============================================================================

export const SAMPLE_VULNERABILITIES: Vulnerability[] = [
  {
    package: 'lodash',
    currentVersion: '4.17.15',
    vulnerabilityType: 'Prototype Pollution',
    severity: 'high',
    description: 'Lodash versions <4.17.21 are vulnerable to prototype pollution',
    fixedInVersion: '4.17.21',
    affectedCodeLocations: [
      'src/utils/deepMerge.ts:12',
      'src/lib/merge.ts:45',
    ],
  },
  {
    package: 'minimist',
    currentVersion: '1.2.5',
    vulnerabilityType: 'Prototype Pollution',
    severity: 'medium',
    description: 'Minimist allows prototype pollution via function arguments',
    fixedInVersion: '1.2.6',
  },
  {
    package: '@testing-library/dom',
    currentVersion: '8.1.0',
    vulnerabilityType: 'Regular Expression DoS',
    severity: 'low',
    description: 'ReDoS vulnerability in dependency',
    fixedInVersion: '8.11.3',
  },
];

// ============================================================================
// SAMPLE SECURITY PATTERNS
// ============================================================================

export const SAMPLE_SECURITY_PATTERNS: SecurityAntiPattern[] = [
  {
    type: 'secret',
    severity: 'critical',
    file: 'src/config/firebase.ts',
    line: 5,
    column: 20,
    message: 'Possible hard-coded API key detected',
    remediation: 'Use environment variables for sensitive data',
    evidence: 'apiKey = "AIzaSyC...',
  },
  {
    type: 'unsafeDom',
    severity: 'high',
    file: 'src/components/HtmlRenderer.tsx',
    line: 28,
    message: 'dangerouslySetInnerHTML used',
    remediation: 'Sanitize HTML or use safe rendering methods',
    evidence: 'dangerouslySetInnerHTML={{ __html: content }}',
  },
  {
    type: 'xss',
    severity: 'high',
    file: 'src/components/UserComment.tsx',
    line: 15,
    message: 'Potential XSS vulnerability: unescaped user input',
    remediation: 'Escape HTML entities or use DOMPurify',
    evidence: 'innerHTML = userInput',
  },
];

// ============================================================================
// SAMPLE COMPLEXITY FUNCTIONS
// ============================================================================

export const SAMPLE_COMPLEX_FUNCTIONS: ComplexityFunction[] = [
  {
    file: 'src/utils/dataProcessor.ts',
    name: 'processData',
    line: 45,
    complexity: 28,
    status: 'critical',
  },
  {
    file: 'src/services/authService.ts',
    name: 'validateToken',
    line: 120,
    complexity: 22,
    status: 'critical',
  },
  {
    file: 'src/utils/formatter.ts',
    name: 'formatDate',
    line: 8,
    complexity: 15,
    status: 'warning',
  },
  {
    file: 'src/components/Form.tsx',
    name: 'handleSubmit',
    line: 95,
    complexity: 18,
    status: 'warning',
  },
];

// ============================================================================
// SAMPLE LINTING VIOLATIONS
// ============================================================================

export const SAMPLE_LINTING_VIOLATIONS: LintingViolation[] = [
  {
    file: 'src/utils/logger.ts',
    line: 12,
    column: 5,
    severity: 'warning',
    rule: 'no-console',
    message: 'Unexpected console statement',
    fixable: true,
  },
  {
    file: 'src/index.ts',
    line: 5,
    column: 1,
    severity: 'warning',
    rule: 'no-var',
    message: 'Unexpected var, use let or const instead',
    fixable: true,
  },
  {
    file: 'src/components/Old.tsx',
    line: 8,
    column: 10,
    severity: 'warning',
    rule: 'no-unused-vars',
    message: 'Variable "unused" is defined but never used',
    fixable: false,
  },
];

// ============================================================================
// SAMPLE COVERAGE GAPS
// ============================================================================

export const SAMPLE_COVERAGE_GAPS: CoverageGap[] = [
  {
    file: 'src/services/authService.ts',
    coverage: 45.5,
    uncoveredLines: 120,
    criticality: 'critical',
    suggestedTests: [
      'Test login with valid credentials',
      'Test login with invalid credentials',
      'Test token refresh',
      'Test logout',
    ],
    estimatedEffort: 'high',
  },
  {
    file: 'src/utils/validators.ts',
    coverage: 62.3,
    uncoveredLines: 45,
    criticality: 'high',
    suggestedTests: [
      'Test email validation',
      'Test password validation',
      'Test edge cases',
    ],
    estimatedEffort: 'medium',
  },
  {
    file: 'src/lib/cache.ts',
    coverage: 78.2,
    uncoveredLines: 10,
    criticality: 'medium',
    suggestedTests: ['Test cache expiration'],
    estimatedEffort: 'low',
  },
];

// ============================================================================
// SAMPLE RECOMMENDATIONS
// ============================================================================

export const SAMPLE_RECOMMENDATIONS: Recommendation[] = [
  {
    priority: 'critical',
    category: 'security',
    issue: 'Critical vulnerabilities found',
    remediation: 'Update dependencies: lodash@4.17.21, minimist@1.2.6',
    estimatedEffort: 'low',
    expectedImpact: 'Eliminated security vulnerabilities',
    relatedFindings: ['sec-vuln-001'],
  },
  {
    priority: 'high',
    category: 'codeQuality',
    issue: 'High cyclomatic complexity',
    remediation:
      'Refactor 3 functions with high complexity (>20) by extracting logic into smaller functions',
    estimatedEffort: 'medium',
    expectedImpact: 'Improved code readability and maintainability',
    relatedFindings: ['cc-001'],
  },
  {
    priority: 'high',
    category: 'testCoverage',
    issue: 'Insufficient test coverage',
    remediation:
      'Increase test coverage from 68.5% to 80% by adding tests for authentication service',
    estimatedEffort: 'high',
    expectedImpact: 'Better code reliability and fewer bugs',
    relatedFindings: ['cov-001'],
  },
  {
    priority: 'medium',
    category: 'architecture',
    issue: 'Oversized components',
    remediation:
      'Split 2 oversized components (>500 lines) into smaller, focused components following atomic design',
    estimatedEffort: 'medium',
    expectedImpact: 'Improved reusability and testability',
    relatedFindings: ['arch-001'],
  },
  {
    priority: 'medium',
    category: 'codeQuality',
    issue: 'Code duplication',
    remediation: 'Extract 5 duplicated utility functions used across components',
    estimatedEffort: 'medium',
    expectedImpact: 'Easier maintenance and consistency',
    relatedFindings: ['dup-001'],
  },
];

// ============================================================================
// SAMPLE PROJECT STRUCTURES
// ============================================================================

export const SAMPLE_PROJECT_FILES: Record<string, string> = {
  'src/index.ts': `
    import { Application } from './app';

    const app = new Application();
    app.start();
  `,
  'src/app.ts': `
    import { Router } from './router';

    export class Application {
      private router: Router;

      constructor() {
        this.router = new Router();
      }

      async start() {
        console.log('Starting application...');
        await this.router.initialize();
      }
    }
  `,
  'src/utils/math.ts': `
    export const add = (a: number, b: number): number => a + b;
    export const subtract = (a: number, b: number): number => a - b;
    export const multiply = (a: number, b: number): number => a * b;
  `,
  'src/components/Button.tsx': `
    import React from 'react';

    interface ButtonProps {
      onClick: () => void;
      label: string;
      disabled?: boolean;
    }

    export const Button: React.FC<ButtonProps> = ({
      onClick,
      label,
      disabled = false,
    }) => (
      <button onClick={onClick} disabled={disabled}>
        {label}
      </button>
    );
  `,
};

// ============================================================================
// SAMPLE COVERAGE DATA
// ============================================================================

export const SAMPLE_COVERAGE_DATA = {
  'src/utils/math.ts': {
    lines: { total: 50, covered: 45, pct: 90 },
    branches: { total: 20, covered: 18, pct: 90 },
    functions: { total: 5, covered: 5, pct: 100 },
    statements: { total: 55, covered: 50, pct: 90.9 },
  },
  'src/components/Button.tsx': {
    lines: { total: 30, covered: 25, pct: 83.3 },
    branches: { total: 10, covered: 8, pct: 80 },
    functions: { total: 1, covered: 1, pct: 100 },
    statements: { total: 35, covered: 28, pct: 80 },
  },
  'src/services/auth.ts': {
    lines: { total: 100, covered: 45, pct: 45 },
    branches: { total: 40, covered: 18, pct: 45 },
    functions: { total: 8, covered: 3, pct: 37.5 },
    statements: { total: 120, covered: 54, pct: 45 },
  },
  total: {
    lines: { total: 500, covered: 340, pct: 68 },
    branches: { total: 200, covered: 136, pct: 68 },
    functions: { total: 50, covered: 36, pct: 72 },
    statements: { total: 600, covered: 408, pct: 68 },
  },
};
