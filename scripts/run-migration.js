#!/usr/bin/env node

/**
 * Test Migration Runner
 * Execute: node scripts/run-migration.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const DEFAULT_PATTERN = 'dbal/development/tests/**/*.test.ts';
const DEFAULT_TARGET_DIR = 'packages';
const DBAL_TARGET = 'dbal_core';

async function findTestFiles(pattern) {
  console.log(`Searching for test files matching: ${pattern}\n`);
  const files = await glob(pattern);
  console.log(`Found ${files.length} test files\n`);
  return files;
}

function mapToPackage(filePath) {
  // Map file paths to appropriate package
  if (filePath.includes('dbal/development/tests')) {
    return DBAL_TARGET;
  }
  if (filePath.includes('frontends/nextjs')) {
    return 'nextjs_frontend';
  }
  if (filePath.includes('frontends/cli')) {
    return 'cli_frontend';
  }
  if (filePath.includes('frontends/qt6')) {
    return 'qt6_frontend';
  }
  // Extract generic name from path
  const match = filePath.match(/\/([^/]+)\/tests?\//);
  return match ? `${match[1]}_tests` : 'unknown_tests';
}

async function extractTestInfo(filePath) {
  // Read file and extract minimal test structure
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Extract imports
    const imports = [];
    const importRegex = /import\s+(?:{([^}]+)}|\*|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        from: match[3],
        import: match[1] ? match[1].split(',').map(s => s.trim()) : match[2] ? [match[2]] : []
      });
    }

    // Extract test suites
    const suites = [];
    const describeRegex = /describe\s*\(\s*['"]([^'"]+)['"]/g;
    let suiteIndex = 0;
    while ((match = describeRegex.exec(content)) !== null) {
      suites.push({
        id: `suite_${suiteIndex}`,
        name: match[1],
        tests: []
      });
      suiteIndex++;
    }

    return { imports, suites, testCount: lines.filter(l => l.includes('it(')).length };
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

async function runMigration() {
  const pattern = DEFAULT_PATTERN;
  const dryRun = process.argv.includes('--dry-run');
  const verbose = process.argv.includes('--verbose');

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be written\n');
  }

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     TypeScript → JSON Test Migration Tool              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    const testFiles = await findTestFiles(pattern);

    if (testFiles.length === 0) {
      console.log('No test files found matching pattern.');
      return;
    }

    let converted = 0;
    let failed = 0;

    for (const filePath of testFiles) {
      const packageName = mapToPackage(filePath);
      const testInfo = await extractTestInfo(filePath);

      if (!testInfo) {
        failed++;
        continue;
      }

      const outputDir = path.join(DEFAULT_TARGET_DIR, packageName, 'unit-tests');
      const outputFile = path.join(outputDir, 'tests.json');

      if (verbose) {
        console.log(`Processing: ${filePath}`);
        console.log(`Package: ${packageName}`);
        console.log(`Tests found: ${testInfo.testCount}`);
        console.log(`Target: ${outputFile}\n`);
      }

      if (!dryRun) {
        // Create directory
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // Create basic JSON structure
        const jsonContent = {
          $schema: 'https://metabuilder.dev/schemas/tests.schema.json',
          schemaVersion: '2.0.0',
          package: packageName,
          description: `Converted from ${path.basename(filePath)}`,
          imports: testInfo.imports,
          testSuites: testInfo.suites
        };

        fs.writeFileSync(outputFile, JSON.stringify(jsonContent, null, 2));
        console.log(`✓ Created: ${outputFile}`);
      } else {
        console.log(`[DRY RUN] Would create: ${outputFile}`);
      }

      converted++;
    }

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                  Migration Summary                     ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  ✓ Converted: ${String(converted).padEnd(38)}║`);
    console.log(`║  ✗ Failed:    ${String(failed).padEnd(38)}║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');

    if (dryRun) {
      console.log('This was a DRY RUN. Files were not actually written.');
      console.log('Run without --dry-run to perform actual migration.\n');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
