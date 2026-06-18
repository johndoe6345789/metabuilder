/**
 * File change detection strategies
 */
import * as fs from 'fs';
import * as crypto from 'crypto';
import { logger } from './logger.js';
import { getChangedFiles, readFile, pathExists } from './fileSystem.js';
/**
 * Generate SHA256 hash of file content
 */
export function hashFile(filePath) {
    try {
        const content = readFile(filePath);
        return crypto.createHash('sha256').update(content).digest('hex');
    }
    catch {
        return '';
    }
}
/**
 * Get file stat metadata (mtime, size)
 */
export function getFileMetadata(filePath) {
    try {
        const stat = fs.statSync(filePath);
        return { modifiedTime: stat.mtimeMs, size: stat.size };
    }
    catch {
        return null;
    }
}
/**
 * Detect git root by walking up the directory tree
 */
export function detectGitRoot() {
    try {
        let current = process.cwd();
        while (current !== '/') {
            if (fs.existsSync(`${current}/.git`))
                return current;
            current = current.substring(0, current.lastIndexOf('/'));
        }
    }
    catch {
        logger.debug('Not in a git repository');
    }
    return null;
}
/**
 * Get set of changed files via git status
 */
export function getChangedFilesViaGit(gitRoot) {
    const changed = new Set();
    if (!gitRoot)
        return changed;
    try {
        const changedFiles = getChangedFiles();
        for (const file of changedFiles) {
            changed.add(file);
        }
        logger.debug(`Git detected ${changed.size} changed files`);
    }
    catch (error) {
        logger.debug('Git change detection failed', {
            error: error.message,
        });
    }
    return changed;
}
/**
 * Find changed files by comparing stored hash records
 */
export function getChangedFilesByHash(files, currentState) {
    const changed = new Set();
    for (const file of files) {
        if (!pathExists(file)) {
            if (currentState.files[file])
                changed.add(file);
            continue;
        }
        try {
            const metadata = getFileMetadata(file);
            if (!metadata)
                continue;
            const previousRecord = currentState.files[file];
            if (!previousRecord) {
                changed.add(file);
                continue;
            }
            if (previousRecord.size !== metadata.size ||
                previousRecord.modifiedTime !== metadata.modifiedTime) {
                const hash = hashFile(file);
                if (hash !== previousRecord.hash) {
                    changed.add(file);
                }
            }
        }
        catch (error) {
            logger.debug(`Failed to check file changes: ${file}`, {
                error: error.message,
            });
        }
    }
    return changed;
}
