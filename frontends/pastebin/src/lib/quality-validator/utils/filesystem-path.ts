/**
 * Path utilities for Quality Validator filesystem
 */

import * as fs from 'fs';
import * as path from 'path';
import { AnalysisErrorClass } from '../types/index.js';

export function getProjectRoot(): string {
  return process.cwd();
}

export function resolvePath(filePath: string): string {
  const normalized = path.normalize(filePath);

  if (normalized.includes('..')) {
    throw new AnalysisErrorClass(
      'Directory traversal detected',
      `Path contains '..': ${filePath}`
    );
  }

  const resolved = path.resolve(getProjectRoot(), normalized);
  const projectRoot = getProjectRoot();

  if (!resolved.startsWith(projectRoot)) {
    throw new AnalysisErrorClass(
      'Path outside project root',
      `Attempted to access: ${resolved}`
    );
  }

  return resolved;
}

export function normalizeFilePath(filePath: string): string {
  const projectRoot = getProjectRoot();
  const resolved = resolvePath(filePath);
  return path.relative(projectRoot, resolved);
}

export function pathExists(filePath: string): boolean {
  try {
    return fs.existsSync(resolvePath(filePath));
  } catch {
    return false;
  }
}

export function isFile(filePath: string): boolean {
  try {
    return fs.statSync(resolvePath(filePath)).isFile();
  } catch {
    return false;
  }
}

export function isDirectory(dirPath: string): boolean {
  try {
    return fs.statSync(resolvePath(dirPath)).isDirectory();
  } catch {
    return false;
  }
}

export function getLineCount(filePath: string): number {
  try {
    const content = fs.readFileSync(resolvePath(filePath), 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

export function getLines(
  filePath: string,
  startLine: number,
  endLine: number
): string[] {
  try {
    const content = fs.readFileSync(resolvePath(filePath), 'utf-8');
    const lines = content.split('\n');
    return lines.slice(
      Math.max(0, startLine - 1),
      Math.min(lines.length, endLine)
    );
  } catch {
    return [];
  }
}

export function getGitRoot(): string | null {
  try {
    let current = getProjectRoot();
    while (current !== path.dirname(current)) {
      if (fs.existsSync(path.join(current, '.git'))) {
        return current;
      }
      current = path.dirname(current);
    }
  } catch {
    // not in git
  }
  return null;
}

function escapeRegexChars(str: string): string {
  return str.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}

export function matchesPattern(filePath: string, pattern: string): boolean {
  const regexPattern = escapeRegexChars(pattern)
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${regexPattern}$`).test(filePath);
}

export function shouldExclude(filePath: string, patterns: string[]): boolean {
  return patterns.some(p => matchesPattern(filePath, p));
}
