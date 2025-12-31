#!/usr/bin/env node
/**
 * Parameterized Test CLI
 * Usage: node test_parameterized_cli.cjs <test.logic.json> <test.parameters.json>
 */

const { runParameterizedTestsSync, formatParameterizedResults } = require('./test_parameterized.cjs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node test_parameterized_cli.cjs <test.logic.json> <test.parameters.json>');
    console.error('');
    console.error('Example:');
    console.error('  node test_parameterized_cli.cjs \\');
    console.error('    contact_form.test.logic.json \\');
    console.error('    contact_form.test.parameters.json');
    console.error('');
    console.error('Structure:');
    console.error('  - test.logic.json      = Test functions (the assertions)');
    console.error('  - test.parameters.json = Input data sets to test with');
    process.exit(1);
  }

  const logicPath = path.resolve(args[0]);
  const parametersPath = path.resolve(args[1]);

  console.log('Running parameterized tests...');
  console.log(`Logic:      ${logicPath}`);
  console.log(`Parameters: ${parametersPath}`);

  try {
    const results = runParameterizedTestsSync(logicPath, parametersPath);
    const output = formatParameterizedResults(results);
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
