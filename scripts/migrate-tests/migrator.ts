/**
 * Batch Test Migration Script
 * Discovers all .test.ts files and converts to JSON
 */

import { glob } from 'glob';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { convertFile } from './converter';

export interface MigrationConfig {
  dryRun?: boolean;
  verbose?: boolean;
  pattern?: string;
  targetDir?: string;
}

export class TestMigrator {
  private config: MigrationConfig;
  private converted: number = 0;
  private failed: number = 0;
  private skipped: number = 0;

  constructor(config: MigrationConfig = {}) {
    this.config = {
      dryRun: false,
      verbose: false,
      pattern: 'frontends/**/*.test.ts',
      targetDir: 'packages',
      ...config,
    };
  }

  /**
   * Run migration
   */
  async migrate(): Promise<void> {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     TypeScript → JSON Test Migration Tool              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    if (this.config.dryRun) {
      console.log('⚠️  DRY RUN MODE - No files will be modified\n');
    }

    // Discover test files
    const testFiles = await this.discoverTestFiles();

    if (testFiles.length === 0) {
      console.log('No test files found matching pattern: ' + this.config.pattern);
      return;
    }

    console.log(`Found ${testFiles.length} test files\n`);

    // Convert each file
    for (const testFile of testFiles) {
      await this.convertTestFile(testFile);
    }

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                  Migration Summary                     ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  ✓ Converted: ${String(this.converted).padEnd(38)}║`);
    console.log(`║  ✗ Failed:    ${String(this.failed).padEnd(38)}║`);
    console.log(`║  ⊘ Skipped:   ${String(this.skipped).padEnd(38)}║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');

    if (this.config.dryRun) {
      console.log('This was a DRY RUN. Files were not actually modified.');
      console.log('Run without --dry-run to perform actual migration.\n');
    }
  }

  /**
   * Discover test files
   */
  private async discoverTestFiles(): Promise<string[]> {
    return await glob(this.config.pattern!);
  }

  /**
   * Convert a single test file
   */
  private async convertTestFile(testFile: string): Promise<void> {
    try {
      // Determine output path
      const packageName = this.extractPackageName(testFile);
      const jsonPath = join(this.config.targetDir!, packageName, 'unit-tests', 'tests.json');

      if (this.config.verbose) {
        console.log(`Processing: ${testFile}`);
        console.log(`Target: ${jsonPath}\n`);
      }

      if (this.config.dryRun) {
        console.log(`[DRY RUN] Would convert: ${testFile}`);
        console.log(`[DRY RUN] → ${jsonPath}\n`);
        this.converted++;
        return;
      }

      // Create output directory
      mkdirSync(dirname(jsonPath), { recursive: true });

      // Convert file
      if (convertFile(testFile, jsonPath)) {
        this.converted++;
      } else {
        this.failed++;
      }

      if (this.config.verbose) {
        console.log('');
      }
    } catch (err) {
      console.error(`✗ Error processing ${testFile}:`, err);
      this.failed++;
    }
  }

  /**
   * Extract package name from test file path
   */
  private extractPackageName(testFile: string): string {
    // Handle different patterns
    if (testFile.includes('frontends/nextjs')) {
      return 'nextjs_frontend';
    }
    if (testFile.includes('frontends/cli')) {
      return 'cli_frontend';
    }
    if (testFile.includes('frontends/qt6')) {
      return 'qt6_frontend';
    }

    // Fallback: extract from path
    const match = testFile.match(/frontends\/([^/]+)\//);
    return match ? `${match[1]}_tests` : 'unknown_tests';
  }

  /**
   * Get migration statistics
   */
  getStats() {
    return {
      converted: this.converted,
      failed: this.failed,
      skipped: this.skipped,
      total: this.converted + this.failed + this.skipped,
    };
  }
}

/**
 * Main entry point
 */
export async function runMigration(config?: MigrationConfig): Promise<void> {
  const migrator = new TestMigrator(config);
  await migrator.migrate();
}

// CLI support
if (require.main === module) {
  const config: MigrationConfig = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  runMigration(config).catch(err => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  });
}
