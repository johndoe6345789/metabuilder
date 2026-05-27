/**
 * Complexity analysis helpers for CodeQualityAnalyzer
 */

import { ComplexityMetrics, ComplexityFunction } from '../types/index.js';
import { readFile, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';

/**
 * Calculate simple complexity based on control flow keywords
 */
export function calculateSimpleComplexity(code: string): number {
  let complexity = 1;
  const keywords = ['if', 'else', 'case', 'catch', 'while', 'for', 'do', '&&', '\\|\\|', '\\?', ':'];
  for (const kw of keywords) {
    const matches = code.match(new RegExp(`\\b${kw}\\b`, 'g'));
    complexity += (matches ? matches.length : 0) * 0.5;
  }
  return Math.ceil(complexity);
}

interface FileComplexity {
  functions: ComplexityFunction[];
  totalComplexity: number;
  maxComplexity: number;
}

/**
 * Extract complexity from a single file
 */
export function extractComplexityFromFile(
  filePath: string,
  content: string
): FileComplexity {
  const functions: ComplexityFunction[] = [];
  let totalComplexity = 0;
  let maxComplexity = 0;

  const fnRegex =
    /(?:async\s+)?(?:function|const|let|var)\s+(\w+)\s*(?::|=)\s*(?:async\s*)?(?:function|\()/gm;
  let match;

  while ((match = fnRegex.exec(content)) !== null) {
    const functionName = match[1];
    const startIdx = match.index;
    const lineNum = content.substring(0, startIdx).split('\n').length;
    const complexity = calculateSimpleComplexity(
      content.substring(startIdx, startIdx + 1000)
    );

    if (complexity > 0) {
      functions.push({
        file: normalizeFilePath(filePath),
        name: functionName,
        line: lineNum,
        complexity,
        status:
          complexity <= 10 ? 'good' : complexity <= 20 ? 'warning' : 'critical',
      });
      totalComplexity += complexity;
      maxComplexity = Math.max(maxComplexity, complexity);
    }
  }

  return { functions, totalComplexity, maxComplexity };
}

type SafeReader = (path: string) => string | null;

/**
 * Analyze cyclomatic complexity across file paths
 */
export function analyzeComplexity(
  filePaths: string[],
  safeRead: SafeReader
): ComplexityMetrics {
  const functions: ComplexityFunction[] = [];
  let totalComplexity = 0;
  let maxComplexity = 0;

  for (const filePath of filePaths) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;

    const content = safeRead(filePath);
    if (!content) continue;

    try {
      const parsed = extractComplexityFromFile(filePath, content);
      functions.push(...parsed.functions);
      totalComplexity += parsed.totalComplexity;
      maxComplexity = Math.max(maxComplexity, parsed.maxComplexity);
    } catch (error) {
      logger.debug(`Failed to analyze complexity in ${filePath}: ${
        (error as Error).message
      }`);
    }
  }

  const averagePerFile =
    filePaths.length > 0 ? totalComplexity / filePaths.length : 0;

  const distribution = {
    good: functions.filter(f => f.complexity <= 10).length,
    warning: functions.filter(
      f => f.complexity > 10 && f.complexity <= 20
    ).length,
    critical: functions.filter(f => f.complexity > 20).length,
  };

  return {
    functions: functions
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 20),
    averagePerFile,
    maximum: maxComplexity,
    distribution,
  };
}
