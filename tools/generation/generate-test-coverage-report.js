#!/usr/bin/env node

/**
 * Test Coverage Report Generator
 * 
 * Generates a comprehensive report of function-to-test mapping
 * Identifies untested functions and provides actionable recommendations
 */

import fs from "fs";
import path from "path";

function findFiles(dir, pattern, ignore = []) {
  let results = [];
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      const relPath = path.relative(process.cwd(), filepath);

      if (ignore.some(ign => relPath.includes(ign))) continue;

      if (stat.isDirectory()) {
        results = results.concat(findFiles(filepath, pattern, ignore));
      } else if (pattern.test(file)) {
        results.push(filepath);
      }
    }
  } catch (e) {}
  return results;
}

function extractFunctions(content) {
  const functions = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // export function/const
    const namedMatch = line.match(/export\s+(?:function|const|async\s+function|async\s+const)\s+(\w+)/);
    if (namedMatch) {
      functions.push({
        name: namedMatch[1],
        line: lineNum,
        type: "export",
      });
    }
  });

  return functions;
}

function extractTestCases(content) {
  const testNames = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    // Match describe, it, test
    const testMatch = line.match(/(?:describe|it|test)\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (testMatch) {
      testNames.push(testMatch[1]);
    }
  });

  return testNames;
}

function generateReport() {
  const ignore = ["node_modules", ".next", "build", "dist", ".git"];

  // Find all source and test files
  const srcFiles = findFiles("src", /\.(ts|tsx)$/, ignore)
    .concat(findFiles("packages", /\.(ts|tsx)$/, ignore))
    .concat(findFiles("dbal/ts", /\.(ts|tsx)$/, ignore))
    .filter(f => !f.includes(".test.") && !f.includes(".spec."));

  const testFiles = findFiles(".", /\.(test|spec)\.(ts|tsx)$/, ignore);

  // Extract functions and tests
  const functionsByFile = new Map();
  const testsByFile = new Map();

  srcFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const funcs = extractFunctions(content);
      if (funcs.length > 0) {
        functionsByFile.set(file, funcs);
      }
    } catch (e) {}
  });

  testFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const tests = extractTestCases(content);
      if (tests.length > 0) {
        testsByFile.set(file, tests);
      }
    } catch (e) {}
  });

  // Generate markdown report
  let report = `# Function-to-Test Coverage Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;

  const totalFunctions = Array.from(functionsByFile.values()).reduce((sum, funcs) => sum + funcs.length, 0);
  const totalTests = Array.from(testsByFile.values()).reduce((sum, tests) => sum + tests.length, 0);

  report += `## Summary\n\n`;
  report += `- **Total Functions**: ${totalFunctions}\n`;
  report += `- **Total Test Cases**: ${totalTests}\n`;
  report += `- **Source Files with Functions**: ${functionsByFile.size}\n`;
  report += `- **Test Files**: ${testFiles.length}\n\n`;

  report += `## Files with Function Coverage\n\n`;

  const sortedFiles = Array.from(functionsByFile.entries()).sort((a, b) => {
    const aPath = a[0];
    const bPath = b[0];
    return aPath.localeCompare(bPath);
  });

  sortedFiles.forEach(([file, funcs]) => {
    const relFile = path.relative(process.cwd(), file);
    const testFile = file.replace(/\.tsx?$/, ".test.ts").replace(/\.tsx?$/, ".test.tsx");
    const hasTest = testFiles.includes(testFile) || testsByFile.has(testFile);
    const status = hasTest ? "✅" : "❌";

    report += `### ${status} ${relFile}\n\n`;
    report += `**Functions**: ${funcs.length}\n\n`;

    funcs.forEach(func => {
      report += `- \`${func.name}\` (line ${func.line})\n`;
    });

    if (hasTest) {
      const tests = testsByFile.get(testFile) || [];
      report += `\n**Test Cases**: ${tests.length}\n\n`;
    }

    report += `\n`;
  });

  report += `## Test Files\n\n`;

  testFiles.forEach(file => {
    const relFile = path.relative(process.cwd(), file);
    const tests = testsByFile.get(file) || [];

    report += `### ${relFile}\n\n`;
    report += `**Test Cases**: ${tests.length}\n\n`;

    tests.forEach(test => {
      report += `- ${test}\n`;
    });

    report += `\n`;
  });

  report += `## Recommendations\n\n`;

  const untested = Array.from(functionsByFile.entries()).filter(
    ([file]) => !testFiles.some(t => t.endsWith(file.replace(/\.(ts|tsx)$/, ".test.ts")))
  );

  if (untested.length > 0) {
    report += `### Files Needing Test Coverage\n\n`;
    untested.forEach(([file, funcs]) => {
      const relFile = path.relative(process.cwd(), file);
      report += `- **${relFile}**: ${funcs.length} functions need tests\n`;
    });
    report += `\n`;
  }

  report += `### Best Practices\n\n`;
  report += `1. **Parameterized Tests**: Use \`it.each()\` for testing multiple similar scenarios\n`;
  report += `2. **Test Organization**: Group related tests in \`describe()\` blocks\n`;
  report += `3. **Clear Descriptions**: Use descriptive test names that explain what is being tested\n`;
  report += `4. **Edge Cases**: Include tests for null, undefined, empty values, and boundary conditions\n`;
  report += `5. **Mocking**: Use \`vi.fn()\` and \`vi.mock()\` for external dependencies\n`;
  report += `6. **Async Testing**: Use \`async/await\` and \`act()\` for async operations\n`;
  report += `7. **Setup/Teardown**: Use \`beforeEach\` and \`afterEach\` for test setup and cleanup\n\n`;

  return report;
}

// Write report
const report = generateReport();
fs.writeFileSync("FUNCTION_TEST_COVERAGE.md", report);

console.log("✅ Coverage report generated: FUNCTION_TEST_COVERAGE.md");
console.log("\nTo run all tests:");
console.log("  npm test -- --run\n");
console.log("To run tests in watch mode:");
console.log("  npm test\n");
