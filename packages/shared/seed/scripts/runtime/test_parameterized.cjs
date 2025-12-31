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
 */
function runParameterizedTest(scriptJson, functionName, testCase, testType) {
  const startTime = Date.now();
  let passed = false;
  let actualResult = null;
  let error = null;

  try {
    // Execute the test function with the input
    actualResult = executeFunction(scriptJson, functionName, [testCase.input]);

    // Check result based on test type
    if (testType === 'valid') {
      // For valid tests, the result should be truthy (no errors)
      passed = actualResult && !actualResult.errors;
    } else if (testType === 'invalid') {
      // For invalid tests, check expected_errors match
      if (testCase.expected_errors) {
        passed = actualResult && actualResult.errors &&
                 deepEqual(actualResult.errors, testCase.expected_errors);
      } else {
        passed = actualResult && actualResult.errors;
      }
    } else if (testType === 'email_validation') {
      // For email validation, check should_be_valid
      const isValid = actualResult && !actualResult.errors;
      passed = isValid === testCase.should_be_valid;
    } else if (testType === 'success') {
      // For success tests, result should be truthy and no errors
      passed = actualResult && actualResult.success === true;
    } else if (testType === 'failure') {
      // For failure tests, result should indicate failure
      passed = actualResult && actualResult.success === false;
    } else if (testCase.expected !== undefined) {
      // Generic: compare to expected value
      passed = deepEqual(actualResult, testCase.expected);
    } else {
      // No specific assertion, just check it ran
      passed = true;
    }
  } catch (err) {
    error = err;
    if (testCase.expectedError) {
      passed = err.message.includes(testCase.expectedError);
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
    expectedResult: testCase.expected,
    error: error ? error.message : null
  };
}

/**
 * Run all parameterized tests from cases JSON
 */
function runParameterizedTests(scriptJson, casesJson) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    duration: 0,
    functions: {}
  };

  const startTime = Date.now();

  // Iterate through each function's test cases
  for (const [functionName, testGroups] of Object.entries(casesJson)) {
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
        const result = runParameterizedTest(scriptJson, functionName, testCase, groupName);

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
 */
function runParameterizedTestsSync(scriptPath, casesPath) {
  const fs = require('fs');

  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
  const scriptJson = JSON.parse(scriptContent);

  const casesContent = fs.readFileSync(casesPath, 'utf-8');
  const casesJson = JSON.parse(casesContent);

  return runParameterizedTests(scriptJson, casesJson);
}

module.exports = {
  runParameterizedTest,
  runParameterizedTests,
  formatParameterizedResults,
  runParameterizedTestsSync,
  deepEqual
};
