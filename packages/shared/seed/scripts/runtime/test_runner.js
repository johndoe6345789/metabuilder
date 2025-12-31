/**
 * JSON-based Test Runner for Script Executor
 * Executes test cases defined in JSON format
 */

import { executeFunction } from './script_executor.js';

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
 * @param {Object} testCase - Test case definition
 * @param {Object} scriptJson - Script JSON to test against
 * @returns {Object} Test result
 */
function executeTestCase(testCase, scriptJson) {
  const startTime = performance.now();
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

  const duration = performance.now() - startTime;

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
 * @param {Object} testSuite - Test suite definition
 * @param {Object} scriptJson - Script JSON to test
 * @returns {Object} Test results
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

  const startTime = performance.now();

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

  results.duration = performance.now() - startTime;

  return results;
}

/**
 * Format test results as human-readable string
 * @param {Object} results - Test results
 * @returns {string} Formatted output
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
 * Load and run test suite from files
 * @param {string} scriptPath - Path to script.json
 * @param {string} testPath - Path to test suite JSON
 * @returns {Promise<Object>} Test results
 */
async function runTestSuite(scriptPath, testPath) {
  const fs = await import('fs/promises');

  const scriptContent = await fs.readFile(scriptPath, 'utf-8');
  const scriptJson = JSON.parse(scriptContent);

  const testContent = await fs.readFile(testPath, 'utf-8');
  const testSuite = JSON.parse(testContent);

  return executeTestSuite(testSuite, scriptJson);
}

/**
 * Synchronous version for Node.js
 */
function runTestSuiteSync(scriptPath, testPath) {
  if (typeof require !== 'undefined') {
    const fs = require('fs');

    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
    const scriptJson = JSON.parse(scriptContent);

    const testContent = fs.readFileSync(testPath, 'utf-8');
    const testSuite = JSON.parse(testContent);

    return executeTestSuite(testSuite, scriptJson);
  }
  throw new Error('Synchronous file loading not available in browser environment');
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    executeTestCase,
    executeTestSuite,
    formatResults,
    runTestSuite,
    runTestSuiteSync,
    deepEqual
  };
}

export {
  executeTestCase,
  executeTestSuite,
  formatResults,
  runTestSuite,
  runTestSuiteSync,
  deepEqual
};

export default {
  executeTestCase,
  executeTestSuite,
  formatResults,
  runTestSuite,
  runTestSuiteSync,
  deepEqual
};
