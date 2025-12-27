#!/usr/bin/env node

/**
 * Function-to-Test Coverage Analyzer
 * 
 * This script:
 * 1. Scans all TypeScript/TSX source files for exported functions
 * 2. Scans all test files for test cases
 * 3. Maps functions to tests
 * 4. Reports functions without tests
 * 5. Generates a coverage report
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

interface FunctionDef {
  name: string;
  file: string;
  type: "named" | "default" | "class-method";
  line: number;
}

interface TestCase {
  name: string;
  file: string;
  functions: string[];
  line: number;
}

interface CoverageReport {
  totalFunctions: number;
  testedFunctions: number;
  untested: FunctionDef[];
  tested: Map<string, TestCase[]>;
  coverage: number;
}

// Configuration
const CONFIG = {
  srcPatterns: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "packages/**/src/**/*.ts",
    "packages/**/src/**/*.tsx",
    "dbal/development/**/*.ts",
  ],
  testPatterns: [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "packages/**/tests/**/*.test.ts",
    "packages/**/tests/**/*.test.tsx",
    "dbal/**/*.test.ts",
  ],
  ignorePatterns: [
    "**/node_modules/**",
    "**/.next/**",
    "**/build/**",
    "**/*.d.ts",
    "**/dist/**",
  ],
};

// Extract function names from source code
function extractFunctions(content: string, file: string): FunctionDef[] {
  const functions: FunctionDef[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Named exports: export function name() or export const name = () =>
    const namedFuncMatch = line.match(
      /export\s+(?:function|const)\s+(\w+)\s*(?:\(|=)/
    );
    if (namedFuncMatch) {
      functions.push({
        name: namedFuncMatch[1],
        file,
        type: "named",
        line: lineNum,
      });
    }

    // Class methods: methodName() { or methodName = () => {
    const classMethodMatch = line.match(/^\s+(\w+)\s*\(.*\)\s*[:{]/);
    if (classMethodMatch && line.includes("class")) {
      functions.push({
        name: classMethodMatch[1],
        file,
        type: "class-method",
        line: lineNum,
      });
    }

    // Default exports
    if (line.includes("export default") && line.includes("function")) {
      const defaultMatch = line.match(/export\s+default\s+function\s+(\w+)/);
      if (defaultMatch) {
        functions.push({
          name: defaultMatch[1],
          file,
          type: "default",
          line: lineNum,
        });
      }
    }
  });

  return functions;
}

// Extract test cases and mentioned functions
function extractTestCases(
  content: string,
  file: string
): Map<string, string[]> {
  const testMap = new Map<string, string[]>();
  const lines = content.split("\n");
  let currentTestName = "";

  lines.forEach((line) => {
    // Detect test blocks: it(), test(), describe()
    const testMatch = line.match(
      /(?:it|test|describe)\s*\(\s*['"`]([^'"`]+)['"`]/
    );
    if (testMatch) {
      currentTestName = testMatch[1];
      testMap.set(currentTestName, []);
    }

    if (currentTestName) {
      // Look for function calls within the test
      const funcCalls = line.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
      if (funcCalls) {
        funcCalls.forEach((call) => {
          const funcName = call.replace(/\s*\($/, "");
          if (funcName && !isCommonTestHelper(funcName)) {
            testMap.get(currentTestName)!.push(funcName);
          }
        });
      }
    }
  });

  return testMap;
}

// Filter out common test helpers
function isCommonTestHelper(name: string): boolean {
  const helpers = [
    "it",
    "test",
    "describe",
    "expect",
    "beforeEach",
    "afterEach",
    "beforeAll",
    "afterAll",
    "jest",
    "vi",
    "assert",
    "eq",
    "ok",
    "throws",
    "doesNotThrow",
    "async",
    "render",
    "screen",
    "fireEvent",
    "userEvent",
    "waitFor",
    "within",
  ];
  return helpers.includes(name);
}

// Main analysis function
async function analyze(): Promise<CoverageReport> {
  const cwd = process.cwd();

  // Get all source files
  const srcFiles = await glob(CONFIG.srcPatterns, {
    cwd,
    ignore: CONFIG.ignorePatterns,
  });

  // Get all test files
  const testFiles = await glob(CONFIG.testPatterns, {
    cwd,
    ignore: CONFIG.ignorePatterns,
  });

  // Extract functions from source files
  const allFunctions: FunctionDef[] = [];
  for (const file of srcFiles) {
    try {
      const content = fs.readFileSync(path.join(cwd, file), "utf-8");
      const funcs = extractFunctions(content, file);
      allFunctions.push(...funcs);
    } catch (e) {
      console.warn(`Error reading ${file}:`, (e as Error).message);
    }
  }

  // Extract test cases and create mapping
  const testMapping = new Map<string, TestCase[]>();
  const testedFunctionNames = new Set<string>();

  for (const file of testFiles) {
    try {
      const content = fs.readFileSync(path.join(cwd, file), "utf-8");
      const testCases = extractTestCases(content, file);

      testCases.forEach((functionNames, testName) => {
        functionNames.forEach((funcName) => {
          testedFunctionNames.add(funcName);

          if (!testMapping.has(funcName)) {
            testMapping.set(funcName, []);
          }
          testMapping.get(funcName)!.push({
            name: testName,
            file,
            functions: functionNames,
            line: 0,
          });
        });
      });
    } catch (e) {
      console.warn(`Error reading ${file}:`, (e as Error).message);
    }
  }

  // Identify untested functions
  const untested = allFunctions.filter((f) => !testedFunctionNames.has(f.name));

  // Calculate coverage
  const coverage = (
    ((allFunctions.length - untested.length) / allFunctions.length) *
    100
  ).toFixed(2);

  return {
    totalFunctions: allFunctions.length,
    testedFunctions: allFunctions.length - untested.length,
    untested,
    tested: testMapping,
    coverage: parseFloat(coverage),
  };
}

// Generate report
async function generateReport() {
  try {
    const report = await analyze();

    console.log("\n" + "=".repeat(70));
    console.log("FUNCTION-TO-TEST COVERAGE ANALYSIS");
    console.log("=".repeat(70));

    console.log(`\nSummary:`);
    console.log(`  Total Functions: ${report.totalFunctions}`);
    console.log(`  Tested Functions: ${report.testedFunctions}`);
    console.log(`  Untested Functions: ${report.untested.length}`);
    console.log(`  Coverage: ${report.coverage}%`);

    if (report.untested.length > 0) {
      console.log(`\n${"─".repeat(70)}`);
      console.log("UNTESTED FUNCTIONS:");
      console.log(`${"─".repeat(70)}`);

      // Group by file
      const grouped = new Map<string, FunctionDef[]>();
      report.untested.forEach((fn) => {
        if (!grouped.has(fn.file)) {
          grouped.set(fn.file, []);
        }
        grouped.get(fn.file)!.push(fn);
      });

      grouped.forEach((fns, file) => {
        console.log(`\n📄 ${file}`);
        fns.forEach((fn) => {
          console.log(
            `   └─ ${fn.name} (${fn.type}) [line ${fn.line}]`
          );
        });
      });

      // Generate TODO items
      console.log(`\n${"─".repeat(70)}`);
      console.log("TODO - CREATE TESTS FOR:");
      console.log(`${"─".repeat(70)}`);

      report.untested.forEach((fn) => {
        console.log(`- [ ] Write test for \`${fn.name}\` in ${fn.file}`);
      });
    }

    console.log("\n" + "=".repeat(70) + "\n");

    // Generate JSON report
    const reportPath = path.join(process.cwd(), "coverage-report.json");
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          summary: {
            totalFunctions: report.totalFunctions,
            testedFunctions: report.testedFunctions,
            untestedFunctions: report.untested.length,
            coverage: report.coverage,
          },
          untested: report.untested,
        },
        null,
        2
      )
    );

    console.log(`✅ Report saved to: coverage-report.json`);
  } catch (e) {
    console.error("Error analyzing coverage:", e);
    process.exit(1);
  }
}

// Run the analysis
generateReport();
