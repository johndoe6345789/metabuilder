/**
 * File Change Detector for Quality Validator
 * Tracks file modifications and uses git status for efficient change detection
 * Enables incremental analysis of only changed files
 */

import * as fs from 'fs';
import * as crypto from 'crypto';
import { logger } from './logger.js';
import { getChangedFiles, readFile, pathExists, readJsonFile, writeJsonFile } from './fileSystem.js';

/**
 * File hash record
 */
export interface FileRecord {
  path: string;
  hash: string;
  modifiedTime: number;
  size: number;
}

/**
 * Change detection state
 */
export interface ChangeDetectionState {
  files: Record<string, FileRecord>;
  timestamp: number;
}

/**
 * File change information
 */
export interface FileChange {
  path: string;
  type: 'modified' | 'added' | 'deleted';
  previousHash?: string;
  currentHash?: string;
}

/**
 * FileChangeDetector provides efficient change detection using multiple strategies
 */
export class FileChangeDetector {
  private stateFile: string = '.quality/.state.json';
  private currentState: ChangeDetectionState;
  private useGitStatus: boolean = true;
  private gitRoot: string | null = null;

  constructor(useGitStatus: boolean = true) {
    this.useGitStatus = useGitStatus;
    this.currentState = this.loadState();
    this.detectGitRoot();
  }

  /**
   * Detect git root directory
   */
  private detectGitRoot(): void {
    try {
      let current = process.cwd();
      while (current !== '/') {
        if (fs.existsSync(`${current}/.git`)) {
          this.gitRoot = current;
          return;
        }
        current = current.substring(0, current.lastIndexOf('/'));
      }
    } catch {
      logger.debug('Not in a git repository');
    }
  }

  /**
   * Generate SHA256 hash of file content
   */
  private hashFile(filePath: string): string {
    try {
      const content = readFile(filePath);
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch {
      return '';
    }
  }

  /**
   * Get file metadata
   */
  private getFileMetadata(filePath: string): Partial<FileRecord> | null {
    try {
      const stat = fs.statSync(filePath);
      return {
        modifiedTime: stat.mtimeMs,
        size: stat.size,
      };
    } catch {
      return null;
    }
  }

  /**
   * Load detection state from disk
   */
  private loadState(): ChangeDetectionState {
    try {
      if (pathExists(this.stateFile)) {
        const state = readJsonFile<ChangeDetectionState>(this.stateFile);
        logger.debug('Loaded change detection state');
        return state;
      }
    } catch (error) {
      logger.debug('Failed to load change detection state', {
        error: (error as Error).message,
      });
    }

    return {
      files: {},
      timestamp: Date.now(),
    };
  }

  /**
   * Save detection state to disk
   */
  private saveState(): void {
    try {
      this.currentState.timestamp = Date.now();
      writeJsonFile(this.stateFile, this.currentState);
      logger.debug('Saved change detection state');
    } catch (error) {
      logger.warn('Failed to save change detection state', {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get changed files using git (fastest method)
   */
  private getChangedFilesViaGit(): Set<string> {
    const changed = new Set<string>();

    try {
      if (!this.gitRoot) {
        return changed;
      }

      const changedFiles = getChangedFiles();
      for (const file of changedFiles) {
        changed.add(file);
      }

      logger.debug(`Git detected ${changed.size} changed files`);
    } catch (error) {
      logger.debug('Git change detection failed', {
        error: (error as Error).message,
      });
    }

    return changed;
  }

  /**
   * Get changed files by comparing file hashes
   */
  private getChangedFilesByHash(files: string[]): Set<string> {
    const changed = new Set<string>();

    for (const file of files) {
      if (!pathExists(file)) {
        // File deleted
        if (this.currentState.files[file]) {
          changed.add(file);
        }
        continue;
      }

      try {
        const metadata = this.getFileMetadata(file);
        if (!metadata) continue;

        const previousRecord = this.currentState.files[file];

        // New file
        if (!previousRecord) {
          changed.add(file);
          continue;
        }

        // Check quick indicators first (size and modification time)
        if (
          previousRecord.size !== metadata.size ||
          previousRecord.modifiedTime !== metadata.modifiedTime
        ) {
          // Verify with hash
          const hash = this.hashFile(file);
          if (hash !== previousRecord.hash) {
            changed.add(file);
          }
        }
      } catch (error) {
        logger.debug(`Failed to check file changes: ${file}`, {
          error: (error as Error).message,
        });
      }
    }

    return changed;
  }

  /**
   * Detect which files have changed
   */
  detectChanges(files: string[]): FileChange[] {
    const changes: FileChange[] = [];

    // Try git first (fastest)
    if (this.useGitStatus && this.gitRoot) {
      const gitChanges = this.getChangedFilesViaGit();

      if (gitChanges.size > 0) {
        for (const file of gitChanges) {
          if (files.includes(file)) {
            const previousRecord = this.currentState.files[file];
            const currentHash = pathExists(file) ? this.hashFile(file) : '';

            changes.push({
              path: file,
              type: !pathExists(file) ? 'deleted' : previousRecord ? 'modified' : 'added',
              previousHash: previousRecord?.hash,
              currentHash: currentHash || undefined,
            });
          }
        }
      }

      if (changes.length > 0) {
        return changes;
      }
    }

    // Fallback: check hash for all files
    const changedSet = this.getChangedFilesByHash(files);

    for (const file of changedSet) {
      const previousRecord = this.currentState.files[file];
      const currentHash = pathExists(file) ? this.hashFile(file) : '';

      changes.push({
        path: file,
        type: !pathExists(file) ? 'deleted' : previousRecord ? 'modified' : 'added',
        previousHash: previousRecord?.hash,
        currentHash: currentHash || undefined,
      });
    }

    logger.info(`Detected ${changes.length} file changes`);
    return changes;
  }

  /**
   * Update file records after analysis
   */
  updateRecords(files: string[]): void {
    for (const file of files) {
      if (pathExists(file)) {
        const metadata = this.getFileMetadata(file);
        if (metadata) {
          const hash = this.hashFile(file);
          this.currentState.files[file] = {
            path: file,
            hash,
            modifiedTime: metadata.modifiedTime!,
            size: metadata.size!,
          };
        }
      } else {
        delete this.currentState.files[file];
      }
    }

    this.saveState();
  }

  /**
   * Get unchanged files (optimization opportunity)
   */
  getUnchangedFiles(files: string[]): string[] {
    const unchanged: string[] = [];

    for (const file of files) {
      if (!pathExists(file)) {
        continue;
      }

      try {
        const metadata = this.getFileMetadata(file);
        if (!metadata) continue;

        const previousRecord = this.currentState.files[file];
        if (!previousRecord) {
          continue;
        }

        // Quick check: size and modification time
        if (
          previousRecord.size === metadata.size &&
          previousRecord.modifiedTime === metadata.modifiedTime
        ) {
          // Verify with hash to be sure
          const hash = this.hashFile(file);
          if (hash === previousRecord.hash) {
            unchanged.push(file);
          }
        }
      } catch (error) {
        logger.debug(`Failed to check unchanged status: ${file}`, {
          error: (error as Error).message,
        });
      }
    }

    return unchanged;
  }

  /**
   * Get all tracked files
   */
  getTrackedFiles(): string[] {
    return Object.keys(this.currentState.files);
  }

  /**
   * Clear all tracking records
   */
  resetRecords(): void {
    this.currentState = {
      files: {},
      timestamp: Date.now(),
    };
    this.saveState();
    logger.info('Change detection records reset');
  }

  /**
   * Get statistics
   */
  getStats(): {
    trackedFiles: number;
    lastUpdate: string;
  } {
    return {
      trackedFiles: Object.keys(this.currentState.files).length,
      lastUpdate: new Date(this.currentState.timestamp).toISOString(),
    };
  }
}

/**
 * Global change detector instance
 */
let globalDetector: FileChangeDetector | null = null;

/**
 * Get or create global change detector
 */
export function getGlobalChangeDetector(useGitStatus: boolean = true): FileChangeDetector {
  if (!globalDetector) {
    globalDetector = new FileChangeDetector(useGitStatus);
  }
  return globalDetector;
}

/**
 * Reset global change detector
 */
export function resetGlobalChangeDetector(): void {
  globalDetector = null;
}

// Export singleton instance
export const fileChangeDetector = getGlobalChangeDetector();
