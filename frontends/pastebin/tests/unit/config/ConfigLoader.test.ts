/**
 * Unit Tests for Configuration Loader
 * Tests configuration loading, merging, and validation
 */

import { ConfigLoader } from '../../../src/lib/quality-validator/config/ConfigLoader';
import { ConfigurationError } from '../../../src/lib/quality-validator/types';
import { createTempDir, cleanupTempDir, createTestFile } from '../../test-utils';
import * as fs from 'fs';
import * as path from 'path';

describe('ConfigLoader', () => {
  let loader: ConfigLoader;
  let tempDir: string;

  beforeEach(() => {
    loader = ConfigLoader.getInstance();
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('loadConfiguration', () => {
    it('should load default configuration', async () => {
      const config = await loader.loadConfiguration();

      expect(config).toBeDefined();
      expect(config.projectName).toBeDefined();
      expect(config.codeQuality).toBeDefined();
      expect(config.testCoverage).toBeDefined();
      expect(config.architecture).toBeDefined();
      expect(config.security).toBeDefined();
      expect(config.scoring).toBeDefined();
    });

    it('should load configuration from file', async () => {
      const configFile = path.join(tempDir, '.qualityrc.json');
      const customConfig = {
        projectName: 'custom-project',
        codeQuality: {
          enabled: false,
        },
      };

      fs.writeFileSync(configFile, JSON.stringify(customConfig), 'utf-8');

      const config = await loader.loadConfiguration(configFile);

      expect(config.projectName).toBe('custom-project');
      expect(config.codeQuality.enabled).toBe(false);
    });

    it('should throw error for missing config file', async () => {
      await expect(loader.loadConfiguration('/non-existent/config.json')).rejects.toThrow(
        ConfigurationError
      );
    });

    it('should throw error for invalid JSON', async () => {
      const configFile = path.join(tempDir, 'invalid.json');
      fs.writeFileSync(configFile, 'invalid json {', 'utf-8');

      await expect(loader.loadConfiguration(configFile)).rejects.toThrow(ConfigurationError);
    });

    it('should throw error if config is not an object', async () => {
      const configFile = path.join(tempDir, 'not-object.json');
      fs.writeFileSync(configFile, '"not an object"', 'utf-8');

      await expect(loader.loadConfiguration(configFile)).rejects.toThrow(ConfigurationError);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate weights sum to 1.0', async () => {
      const configFile = path.join(tempDir, 'bad-weights.json');
      const config = {
        scoring: {
          weights: {
            codeQuality: 0.5,
            testCoverage: 0.5,
            architecture: 0.5,
            security: 0.5,
          },
        },
      };

      fs.writeFileSync(configFile, JSON.stringify(config), 'utf-8');

      await expect(loader.loadConfiguration(configFile)).rejects.toThrow(ConfigurationError);
    });

    it('should validate percentage ranges', async () => {
      const configFile = path.join(tempDir, 'bad-percent.json');
      const config = {
        testCoverage: {
          minimumPercent: 150,
        },
      };

      fs.writeFileSync(configFile, JSON.stringify(config), 'utf-8');

      await expect(loader.loadConfiguration(configFile)).rejects.toThrow(ConfigurationError);
    });

    it('should validate complexity thresholds', async () => {
      const configFile = path.join(tempDir, 'bad-complexity.json');
      const config = {
        codeQuality: {
          complexity: {
            max: 10,
            warning: 15,
          },
        },
      };

      fs.writeFileSync(configFile, JSON.stringify(config), 'utf-8');

      await expect(loader.loadConfiguration(configFile)).rejects.toThrow(ConfigurationError);
    });

    it('should validate duplication thresholds', async () => {
      const configFile = path.join(tempDir, 'bad-duplication.json');
      const config = {
        codeQuality: {
          duplication: {
            maxPercent: 3,
            warningPercent: 5,
          },
        },
      };

      fs.writeFileSync(configFile, JSON.stringify(config), 'utf-8');

      await expect(loader.loadConfiguration(configFile)).rejects.toThrow(ConfigurationError);
    });

    it('should validate passing grade', async () => {
      const configFile = path.join(tempDir, 'bad-grade.json');
      const config = {
        scoring: {
          passingGrade: 'Z',
        },
      };

      fs.writeFileSync(configFile, JSON.stringify(config), 'utf-8');

      await expect(loader.loadConfiguration(configFile)).rejects.toThrow(ConfigurationError);
    });

    it('should accept valid A-F grades', async () => {
      for (const grade of ['A', 'B', 'C', 'D', 'F']) {
        const configFile = path.join(tempDir, `grade-${grade}.json`);
        const config = {
          scoring: {
            passingGrade: grade,
          },
        };

        fs.writeFileSync(configFile, JSON.stringify(config), 'utf-8');

        const loaded = await loader.loadConfiguration(configFile);
        expect(loaded.scoring.passingGrade).toBe(grade);
      }
    });
  });

  describe('CLI Options', () => {
    it('should apply skipCoverage option', async () => {
      const config = await loader.loadConfiguration();
      const modified = loader.applyCliOptions(config, { skipCoverage: true });

      expect(modified.testCoverage.enabled).toBe(false);
      expect(config.testCoverage.enabled).toBe(true); // Original unchanged
    });

    it('should apply skipSecurity option', async () => {
      const config = await loader.loadConfiguration();
      const modified = loader.applyCliOptions(config, { skipSecurity: true });

      expect(modified.security.enabled).toBe(false);
    });

    it('should apply skipArchitecture option', async () => {
      const config = await loader.loadConfiguration();
      const modified = loader.applyCliOptions(config, { skipArchitecture: true });

      expect(modified.architecture.enabled).toBe(false);
    });

    it('should apply skipComplexity option', async () => {
      const config = await loader.loadConfiguration();
      const modified = loader.applyCliOptions(config, { skipComplexity: true });

      expect(modified.codeQuality.enabled).toBe(false);
    });

    it('should apply noColor option', async () => {
      const config = await loader.loadConfiguration();
      const modified = loader.applyCliOptions(config, { noColor: true });

      expect(modified.reporting.colors).toBe(false);
    });

    it('should apply verbose option', async () => {
      const config = await loader.loadConfiguration();
      const modified = loader.applyCliOptions(config, { verbose: true });

      expect(modified.reporting.verbose).toBe(true);
    });

    it('should apply multiple options', async () => {
      const config = await loader.loadConfiguration();
      const modified = loader.applyCliOptions(config, {
        skipCoverage: true,
        skipSecurity: true,
        noColor: true,
        verbose: true,
      });

      expect(modified.testCoverage.enabled).toBe(false);
      expect(modified.security.enabled).toBe(false);
      expect(modified.reporting.colors).toBe(false);
      expect(modified.reporting.verbose).toBe(true);
    });
  });

  describe('Default Configuration', () => {
    it('should return default configuration', () => {
      const defaults = loader.getDefaults();

      expect(defaults).toBeDefined();
      expect(defaults.projectName).toBeDefined();
      expect(defaults.codeQuality.enabled).toBe(true);
      expect(defaults.testCoverage.enabled).toBe(true);
      expect(defaults.architecture.enabled).toBe(true);
      expect(defaults.security.enabled).toBe(true);
    });

    it('should have correct weight sums', () => {
      const defaults = loader.getDefaults();
      const sum =
        defaults.scoring.weights.codeQuality +
        defaults.scoring.weights.testCoverage +
        defaults.scoring.weights.architecture +
        defaults.scoring.weights.security;

      expect(sum).toBeCloseTo(1.0, 3);
    });

    it('should have reasonable complexity limits', () => {
      const defaults = loader.getDefaults();

      expect(defaults.codeQuality.complexity.warning).toBeLessThan(
        defaults.codeQuality.complexity.max
      );
      expect(defaults.codeQuality.complexity.max).toBeGreaterThan(0);
    });

    it('should have reasonable coverage limits', () => {
      const defaults = loader.getDefaults();

      expect(defaults.testCoverage.warningPercent).toBeLessThan(
        defaults.testCoverage.minimumPercent
      );
      expect(defaults.testCoverage.minimumPercent).toBeGreaterThan(0);
      expect(defaults.testCoverage.minimumPercent).toBeLessThanOrEqual(100);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const loader1 = ConfigLoader.getInstance();
      const loader2 = ConfigLoader.getInstance();

      expect(loader1).toBe(loader2);
    });
  });
});
