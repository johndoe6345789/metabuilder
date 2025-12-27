#!/usr/bin/env node

/**
 * Function-to-Test Coverage Analyzer (Simple Version)
 * 
 * Analyzes which functions have unit tests
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Recursively find files
function findFiles(dir, pattern, ignore = []) {
  let results = [];
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      const relPath = path.relative(process.cwd(), filepath);
      
      // Skip ignored patterns
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

// Extract exported functions
function extractFunctions(content, file) {
  const functions = [];
  const lines = content.split("\n");
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // export function name() or export const name = () =>
    const namedMatch = line.match(/export\s+(?:function|const|async\s+function|async\s+const)\s+(\w+)/);
    if (namedMatch) {
      functions.push({
        name: namedMatch[1],
        file,
        type: "export",
        line: lineNum,
      });
    }
  });
  
  return functions;
}

// Extract test function calls
function extractTestedFunctions(content) {
  const functions = new Set();
  
  // Match function calls in test context
  const matches = content.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g) || [];
  matches.forEach(match => {
    const name = match.replace(/\s*\($/, "");
    const helpers = ["it", "test", "describe", "expect", "beforeEach", "afterEach", "beforeAll", "afterAll", "jest", "vi", "assert", "eq", "ok", "throws", "render", "screen", "fireEvent", "userEvent", "waitFor"];
    if (!helpers.includes(name)) {
      functions.add(name);
    }
  });
  
  return functions;
}

// Main analysis
function analyze() {
  const ignore = ["node_modules", ".next", "build", "dist"];
  
  console.log("\n" + "=".repeat(70));
  console.log("FUNCTION-TO-TEST COVERAGE ANALYSIS");
  console.log("=".repeat(70) + "\n");
  
  // Find source files
  const srcFiles = findFiles("src", /\.(ts|tsx)$/, ignore)
    .concat(findFiles("packages", /\.(ts|tsx)$/, ignore))
    .concat(findFiles("dbal/development", /\.(ts|tsx)$/, ignore))
    .filter(f => !f.includes(".test.") && !f.includes(".spec."));
  
  // Find test files
  const testFiles = findFiles(".", /\.(test|spec)\.(ts|tsx)$/, ignore);
  
  // Extract all functions
  const allFunctions = new Map();
  srcFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const funcs = extractFunctions(content, path.relative(process.cwd(), file));
      funcs.forEach(f => {
        const key = `${f.name}`;
        if (!allFunctions.has(key)) {
          allFunctions.set(key, []);
        }
        allFunctions.get(key).push(f);
      });
    } catch (e) {}
  });
  
  // Extract tested functions
  const testedFunctions = new Set();
  testFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const tested = extractTestedFunctions(content);
      tested.forEach(f => testedFunctions.add(f));
    } catch (e) {}
  });
  
  // Calculate coverage
  const untested = [];
  const tested = [];
  
  allFunctions.forEach((defs, name) => {
    if (testedFunctions.has(name)) {
      tested.push({ name, defs });
    } else {
      untested.push({ name, defs });
    }
  });
  
  const coverage = (tested.length / allFunctions.size * 100).toFixed(1);
  
  console.log(`📊 Summary:`);
  console.log(`   Total Functions: ${allFunctions.size}`);
  console.log(`   Tested: ${tested.length}`);
  console.log(`   Untested: ${untested.length}`);
  console.log(`   Coverage: ${coverage}%`);
  
  if (untested.length > 0) {
    console.log(`\n${"─".repeat(70)}`);
    console.log(`❌ UNTESTED FUNCTIONS (${untested.length}):`);
    console.log(`${"─".repeat(70)}`);
    
    const grouped = new Map();
    untested.forEach(({ name, defs }) => {
      defs.forEach(def => {
        if (!grouped.has(def.file)) {
          grouped.set(def.file, []);
        }
        grouped.get(def.file).push({ name, ...def });
      });
    });
    
    grouped.forEach((funcs, file) => {
      console.log(`\n📄 ${file}`);
      funcs.slice(0, 10).forEach(f => {
        console.log(`   • ${f.name} [line ${f.line}]`);
      });
      if (funcs.length > 10) {
        console.log(`   ... and ${funcs.length - 10} more`);
      }
    });
  }
  
  if (tested.length > 0) {
    console.log(`\n${"─".repeat(70)}`);
    console.log(`✅ TESTED FUNCTIONS (${tested.length}):`);
    console.log(`${"─".repeat(70)}`);
    tested.slice(0, 15).forEach(({ name }) => {
      console.log(`   ✓ ${name}`);
    });
    if (tested.length > 15) {
      console.log(`   ... and ${tested.length - 15} more`);
    }
  }
  
  // Generate action items
  if (untested.length > 0) {
    console.log(`\n${"─".repeat(70)}`);
    console.log(`🎯 TODO - CREATE TESTS FOR:`);
    console.log(`${"─".repeat(70)}`);
    
    untested.forEach(({ name, defs }) => {
      const file = defs[0].file;
      console.log(`- [ ] Test ${name} (in ${file})`);
    });
  }
  
  console.log("\n" + "=".repeat(70) + "\n");
}

analyze();
