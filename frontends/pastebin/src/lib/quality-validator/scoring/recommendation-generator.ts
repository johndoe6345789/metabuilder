/**
 * Recommendation generation for scoring results
 */

import type {
  Recommendation,
  Finding,
  CodeQualityMetrics,
  TestCoverageMetrics,
  ArchitectureMetrics,
  SecurityMetrics,
} from '../types/index.js';

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export function generateRecommendations(
  codeQuality: CodeQualityMetrics | null,
  testCoverage: TestCoverageMetrics | null,
  architecture: ArchitectureMetrics | null,
  security: SecurityMetrics | null,
  _findings: Finding[]
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (codeQuality) {
    if (codeQuality.complexity.distribution.critical > 0) {
      recs.push({
        priority: 'high',
        category: 'codeQuality',
        issue: 'High cyclomatic complexity',
        remediation:
          `Refactor ${codeQuality.complexity.distribution.critical}` +
          ' functions with high complexity (>20)',
        estimatedEffort: 'medium',
        expectedImpact: 'Improved code readability and testability',
      });
    }
    if (codeQuality.duplication.percent > 5) {
      recs.push({
        priority: 'medium',
        category: 'codeQuality',
        issue: 'Code duplication',
        remediation:
          `Reduce duplication ` +
          `(${codeQuality.duplication.percent.toFixed(1)}%)` +
          ' by extracting shared utilities',
        estimatedEffort: 'medium',
        expectedImpact: 'Easier maintenance and consistency',
      });
    }
  }

  if (testCoverage) {
    if (testCoverage.overall.lines.percentage < 80) {
      recs.push({
        priority: 'high',
        category: 'testCoverage',
        issue: 'Insufficient test coverage',
        remediation:
          `Increase coverage from ` +
          `${testCoverage.overall.lines.percentage.toFixed(1)}% to 80%`,
        estimatedEffort: 'high',
        expectedImpact: 'Better code reliability and reduced bugs',
      });
    }
    if (testCoverage.effectiveness.effectivenessScore < 70) {
      recs.push({
        priority: 'medium',
        category: 'testCoverage',
        issue: 'Low test effectiveness',
        remediation:
          'Improve tests: more assertions, fewer mocks, better isolation',
        estimatedEffort: 'medium',
        expectedImpact: 'More reliable test suite',
      });
    }
  }

  if (architecture) {
    if (architecture.dependencies.circularDependencies.length > 0) {
      const cnt = architecture.dependencies.circularDependencies.length;
      recs.push({
        priority: 'high',
        category: 'architecture',
        issue: 'Circular dependencies',
        remediation:
          `Resolve ${cnt} circular dependencies by restructuring modules`,
        estimatedEffort: 'medium',
        expectedImpact: 'Better modularity and maintainability',
      });
    }
    if (architecture.components.oversized.length > 0) {
      const cnt = architecture.components.oversized.length;
      recs.push({
        priority: 'medium',
        category: 'architecture',
        issue: 'Oversized components',
        remediation: `Split ${cnt} oversized components into smaller ones`,
        estimatedEffort: 'medium',
        expectedImpact: 'Improved reusability and testability',
      });
    }
  }

  if (security) {
    const critVulns = security.vulnerabilities.filter(
      (v) => v.severity === 'critical'
    ).length;
    if (critVulns > 0) {
      recs.push({
        priority: 'critical',
        category: 'security',
        issue: 'Critical vulnerabilities',
        remediation:
          `Address ${critVulns} critical ` +
          'vulnerability/vulnerabilities by updating dependencies',
        estimatedEffort: 'low',
        expectedImpact: 'Eliminated critical security risks',
      });
    }
  }

  recs.sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 999) -
      (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 999)
  );
  return recs.slice(0, 5);
}
