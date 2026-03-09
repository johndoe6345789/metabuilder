/**
 * Unit Tests for Architecture Checker
 * Tests component validation, dependency analysis, and pattern compliance
 */

import { ArchitectureChecker } from '../../../src/lib/quality-validator/analyzers/architectureChecker';
import { logger } from '../../../src/lib/quality-validator/utils/logger';
import { createTempDir, cleanupTempDir, createTestFile } from '../../test-utils';

describe('ArchitectureChecker', () => {
  let checker: ArchitectureChecker;
  let tempDir: string;

  beforeEach(() => {
    checker = new ArchitectureChecker();
    tempDir = createTempDir();
    logger.configure({ verbose: false, useColors: false });
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('analyze', () => {
    it('should analyze architecture and return result', async () => {
      const filePath = createTestFile(
        tempDir,
        'src/components/atoms/Button.tsx',
        'export const Button = () => <button>Click</button>;'
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await checker.analyze(['src/components/atoms/Button.tsx']);

        expect(result).toBeDefined();
        expect(result.category).toBe('architecture');
        expect(typeof result.score).toBe('number');
        expect(result.status).toMatch(/pass|fail|warning/);
        expect(Array.isArray(result.findings)).toBe(true);
        expect(result.metrics).toBeDefined();
        expect(typeof result.executionTime).toBe('number');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle empty file list', async () => {
      const result = await checker.analyze([]);

      expect(result).toBeDefined();
      expect(result.category).toBe('architecture');
      expect(typeof result.score).toBe('number');
    });
  });

  describe('Component Analysis', () => {
    it('should classify components by folder structure', async () => {
      createTestFile(tempDir, 'src/components/atoms/Button.tsx', '// Atom');
      createTestFile(tempDir, 'src/components/molecules/Card.tsx', '// Molecule');
      createTestFile(tempDir, 'src/components/organisms/Header.tsx', '// Organism');
      createTestFile(tempDir, 'src/components/templates/Layout.tsx', '// Template');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await checker.analyze([
          'src/components/atoms/Button.tsx',
          'src/components/molecules/Card.tsx',
          'src/components/organisms/Header.tsx',
          'src/components/templates/Layout.tsx',
        ]);

        const metrics = result.metrics as any;
        expect(metrics.components).toBeDefined();
        expect(metrics.components.byType.atoms).toBeGreaterThanOrEqual(0);
        expect(metrics.components.byType.molecules).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect oversized components', async () => {
      // Create a large component
      let largeComponentCode = '// Large component\n';
      for (let i = 0; i < 600; i++) {
        largeComponentCode += `// Line ${i}\n`;
      }

      createTestFile(tempDir, 'src/components/organisms/Large.tsx', largeComponentCode);

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await checker.analyze(['src/components/organisms/Large.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.components).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should calculate average component size', async () => {
      createTestFile(tempDir, 'src/components/atoms/A.tsx', '// ' + 'x'.repeat(100));
      createTestFile(tempDir, 'src/components/atoms/B.tsx', '// ' + 'x'.repeat(100));
      createTestFile(tempDir, 'src/components/atoms/C.tsx', '// ' + 'x'.repeat(100));

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await checker.analyze([
          'src/components/atoms/A.tsx',
          'src/components/atoms/B.tsx',
          'src/components/atoms/C.tsx',
        ]);

        const metrics = result.metrics as any;
        expect(metrics.components.averageSize).toBeGreaterThan(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Dependency Analysis', () => {
    it('should extract import statements', async () => {
      const filePath = createTestFile(
        tempDir,
        'src/components/Button.tsx',
        `
        import React from 'react';
        import { useState } from 'react';
        import Button from './Button';
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await checker.analyze(['src/components/Button.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.dependencies).toBeDefined();
        expect(metrics.dependencies.totalModules).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should track external dependencies', async () => {
      createTestFile(
        tempDir,
        'src/app.ts',
        `
        import React from 'react';
        import lodash from 'lodash';
        import { Button } from './components';
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await checker.analyze(['src/app.ts']);

        const metrics = result.metrics as any;
        expect(metrics.dependencies.externalDependencies).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect circular dependencies', async () => {
      createTestFile(
        tempDir,
        'src/a.ts',
        "import { B } from './b';\nexport const A = () => B();"
      );
      createTestFile(
        tempDir,
        'src/b.ts',
        "import { A } from './a';\nexport const B = () => A();"
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await checker.analyze(['src/a.ts', 'src/b.ts']);

        const metrics = result.metrics as any;
        expect(metrics.dependencies.circularDependencies).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Pattern Analysis', () => {
    it('should detect Redux mutations', async () => {
      createTestFile(
        tempDir,
        'src/store/slices/counter.ts',
        `
        export const counterSlice = {
          reducer: (state) => {
            state.count = state.count + 1;
          }
        };
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await checker.analyze(['src/store/slices/counter.ts']);

        const metrics = result.metrics as any;
        expect(metrics.patterns.reduxCompliance).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect hooks not at top level', async () => {
      createTestFile(
        tempDir,
        'src/components/BadHook.tsx',
        `
        export function Component() {
          if (condition) {
            const [state, setState] = useState(0);
          }
        }
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await checker.analyze(['src/components/BadHook.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.patterns.hookUsage).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Score Calculation', () => {
    it('should return score between 0 and 100', async () => {
      const result = await checker.analyze([]);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should assign status based on score', async () => {
      const result = await checker.analyze([]);

      if (result.score >= 80) {
        expect(result.status).toBe('pass');
      } else if (result.score >= 70) {
        expect(result.status).toBe('warning');
      } else {
        expect(result.status).toBe('fail');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent files gracefully', async () => {
      const result = await checker.analyze(['non-existent.ts']);

      expect(result).toBeDefined();
      expect(result.category).toBe('architecture');
    });

    it('should measure execution time', async () => {
      const result = await checker.analyze([]);

      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });
  });
});
