/**
 * JSON-based Test Runner for Script Executor (CommonJS version)
 * Executes test cases defined in JSON format
 */

const { executeFunction } = require('./script_executor.cjs');

/**
 * Deep equality comparison
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Execute a single test case
 */
function executeTestCase(testCase, scriptJson) {
  const startTime = Date.now();
  let passed = false;
  let actualResult = null;
  let error = null;

  try {
    actualResult = executeFunction(scriptJson, testCase.function, testCase.args || []);

    // Check result
    if (testCase.expected !== undefined) {
      passed = deepEqual(actualResult, testCase.expected);
    } else if (testCase.expectedError) {
      passed = false; // Should have thrown
    } else {
      passed = true; // No assertion
    }
  } catch (err) {
    error = err;
    if (testCase.expectedError) {
      // Check if error matches expected
      passed = err.message.includes(testCase.expectedError);
    } else {
      passed = false;
    }
  }

  const duration = Date.now() - startTime;

  return {
    name: testCase.name,
    function: testCase.function,
    passed,
    duration,
    actualResult,
    expectedResult: testCase.expected,
    error: error ? error.message : null
  };
}

/**
 * Execute test suite from JSON
 */
function executeTestSuite(testSuite, scriptJson) {
  const results = {
    suite: testSuite.name || 'Unnamed Suite',
    description: testSuite.description,
    total: 0,
    passed: 0,
    failed: 0,
    duration: 0,
    tests: []
  };

  const startTime = Date.now();

  for (const testCase of (testSuite.tests || [])) {
    const result = executeTestCase(testCase, scriptJson);
    results.tests.push(result);
    results.total++;
    if (result.passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  results.duration = Date.now() - startTime;

  return results;
}

/**
 * Format test results as human-readable string
 */
function formatResults(results) {
  const lines = [];
  lines.push(`\n${'='.repeat(60)}`);
  lines.push(`Test Suite: ${results.suite}`);
  if (results.description) {
    lines.push(`Description: ${results.description}`);
  }
  lines.push(`${'='.repeat(60)}\n`);

  for (const test of results.tests) {
    const icon = test.passed ? '✅' : '❌';
    lines.push(`${icon} ${test.name}`);
    lines.push(`   Function: ${test.function}`);
    lines.push(`   Duration: ${test.duration.toFixed(2)}ms`);

    if (!test.passed) {
      lines.push(`   Expected: ${JSON.stringify(test.expectedResult)}`);
      lines.push(`   Actual:   ${JSON.stringify(test.actualResult)}`);
      if (test.error) {
        lines.push(`   Error:    ${test.error}`);
      }
    }
    lines.push('');
  }

  lines.push(`${'='.repeat(60)}`);
  lines.push(`Results: ${results.passed}/${results.total} passed (${results.failed} failed)`);
  lines.push(`Total Duration: ${results.duration.toFixed(2)}ms`);
  lines.push(`${'='.repeat(60)}\n`);

  if (results.failed === 0) {
    lines.push('🎉 All tests passed!');
  } else {
    lines.push(`❌ ${results.failed} test(s) failed.`);
  }

  return lines.join('\n');
}

/**
 * Synchronous version for Node.js
 */
function runTestSuiteSync(scriptPath, testPath) {
  const fs = require('fs');

  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
  const scriptJson = JSON.parse(scriptContent);

  const testContent = fs.readFileSync(testPath, 'utf-8');
  const testSuite = JSON.parse(testContent);

  return executeTestSuite(testSuite, scriptJson);
}

module.exports = {
  executeTestCase,
  executeTestSuite,
  formatResults,
  runTestSuiteSync,
  deepEqual
};
