/**
 * Unified Test Runner
 * Coordinates Playwright E2E, Storybook, and Unit tests
 * All test types discoverable as JSON definitions in packages/*/[type]/tests.json
 */

import { glob } from 'glob';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { TestRunnerConfig, TestResult } from './types';
import { registerJSONTestSuite } from './json-interpreter';

export class UnifiedTestRunner {
  private config: TestRunnerConfig;
  private testFiles: Map<string, any> = new Map();

  constructor(config: TestRunnerConfig = {}) {
    this.config = config;
  }

  /**
   * Discover all JSON test files across test types
   */
  async discoverTests(): Promise<{
    unit: Array<{ file: string; content: any }>;
    e2e: Array<{ file: string; content: any }>;
    storybook: Array<{ file: string; content: any }>;
  }> {
    console.log('🔍 Discovering tests...\n');

    const tests = {
      unit: await this.discoverUnitTests(),
      e2e: await this.discoverE2ETests(),
      storybook: await this.discoverStorybookTests(),
    };

    console.log(`✓ Found ${tests.unit.length} unit test files`);
    console.log(`✓ Found ${tests.e2e.length} E2E test files`);
    console.log(`✓ Found ${tests.storybook.length} Storybook files\n`);

    return tests;
  }

  /**
   * Discover unit tests from packages
   */
  private async discoverUnitTests(): Promise<Array<{ file: string; content: any }>> {
    const files = await glob('packages/*/unit-tests/tests.json');
    return this.loadTestFiles(files, 'unit');
  }

  /**
   * Discover E2E tests from packages
   */
  private async discoverE2ETests(): Promise<Array<{ file: string; content: any }>> {
    const files = await glob('packages/*/playwright/tests.json');
    return this.loadTestFiles(files, 'e2e');
  }

  /**
   * Discover Storybook stories from packages
   */
  private async discoverStorybookTests(): Promise<Array<{ file: string; content: any }>> {
    const files = await glob('packages/*/storybook/stories.json');
    return this.loadTestFiles(files, 'storybook');
  }

  /**
   * Load test files from disk
   */
  private loadTestFiles(files: string[], type: string): Array<{ file: string; content: any }> {
    const tests: Array<{ file: string; content: any }> = [];

    for (const file of files) {
      try {
        const content = JSON.parse(readFileSync(file, 'utf-8'));

        // Apply filters
        if (this.config.packages && !this.shouldIncludePackage(content.package)) {
          continue;
        }

        if (this.config.tags && !this.shouldIncludeTags(content)) {
          continue;
        }

        tests.push({ file, content });
        this.testFiles.set(file, { type, content });
      } catch (err) {
        console.error(`⚠️  Failed to load ${file}:`, err instanceof Error ? err.message : String(err));
      }
    }

    return tests;
  }

  /**
   * Check if package should be included
   */
  private shouldIncludePackage(packageName: string): boolean {
    if (!this.config.packages) return true;
    return this.config.packages.includes(packageName);
  }

  /**
   * Check if test tags match filter
   */
  private shouldIncludeTags(content: any): boolean {
    if (!this.config.tags) return true;

    const contentTags = new Set<string>();

    // Collect tags from test suites
    for (const suite of content.testSuites || []) {
      if (suite.tags) {
        suite.tags.forEach((tag: string) => contentTags.add(tag));
      }
      for (const test of suite.tests || []) {
        if (test.tags) {
          test.tags.forEach((tag: string) => contentTags.add(tag));
        }
      }
    }

    // Check if any tag matches
    return this.config.tags.some(tag => contentTags.has(tag));
  }

  /**
   * Register and run all discovered unit tests
   */
  async runUnitTests(tests: Array<{ file: string; content: any }>): Promise<void> {
    if (tests.length === 0) {
      console.log('No unit tests found\n');
      return;
    }

    console.log('▶️  Registering unit tests...\n');

    for (const test of tests) {
      try {
        registerJSONTestSuite(test.content);
        if (this.config.verbose) {
          console.log(`  ✓ Registered ${test.file}`);
        }
      } catch (err) {
        console.error(`  ✗ Failed to register ${test.file}:`, err instanceof Error ? err.message : String(err));
      }
    }

    console.log('\n✓ Unit tests registered (will execute with Vitest)\n');
  }

  /**
   * Register and run all discovered E2E tests
   */
  async runE2ETests(tests: Array<{ file: string; content: any }>): Promise<void> {
    if (tests.length === 0) {
      console.log('No E2E tests found\n');
      return;
    }

    console.log('▶️  Registering E2E tests...\n');

    for (const test of tests) {
      if (this.config.verbose) {
        console.log(`  ✓ Registered ${test.file}`);
      }
    }

    console.log('\n✓ E2E tests registered (will execute with Playwright)\n');
  }

  /**
   * Validate Storybook stories
   */
  async validateStorybookStories(tests: Array<{ file: string; content: any }>): Promise<void> {
    if (tests.length === 0) {
      console.log('No Storybook stories found\n');
      return;
    }

    console.log('▶️  Validating Storybook stories...\n');

    let valid = 0;
    let invalid = 0;

    for (const test of tests) {
      try {
        // Validate story structure
        if (!test.content.title) {
          throw new Error('Missing required "title" field');
        }

        if (!Array.isArray(test.content.stories)) {
          throw new Error('Missing required "stories" array');
        }

        for (const story of test.content.stories) {
          if (!story.name || !story.render) {
            throw new Error(`Invalid story: missing "name" or "render"`);
          }
        }

        console.log(`  ✓ ${test.file}`);
        valid++;
      } catch (err) {
        console.error(`  ✗ ${test.file}:`, err instanceof Error ? err.message : String(err));
        invalid++;
      }
    }

    console.log(`\n✓ Story validation complete: ${valid} valid, ${invalid} invalid\n`);

    if (invalid > 0) {
      throw new Error(`${invalid} stories failed validation`);
    }
  }

  /**
   * Run all tests
   */
  async runAll(): Promise<void> {
    const tests = await this.discoverTests();

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('   🎯 UNIFIED TEST RUNNER - JSON Interpreter Everywhere\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // Run unit tests through JSON interpreter
    await this.runUnitTests(tests.unit);

    // Run E2E tests (will be handled by Playwright)
    await this.runE2ETests(tests.e2e);

    // Validate Storybook stories
    await this.validateStorybookStories(tests.storybook);

    console.log('═══════════════════════════════════════════════════════');
    console.log('\n✅ Test discovery and registration complete!');
    console.log('\nNext steps:');
    console.log('  • Unit tests: Run with `npm run test:unit`');
    console.log('  • E2E tests: Run with `npm run test:e2e`');
    console.log('  • Storybook: Build with `npm run storybook:build`\n');
  }

  /**
   * Get test statistics
   */
  async getStatistics(): Promise<{
    totalFiles: number;
    unitTests: number;
    e2eTests: number;
    storybookStories: number;
  }> {
    const tests = await this.discoverTests();

    let unitTestCount = 0;
    let e2eTestCount = 0;
    let storybookStoryCount = 0;

    for (const test of tests.unit) {
      unitTestCount += test.content.testSuites?.reduce((acc: number, suite: any) => acc + (suite.tests?.length || 0), 0) || 0;
    }

    for (const test of tests.e2e) {
      e2eTestCount += test.content.tests?.length || 0;
    }

    for (const test of tests.storybook) {
      storybookStoryCount += test.content.stories?.length || 0;
    }

    return {
      totalFiles: tests.unit.length + tests.e2e.length + tests.storybook.length,
      unitTests: unitTestCount,
      e2eTests: e2eTestCount,
      storybookStories: storybookStoryCount,
    };
  }
}

/**
 * Main entry point
 */
export async function runTests(config?: TestRunnerConfig): Promise<void> {
  const runner = new UnifiedTestRunner(config);
  await runner.runAll();
}

// CLI support
if (require.main === module) {
  const config: TestRunnerConfig = {
    verbose: process.argv.includes('--verbose'),
  };

  runTests(config).catch(err => {
    console.error('\n❌ Test runner failed:', err);
    process.exit(1);
  });
}
