/**
 * File Change Detector for Quality Validator
 * Tracks file modifications for efficient incremental analysis
 */

import { logger } from './logger.js';
import { pathExists, readJsonFile, writeJsonFile } from './fileSystem.js';
import {
  hashFile,
  getFileMetadata,
  detectGitRoot,
  getChangedFilesViaGit,
  getChangedFilesByHash,
} from './change-detection.js';

export interface FileRecord {
  path: string;
  hash: string;
  modifiedTime: number;
  size: number;
}

export interface ChangeDetectionState {
  files: Record<string, FileRecord>;
  timestamp: number;
}

export interface FileChange {
  path: string;
  type: 'modified' | 'added' | 'deleted';
  previousHash?: string;
  currentHash?: string;
}

const STATE_FILE = '.quality/.state.json';

function buildChange(
  file: string,
  prev?: FileRecord
): FileChange {
  const exists = pathExists(file);
  const currentHash = exists ? hashFile(file) : '';
  return {
    path: file,
    type: !exists ? 'deleted' : prev ? 'modified' : 'added',
    previousHash: prev?.hash,
    currentHash: currentHash || undefined,
  };
}

export class FileChangeDetector {
  currentState: ChangeDetectionState;
  private useGitStatus: boolean;
  private gitRoot: string | null;

  constructor(useGitStatus = true) {
    this.useGitStatus = useGitStatus;
    this.currentState = this.loadState();
    this.gitRoot = detectGitRoot();
  }

  private loadState(): ChangeDetectionState {
    try {
      if (pathExists(STATE_FILE)) {
        const state = readJsonFile<ChangeDetectionState>(STATE_FILE);
        logger.debug('Loaded change detection state');
        return state;
      }
    } catch (error) {
      logger.debug('Failed to load state', {
        error: (error as Error).message,
      });
    }
    return { files: {}, timestamp: Date.now() };
  }

  private saveState(): void {
    try {
      this.currentState.timestamp = Date.now();
      writeJsonFile(STATE_FILE, this.currentState);
    } catch (error) {
      logger.warn('Failed to save change detection state', {
        error: (error as Error).message,
      });
    }
  }

  detectChanges(files: string[]): FileChange[] {
    const changes: FileChange[] = [];
    if (this.useGitStatus && this.gitRoot) {
      const gitChanges = getChangedFilesViaGit(this.gitRoot);
      if (gitChanges.size > 0) {
        for (const file of gitChanges) {
          if (!files.includes(file)) continue;
          changes.push(buildChange(file, this.currentState.files[file]));
        }
        if (changes.length > 0) return changes;
      }
    }
    const changedSet = getChangedFilesByHash(files, this.currentState);
    for (const file of changedSet) {
      changes.push(buildChange(file, this.currentState.files[file]));
    }
    logger.info(`Detected ${changes.length} file changes`);
    return changes;
  }

  updateRecords(files: string[]): void {
    for (const file of files) {
      if (pathExists(file)) {
        const metadata = getFileMetadata(file);
        if (metadata) {
          this.currentState.files[file] = {
            path: file, hash: hashFile(file),
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

  getUnchangedFiles(files: string[]): string[] {
    const unchanged: string[] = [];
    for (const file of files) {
      if (!pathExists(file)) continue;
      try {
        const metadata = getFileMetadata(file);
        if (!metadata) continue;
        const prev = this.currentState.files[file];
        if (!prev) continue;
        if (
          prev.size === metadata.size &&
          prev.modifiedTime === metadata.modifiedTime &&
          hashFile(file) === prev.hash
        ) {
          unchanged.push(file);
        }
      } catch (error) {
        logger.debug(`Unchanged check failed: ${file}`, {
          error: (error as Error).message,
        });
      }
    }
    return unchanged;
  }

  getTrackedFiles(): string[] {
    return Object.keys(this.currentState.files);
  }

  resetRecords(): void {
    this.currentState = { files: {}, timestamp: Date.now() };
    this.saveState();
    logger.info('Change detection records reset');
  }

  getStats(): { trackedFiles: number; lastUpdate: string } {
    return {
      trackedFiles: Object.keys(this.currentState.files).length,
      lastUpdate: new Date(this.currentState.timestamp).toISOString(),
    };
  }
}

let globalDetector: FileChangeDetector | null = null;

export function getGlobalChangeDetector(
  useGitStatus = true
): FileChangeDetector {
  if (!globalDetector) {
    globalDetector = new FileChangeDetector(useGitStatus);
  }
  return globalDetector;
}

export function resetGlobalChangeDetector(): void {
  globalDetector = null;
}

export const fileChangeDetector = getGlobalChangeDetector();
