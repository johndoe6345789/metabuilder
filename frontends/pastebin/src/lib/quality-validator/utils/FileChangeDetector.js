/**
 * File Change Detector for Quality Validator
 * Tracks file modifications for efficient incremental analysis
 */
import { logger } from './logger.js';
import { pathExists, readJsonFile, writeJsonFile } from './fileSystem.js';
import { hashFile, getFileMetadata, detectGitRoot, getChangedFilesViaGit, getChangedFilesByHash, } from './change-detection.js';
const STATE_FILE = '.quality/.state.json';
function buildChange(file, prev) {
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
    constructor(useGitStatus = true) {
        this.useGitStatus = useGitStatus;
        this.currentState = this.loadState();
        this.gitRoot = detectGitRoot();
    }
    loadState() {
        try {
            if (pathExists(STATE_FILE)) {
                const state = readJsonFile(STATE_FILE);
                logger.debug('Loaded change detection state');
                return state;
            }
        }
        catch (error) {
            logger.debug('Failed to load state', {
                error: error.message,
            });
        }
        return { files: {}, timestamp: Date.now() };
    }
    saveState() {
        try {
            this.currentState.timestamp = Date.now();
            writeJsonFile(STATE_FILE, this.currentState);
        }
        catch (error) {
            logger.warn('Failed to save change detection state', {
                error: error.message,
            });
        }
    }
    detectChanges(files) {
        const changes = [];
        if (this.useGitStatus && this.gitRoot) {
            const gitChanges = getChangedFilesViaGit(this.gitRoot);
            if (gitChanges.size > 0) {
                for (const file of gitChanges) {
                    if (!files.includes(file))
                        continue;
                    changes.push(buildChange(file, this.currentState.files[file]));
                }
                if (changes.length > 0)
                    return changes;
            }
        }
        const changedSet = getChangedFilesByHash(files, this.currentState);
        for (const file of changedSet) {
            changes.push(buildChange(file, this.currentState.files[file]));
        }
        logger.info(`Detected ${changes.length} file changes`);
        return changes;
    }
    updateRecords(files) {
        for (const file of files) {
            if (pathExists(file)) {
                const metadata = getFileMetadata(file);
                if (metadata) {
                    this.currentState.files[file] = {
                        path: file,
                        hash: hashFile(file),
                        modifiedTime: metadata.modifiedTime,
                        size: metadata.size,
                    };
                }
            }
            else {
                delete this.currentState.files[file];
            }
        }
        this.saveState();
    }
    getUnchangedFiles(files) {
        const unchanged = [];
        for (const file of files) {
            if (!pathExists(file))
                continue;
            try {
                const metadata = getFileMetadata(file);
                if (!metadata)
                    continue;
                const prev = this.currentState.files[file];
                if (!prev)
                    continue;
                if (prev.size === metadata.size &&
                    prev.modifiedTime === metadata.modifiedTime &&
                    hashFile(file) === prev.hash) {
                    unchanged.push(file);
                }
            }
            catch (error) {
                logger.debug(`Unchanged check failed: ${file}`, {
                    error: error.message,
                });
            }
        }
        return unchanged;
    }
    getTrackedFiles() {
        return Object.keys(this.currentState.files);
    }
    resetRecords() {
        this.currentState = { files: {}, timestamp: Date.now() };
        this.saveState();
        logger.info('Change detection records reset');
    }
    getStats() {
        return {
            trackedFiles: Object.keys(this.currentState.files).length,
            lastUpdate: new Date(this.currentState.timestamp).toISOString(),
        };
    }
}
let globalDetector = null;
export function getGlobalChangeDetector(useGitStatus = true) {
    if (!globalDetector) {
        globalDetector = new FileChangeDetector(useGitStatus);
    }
    return globalDetector;
}
export function resetGlobalChangeDetector() {
    globalDetector = null;
}
export const fileChangeDetector = getGlobalChangeDetector();
