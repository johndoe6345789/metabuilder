/**
 * Performance issue detection helpers for SecurityScanner
 */

import { PerformanceIssue } from '../types/index.js';
import { readFile, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';

export function checkPerformanceIssues(
  filePaths: string[]
): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  for (const filePath of filePaths) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
      continue;
    }
    try {
      const content = readFile(filePath);
      const lines = content.split('\n');
      const normalized = normalizeFilePath(filePath);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        if (line.includes('onClick={') && line.includes('=>')) {
          issues.push({
            type: 'inlineFunction', severity: 'medium',
            file: normalized, line: lineNum,
            message: 'Inline function definition in JSX',
            suggestion:
              'Define function outside JSX or use useCallback',
            estimatedImpact:
              'Performance degradation in large lists',
          });
        }
        if (
          line.includes('.map(') &&
          !line.includes('key=') &&
          i + 1 < lines.length &&
          lines[i + 1].includes('key=') === false
        ) {
          issues.push({
            type: 'missingKey', severity: 'high',
            file: normalized, line: lineNum,
            message: 'List items missing key prop',
            suggestion: 'Add unique key prop to each list item',
            estimatedImpact:
              'Rendering issues and performance problems',
          });
        }
        if (line.includes('={{') || line.includes('={[')) {
          issues.push({
            type: 'inlineObject', severity: 'medium',
            file: normalized, line: lineNum,
            message: 'Inline object/array literal in JSX props',
            suggestion: 'Move to state or memoize with useMemo',
            estimatedImpact:
              'Unnecessary re-renders of child components',
          });
        }
      }
    } catch {
      logger.debug(
        `Failed to check performance issues in ${filePath}`
      );
    }
  }
  return issues.slice(0, 20);
}
