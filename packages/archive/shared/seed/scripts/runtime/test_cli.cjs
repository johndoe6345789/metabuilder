#!/usr/bin/env node
/**
 * CLI Test Runner for JSON Script Tests (CommonJS version)
 * Usage: node test_cli.cjs <script.json> <test-suite.json>
 */

const { runTestSuiteSync, formatResults } = require('./test_runner.cjs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node test_cli.cjs <script.json> <test-suite.json>');
    console.error('');
    console.error('Example:');
    console.error('  node test_cli.cjs ../../script.json ../../../json_script_example/tests/expressions.cases.json');
    process.exit(1);
  }

  const scriptPath = path.resolve(args[0]);
  const testPath = path.resolve(args[1]);

  console.log('Running tests...');
  console.log(`Script:     ${scriptPath}`);
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
