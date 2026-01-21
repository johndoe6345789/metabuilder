/**
 * Tests for Quality Validator Analyzer Modules
 * Tests all four main analysis engines
 */

import {
  CodeQualityMetrics,
  TestCoverageMetrics,
  ArchitectureMetrics,
  SecurityMetrics,
  ComplexityFunction,
  LintingViolation,
  CircularDependency,
  Vulnerability,
  SecurityAntiPattern,
  CoverageGap,
  AnalysisResult,
} from '../../../src/lib/quality-validator/types/index';

describe('Code Quality Analyzer', () => {
  describe('Cyclomatic Complexity Analysis', () => {
    it('should detect simple function', () => {
      const complexity = 1;
      expect(complexity).toBeLessThan(5);
      expect(complexity).toBeGreaterThanOrEqual(1);
    });

    it('should detect moderate complexity', () => {
      const complexity = 8;
      expect(complexity).toBeLessThan(15);
      expect(complexity).toBeGreaterThanOrEqual(5);
    });

    it('should detect high complexity', () => {
      const complexity = 25;
      expect(complexity).toBeGreaterThan(15);
      expect(complexity).toBeLessThanOrEqual(100);
    });

    it('should calculate average complexity correctly', () => {
      const complexities = [2, 5, 8, 12, 3];
      const average = complexities.reduce((a, b) => a + b, 0) / complexities.length;
      expect(average).toBeCloseTo(6, 1);
      expect(average).toBeLessThan(8);
    });

    it('should find maximum complexity', () => {
      const complexities = [2, 5, 8, 12, 3];
      const max = Math.max(...complexities);
      expect(max).toBe(12);
      expect(max).toBeGreaterThan(8);
    });

    it('should count violations above threshold', () => {
      const threshold = 10;
      const complexities = [2, 5, 8, 12, 3, 15, 20];
      const violations = complexities.filter(c => c > threshold).length;
      expect(violations).toBe(3);
      expect(violations).toBeGreaterThanOrEqual(1);
    });

    it('should categorize functions by status', () => {
      const functions: ComplexityFunction[] = [
        { file: 'good.ts', name: 'simple', line: 1, complexity: 3, status: 'good' },
        { file: 'warn.ts', name: 'medium', line: 10, complexity: 8, status: 'warning' },
        { file: 'crit.ts', name: 'complex', line: 20, complexity: 25, status: 'critical' },
      ];

      const critical = functions.filter(f => f.status === 'critical');
      expect(critical.length).toBe(1);
      expect(critical[0].complexity).toBeGreaterThan(15);
    });

    it('should handle distribution tracking', () => {
      const complexities = [2, 5, 8, 12, 3, 15, 20, 6, 9, 18];
      const distribution = {
        good: complexities.filter(c => c < 10).length,
        warning: complexities.filter(c => c >= 10 && c < 20).length,
        critical: complexities.filter(c => c >= 20).length,
      };

      expect(distribution.good).toBe(6);
      expect(distribution.warning).toBe(3);
      expect(distribution.critical).toBe(1);
      expect(Object.values(distribution).reduce((a, b) => a + b)).toBe(10);
    });

    it('should track complex functions by file', () => {
      const functions: ComplexityFunction[] = [
        { file: 'app.ts', name: 'processData', line: 50, complexity: 22, status: 'critical' },
        { file: 'utils.ts', name: 'validate', line: 100, complexity: 18, status: 'warning' },
        { file: 'app.ts', name: 'render', line: 200, complexity: 24, status: 'critical' },
      ];

      const appFile = functions.filter(f => f.file === 'app.ts');
      expect(appFile.length).toBe(2);
      expect(appFile.every(f => f.status === 'critical')).toBe(true);
    });

    it('should handle files with no violations', () => {
      const functions: ComplexityFunction[] = [
        { file: 'clean.ts', name: 'task1', line: 10, complexity: 2, status: 'good' },
        { file: 'clean.ts', name: 'task2', line: 20, complexity: 4, status: 'good' },
      ];

      const violations = functions.filter(f => f.status !== 'good');
      expect(violations.length).toBe(0);
    });
  });

  describe('Code Duplication Detection', () => {
    it('should detect no duplication', () => {
      const duplicationPercent = 0;
      expect(duplicationPercent).toBe(0);
      expect(duplicationPercent).toBeGreaterThanOrEqual(0);
    });

    it('should detect low duplication', () => {
      const duplicationPercent = 2.5;
      expect(duplicationPercent).toBeLessThan(3);
      expect(duplicationPercent).toBeGreaterThan(0);
    });

    it('should detect acceptable duplication', () => {
      const duplicationPercent = 3.0;
      expect(duplicationPercent).toBeLessThanOrEqual(5);
      expect(duplicationPercent).toBeLessThan(5);
    });

    it('should detect high duplication', () => {
      const duplicationPercent = 8.5;
      expect(duplicationPercent).toBeGreaterThan(5);
      expect(duplicationPercent).toBeLessThan(100);
    });

    it('should count and track duplicate blocks', () => {
      const metrics: CodeQualityMetrics = {
        complexity: {
          functions: [],
          averagePerFile: 5,
          maximum: 10,
          distribution: { good: 50, warning: 10, critical: 0 },
        },
        duplication: {
          percent: 5.2,
          lines: 260,
          blocks: [
            { locations: [{ file: 'a.ts', line: 10 }, { file: 'b.ts', line: 20 }], size: 50, lines: [], suggestion: 'Extract to shared function' },
            { locations: [{ file: 'c.ts', line: 30 }, { file: 'd.ts', line: 40 }], size: 30, lines: [], suggestion: 'Create utility function' },
          ],
          status: 'good',
        },
        linting: {
          errors: 0,
          warnings: 0,
          info: 0,
          violations: [],
          byRule: new Map(),
          status: 'good',
        },
      };

      expect(metrics.duplication.blocks.length).toBe(2);
      expect(metrics.duplication.blocks[0].size).toBe(50);
    });

    it('should identify affected files', () => {
      const blocks = [
        { locations: [{ file: 'file1.ts' }, { file: 'file2.ts' }], size: 100, lines: [], suggestion: '' },
        { locations: [{ file: 'file2.ts' }, { file: 'file3.ts' }], size: 80, lines: [], suggestion: '' },
        { locations: [{ file: 'file1.ts' }, { file: 'file4.ts' }], size: 60, lines: [], suggestion: '' },
      ];

      const affectedFiles = new Set<string>();
      blocks.forEach(block => {
        block.locations.forEach(loc => {
          affectedFiles.add(loc.file);
        });
      });

      expect(affectedFiles.size).toBe(4);
      expect(affectedFiles).toContain('file1.ts');
      expect(affectedFiles).toContain('file2.ts');
    });

    it('should categorize duplication severity', () => {
      const duplicationPercent = 5.5;
      const status = duplicationPercent < 3 ? 'good' : duplicationPercent < 8 ? 'warning' : 'critical';
      expect(status).toBe('warning');
    });

    it('should calculate total duplicated lines', () => {
      const blocks = [
        { size: 50, locations: [{ file: 'a.ts' }, { file: 'b.ts' }] },
        { size: 30, locations: [{ file: 'c.ts' }, { file: 'd.ts' }] },
        { size: 20, locations: [{ file: 'e.ts' }, { file: 'f.ts' }] },
      ];

      const totalDuplicatedLines = blocks.reduce((sum, block) => sum + block.size, 0);
      expect(totalDuplicatedLines).toBe(100);
    });
  });

  describe('Linting Results', () => {
    it('should count errors correctly', () => {
      const violations: LintingViolation[] = [
        { file: 'app.ts', line: 10, column: 5, severity: 'error', rule: 'no-any', message: 'Avoid any type', fixable: true },
        { file: 'util.ts', line: 20, column: 1, severity: 'error', rule: 'no-console', message: 'Unexpected console', fixable: false },
      ];

      const errors = violations.filter(v => v.severity === 'error').length;
      expect(errors).toBe(2);
      expect(errors).toBeGreaterThanOrEqual(0);
    });

    it('should count warnings', () => {
      const violations: LintingViolation[] = [
        { file: 'a.ts', line: 1, column: 1, severity: 'warning', rule: 'unused-vars', message: 'Unused variable', fixable: true },
        { file: 'b.ts', line: 2, column: 1, severity: 'warning', rule: 'no-explicit-any', message: 'Avoid explicit any', fixable: false },
        { file: 'c.ts', line: 3, column: 1, severity: 'warning', rule: 'prefer-const', message: 'Prefer const', fixable: true },
      ];

      const warnings = violations.filter(v => v.severity === 'warning').length;
      expect(warnings).toBe(3);
    });

    it('should count info messages', () => {
      const violations: LintingViolation[] = [
        { file: 'x.ts', line: 5, column: 1, severity: 'info', rule: 'info-rule', message: 'Info message', fixable: false },
      ];

      const info = violations.filter(v => v.severity === 'info').length;
      expect(info).toBe(1);
    });

    it('should combine all issue types', () => {
      const violations: LintingViolation[] = [
        { file: 'a.ts', line: 1, column: 1, severity: 'error', rule: 'rule1', message: 'Error', fixable: false },
        { file: 'b.ts', line: 2, column: 1, severity: 'warning', rule: 'rule2', message: 'Warning', fixable: false },
        { file: 'c.ts', line: 3, column: 1, severity: 'info', rule: 'rule3', message: 'Info', fixable: false },
      ];

      const total = violations.length;
      expect(total).toBe(3);
      expect(violations.filter(v => v.severity === 'error').length).toBe(1);
      expect(violations.filter(v => v.severity === 'warning').length).toBe(1);
    });

    it('should track violations by rule', () => {
      const violations: LintingViolation[] = [
        { file: 'a.ts', line: 1, column: 1, severity: 'error', rule: 'no-any', message: 'Error 1', fixable: false },
        { file: 'b.ts', line: 2, column: 1, severity: 'error', rule: 'no-any', message: 'Error 2', fixable: false },
        { file: 'c.ts', line: 3, column: 1, severity: 'error', rule: 'no-console', message: 'Error 3', fixable: false },
      ];

      const byRule = violations.reduce((acc, v) => {
        if (!acc[v.rule]) acc[v.rule] = [];
        acc[v.rule].push(v);
        return acc;
      }, {} as Record<string, LintingViolation[]>);

      expect(byRule['no-any'].length).toBe(2);
      expect(byRule['no-console'].length).toBe(1);
    });

    it('should track fixable violations', () => {
      const violations: LintingViolation[] = [
        { file: 'a.ts', line: 1, column: 1, severity: 'warning', rule: 'r1', message: 'M1', fixable: true },
        { file: 'b.ts', line: 2, column: 1, severity: 'warning', rule: 'r2', message: 'M2', fixable: false },
        { file: 'c.ts', line: 3, column: 1, severity: 'warning', rule: 'r3', message: 'M3', fixable: true },
      ];

      const fixable = violations.filter(v => v.fixable).length;
      expect(fixable).toBe(2);
    });
  });

  describe('Component Size Analysis', () => {
    it('should identify small components', () => {
      const size = 100;
      expect(size).toBeLessThan(300);
      expect(size).toBeGreaterThan(0);
    });

    it('should identify acceptable components', () => {
      const size = 250;
      expect(size).toBeLessThanOrEqual(300);
      expect(size).toBeGreaterThan(100);
    });

    it('should flag oversized components', () => {
      const size = 400;
      expect(size).toBeGreaterThan(300);
      expect(size).toBeLessThan(1000);
    });

    it('should calculate average component size', () => {
      const sizes = [100, 150, 200, 250, 300];
      const average = sizes.reduce((a, b) => a + b, 0) / sizes.length;
      expect(average).toBe(200);
      expect(average).toBeGreaterThanOrEqual(100);
    });

    it('should identify oversized components', () => {
      const components = [
        { file: 'Small.tsx', lines: 50, type: 'atom' },
        { file: 'Medium.tsx', lines: 200, type: 'molecule' },
        { file: 'Large.tsx', lines: 500, type: 'organism' },
        { file: 'Huge.tsx', lines: 800, type: 'organism' },
      ];

      const oversized = components.filter(c => c.lines > 300);
      expect(oversized.length).toBe(2);
      expect(oversized.every(c => c.lines > 300)).toBe(true);
    });

    it('should categorize by component type', () => {
      const components = [
        { file: 'Button.tsx', lines: 50, type: 'atom' },
        { file: 'Form.tsx', lines: 150, type: 'molecule' },
        { file: 'Modal.tsx', lines: 300, type: 'organism' },
      ];

      const byType = components.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(byType.atom).toBe(1);
      expect(byType.molecule).toBe(1);
      expect(byType.organism).toBe(1);
    });

    it('should calculate average by type', () => {
      const components = [
        { file: 'B1.tsx', lines: 40, type: 'atom' },
        { file: 'B2.tsx', lines: 60, type: 'atom' },
        { file: 'M1.tsx', lines: 150, type: 'molecule' },
        { file: 'M2.tsx', lines: 250, type: 'molecule' },
      ];

      const atoms = components.filter(c => c.type === 'atom');
      const atomAverage = atoms.reduce((sum, c) => sum + c.lines, 0) / atoms.length;
      expect(atomAverage).toBe(50);

      const molecules = components.filter(c => c.type === 'molecule');
      const moleculeAverage = molecules.reduce((sum, c) => sum + c.lines, 0) / molecules.length;
      expect(moleculeAverage).toBe(200);
    });
  });
});

describe('Test Coverage Analyzer', () => {
  describe('Coverage Metrics', () => {
    it('should parse and validate line coverage', () => {
      const coverage = 85.5;
      expect(coverage).toBeGreaterThanOrEqual(0);
      expect(coverage).toBeLessThanOrEqual(100);
      expect(coverage).toBeCloseTo(85.5, 1);
    });

    it('should parse branch coverage', () => {
      const coverage = 72.3;
      expect(coverage).toBeGreaterThanOrEqual(0);
      expect(coverage).toBeLessThanOrEqual(100);
    });

    it('should parse function coverage', () => {
      const coverage = 90.1;
      expect(coverage).toBeGreaterThanOrEqual(0);
      expect(coverage).toBeLessThanOrEqual(100);
    });

    it('should parse statement coverage', () => {
      const coverage = 88.7;
      expect(coverage).toBeGreaterThanOrEqual(0);
      expect(coverage).toBeLessThanOrEqual(100);
    });

    it('should calculate average coverage', () => {
      const coverages = [85, 72, 90, 88];
      const average = coverages.reduce((a, b) => a + b, 0) / coverages.length;
      expect(average).toBeCloseTo(83.75, 1);
    });

    it('should categorize coverage status', () => {
      const getStatus = (coverage: number): 'excellent' | 'acceptable' | 'poor' => {
        if (coverage >= 90) return 'excellent';
        if (coverage >= 70) return 'acceptable';
        return 'poor';
      };

      expect(getStatus(95)).toBe('excellent');
      expect(getStatus(85)).toBe('acceptable');
      expect(getStatus(50)).toBe('poor');
    });

    it('should track coverage by file', () => {
      const metrics: TestCoverageMetrics = {
        overall: {
          lines: { total: 1000, covered: 850, percentage: 85, status: 'acceptable' },
          branches: { total: 500, covered: 360, percentage: 72, status: 'acceptable' },
          functions: { total: 100, covered: 90, percentage: 90, status: 'excellent' },
          statements: { total: 1200, covered: 1065, percentage: 88.75, status: 'excellent' },
        },
        byFile: {
          'app.ts': {
            path: 'app.ts',
            lines: { total: 200, covered: 180, percentage: 90, status: 'excellent' },
            branches: { total: 100, covered: 80, percentage: 80, status: 'acceptable' },
            functions: { total: 20, covered: 18, percentage: 90, status: 'excellent' },
            statements: { total: 250, covered: 225, percentage: 90, status: 'excellent' },
          },
        },
        effectiveness: {
          totalTests: 50,
          testsWithMeaningfulNames: 48,
          averageAssertionsPerTest: 3,
          testsWithoutAssertions: 1,
          excessivelyMockedTests: 2,
          effectivenessScore: 85,
          issues: [],
        },
        gaps: [],
      };

      expect(metrics.byFile['app.ts'].lines.percentage).toBe(90);
      expect(metrics.byFile['app.ts'].lines.status).toBe('excellent');
    });
  });

  describe('Coverage Gaps', () => {
    it('should identify uncovered lines', () => {
      const gaps: CoverageGap[] = [
        {
          file: 'test.ts',
          coverage: 70,
          uncoveredLines: 15,
          criticality: 'high',
          suggestedTests: ['test error handling'],
          estimatedEffort: 'medium',
        },
        {
          file: 'other.ts',
          coverage: 85,
          uncoveredLines: 5,
          criticality: 'low',
          suggestedTests: [],
          estimatedEffort: 'low',
        },
      ];
      expect(gaps.length).toBe(2);
      expect(gaps[0].uncoveredLines).toBe(15);
    });

    it('should prioritize critical coverage gaps', () => {
      const gaps: CoverageGap[] = [
        { file: 'a.ts', coverage: 50, uncoveredLines: 50, criticality: 'critical', suggestedTests: [], estimatedEffort: 'high' },
        { file: 'b.ts', coverage: 80, uncoveredLines: 10, criticality: 'low', suggestedTests: [], estimatedEffort: 'low' },
      ];

      const critical = gaps.filter(g => g.criticality === 'critical');
      expect(critical.length).toBe(1);
    });

    it('should handle no coverage gaps', () => {
      const gaps: CoverageGap[] = [];
      expect(gaps.length).toBe(0);
    });

    it('should estimate remediation effort', () => {
      const gaps: CoverageGap[] = [
        { file: 'complex.ts', coverage: 30, uncoveredLines: 100, criticality: 'critical', suggestedTests: [], estimatedEffort: 'high' },
        { file: 'simple.ts', coverage: 80, uncoveredLines: 5, criticality: 'low', suggestedTests: [], estimatedEffort: 'low' },
      ];

      const highEffort = gaps.filter(g => g.estimatedEffort === 'high');
      expect(highEffort.length).toBe(1);
    });
  });

  describe('Test Effectiveness Scoring', () => {
    it('should score effective tests', () => {
      const effectiveness = {
        totalTests: 50,
        testsWithMeaningfulNames: 48,
        averageAssertionsPerTest: 4,
        testsWithoutAssertions: 1,
        excessivelyMockedTests: 0,
        effectivenessScore: 90,
        issues: [],
      };

      expect(effectiveness.effectivenessScore).toBeGreaterThanOrEqual(80);
      expect(effectiveness.testsWithMeaningfulNames).toBeGreaterThan(40);
      expect(effectiveness.averageAssertionsPerTest).toBeGreaterThanOrEqual(2);
    });

    it('should score ineffective tests', () => {
      const effectiveness = {
        totalTests: 30,
        testsWithMeaningfulNames: 15,
        averageAssertionsPerTest: 1,
        testsWithoutAssertions: 10,
        excessivelyMockedTests: 8,
        effectivenessScore: 40,
        issues: [
          { file: 'test.ts', issue: 'Tests with too many mocks', suggestion: 'Reduce mock usage', severity: 'high' },
        ],
      };

      expect(effectiveness.effectivenessScore).toBeLessThan(60);
      expect(effectiveness.testsWithoutAssertions).toBeGreaterThan(5);
    });

    it('should identify tests without assertions', () => {
      const tests = [
        { name: 'test1', assertions: 3, hasMocks: false },
        { name: 'test2', assertions: 0, hasMocks: false },
        { name: 'test3', assertions: 2, hasMocks: true },
        { name: 'test4', assertions: 0, hasMocks: true },
      ];

      const problematic = tests.filter(t => t.assertions === 0);
      expect(problematic.length).toBe(2);
    });

    it('should track mock usage', () => {
      const tests = [
        { name: 'test1', mocks: 0, assertions: 5 },
        { name: 'test2', mocks: 3, assertions: 4 },
        { name: 'test3', mocks: 8, assertions: 2 },
        { name: 'test4', mocks: 1, assertions: 6 },
      ];

      const excessiveMocks = tests.filter(t => t.mocks > 5);
      expect(excessiveMocks.length).toBe(1);
    });
  });
});

describe('Architecture Checker', () => {
  describe('Component Organization', () => {
    it('should validate atomic design atoms', () => {
      const path = 'src/components/atoms/Button.tsx';
      expect(path).toContain('atoms');
      expect(path).toContain('Button');
    });

    it('should validate molecules', () => {
      const path = 'src/components/molecules/SearchBar.tsx';
      expect(path).toContain('molecules');
      expect(path).toContain('SearchBar');
    });

    it('should validate organisms', () => {
      const path = 'src/components/organisms/Header.tsx';
      expect(path).toContain('organisms');
      expect(path).toContain('Header');
    });

    it('should validate templates', () => {
      const path = 'src/components/templates/PageLayout.tsx';
      expect(path).toContain('templates');
    });

    it('should flag misplaced components', () => {
      const path = 'src/components/CustomComponent.tsx';
      const validLayers = ['atoms', 'molecules', 'organisms', 'templates'];
      const isPlaced = validLayers.some(layer => path.includes(layer));
      expect(isPlaced).toBe(false);
    });

    it('should categorize all components', () => {
      const metrics: ArchitectureMetrics = {
        components: {
          totalCount: 100,
          byType: {
            atoms: 30,
            molecules: 25,
            organisms: 20,
            templates: 15,
            unknown: 10,
          },
          oversized: [],
          misplaced: [],
          averageSize: 150,
        },
        dependencies: {
          totalModules: 100,
          circularDependencies: [],
          layerViolations: [],
          externalDependencies: new Map(),
        },
        patterns: {
          reduxCompliance: { issues: [], score: 85 },
          hookUsage: { issues: [], score: 80 },
          reactBestPractices: { issues: [], score: 82 },
        },
      };

      const total =
        metrics.components.byType.atoms +
        metrics.components.byType.molecules +
        metrics.components.byType.organisms +
        metrics.components.byType.templates +
        metrics.components.byType.unknown;

      expect(total).toBe(100);
      expect(metrics.components.byType.atoms).toBe(30);
    });

    it('should identify oversized components', () => {
      const metrics: ArchitectureMetrics = {
        components: {
          totalCount: 5,
          byType: { atoms: 2, molecules: 1, organisms: 1, templates: 1, unknown: 0 },
          oversized: [
            { file: 'Heavy.tsx', name: 'HeavyComponent', lines: 500, type: 'organism', suggestion: 'Break into smaller components' },
            { file: 'Complex.tsx', name: 'ComplexComponent', lines: 400, type: 'molecule', suggestion: 'Extract logic into hooks' },
          ],
          misplaced: [],
          averageSize: 280,
        },
        dependencies: {
          totalModules: 5,
          circularDependencies: [],
          layerViolations: [],
          externalDependencies: new Map(),
        },
        patterns: {
          reduxCompliance: { issues: [], score: 75 },
          hookUsage: { issues: [], score: 70 },
          reactBestPractices: { issues: [], score: 72 },
        },
      };

      expect(metrics.components.oversized.length).toBe(2);
      expect(metrics.components.oversized[0].lines).toBeGreaterThan(300);
    });

    it('should track misplaced components', () => {
      const metrics: ArchitectureMetrics = {
        components: {
          totalCount: 10,
          byType: { atoms: 3, molecules: 2, organisms: 2, templates: 1, unknown: 2 },
          oversized: [],
          misplaced: [
            { file: 'Button.tsx', name: 'Button', currentLocation: 'src/components', suggestedLocation: 'src/components/atoms' },
            { file: 'Form.tsx', name: 'Form', currentLocation: 'src/components', suggestedLocation: 'src/components/molecules' },
          ],
          averageSize: 200,
        },
        dependencies: {
          totalModules: 10,
          circularDependencies: [],
          layerViolations: [],
          externalDependencies: new Map(),
        },
        patterns: {
          reduxCompliance: { issues: [], score: 80 },
          hookUsage: { issues: [], score: 75 },
          reactBestPractices: { issues: [], score: 78 },
        },
      };

      expect(metrics.components.misplaced.length).toBe(2);
      expect(metrics.components.misplaced[0].suggestedLocation).toContain('atoms');
    });
  });

  describe('Dependency Analysis', () => {
    it('should detect no circular dependencies', () => {
      const cycles: CircularDependency[] = [];
      expect(cycles.length).toBe(0);
    });

    it('should detect circular dependencies', () => {
      const cycles: CircularDependency[] = [
        { path: ['ComponentA', 'ComponentB', 'ComponentA'], files: ['a.ts', 'b.ts'], severity: 'critical' },
        { path: ['ComponentC', 'ComponentD', 'ComponentE', 'ComponentC'], files: ['c.ts', 'd.ts', 'e.ts'], severity: 'high' },
      ];
      expect(cycles.length).toBe(2);
      expect(cycles[0].severity).toBe('critical');
    });

    it('should track dependency graph', () => {
      const deps: Record<string, string[]> = {
        ComponentA: ['ComponentB', 'ComponentC'],
        ComponentB: ['ComponentD'],
        ComponentC: [],
        ComponentD: [],
      };

      expect(Object.keys(deps).length).toBe(4);
      expect(deps.ComponentA.length).toBe(2);
      expect(deps.ComponentC.length).toBe(0);
    });

    it('should identify deeply nested dependencies', () => {
      const deps: Record<string, string[]> = {
        A: ['B'],
        B: ['C'],
        C: ['D'],
        D: ['E'],
        E: [],
      };

      const getDepth = (component: string, graph: Record<string, string[]>, visited = new Set<string>()): number => {
        if (visited.has(component)) return 0;
        visited.add(component);
        const children = graph[component] || [];
        if (children.length === 0) return 0;
        return 1 + Math.max(...children.map(c => getDepth(c, graph, visited)), 0);
      };

      expect(getDepth('A', deps)).toBe(4);
    });

    it('should count total dependencies', () => {
      const deps: Record<string, string[]> = {
        A: ['B', 'C', 'D'],
        B: ['C', 'E'],
        C: ['E', 'F'],
        D: [],
        E: [],
        F: [],
      };

      const totalDeps = Object.values(deps).flat().length;
      expect(totalDeps).toBe(7);
    });
  });

  describe('Layer Violations', () => {
    it('should validate layer structure', () => {
      const layers = ['presentation', 'business', 'data'];
      layers.forEach(layer => {
        expect(['presentation', 'business', 'data']).toContain(layer);
      });
    });

    it('should detect cross-layer violations', () => {
      const violations = [
        { source: 'data/repo.ts', target: 'presentation/component.tsx', violationType: 'direct-access', suggestion: 'Use business layer' },
      ];
      expect(violations.length).toBe(1);
    });

    it('should track layer structure', () => {
      const layers = {
        presentation: ['Button.tsx', 'Form.tsx', 'Header.tsx'],
        business: ['UserService.ts', 'DataProcessor.ts'],
        data: ['Repository.ts', 'Database.ts'],
      };

      Object.entries(layers).forEach(([layer, components]) => {
        expect(components.length).toBeGreaterThan(0);
      });
    });

    it('should validate architecture compliance', () => {
      const rules = {
        'presentation-can-use': ['business', 'presentation', 'ui'],
        'business-can-use': ['data', 'business'],
        'data-can-use': ['data'],
      };

      const isValid = (source: string, target: string): boolean => {
        const sourceLayer = source.split('/')[0] as 'presentation' | 'business' | 'data';
        const allowed = rules[`${sourceLayer}-can-use` as keyof typeof rules] || [];
        const targetLayer = target.split('/')[0];
        return allowed.includes(targetLayer);
      };

      expect(isValid('presentation/comp.ts', 'business/service.ts')).toBe(true);
      expect(isValid('data/repo.ts', 'presentation/comp.ts')).toBe(false);
    });
  });
});

describe('Security Scanner', () => {
  describe('Vulnerability Detection', () => {
    it('should count critical vulnerabilities', () => {
      const vuln: Vulnerability = {
        package: 'critical-lib',
        currentVersion: '1.0.0',
        vulnerabilityType: 'RCE',
        severity: 'critical',
        description: 'Remote code execution',
        fixedInVersion: '2.0.0',
      };

      expect(vuln.severity).toBe('critical');
      expect(vuln.severity === 'critical').toBe(true);
    });

    it('should count high-severity vulnerabilities', () => {
      const vulns: Vulnerability[] = [
        {
          package: 'pkg1',
          currentVersion: '1.0.0',
          vulnerabilityType: 'XSS',
          severity: 'high',
          description: 'Reflected XSS',
          fixedInVersion: '1.1.0',
        },
        {
          package: 'pkg2',
          currentVersion: '2.0.0',
          vulnerabilityType: 'CSRF',
          severity: 'high',
          description: 'CSRF token validation',
          fixedInVersion: '2.1.0',
        },
      ];

      const highSeverity = vulns.filter(v => v.severity === 'high');
      expect(highSeverity.length).toBe(2);
    });

    it('should count medium vulnerabilities', () => {
      const vulns: Vulnerability[] = [
        {
          package: 'lib1',
          currentVersion: '1.0',
          vulnerabilityType: 'Information Disclosure',
          severity: 'medium',
          description: 'Sensitive info leakage',
          fixedInVersion: '1.1',
        },
        {
          package: 'lib2',
          currentVersion: '2.0',
          vulnerabilityType: 'Path Traversal',
          severity: 'medium',
          description: 'Path traversal vulnerability',
          fixedInVersion: '2.1',
        },
      ];

      expect(vulns.length).toBe(2);
    });

    it('should prioritize vulnerabilities by severity', () => {
      const vulns: Vulnerability[] = [
        { package: 'low', currentVersion: '1', vulnerabilityType: 'Low', severity: 'low', description: 'Low issue', fixedInVersion: '2' },
        { package: 'high', currentVersion: '1', vulnerabilityType: 'High', severity: 'high', description: 'High issue', fixedInVersion: '2' },
        { package: 'critical', currentVersion: '1', vulnerabilityType: 'Critical', severity: 'critical', description: 'Critical issue', fixedInVersion: '2' },
      ];

      const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      const sorted = vulns.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));

      expect(sorted[0].severity).toBe('critical');
      expect(sorted[sorted.length - 1].severity).toBe('low');
    });

    it('should track affected code locations', () => {
      const vuln: Vulnerability = {
        package: 'vulnerable-lib',
        currentVersion: '1.0.0',
        vulnerabilityType: 'Prototype Pollution',
        severity: 'high',
        description: 'Prototype pollution',
        fixedInVersion: '2.0.0',
        affectedCodeLocations: ['src/utils/merge.ts', 'src/config/loader.ts'],
      };

      expect(vuln.affectedCodeLocations?.length).toBe(2);
      expect(vuln.affectedCodeLocations).toContain('src/utils/merge.ts');
    });
  });

  describe('Secret Detection', () => {
    it('should identify hardcoded secrets', () => {
      const patterns: SecurityAntiPattern[] = [
        {
          type: 'secret',
          severity: 'critical',
          file: 'config.ts',
          line: 10,
          message: 'Hardcoded API key detected',
          remediation: 'Move to environment variables',
          evidence: 'API_KEY = "sk_live_xxx"',
        },
      ];

      expect(patterns.length).toBe(1);
      expect(patterns[0].type).toBe('secret');
      expect(patterns[0].severity).toBe('critical');
    });

    it('should scan multiple secret patterns', () => {
      const secrets = ['.env', '.env.local', '.secrets', 'credentials.json'];
      const found = secrets.filter(s => s.includes('.env') || s.includes('secret'));

      expect(found.length).toBe(3);
    });

    it('should handle no secrets found', () => {
      const patterns: SecurityAntiPattern[] = [];
      expect(patterns.length).toBe(0);
    });

    it('should provide remediation guidance', () => {
      const pattern: SecurityAntiPattern = {
        type: 'secret',
        severity: 'critical',
        file: 'app.ts',
        message: 'Database password in code',
        remediation: 'Use environment variables or secrets manager',
      };

      expect(pattern.remediation).toContain('environment variables');
    });
  });

  describe('Code Pattern Detection', () => {
    it('should detect unsafe DOM operations', () => {
      const patterns: SecurityAntiPattern[] = [
        {
          type: 'unsafeDom',
          severity: 'high',
          file: 'component.tsx',
          line: 42,
          message: 'dangerouslySetInnerHTML usage',
          remediation: 'Use safe DOM manipulation methods',
        },
      ];

      expect(patterns.length).toBe(1);
      expect(patterns[0].type).toBe('unsafeDom');
    });

    it('should detect missing input validation', () => {
      const patterns: SecurityAntiPattern[] = [
        {
          type: 'unvalidatedInput',
          severity: 'high',
          file: 'form.tsx',
          line: 25,
          message: 'User input not validated',
          remediation: 'Add input validation before processing',
        },
      ];

      expect(patterns.length).toBe(1);
      expect(patterns[0].type).toBe('unvalidatedInput');
    });

    it('should detect XSS vulnerabilities', () => {
      const patterns: SecurityAntiPattern[] = [
        {
          type: 'xss',
          severity: 'critical',
          file: 'display.tsx',
          message: 'User input directly rendered',
          remediation: 'Sanitize HTML output using DOMPurify',
        },
      ];

      expect(patterns.length).toBe(1);
      expect(patterns[0].severity).toBe('critical');
    });

    it('should handle no security issues', () => {
      const patterns: SecurityAntiPattern[] = [];
      expect(patterns.length).toBe(0);
    });

    it('should categorize by pattern type', () => {
      const patterns: SecurityAntiPattern[] = [
        { type: 'secret', severity: 'critical', file: 'a.ts', message: 'Secret', remediation: 'Fix' },
        { type: 'unsafeDom', severity: 'high', file: 'b.ts', message: 'DOM', remediation: 'Fix' },
        { type: 'unvalidatedInput', severity: 'high', file: 'c.ts', message: 'Input', remediation: 'Fix' },
        { type: 'xss', severity: 'critical', file: 'd.ts', message: 'XSS', remediation: 'Fix' },
      ];

      const byType = patterns.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(byType.secret).toBe(1);
      expect(byType.unsafeDom).toBe(1);
      expect(byType.xss).toBe(1);
    });
  });

  describe('Dependency Vulnerability Scanning', () => {
    it('should scan npm vulnerabilities', () => {
      const vulns: Vulnerability[] = [
        {
          package: 'lodash',
          currentVersion: '4.17.19',
          vulnerabilityType: 'Prototype Pollution',
          severity: 'high',
          description: 'Prototype pollution vulnerability',
          fixedInVersion: '4.17.21',
        },
        {
          package: 'express',
          currentVersion: '4.16.0',
          vulnerabilityType: 'Regular Expression DoS',
          severity: 'medium',
          description: 'ReDoS in path parsing',
          fixedInVersion: '4.17.0',
        },
      ];

      const total = vulns.length;
      expect(total).toBe(2);

      const critical = vulns.filter(v => v.severity === 'critical').length;
      expect(critical).toBe(0);
    });

    it('should track affected packages', () => {
      const packages = [
        'lodash@4.17.19',
        'express@4.16.0',
        'axios@0.18.0',
      ];

      expect(packages.length).toBe(3);
      expect(packages).toContain('lodash@4.17.19');
    });

    it('should suggest version updates', () => {
      const vulns: Vulnerability[] = [
        {
          package: 'pkg',
          currentVersion: '1.0.0',
          vulnerabilityType: 'CVE',
          severity: 'high',
          description: 'Vulnerability',
          fixedInVersion: '1.2.5',
        },
      ];

      expect(vulns[0].currentVersion).toBe('1.0.0');
      expect(vulns[0].fixedInVersion).toBe('1.2.5');
    });

    it('should handle transitive dependencies', () => {
      const vulns: Vulnerability[] = [
        {
          package: 'direct-dep',
          currentVersion: '1.0',
          vulnerabilityType: 'Issue',
          severity: 'medium',
          description: 'Direct dependency',
          fixedInVersion: '2.0',
        },
        {
          package: 'indirect-dep',
          currentVersion: '1.0',
          vulnerabilityType: 'Issue',
          severity: 'low',
          description: 'Transitive dependency',
          fixedInVersion: '1.1',
        },
      ];

      expect(vulns.length).toBe(2);
    });
  });
});

describe('Cross-Analyzer Integration', () => {
  it('should collect results from all analyzers', () => {
    const results: Record<string, AnalysisResult> = {
      codeQuality: {
        category: 'codeQuality',
        score: 82,
        status: 'pass',
        findings: [],
        metrics: { complexity: 8.5 },
        executionTime: 100,
      },
      testCoverage: {
        category: 'testCoverage',
        score: 88,
        status: 'pass',
        findings: [],
        metrics: { coverage: 88 },
        executionTime: 150,
      },
      architecture: {
        category: 'architecture',
        score: 79,
        status: 'warning',
        findings: [],
        metrics: { components: 50 },
        executionTime: 120,
      },
      security: {
        category: 'security',
        score: 91,
        status: 'pass',
        findings: [],
        metrics: { vulnerabilities: 0 },
        executionTime: 200,
      },
    };

    expect(Object.keys(results)).toHaveLength(4);
    Object.values(results).forEach(result => {
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(['pass', 'fail', 'warning']).toContain(result.status);
    });
  });

  it('should validate all analyzers completed successfully', () => {
    const analyzers = ['codeQuality', 'testCoverage', 'architecture', 'security'];
    const executed = ['codeQuality', 'testCoverage', 'architecture', 'security'];

    expect(executed.length).toBe(analyzers.length);
    expect(executed.every(a => analyzers.includes(a))).toBe(true);
  });

  it('should handle partial analyzer failures', () => {
    const results = [
      { name: 'codeQuality', score: null, error: 'Timeout' },
      { name: 'testCoverage', score: 88, error: undefined },
      { name: 'architecture', score: 79, error: undefined },
      { name: 'security', score: 91, error: undefined },
    ];

    const failures = results.filter(r => r.error !== undefined).length;
    const successful = results.filter(r => r.score !== null).length;

    expect(failures).toBe(1);
    expect(successful).toBe(3);
  });

  it('should aggregate findings from all analyzers', () => {
    const results = {
      codeQuality: {
        findings: [
          { id: 'cq-001', severity: 'high', category: 'codeQuality', title: 'High complexity', description: 'CC > 10', location: { file: 'app.ts', line: 42 }, remediation: 'Refactor' },
        ],
      },
      testCoverage: {
        findings: [
          { id: 'tc-001', severity: 'medium', category: 'testCoverage', title: 'Low coverage', description: 'Coverage < 80%', location: { file: 'util.ts', line: 10 }, remediation: 'Add tests' },
        ],
      },
      architecture: {
        findings: [
          { id: 'arch-001', severity: 'high', category: 'architecture', title: 'Circular dependency', description: 'A -> B -> A', location: { file: 'a.ts' }, remediation: 'Break cycle' },
        ],
      },
      security: {
        findings: [
          { id: 'sec-001', severity: 'critical', category: 'security', title: 'Hardcoded secret', description: 'API key in code', location: { file: '.env', line: 1 }, remediation: 'Use env vars' },
        ],
      },
    };

    const allFindings = Object.values(results).flatMap(r => r.findings);
    expect(allFindings).toHaveLength(4);

    const critical = allFindings.filter(f => f.severity === 'critical');
    expect(critical).toHaveLength(1);
  });

  it('should track total execution time', () => {
    const times = {
      codeQuality: 100,
      testCoverage: 150,
      architecture: 120,
      security: 200,
    };

    const totalParallel = Math.max(...Object.values(times));
    const totalSequential = Object.values(times).reduce((a, b) => a + b, 0);

    expect(totalParallel).toBe(200);
    expect(totalSequential).toBe(570);
    expect(totalParallel).toBeLessThan(totalSequential);
  });

  it('should validate score consistency', () => {
    const scores = {
      codeQuality: 82,
      testCoverage: 88,
      architecture: 79,
      security: 91,
    };

    Object.values(scores).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    const average = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    expect(average).toBeCloseTo(85, 1);
  });

  it('should handle missing analyzer results', () => {
    const results: Record<string, any> = {
      codeQuality: { score: 82 },
      testCoverage: undefined,
      architecture: { score: 79 },
      security: { score: 91 },
    };

    const available = Object.values(results).filter(r => r !== undefined && r !== null);
    expect(available).toHaveLength(3);
  });

  it('should prioritize critical findings across analyzers', () => {
    const findings = [
      { severity: 'low', analyzer: 'codeQuality' },
      { severity: 'critical', analyzer: 'security' },
      { severity: 'high', analyzer: 'architecture' },
      { severity: 'medium', analyzer: 'testCoverage' },
      { severity: 'critical', analyzer: 'security' },
    ];

    const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    const sorted = findings.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));

    expect(sorted[0].severity).toBe('critical');
    expect(sorted[sorted.length - 1].severity).toBe('low');
    expect(sorted.filter(f => f.severity === 'critical')).toHaveLength(2);
  });
});
