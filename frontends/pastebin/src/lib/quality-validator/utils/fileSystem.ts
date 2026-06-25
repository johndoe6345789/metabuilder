/**
 * File system utilities for Quality Validator
 */

import * as fs from 'fs'
import * as path from 'path'
import { AnalysisErrorClass } from '../types/index.js'
import { logger } from './logger.js'
import {
  resolvePath,
  normalizeFilePath,
  shouldExclude,
} from './filesystem-path.js'

export {
  getProjectRoot,
  resolvePath,
  normalizeFilePath,
  pathExists,
  isFile,
  isDirectory,
  getLineCount,
  getLines,
  getGitRoot,
  matchesPattern,
  shouldExclude,
} from './filesystem-path.js'

export function readFile(p: string): string {
  try {
    return fs.readFileSync(resolvePath(p), 'utf-8')
  } catch (e) {
    throw new AnalysisErrorClass(
      `Failed to read file: ${p}`,
      (e as Error).message,
    )
  }
}

export function writeFile(p: string, content: string): void {
  try {
    const r = resolvePath(p)
    const d = path.dirname(r)
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
    fs.writeFileSync(r, content, 'utf-8')
    logger.debug(`Written file: ${p}`)
  } catch (e) {
    throw new AnalysisErrorClass(
      `Failed to write file: ${p}`,
      (e as Error).message,
    )
  }
}

export function readJsonFile<T>(p: string): T {
  try {
    return JSON.parse(readFile(p)) as T
  } catch (e) {
    throw new AnalysisErrorClass(
      `Failed to parse JSON: ${p}`,
      (e as Error).message,
    )
  }
}

export function writeJsonFile<T>(p: string, data: T, pretty = true): void {
  try {
    writeFile(p, pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data))
  } catch (e) {
    throw new AnalysisErrorClass(
      `Failed to write JSON: ${p}`,
      (e as Error).message,
    )
  }
}

export function listFilesRecursive(
  dirPath: string,
  extensions?: string[],
  excludePatterns: string[] = [],
): string[] {
  const results: string[] = []
  try {
    const walk = (cur: string) => {
      for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
        const full = path.join(cur, e.name)
        const rel = normalizeFilePath(full)
        if (shouldExclude(rel, excludePatterns)) continue
        if (e.isFile()) {
          if (!extensions || extensions.some(x => e.name.endsWith(x))) {
            results.push(rel)
          }
        } else if (e.isDirectory()) walk(full)
      }
    }
    walk(resolvePath(dirPath))
  } catch (e) {
    logger.warn(`Failed to list: ${dirPath}`, { error: (e as Error).message })
  }
  return results
}

export function getSourceFiles(ex: string[] = []): string[] {
  return listFilesRecursive('src', ['.ts', '.tsx'], ex)
}

export function getTestFiles(ex: string[] = []): string[] {
  return listFilesRecursive(
    'src',
    ['.ts', '.tsx'],
    [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__tests__/**',
      ...ex,
    ],
  )
}

export function ensureDirectory(p: string): void {
  try {
    const r = resolvePath(p)
    if (!fs.existsSync(r)) {
      fs.mkdirSync(r, { recursive: true })
      logger.debug(`Created dir: ${p}`)
    }
  } catch (e) {
    throw new AnalysisErrorClass(
      `Failed to create dir: ${p}`,
      (e as Error).message,
    )
  }
}

export function deletePathSync(p: string): void {
  try {
    const r = resolvePath(p)
    if (fs.existsSync(r)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      fs.statSync(r).isDirectory()
        ? fs.rmSync(r, { recursive: true, force: true })
        : fs.unlinkSync(r)
      logger.debug(`Deleted: ${p}`)
    }
  } catch (e) {
    throw new AnalysisErrorClass(`Failed to delete: ${p}`, (e as Error).message)
  }
}

export function getChangedFiles(since?: string): string[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require('child_process')
    const cmd = since
      ? `git diff --name-only ${since}`
      : 'git diff --name-only HEAD~1'
    return (execSync(cmd, { cwd: process.cwd(), encoding: 'utf-8' }) as string)
      .split('\n')
      .filter((l: string) => l.trim())
      .map((l: string) => l.trim())
  } catch {
    logger.warn('Failed to get changed files from git')
    return []
  }
}
