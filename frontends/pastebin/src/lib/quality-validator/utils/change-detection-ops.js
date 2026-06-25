/**
 * FileChangeDetector operational methods extracted for size compliance
 */
import { logger } from './logger.js';
import { pathExists, writeJsonFile } from './fileSystem.js';
import { hashFile, getFileMetadata, getChangedFilesViaGit, getChangedFilesByHash, } from './change-detection.js';
export function detectChanges(files, state, useGit, gitRoot) {
    const changes = [];
    if (useGit && gitRoot) {
        const gitChanges = getChangedFilesViaGit(gitRoot);
        if (gitChanges.size > 0) {
            for (const file of gitChanges) {
                if (!files.includes(file))
                    continue;
                const prev = state.files[file];
                const hash = pathExists(file) ? hashFile(file) : '';
                changes.push({
                    path: file,
                    type: !pathExists(file) ? 'deleted' : prev ? 'modified' : 'added',
                    previousHash: prev?.hash,
                    currentHash: hash || undefined,
                });
            }
            if (changes.length > 0)
                return changes;
        }
    }
    for (const file of getChangedFilesByHash(files, state)) {
        const prev = state.files[file];
        const hash = pathExists(file) ? hashFile(file) : '';
        changes.push({
            path: file,
            type: !pathExists(file) ? 'deleted' : prev ? 'modified' : 'added',
            previousHash: prev?.hash,
            currentHash: hash || undefined,
        });
    }
    logger.info(`Detected ${changes.length} file changes`);
    return changes;
}
export function updateRecords(files, state, stateFile) {
    for (const file of files) {
        if (pathExists(file)) {
            const m = getFileMetadata(file);
            if (m) {
                state.files[file] = {
                    path: file,
                    hash: hashFile(file),
                    modifiedTime: m.modifiedTime,
                    size: m.size,
                };
            }
        }
        else {
            delete state.files[file];
        }
    }
    try {
        state.timestamp = Date.now();
        writeJsonFile(stateFile, state);
        logger.debug('Saved change detection state');
    }
    catch (e) {
        logger.warn('Failed to save state', { error: e.message });
    }
}
export function getUnchangedFiles(files, state) {
    const unchanged = [];
    for (const file of files) {
        if (!pathExists(file))
            continue;
        try {
            const m = getFileMetadata(file);
            if (!m)
                continue;
            const prev = state.files[file];
            if (!prev)
                continue;
            if (prev.size === m.size && prev.modifiedTime === m.modifiedTime) {
                if (hashFile(file) === prev.hash)
                    unchanged.push(file);
            }
        }
        catch (e) {
            logger.debug(`Check failed: ${file}`, { error: e.message });
        }
    }
    return unchanged;
}
