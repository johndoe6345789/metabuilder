#!/usr/bin/env node
/**
 * CLI Test Runner for JSON Script Tests
 * Usage: node test_cli.js <script.json> <test-suite.json>
 */

import { runTestSuiteSync, formatResults } from './test_runner.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node test_cli.js <script.json> <test-suite.json>');
    console.error('');
    console.error('Example:');
    console.error('  node test_cli.js ../../script.json ../../../json_script_example/tests/expressions.cases.json');
    process.exit(1);
  }

  const scriptPath = path.resolve(args[0]);
  const testPath = path.resolve(args[1]);

  console.log('Running tests...');
  console.log(`Script:    ${scriptPath}`);
  console.log(`Test Suite: ${testPath}`);

  try {
    const results = runTestSuiteSync(scriptPath, testPath);
    const output = formatResults(results);
    console.log(output);

    // Exit with error code if tests failed
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Test execution failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
