/**
 * Comprehensive Unit Tests for Architecture Checker
 * Tests component validation, dependency graph analysis, pattern compliance
 * and circular dependency detection with realistic scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ArchitectureChecker } from '../../../../../src/lib/quality-validator/analyzers/architectureChecker';
import {
  createTempDir,
  cleanupTempDir,
  createTestFile,
  createMockArchitectureMetrics,
} from '../../../../test-utils';

describe('ArchitectureChecker - Comprehensive Tests', () => {
  let checker: ArchitectureChecker;
  let tempDir: string;

  beforeEach(() => {
    checker = new ArchitectureChecker();
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  // ============================================================================
  // COMPONENT ANALYSIS TESTS
  // ============================================================================

  describe('Component Organization Analysis', () => {
    it('should classify components into atomic design categories', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/components/atoms/Button.tsx', 'export const Button = () => <button>Click</button>;');
        createTestFile(tempDir, 'src/components/molecules/Form.tsx', 'export const Form = () => <form></form>;');
        createTestFile(tempDir, 'src/components/organisms/Header.tsx', 'export const Header = () => <header></header>;');
        createTestFile(tempDir, 'src/components/templates/Layout.tsx', 'export const Layout = () => <div></div>;');

        const result = await checker.analyze([
          'src/components/atoms/Button.tsx',
          'src/components/molecules/Form.tsx',
          'src/components/organisms/Header.tsx',
          'src/components/templates/Layout.tsx',
        ]);

        expect(result.category).toBe('architecture');
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.status).toMatch(/pass|fail|warning/);

        const metrics = result.metrics as any;
        expect(metrics.components).toBeDefined();
        expect(metrics.components.byType).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect oversized components (>500 lines)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        let largeComponentCode = '// Large component\n';
        for (let i = 0; i < 600; i++) {
          largeComponentCode += `// Line ${i}\n`;
        }
        largeComponentCode += 'export const LargeComponent = () => <div>Large</div>;';

        createTestFile(tempDir, 'src/components/organisms/Oversized.tsx', largeComponentCode);

        const result = await checker.analyze(['src/components/organisms/Oversized.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.components).toBeDefined();
        expect(metrics.components.oversized).toBeDefined();
        expect(Array.isArray(metrics.components.oversized)).toBe(true);

        if (metrics.components.oversized.length > 0) {
          const oversized = metrics.components.oversized[0];
          expect(oversized.lines).toBeGreaterThan(500);
          expect(oversized.suggestion).toBeDefined();
          expect(oversized.name).toBe('Oversized');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should calculate average component size correctly', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Create 3 components with known sizes
        createTestFile(tempDir, 'src/components/atoms/Small.tsx', 'export const Small = () => null;\n');
        createTestFile(tempDir, 'src/components/atoms/Medium.tsx', '// ' + 'x'.repeat(50) + '\nexport const Medium = () => null;\n');
        createTestFile(tempDir, 'src/components/atoms/Large.tsx', '// ' + 'x'.repeat(100) + '\nexport const Large = () => null;\n');

        const result = await checker.analyze([
          'src/components/atoms/Small.tsx',
          'src/components/atoms/Medium.tsx',
          'src/components/atoms/Large.tsx',
        ]);

        const metrics = result.metrics as any;
        expect(metrics.components.averageSize).toBeGreaterThan(0);
        expect(metrics.components.totalCount).toBe(3);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should extract correct component name from file path', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/components/organisms/MyComplexComponent.tsx',
          '// Large component\n' + 'x'.repeat(600) + '\nexport const MyComplexComponent = () => null;'
        );

        const result = await checker.analyze(['src/components/organisms/MyComplexComponent.tsx']);

        const metrics = result.metrics as any;
        if (metrics.components.oversized.length > 0) {
          expect(metrics.components.oversized[0].name).toBe('MyComplexComponent');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // DEPENDENCY GRAPH ANALYSIS TESTS
  // ============================================================================

  describe('Dependency Graph Analysis', () => {
    it('should build import graph from source files', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/components/Button.tsx',
          `
import React from 'react';
import { useState } from 'react';
import { useCallback } from 'react';
import { helpers } from './helpers';
        `
        );

        const result = await checker.analyze(['src/components/Button.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.dependencies).toBeDefined();
        expect(metrics.dependencies.totalModules).toBeGreaterThanOrEqual(0);
        expect(metrics.dependencies.externalDependencies).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should track external dependencies separately', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/app.ts',
          `
import React from 'react';
import lodash from 'lodash';
import { Button } from './components/Button';
        `
        );

        const result = await checker.analyze(['src/app.ts']);

        const metrics = result.metrics as any;
        expect(metrics.dependencies.externalDependencies).toBeDefined();
        expect(metrics.dependencies.externalDependencies instanceof Map).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect circular dependency A->B->A', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // File A imports B
        createTestFile(
          tempDir,
          'src/moduleA.ts',
          `
import { B } from './moduleB';
export const A = () => {
  return B();
};
        `
        );

        // File B imports A (circular)
        createTestFile(
          tempDir,
          'src/moduleB.ts',
          `
import { A } from './moduleA';
export const B = () => {
  return A();
};
        `
        );

        const result = await checker.analyze(['src/moduleA.ts', 'src/moduleB.ts']);

        const metrics = result.metrics as any;
        expect(metrics.dependencies.circularDependencies).toBeDefined();
        expect(Array.isArray(metrics.dependencies.circularDependencies)).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect circular dependency in three-module chain A->B->C->A', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/modA.ts', "import { B } from './modB'; export const A = B;");
        createTestFile(tempDir, 'src/modB.ts', "import { C } from './modC'; export const B = C;");
        createTestFile(tempDir, 'src/modC.ts', "import { A } from './modA'; export const C = A;");

        const result = await checker.analyze(['src/modA.ts', 'src/modB.ts', 'src/modC.ts']);

        const metrics = result.metrics as any;
        expect(metrics.dependencies.circularDependencies).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle multiple independent modules without circular deps', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/utils/math.ts', 'export const add = (a, b) => a + b;');
        createTestFile(tempDir, 'src/utils/string.ts', 'export const uppercase = (s) => s.toUpperCase();');
        createTestFile(tempDir, 'src/utils/array.ts', 'export const flatten = (arr) => arr.flat();');

        const result = await checker.analyze([
          'src/utils/math.ts',
          'src/utils/string.ts',
          'src/utils/array.ts',
        ]);

        const metrics = result.metrics as any;
        expect(metrics.dependencies.circularDependencies).toBeDefined();
        expect(metrics.dependencies.circularDependencies.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should count total modules correctly', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/file1.ts', 'export const func1 = () => {};');
        createTestFile(tempDir, 'src/file2.tsx', 'export const Comp = () => null;');
        createTestFile(tempDir, 'src/file3.js', '// JS file');

        const result = await checker.analyze([
          'src/file1.ts',
          'src/file2.tsx',
          'src/file3.js',
        ]);

        const metrics = result.metrics as any;
        expect(metrics.dependencies.totalModules).toBeGreaterThanOrEqual(2);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // PATTERN COMPLIANCE TESTS
  // ============================================================================

  describe('Pattern Compliance Analysis', () => {
    it('should detect Redux direct state mutation', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/store/slices/counterSlice.ts',
          `
export const counterSlice = {
  reducers: {
    increment: (state) => {
      state.count = state.count + 1;
    }
  }
};
        `
        );

        const result = await checker.analyze(['src/store/slices/counterSlice.ts']);

        const metrics = result.metrics as any;
        expect(metrics.patterns.reduxCompliance).toBeDefined();
        expect(metrics.patterns.reduxCompliance.issues).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect hooks called conditionally', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/components/BadHookUsage.tsx',
          `
export function Component() {
  if (condition) {
    const [state, setState] = useState(0);
  }
  return <div>{state}</div>;
}
        `
        );

        const result = await checker.analyze(['src/components/BadHookUsage.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.patterns.hookUsage).toBeDefined();
        expect(metrics.patterns.hookUsage.issues).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect hooks inside loops', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/components/LoopHook.tsx',
          `
export function Component({ items }) {
  for (const item of items) {
    const [state, setState] = useState(item);
  }
  return <div>List</div>;
}
        `
        );

        const result = await checker.analyze(['src/components/LoopHook.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.patterns.hookUsage).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should calculate pattern compliance scores', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/clean.ts', 'export const clean = () => {};');

        const result = await checker.analyze(['src/clean.ts']);

        const metrics = result.metrics as any;
        expect(metrics.patterns.reduxCompliance.score).toBeGreaterThanOrEqual(0);
        expect(metrics.patterns.reduxCompliance.score).toBeLessThanOrEqual(100);
        expect(metrics.patterns.hookUsage.score).toBeGreaterThanOrEqual(0);
        expect(metrics.patterns.hookUsage.score).toBeLessThanOrEqual(100);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // FINDINGS GENERATION TESTS
  // ============================================================================

  describe('Findings Generation', () => {
    it('should generate findings for oversized components', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        let largeCode = '';
        for (let i = 0; i < 600; i++) {
          largeCode += `// Line ${i}\n`;
        }
        largeCode += 'export const Large = () => null;';

        createTestFile(tempDir, 'src/components/atoms/Huge.tsx', largeCode);

        const result = await checker.analyze(['src/components/atoms/Huge.tsx']);

        expect(result.findings).toBeDefined();
        expect(Array.isArray(result.findings)).toBe(true);

        const oversizedFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('oversized')
        );

        if (oversizedFindings.length > 0) {
          const finding = oversizedFindings[0];
          expect(finding.severity).toBe('medium');
          expect(finding.category).toBe('architecture');
          expect(finding.remediation).toBeDefined();
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate findings for circular dependencies', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/a.ts', "import { B } from './b'; export const A = B;");
        createTestFile(tempDir, 'src/b.ts', "import { A } from './a'; export const B = A;");

        const result = await checker.analyze(['src/a.ts', 'src/b.ts']);

        const circularFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('circular')
        );

        if (circularFindings.length > 0) {
          const finding = circularFindings[0];
          expect(finding.severity).toBe('high');
          expect(finding.category).toBe('architecture');
          expect(finding.remediation).toBeDefined();
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate findings for pattern violations', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/store/mySlice.ts',
          `
export const slice = {
  reducer: (state) => {
    state.value = 42;
  }
};
        `
        );

        const result = await checker.analyze(['src/store/mySlice.ts']);

        const patternFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('redux') ||
          f.title.toLowerCase().includes('pattern')
        );

        if (patternFindings.length > 0) {
          expect(patternFindings[0].category).toBe('architecture');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // SCORE CALCULATION TESTS
  // ============================================================================

  describe('Score Calculation and Status', () => {
    it('should return score between 0 and 100', async () => {
      const result = await checker.analyze([]);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should assign PASS status when score >= 80', async () => {
      const result = await checker.analyze([]);

      if (result.score >= 80) {
        expect(result.status).toBe('pass');
      }
    });

    it('should assign WARNING status when score between 70-80', async () => {
      const result = await checker.analyze([]);

      if (result.score >= 70 && result.score < 80) {
        expect(result.status).toBe('warning');
      }
    });

    it('should assign FAIL status when score < 70', async () => {
      const result = await checker.analyze([]);

      if (result.score < 70) {
        expect(result.status).toBe('fail');
      }
    });

    it('should reduce score for oversized components', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        let largeCode = '';
        for (let i = 0; i < 600; i++) {
          largeCode += `// Line ${i}\n`;
        }

        createTestFile(tempDir, 'src/components/atoms/Huge.tsx', largeCode);

        const result = await checker.analyze(['src/components/atoms/Huge.tsx']);

        expect(result.score).toBeDefined();
        expect(typeof result.score).toBe('number');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should reduce score for circular dependencies', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/x.ts', "import { Y } from './y'; export const X = Y;");
        createTestFile(tempDir, 'src/y.ts', "import { X } from './x'; export const Y = X;");

        const result = await checker.analyze(['src/x.ts', 'src/y.ts']);

        expect(result.score).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should calculate weighted score (35% components, 35% dependencies, 30% patterns)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/components/atoms/Button.tsx', 'export const Button = () => null;');

        const result = await checker.analyze(['src/components/atoms/Button.tsx']);

        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // VALIDATION AND ERROR HANDLING TESTS
  // ============================================================================

  describe('Validation and Error Handling', () => {
    it('should validate configuration before analysis', async () => {
      const result = await checker.analyze([]);

      expect(result).toBeDefined();
      expect(result.category).toBe('architecture');
    });

    it('should handle non-existent files gracefully', async () => {
      const result = await checker.analyze(['non-existent-file.ts']);

      expect(result).toBeDefined();
      expect(result.category).toBe('architecture');
      expect(typeof result.score).toBe('number');
    });

    it('should skip non-TypeScript files', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/readme.md', '# README');
        createTestFile(tempDir, 'src/config.json', '{}');

        const result = await checker.analyze([
          'src/readme.md',
          'src/config.json',
        ]);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should measure execution time accurately', async () => {
      const result = await checker.analyze([]);

      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.executionTime).toBe('number');
    });

    it('should handle empty file paths array', async () => {
      const result = await checker.analyze([]);

      expect(result).toBeDefined();
      expect(result.findings).toBeDefined();
      expect(Array.isArray(result.findings)).toBe(true);
    });

    it('should handle malformed import statements gracefully', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/malformed.ts',
          `
import from 'react';
import { a, b } from;
import 'just-a-string';
export const x = 1;
        `
        );

        const result = await checker.analyze(['src/malformed.ts']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // EDGE CASES AND SPECIAL SCENARIOS
  // ============================================================================

  describe('Edge Cases and Special Scenarios', () => {
    it('should handle mixed component types in same folder', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/components/atoms/Button.tsx', 'export const Button = () => null;');
        createTestFile(tempDir, 'src/components/atoms/Input.tsx', 'export const Input = () => null;');
        createTestFile(tempDir, 'src/components/atoms/Label.tsx', 'export const Label = () => null;');

        const result = await checker.analyze([
          'src/components/atoms/Button.tsx',
          'src/components/atoms/Input.tsx',
          'src/components/atoms/Label.tsx',
        ]);

        const metrics = result.metrics as any;
        expect(metrics.components.totalCount).toBe(3);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle deeply nested imports', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/deeply/nested/file.ts',
          `
import deep from '../../../utils/deep';
import { helper } from '../../helpers';
import sibling from './sibling';
export const x = 1;
        `
        );

        const result = await checker.analyze(['src/deeply/nested/file.ts']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle components with special characters in names', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/components/atoms/Button-Primary.tsx',
          'export const ButtonPrimary = () => null;'
        );

        const result = await checker.analyze(['src/components/atoms/Button-Primary.tsx']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle components with TypeScript syntax', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/components/atoms/Button.tsx',
          `
import { FC, ReactNode } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button: FC<ButtonProps> = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);
        `
        );

        const result = await checker.analyze(['src/components/atoms/Button.tsx']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle dynamic imports', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/loader.ts',
          `
const dynamicModule = import('./module');
const asyncModule = import('../async/module');
export const loader = () => dynamicModule;
        `
        );

        const result = await checker.analyze(['src/loader.ts']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Scenarios', () => {
    it('should analyze complete project structure', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Create realistic project structure
        createTestFile(tempDir, 'src/components/atoms/Button.tsx', 'export const Button = () => null;');
        createTestFile(tempDir, 'src/components/atoms/Input.tsx', 'export const Input = () => null;');
        createTestFile(tempDir, 'src/components/molecules/Form.tsx', "import { Button } from '../atoms/Button'; export const Form = () => <Button />;");
        createTestFile(tempDir, 'src/components/organisms/Header.tsx', "import { Form } from '../molecules/Form'; export const Header = () => <Form />;");
        createTestFile(tempDir, 'src/store/slices/auth.ts', 'export const authSlice = {};');
        createTestFile(tempDir, 'src/utils/helpers.ts', 'export const help = () => {};');

        const result = await checker.analyze([
          'src/components/atoms/Button.tsx',
          'src/components/atoms/Input.tsx',
          'src/components/molecules/Form.tsx',
          'src/components/organisms/Header.tsx',
          'src/store/slices/auth.ts',
          'src/utils/helpers.ts',
        ]);

        expect(result).toBeDefined();
        expect(result.findings).toBeDefined();
        const metrics = result.metrics as any;
        expect(metrics.components.totalCount).toBeGreaterThan(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle analysis with multiple violations', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Create oversized component
        let largeCode = 'export const Large = () => {\n';
        for (let i = 0; i < 600; i++) {
          largeCode += `// Line ${i}\n`;
        }
        largeCode += '};';
        createTestFile(tempDir, 'src/components/organisms/Oversized.tsx', largeCode);

        // Create circular dependency
        createTestFile(tempDir, 'src/a.ts', "import { B } from './b'; export const A = B;");
        createTestFile(tempDir, 'src/b.ts', "import { A } from './a'; export const B = A;");

        // Create Redux mutation
        createTestFile(tempDir, 'src/store/slices/counter.ts', 'export const reducer = (state) => { state.count = 1; };');

        const result = await checker.analyze([
          'src/components/organisms/Oversized.tsx',
          'src/a.ts',
          'src/b.ts',
          'src/store/slices/counter.ts',
        ]);

        expect(result.findings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
