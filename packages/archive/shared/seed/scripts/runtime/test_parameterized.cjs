/**
 * Parameterized Test Runner for JSON Scripts
 * Runs test functions defined in script.json with parameter sets from *.cases.json
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
 * Run a single parameterized test
 * The test logic function returns {passed: boolean, actual: any, expected: any}
 */
function runParameterizedTest(logicJson, functionName, testCase, testType) {
  const startTime = Date.now();
  let passed = false;
  let actualResult = null;
  let error = null;

  try {
    // Execute the test logic function with the test case
    const testResult = executeFunction(logicJson, functionName, [testCase.input]);

    // The test function should return {passed, actual, expected}
    if (testResult && typeof testResult.passed === 'boolean') {
      passed = testResult.passed;
      actualResult = testResult.actual;
    } else {
      // Fallback: check for common patterns
      if (testType === 'valid') {
        passed = testResult && !testResult.errors;
      } else if (testType === 'invalid') {
        if (testCase.expected_errors) {
          passed = testResult && testResult.errors &&
                   deepEqual(testResult.errors, testCase.expected_errors);
        } else {
          passed = testResult && testResult.errors;
        }
      } else if (testResult && testResult.expectedError) {
        // Test expects an error
        passed = testResult.error !== undefined;
      } else if (testCase.input && testCase.input.expected !== undefined) {
        // Generic: compare to expected value in input
        passed = deepEqual(testResult, testCase.input.expected);
      } else {
        // No specific assertion, just check it ran
        passed = true;
      }
      actualResult = testResult;
    }
  } catch (err) {
    error = err;
    if (testCase.expectedError || (testCase.input && testCase.input.expectedError)) {
      passed = true; // Expected to throw
      actualResult = { error: err.message };
    } else {
      passed = false;
    }
  }

  const duration = Date.now() - startTime;

  return {
    desc: testCase.desc || testCase.name || 'Unnamed test',
    functionName,
    testType,
    passed,
    duration,
    input: testCase.input,
    actualResult,
    expectedResult: testCase.input ? testCase.input.expected : testCase.expected,
    error: error ? error.message : null
  };
}

/**
 * Run all parameterized tests
 * @param {Object} logicJson - Test logic functions (test.logic.json)
 * @param {Object} parametersJson - Test parameters (test.parameters.json)
 */
function runParameterizedTests(logicJson, parametersJson) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    duration: 0,
    functions: {}
  };

  const startTime = Date.now();

  // Iterate through each function's test cases
  for (const [functionName, testGroups] of Object.entries(parametersJson)) {
    results.functions[functionName] = {
      total: 0,
      passed: 0,
      failed: 0,
      groups: {}
    };

    // Iterate through test groups (valid, invalid, etc.)
    for (const [groupName, testCases] of Object.entries(testGroups)) {
      if (!Array.isArray(testCases)) continue;

      results.functions[functionName].groups[groupName] = {
        total: testCases.length,
        passed: 0,
        failed: 0,
        tests: []
      };

      // Run each test case
      for (const testCase of testCases) {
        const result = runParameterizedTest(logicJson, functionName, testCase, groupName);

        results.functions[functionName].groups[groupName].tests.push(result);
        results.functions[functionName].total++;
        results.total++;

        if (result.passed) {
          results.functions[functionName].groups[groupName].passed++;
          results.functions[functionName].passed++;
          results.passed++;
        } else {
          results.functions[functionName].groups[groupName].failed++;
          results.functions[functionName].failed++;
          results.failed++;
        }
      }
    }
  }

  results.duration = Date.now() - startTime;

  return results;
}

/**
 * Format parameterized test results
 */
function formatParameterizedResults(results) {
  const lines = [];
  lines.push(`\n${'='.repeat(60)}`);
  lines.push(`Parameterized Test Results`);
  lines.push(`${'='.repeat(60)}\n`);

  for (const [functionName, funcResults] of Object.entries(results.functions)) {
    lines.push(`\n📦 Function: ${functionName}`);
    lines.push(`   ${funcResults.passed}/${funcResults.total} tests passed\n`);

    for (const [groupName, groupResults] of Object.entries(funcResults.groups)) {
      const groupIcon = groupResults.failed === 0 ? '✅' : '❌';
      lines.push(`  ${groupIcon} ${groupName} (${groupResults.passed}/${groupResults.total})`);

      for (const test of groupResults.tests) {
        const icon = test.passed ? '  ✓' : '  ✗';
        lines.push(`    ${icon} ${test.desc} (${test.duration}ms)`);

        if (!test.passed) {
          if (test.error) {
            lines.push(`       Error: ${test.error}`);
          } else {
            lines.push(`       Input: ${JSON.stringify(test.input)}`);
            lines.push(`       Got: ${JSON.stringify(test.actualResult)}`);
            if (test.expectedResult) {
              lines.push(`       Expected: ${JSON.stringify(test.expectedResult)}`);
            }
          }
        }
      }
      lines.push('');
    }
  }

  lines.push(`${'='.repeat(60)}`);
  lines.push(`Overall: ${results.passed}/${results.total} tests passed (${results.failed} failed)`);
  lines.push(`Total Duration: ${results.duration}ms`);
  lines.push(`${'='.repeat(60)}\n`);

  if (results.failed === 0) {
    lines.push('🎉 All parameterized tests passed!');
  } else {
    lines.push(`❌ ${results.failed} test(s) failed.`);
  }

  return lines.join('\n');
}

/**
 * Load and run parameterized tests from files
 * @param {string} logicPath - Path to test.logic.json
 * @param {string} parametersPath - Path to test.parameters.json
 */
function runParameterizedTestsSync(logicPath, parametersPath) {
  const fs = require('fs');

  const logicContent = fs.readFileSync(logicPath, 'utf-8');
  const logicJson = JSON.parse(logicContent);

  const parametersContent = fs.readFileSync(parametersPath, 'utf-8');
  const parametersJson = JSON.parse(parametersContent);

  return runParameterizedTests(logicJson, parametersJson);
}

module.exports = {
  runParameterizedTest,
  runParameterizedTests,
  formatParameterizedResults,
  runParameterizedTestsSync,
  deepEqual
};
