/**
 * File system utilities for Quality Validator
 * Handles file reading, writing, and path resolution
 */
import * as fs from 'fs';
import * as path from 'path';
import { AnalysisErrorClass } from '../types/index.js';
import { logger } from './logger.js';
/**
 * Get the project root directory
 */
export function getProjectRoot() {
    return process.cwd();
}
/**
 * Resolve a file path relative to project root
 */
export function resolvePath(filePath) {
    const normalized = path.normalize(filePath);
    // Security check: prevent directory traversal
    if (normalized.includes('..')) {
        throw new AnalysisErrorClass('Directory traversal detected', `Path contains '..': ${filePath}`);
    }
    const resolved = path.resolve(getProjectRoot(), normalized);
    const projectRoot = getProjectRoot();
    // Ensure path is within project
    if (!resolved.startsWith(projectRoot)) {
        throw new AnalysisErrorClass('Path outside project root', `Attempted to access: ${resolved}`);
    }
    return resolved;
}
/**
 * Normalize a file path relative to project root
 */
export function normalizeFilePath(filePath) {
    const projectRoot = getProjectRoot();
    const resolved = resolvePath(filePath);
    return path.relative(projectRoot, resolved);
}
/**
 * Check if a path exists
 */
export function pathExists(filePath) {
    try {
        return fs.existsSync(resolvePath(filePath));
    }
    catch {
        return false;
    }
}
/**
 * Check if path is a file
 */
export function isFile(filePath) {
    try {
        const stat = fs.statSync(resolvePath(filePath));
        return stat.isFile();
    }
    catch {
        return false;
    }
}
/**
 * Check if path is a directory
 */
export function isDirectory(dirPath) {
    try {
        const stat = fs.statSync(resolvePath(dirPath));
        return stat.isDirectory();
    }
    catch {
        return false;
    }
}
/**
 * Read a file as text
 */
export function readFile(filePath) {
    try {
        const resolved = resolvePath(filePath);
        return fs.readFileSync(resolved, 'utf-8');
    }
    catch (error) {
        throw new AnalysisErrorClass(`Failed to read file: ${filePath}`, error.message);
    }
}
/**
 * Write a file
 */
export function writeFile(filePath, content) {
    try {
        const resolved = resolvePath(filePath);
        const dir = path.dirname(resolved);
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(resolved, content, 'utf-8');
        logger.debug(`Written file: ${filePath}`);
    }
    catch (error) {
        throw new AnalysisErrorClass(`Failed to write file: ${filePath}`, error.message);
    }
}
/**
 * Read a JSON file
 */
export function readJsonFile(filePath) {
    try {
        const content = readFile(filePath);
        return JSON.parse(content);
    }
    catch (error) {
        throw new AnalysisErrorClass(`Failed to parse JSON file: ${filePath}`, error.message);
    }
}
/**
 * Write a JSON file
 */
export function writeJsonFile(filePath, data, pretty = true) {
    try {
        const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        writeFile(filePath, content);
    }
    catch (error) {
        throw new AnalysisErrorClass(`Failed to write JSON file: ${filePath}`, error.message);
    }
}
/**
 * List files in directory recursively
 */
export function listFilesRecursive(dirPath, extensions, excludePatterns = []) {
    const results = [];
    try {
        const resolved = resolvePath(dirPath);
        const walk = (currentPath) => {
            const entries = fs.readdirSync(currentPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                const relativePath = normalizeFilePath(fullPath);
                // Check if should exclude
                if (shouldExclude(relativePath, excludePatterns)) {
                    continue;
                }
                if (entry.isFile()) {
                    if (!extensions || extensions.some((ext) => entry.name.endsWith(ext))) {
                        results.push(relativePath);
                    }
                }
                else if (entry.isDirectory()) {
                    walk(fullPath);
                }
            }
        };
        walk(resolved);
    }
    catch (error) {
        logger.warn(`Failed to list directory: ${dirPath}`, { error: error.message });
    }
    return results;
}
/**
 * Get all TypeScript/TSX source files
 */
export function getSourceFiles(excludePatterns = []) {
    return listFilesRecursive('src', ['.ts', '.tsx'], excludePatterns);
}
/**
 * Get all test files
 */
export function getTestFiles(excludePatterns = []) {
    const defaults = ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'];
    const patterns = [...defaults, ...excludePatterns];
    return listFilesRecursive('src', ['.ts', '.tsx'], patterns);
}
/**
 * Check if a file path matches any exclude pattern
 */
export function shouldExclude(filePath, patterns) {
    for (const pattern of patterns) {
        if (matchesPattern(filePath, pattern)) {
            return true;
        }
    }
    return false;
}
/**
 * Simple glob pattern matching
 */
export function matchesPattern(filePath, pattern) {
    // Convert glob pattern to regex
    const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
}
/**
 * Get the number of lines in a file
 */
export function getLineCount(filePath) {
    try {
        const content = readFile(filePath);
        return content.split('\n').length;
    }
    catch {
        return 0;
    }
}
/**
 * Get lines from a file between start and end
 */
export function getLines(filePath, startLine, endLine) {
    try {
        const content = readFile(filePath);
        const lines = content.split('\n');
        return lines.slice(Math.max(0, startLine - 1), Math.min(lines.length, endLine));
    }
    catch {
        return [];
    }
}
/**
 * Create a directory if it doesn't exist
 */
export function ensureDirectory(dirPath) {
    try {
        const resolved = resolvePath(dirPath);
        if (!fs.existsSync(resolved)) {
            fs.mkdirSync(resolved, { recursive: true });
            logger.debug(`Created directory: ${dirPath}`);
        }
    }
    catch (error) {
        throw new AnalysisErrorClass(`Failed to create directory: ${dirPath}`, error.message);
    }
}
/**
 * Delete a file or directory
 */
export function deletePathSync(filePath) {
    try {
        const resolved = resolvePath(filePath);
        if (fs.existsSync(resolved)) {
            const stat = fs.statSync(resolved);
            if (stat.isDirectory()) {
                fs.rmSync(resolved, { recursive: true, force: true });
            }
            else {
                fs.unlinkSync(resolved);
            }
            logger.debug(`Deleted: ${filePath}`);
        }
    }
    catch (error) {
        throw new AnalysisErrorClass(`Failed to delete: ${filePath}`, error.message);
    }
}
/**
 * Get git root directory (if in git repo)
 */
export function getGitRoot() {
    try {
        let current = getProjectRoot();
        while (current !== path.dirname(current)) {
            if (fs.existsSync(path.join(current, '.git'))) {
                return current;
            }
            current = path.dirname(current);
        }
    }
    catch {
        // Not in a git repo
    }
    return null;
}
/**
 * Get list of changed files in git
 */
export function getChangedFiles(since) {
    try {
        const { execSync } = require('child_process');
        const cmd = since
            ? `git diff --name-only ${since}`
            : 'git diff --name-only HEAD~1';
        const output = execSync(cmd, {
            cwd: getProjectRoot(),
            encoding: 'utf-8',
        });
        return output
            .split('\n')
            .filter((line) => line.trim().length > 0)
            .map((line) => line.trim());
    }
    catch {
        logger.warn('Failed to get changed files from git');
        return [];
    }
}
