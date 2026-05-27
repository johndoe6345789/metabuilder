/**
 * Architecture pattern compliance analysis helpers
 */

import { PatternMetrics, PatternIssue } from '../types/index.js';
import { readFile, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';

/**
 * Analyze pattern compliance across file paths
 */
export function analyzePatterns(filePaths: string[]): PatternMetrics {
  const reduxIssues: PatternIssue[] = [];
  const hookIssues: PatternIssue[] = [];

  for (const filePath of filePaths) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;

    try {
      const content = readFile(filePath);

      if (
        (filePath.includes('/store/') || filePath.includes('/slices/')) &&
        content.includes('state.') &&
        content.includes('=')
      ) {
        reduxIssues.push({
          file: normalizeFilePath(filePath),
          pattern: 'Redux Mutation',
          issue: 'Direct state mutation detected',
          suggestion:
            'Use immer middleware or clone state before modifying',
          severity: 'high',
        });
      }

      if (content.includes('use')) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (
            lines[i].includes('if') &&
            i + 1 < lines.length &&
            lines[i + 1].includes('use')
          ) {
            hookIssues.push({
              file: normalizeFilePath(filePath),
              line: i + 1,
              pattern: 'Hook not at top level',
              issue: 'Hook called conditionally or inside a loop',
              suggestion: 'Move hook to top level of component',
              severity: 'high',
            });
          }
        }
      }
    } catch {
      logger.debug(`Failed to analyze patterns in ${filePath}`);
    }
  }

  return {
    reduxCompliance: {
      issues: reduxIssues.slice(0, 5),
      score: 100 - Math.min(reduxIssues.length * 20, 100),
    },
    hookUsage: {
      issues: hookIssues.slice(0, 5),
      score: 100 - Math.min(hookIssues.length * 20, 100),
    },
    reactBestPractices: {
      issues: [],
      score: 80,
    },
  };
}
