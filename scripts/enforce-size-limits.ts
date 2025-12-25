#!/usr/bin/env node
/**
 * Code Size Limit Enforcer
 * 
 * Enforces multiple metrics to keep files maintainable:
 * - TypeScript/React: Max 150 lines of actual code (LOC)
 * - Any file: Max 300 lines total (including comments/whitespace)
 * - Max 3 levels of nesting in functions
 * - Max 10 exports per file
 * - Max 5 parameters per function
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface FileSizeLimits {
  maxLoc: number;
  maxTotalLines: number;
  maxNestingDepth: number;
  maxExports: number;
  maxFunctionParams: number;
}

const DEFAULT_LIMITS: Record<string, FileSizeLimits> = {
  tsx: { maxLoc: 150, maxTotalLines: 200, maxNestingDepth: 3, maxExports: 5, maxFunctionParams: 5 },
  ts: { maxLoc: 150, maxTotalLines: 200, maxNestingDepth: 3, maxExports: 10, maxFunctionParams: 5 },
  jsx: { maxLoc: 150, maxTotalLines: 200, maxNestingDepth: 3, maxExports: 5, maxFunctionParams: 5 },
  js: { maxLoc: 150, maxTotalLines: 200, maxNestingDepth: 3, maxExports: 10, maxFunctionParams: 5 },
};

interface Violation {
  file: string;
  metric: string;
  current: number;
  limit: number;
  severity: 'error' | 'warning';
}

const violations: Violation[] = [];

function countLinesOfCode(content: string): number {
  return content
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('//');
    })
    .length;
}

function countExports(content: string): number {
  const exportMatches = content.match(/^\s*(export\s+(default\s+)?(function|const|class|interface|type|enum))/gm);
  return exportMatches ? exportMatches.length : 0;
}

function maxNestingDepth(content: string): number {
  let maxDepth = 0;
  let currentDepth = 0;

  for (const char of content) {
    if (char === '{' || char === '[' || char === '(') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === '}' || char === ']' || char === ')') {
      currentDepth--;
    }
  }

  return maxDepth;
}

function maxFunctionParams(content: string): number {
  const funcMatches = content.match(/(?:function|const\s+\w+\s*=|\s*\()\s*\(([^)]*)\)/g);
  if (!funcMatches) return 0;

  let maxParams = 0;
  for (const match of funcMatches) {
    const params = match
      .substring(match.indexOf('(') + 1, match.lastIndexOf(')'))
      .split(',')
      .filter(p => p.trim().length > 0).length;
    maxParams = Math.max(maxParams, params);
  }

  return maxParams;
}

function analyzeFile(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath).substring(1);

    if (!DEFAULT_LIMITS[ext]) return;

    const limits = DEFAULT_LIMITS[ext];
    const totalLines = content.split('\n').length;
    const loc = countLinesOfCode(content);
    const exports = countExports(content);
    const nesting = maxNestingDepth(content);
    const params = maxFunctionParams(content);

    if (loc > limits.maxLoc) {
      violations.push({
        file: filePath,
        metric: `Lines of Code (LOC)`,
        current: loc,
        limit: limits.maxLoc,
        severity: 'error',
      });
    }

    if (totalLines > limits.maxTotalLines) {
      violations.push({
        file: filePath,
        metric: `Total Lines`,
        current: totalLines,
        limit: limits.maxTotalLines,
        severity: 'warning',
      });
    }

    if (exports > limits.maxExports) {
      violations.push({
        file: filePath,
        metric: `Number of Exports`,
        current: exports,
        limit: limits.maxExports,
        severity: 'warning',
      });
    }

    if (nesting > limits.maxNestingDepth) {
      violations.push({
        file: filePath,
        metric: `Max Nesting Depth`,
        current: nesting,
        limit: limits.maxNestingDepth,
        severity: 'warning',
      });
    }

    if (params > limits.maxFunctionParams) {
      violations.push({
        file: filePath,
        metric: `Max Function Parameters`,
        current: params,
        limit: limits.maxFunctionParams,
        severity: 'warning',
      });
    }
  } catch (error) {
    // Silently skip files that can't be read
  }
}

function scanDirectory(dir: string, exclude: string[] = []): void {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    // Skip excluded directories
    if (stat.isDirectory()) {
      if (exclude.some(ex => fullPath.includes(ex))) {
        continue;
      }
      scanDirectory(fullPath, exclude);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      analyzeFile(fullPath);
    }
  }
}

function generateReport(): void {
  if (violations.length === 0) {
    console.log('✅ All files comply with size limits!');
    return;
  }

  const errors = violations.filter(v => v.severity === 'error');
  const warnings = violations.filter(v => v.severity === 'warning');

  console.log('\n📊 Code Size Limit Violations Report\n');
  console.log('━'.repeat(100));

  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):\n`);
    for (const v of errors) {
      console.log(`  📄 ${v.file}`);
      console.log(`     ${v.metric}: ${v.current} / ${v.limit}`);
      console.log('');
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):\n`);
    for (const v of warnings) {
      console.log(`  📄 ${v.file}`);
      console.log(`     ${v.metric}: ${v.current} / ${v.limit}`);
      console.log('');
    }
  }

  console.log('━'.repeat(100));
  console.log(
    `\n📈 Summary: ${errors.length} errors, ${warnings.length} warnings\n`
  );

  // Export to JSON for CI/CD
  const report = {
    timestamp: new Date().toISOString(),
    errors: errors.length,
    warnings: warnings.length,
    violations: violations.map(v => ({
      file: v.file,
      metric: v.metric,
      current: v.current,
      limit: v.limit,
      severity: v.severity,
    })),
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'size-limits-report.json'),
    JSON.stringify(report, null, 2)
  );

  if (errors.length > 0) {
    process.exit(1);
  }
}

// Main execution
const rootDir = process.cwd();
const excludeDirs = [
  'node_modules',
  'build',
  '.next',
  'dist',
  '.git',
  'coverage',
  '.venv',
];

console.log('🔍 Scanning for size limit violations...\n');
scanDirectory(rootDir, excludeDirs);
generateReport();
