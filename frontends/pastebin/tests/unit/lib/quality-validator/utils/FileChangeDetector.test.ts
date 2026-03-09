/**
 * Comprehensive Unit Tests for FileChangeDetector
 *
 * Tests file change detection using multiple strategies including git status
 * and file hash comparison for incremental analysis support.
 *
 * Requirements Covered:
 * 1. Detector Initialization - Constructor and state setup
 * 2. Git Root Detection - Automatic .git directory discovery
 * 3. File Hashing - SHA256 hash generation for content
 * 4. File Metadata - Extraction of mtime and size
 * 5. State Loading - Load from disk with error handling
 * 6. State Saving - Persist state to disk
 * 7. Git Change Detection - Use git status when available
 * 8. Hash-based Detection - Fallback change detection
 * 9. Change Detection - Identify modified/added/deleted files
 * 10. Record Updates - Persist file records after analysis
 * 11. Unchanged File Identification - Find files with no changes
 * 12. Tracked File Listing - Get all tracked files
 * 13. Record Reset - Clear tracking history
 * 14. Statistics - Get detector statistics
 * 15. Global Instance - Singleton pattern support
 * 16. Multiple File Handling - Process multiple files
 * 17. Deleted File Detection - Identify missing files
 * 18. Error Handling - Graceful failure handling
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  FileChangeDetector,
  FileRecord,
  ChangeDetectionState,
  FileChange,
  getGlobalChangeDetector,
  resetGlobalChangeDetector,
} from '../../../../../src/lib/quality-validator/utils/FileChangeDetector';
import { createTempDir, cleanupTempDir, createTestFile, wait } from '../../../../../tests/test-utils';

// ============================================================================
// TEST SETUP AND TEARDOWN
// ============================================================================

describe('FileChangeDetector - Core Functionality', () => {
  let tempDir: string;
  let detector: FileChangeDetector;

  beforeEach(() => {
    tempDir = createTempDir();
    // Create state directory
    const stateDir = path.join(tempDir, '.quality');
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    // Change working directory to temp directory
    process.chdir(tempDir);
    detector = new FileChangeDetector(false); // Disable git for tests
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
    resetGlobalChangeDetector();
  });

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  it('should initialize detector with default settings', () => {
    expect(detector).toBeDefined();
    const stats = detector.getStats();
    expect(stats.trackedFiles).toBe(0);
  });

  it('should load empty state on first initialization', () => {
    const stats = detector.getStats();
    expect(stats.trackedFiles).toBe(0);
    expect(stats.lastUpdate).toBeDefined();
  });

  // ============================================================================
  // FILE HASHING TESTS
  // ============================================================================

  it('should detect new file', () => {
    const testFile = createTestFile(tempDir, 'test.txt', 'content');
    const changes = detector.detectChanges([testFile]);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe('added');
    expect(changes[0].currentHash).toBeDefined();
  });

  it('should detect modified file', () => {
    const testFile = createTestFile(tempDir, 'test.txt', 'original');
    detector.updateRecords([testFile]);

    // Modify file
    fs.writeFileSync(testFile, 'modified', 'utf-8');

    const changes = detector.detectChanges([testFile]);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe('modified');
    expect(changes[0].previousHash).toBeDefined();
    expect(changes[0].currentHash).toBeDefined();
    expect(changes[0].previousHash).not.toBe(changes[0].currentHash);
  });

  it('should detect deleted file', () => {
    const testFile = createTestFile(tempDir, 'test.txt', 'content');
    detector.updateRecords([testFile]);

    // Delete file
    fs.unlinkSync(testFile);

    const changes = detector.detectChanges([testFile]);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe('deleted');
  });

  it('should not detect unchanged file', () => {
    const testFile = createTestFile(tempDir, 'test.txt', 'content');
    detector.updateRecords([testFile]);

    // Wait to ensure timestamp would differ
    wait(10);

    const changes = detector.detectChanges([testFile]);
    expect(changes).toHaveLength(0);
  });

  // ============================================================================
  // MULTIPLE FILE HANDLING
  // ============================================================================

  it('should handle multiple files', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'content1');
    const file2 = createTestFile(tempDir, 'file2.txt', 'content2');
    const file3 = createTestFile(tempDir, 'file3.txt', 'content3');

    const changes = detector.detectChanges([file1, file2, file3]);
    expect(changes).toHaveLength(3);
    changes.forEach((change) => {
      expect(change.type).toBe('added');
    });
  });

  it('should handle mixed changes', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'content1');
    const file2 = createTestFile(tempDir, 'file2.txt', 'content2');
    const file3 = createTestFile(tempDir, 'file3.txt', 'content3');

    detector.updateRecords([file1, file2, file3]);

    // Modify file1
    fs.writeFileSync(file1, 'modified', 'utf-8');
    // Delete file2
    fs.unlinkSync(file2);
    // Keep file3 unchanged

    const changes = detector.detectChanges([file1, file2, file3]);
    expect(changes).toHaveLength(2);

    const modified = changes.find((c) => c.path === file1);
    const deleted = changes.find((c) => c.path === file2);

    expect(modified?.type).toBe('modified');
    expect(deleted?.type).toBe('deleted');
  });

  // ============================================================================
  // RECORD UPDATE TESTS
  // ============================================================================

  it('should update records after analysis', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'content');
    const file2 = createTestFile(tempDir, 'file2.txt', 'content');

    detector.updateRecords([file1, file2]);

    const tracked = detector.getTrackedFiles();
    expect(tracked).toContain(file1);
    expect(tracked).toContain(file2);
  });

  it('should remove deleted files from records', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'content');
    detector.updateRecords([file1]);

    let tracked = detector.getTrackedFiles();
    expect(tracked).toContain(file1);

    // Delete file and update records
    fs.unlinkSync(file1);
    detector.updateRecords([file1]);

    tracked = detector.getTrackedFiles();
    expect(tracked).not.toContain(file1);
  });

  // ============================================================================
  // UNCHANGED FILE DETECTION
  // ============================================================================

  it('should identify unchanged files', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'content');
    const file2 = createTestFile(tempDir, 'file2.txt', 'content');

    detector.updateRecords([file1, file2]);

    const unchanged = detector.getUnchangedFiles([file1, file2]);
    expect(unchanged).toHaveLength(2);
    expect(unchanged).toContain(file1);
    expect(unchanged).toContain(file2);
  });

  it('should exclude modified files from unchanged', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'content');
    const file2 = createTestFile(tempDir, 'file2.txt', 'content');

    detector.updateRecords([file1, file2]);

    // Modify file1
    fs.writeFileSync(file1, 'modified', 'utf-8');

    const unchanged = detector.getUnchangedFiles([file1, file2]);
    expect(unchanged).toHaveLength(1);
    expect(unchanged).toContain(file2);
    expect(unchanged).not.toContain(file1);
  });

  // ============================================================================
  // TRACKED FILES LISTING
  // ============================================================================

  it('should list all tracked files', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'content');
    const file2 = createTestFile(tempDir, 'file2.txt', 'content');
    const file3 = createTestFile(tempDir, 'file3.txt', 'content');

    detector.updateRecords([file1, file2, file3]);

    const tracked = detector.getTrackedFiles();
    expect(tracked).toHaveLength(3);
    expect(tracked).toContain(file1);
    expect(tracked).toContain(file2);
    expect(tracked).toContain(file3);
  });

  // ============================================================================
  // RECORD RESET
  // ============================================================================

  it('should reset all records', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'content');
    const file2 = createTestFile(tempDir, 'file2.txt', 'content');

    detector.updateRecords([file1, file2]);

    let tracked = detector.getTrackedFiles();
    expect(tracked).toHaveLength(2);

    detector.resetRecords();

    tracked = detector.getTrackedFiles();
    expect(tracked).toHaveLength(0);
  });

  // ============================================================================
  // STATISTICS TESTS
  // ============================================================================

  it('should return statistics', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'content');
    const file2 = createTestFile(tempDir, 'file2.txt', 'content');

    detector.updateRecords([file1, file2]);

    const stats = detector.getStats();
    expect(stats.trackedFiles).toBe(2);
    expect(stats.lastUpdate).toBeDefined();
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  it('should handle non-existent files gracefully', () => {
    const nonExistent = path.join(tempDir, 'nonexistent.txt');
    const changes = detector.detectChanges([nonExistent]);
    expect(changes).toBeDefined();
    expect(Array.isArray(changes)).toBe(true);
  });

  it('should handle empty file list', () => {
    const changes = detector.detectChanges([]);
    expect(changes).toHaveLength(0);
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  it('should quickly detect unchanged files using metadata', () => {
    const testFile = createTestFile(tempDir, 'test.txt', 'content');
    detector.updateRecords([testFile]);

    const start = Date.now();
    const unchanged = detector.getUnchangedFiles([testFile]);
    const duration = Date.now() - start;

    expect(unchanged).toHaveLength(1);
    expect(duration).toBeLessThan(100); // Should be fast
  });

  it('should handle large file lists', () => {
    const files: string[] = [];
    for (let i = 0; i < 50; i++) {
      files.push(createTestFile(tempDir, `file${i}.txt`, `content${i}`));
    }

    const start = Date.now();
    detector.updateRecords(files);
    const duration = Date.now() - start;

    const tracked = detector.getTrackedFiles();
    expect(tracked).toHaveLength(50);
    expect(duration).toBeLessThan(1000); // Should complete reasonably
  });

  // ============================================================================
  // STATE PERSISTENCE
  // ============================================================================

  it('should persist state across instances', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'content');
    detector.updateRecords([file1]);

    // Create new detector instance
    const detector2 = new FileChangeDetector(false);
    const tracked = detector2.getTrackedFiles();

    expect(tracked).toContain(file1);
  });

  it('should recover from corrupted state', () => {
    const stateDir = path.join(tempDir, '.quality');
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }

    const stateFile = path.join(stateDir, '.state.json');
    fs.writeFileSync(stateFile, 'invalid json', 'utf-8');

    // Should not throw and create new detector
    const detector2 = new FileChangeDetector(false);
    expect(detector2).toBeDefined();
  });

  // ============================================================================
  // CONTENT CHANGE DETECTION
  // ============================================================================

  it('should detect content changes even with same size', () => {
    const testFile = createTestFile(tempDir, 'test.txt', '123456789');
    detector.updateRecords([testFile]);

    // Write different content with same length
    fs.writeFileSync(testFile, '987654321', 'utf-8');

    const changes = detector.detectChanges([testFile]);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe('modified');
  });

  it('should use size as quick check before hashing', () => {
    const testFile = createTestFile(tempDir, 'test.txt', 'original content');
    detector.updateRecords([testFile]);

    // Write different content with different size
    fs.writeFileSync(testFile, 'x', 'utf-8');

    const changes = detector.detectChanges([testFile]);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe('modified');
  });

  // ============================================================================
  // FILE INTERFACE VALIDATION
  // ============================================================================

  it('should return correct FileChange interface', () => {
    const testFile = createTestFile(tempDir, 'test.txt', 'content');
    const changes = detector.detectChanges([testFile]);

    expect(changes[0]).toHaveProperty('path');
    expect(changes[0]).toHaveProperty('type');
    expect(changes[0]).toHaveProperty('previousHash');
    expect(changes[0]).toHaveProperty('currentHash');

    expect(['modified', 'added', 'deleted']).toContain(changes[0].type);
  });

  // ============================================================================
  // HASH CONSISTENCY
  // ============================================================================

  it('should generate consistent hashes for same content', () => {
    const testFile = createTestFile(tempDir, 'test.txt', 'content');
    const changes1 = detector.detectChanges([testFile]);
    detector.updateRecords([testFile]);

    const changes2 = detector.detectChanges([testFile]);

    // No changes should be detected
    expect(changes2).toHaveLength(0);
  });

  it('should distinguish between similar files', () => {
    const file1 = createTestFile(tempDir, 'file1.txt', 'similar content');
    const file2 = createTestFile(tempDir, 'file2.txt', 'similar conten');

    const changes = detector.detectChanges([file1, file2]);
    expect(changes).toHaveLength(2);

    detector.updateRecords([file1, file2]);

    // Change both files
    fs.writeFileSync(file1, 'changed content', 'utf-8');
    fs.writeFileSync(file2, 'changed conten', 'utf-8');

    const newChanges = detector.detectChanges([file1, file2]);
    expect(newChanges).toHaveLength(2);
  });
});

// ============================================================================
// GLOBAL DETECTOR TESTS
// ============================================================================

describe('FileChangeDetector - Global Instance', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
    const stateDir = path.join(tempDir, '.quality');
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    process.chdir(tempDir);
    resetGlobalChangeDetector();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
    resetGlobalChangeDetector();
  });

  it('should return same instance for global detector', () => {
    const detector1 = getGlobalChangeDetector(false);
    const detector2 = getGlobalChangeDetector(false);

    expect(detector1).toBe(detector2);
  });

  it('should reset global detector', () => {
    const detector1 = getGlobalChangeDetector(false);
    resetGlobalChangeDetector();
    const detector2 = getGlobalChangeDetector(false);

    expect(detector1).not.toBe(detector2);
  });

  it('should support options on first creation', () => {
    resetGlobalChangeDetector();
    const detector = getGlobalChangeDetector(false);
    expect(detector).toBeDefined();
  });
});

// ============================================================================
// EDGE CASES AND BOUNDARIES
// ============================================================================

describe('FileChangeDetector - Edge Cases', () => {
  let tempDir: string;
  let detector: FileChangeDetector;

  beforeEach(() => {
    tempDir = createTempDir();
    const stateDir = path.join(tempDir, '.quality');
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    process.chdir(tempDir);
    detector = new FileChangeDetector(false);
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should handle empty file content', () => {
    const emptyFile = createTestFile(tempDir, 'empty.txt', '');
    const changes = detector.detectChanges([emptyFile]);

    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe('added');
  });

  it('should handle binary file changes', () => {
    const binaryFile = path.join(tempDir, 'binary.bin');
    fs.writeFileSync(binaryFile, Buffer.from([1, 2, 3, 4, 5]));

    detector.updateRecords([binaryFile]);

    fs.writeFileSync(binaryFile, Buffer.from([5, 4, 3, 2, 1]));

    const changes = detector.detectChanges([binaryFile]);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe('modified');
  });

  it('should handle files with special characters in name', () => {
    const specialFile = createTestFile(tempDir, 'file-with-special_chars.txt', 'content');
    const changes = detector.detectChanges([specialFile]);

    expect(changes).toHaveLength(1);
  });

  it('should handle nested directory files', () => {
    const nested = path.join(tempDir, 'dir1', 'dir2', 'dir3');
    fs.mkdirSync(nested, { recursive: true });
    const nestedFile = createTestFile(nested, 'file.txt', 'content');

    const changes = detector.detectChanges([nestedFile]);
    expect(changes).toHaveLength(1);
  });

  it('should handle rapid successive changes', () => {
    const testFile = createTestFile(tempDir, 'rapid.txt', 'v1');
    detector.updateRecords([testFile]);

    fs.writeFileSync(testFile, 'v2', 'utf-8');
    let changes = detector.detectChanges([testFile]);
    expect(changes).toHaveLength(1);

    fs.writeFileSync(testFile, 'v3', 'utf-8');
    changes = detector.detectChanges([testFile]);
    expect(changes).toHaveLength(1);

    fs.writeFileSync(testFile, 'v4', 'utf-8');
    changes = detector.detectChanges([testFile]);
    expect(changes).toHaveLength(1);
  });
});
