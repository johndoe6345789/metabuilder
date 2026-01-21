/**
 * Tests for FileChangeDetector
 * Validates change detection and file tracking
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { FileChangeDetector } from './FileChangeDetector';
import { writeFile, deletePathSync, pathExists, ensureDirectory } from './fileSystem';

describe('FileChangeDetector', () => {
  let detector: FileChangeDetector;
  const testDir = '.quality/.test-detector';
  const testFile = `${testDir}/test-file.ts`;

  beforeEach(() => {
    ensureDirectory(testDir);
    detector = new FileChangeDetector(false); // Disable git detection for tests
  });

  afterEach(() => {
    try {
      detector.resetRecords();
      if (pathExists(testDir)) {
        deletePathSync(testDir);
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Change Detection', () => {
    it('should detect new files', () => {
      writeFile(testFile, 'console.log("test");');

      const changes = detector.detectChanges([testFile]);

      expect(changes).toHaveLength(1);
      expect(changes[0].path).toBe(testFile);
      expect(changes[0].type).toBe('added');
    });

    it('should detect modified files', () => {
      // Create initial file
      writeFile(testFile, 'console.log("original");');
      detector.updateRecords([testFile]);

      // Modify file
      writeFile(testFile, 'console.log("modified");');
      const changes = detector.detectChanges([testFile]);

      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('modified');
    });

    it('should detect unchanged files', () => {
      // Create and record file
      writeFile(testFile, 'console.log("test");');
      detector.updateRecords([testFile]);

      // Don't modify it
      const changes = detector.detectChanges([testFile]);

      expect(changes).toHaveLength(0);
    });

    it('should not detect changes for untracked files', () => {
      const untracked = `${testDir}/untracked.ts`;
      writeFile(untracked, 'code');

      const changes = detector.detectChanges([untracked]);

      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('added');
    });
  });

  describe('File Recording', () => {
    it('should record file metadata', () => {
      writeFile(testFile, 'content');
      detector.updateRecords([testFile]);

      const stats = detector.getStats();
      expect(stats.trackedFiles).toBe(1);
    });

    it('should update records after changes', () => {
      writeFile(testFile, 'initial');
      detector.updateRecords([testFile]);

      writeFile(testFile, 'updated');
      detector.updateRecords([testFile]);

      const changes = detector.detectChanges([testFile]);
      expect(changes).toHaveLength(0);
    });

    it('should reset records', () => {
      writeFile(testFile, 'content');
      detector.updateRecords([testFile]);

      const statsBefore = detector.getStats();
      expect(statsBefore.trackedFiles).toBeGreaterThan(0);

      detector.resetRecords();

      const statsAfter = detector.getStats();
      expect(statsAfter.trackedFiles).toBe(0);
    });
  });

  describe('Hash Comparison', () => {
    it('should detect when hash changes', () => {
      const file = `${testDir}/hash-test.ts`;

      // Create file
      writeFile(file, 'console.log("v1");');
      detector.updateRecords([file]);

      // Modify content
      writeFile(file, 'console.log("v2");');
      const changes = detector.detectChanges([file]);

      expect(changes).toHaveLength(1);
      expect(changes[0].previousHash).toBeDefined();
      expect(changes[0].currentHash).toBeDefined();
      expect(changes[0].previousHash).not.toBe(changes[0].currentHash);
    });

    it('should store hash in records', () => {
      writeFile(testFile, 'test content');
      detector.updateRecords([testFile]);

      const tracked = detector.getTrackedFiles();
      expect(tracked).toContain(testFile);
    });
  });

  describe('Performance', () => {
    it('should handle multiple file changes efficiently', () => {
      const files: string[] = [];
      for (let i = 0; i < 10; i++) {
        const file = `${testDir}/file-${i}.ts`;
        writeFile(file, `content-${i}`);
        files.push(file);
      }

      // Initial recording
      const recordStart = performance.now();
      detector.updateRecords(files);
      const recordTime = performance.now() - recordStart;

      // Modify half the files
      for (let i = 0; i < 5; i++) {
        writeFile(files[i], `modified-${i}`);
      }

      // Detect changes
      const detectStart = performance.now();
      const changes = detector.detectChanges(files);
      const detectTime = performance.now() - detectStart;

      expect(changes).toHaveLength(5);
      expect(detectTime).toBeLessThan(100); // Should be fast
    });

    it('should quickly identify unchanged files', () => {
      const files: string[] = [];
      for (let i = 0; i < 20; i++) {
        const file = `${testDir}/unchanged-${i}.ts`;
        writeFile(file, `stable content ${i}`);
        files.push(file);
      }

      detector.updateRecords(files);

      const start = performance.now();
      const changes = detector.detectChanges(files);
      const duration = performance.now() - start;

      expect(changes).toHaveLength(0);
      expect(duration).toBeLessThan(50); // Should be very fast
    });
  });

  describe('Statistics', () => {
    it('should report tracked files count', () => {
      writeFile(testFile, 'content');
      detector.updateRecords([testFile]);

      const stats = detector.getStats();
      expect(stats.trackedFiles).toBe(1);
    });

    it('should report last update time', () => {
      writeFile(testFile, 'content');
      detector.updateRecords([testFile]);

      const stats = detector.getStats();
      expect(stats.lastUpdate).toBeDefined();
      expect(new Date(stats.lastUpdate).getTime()).toBeGreaterThan(0);
    });
  });

  describe('Unchanged File Detection', () => {
    it('should identify unchanged files', () => {
      const file1 = `${testDir}/file1.ts`;
      const file2 = `${testDir}/file2.ts`;

      writeFile(file1, 'content1');
      writeFile(file2, 'content2');

      detector.updateRecords([file1, file2]);

      // Only modify file1
      writeFile(file1, 'modified');

      const unchanged = detector.getUnchangedFiles([file1, file2]);
      expect(unchanged).toContain(file2);
      expect(unchanged).not.toContain(file1);
    });

    it('should return empty array when all files changed', () => {
      const file1 = `${testDir}/file1.ts`;
      const file2 = `${testDir}/file2.ts`;

      writeFile(file1, 'content1');
      writeFile(file2, 'content2');

      detector.updateRecords([file1, file2]);

      writeFile(file1, 'modified1');
      writeFile(file2, 'modified2');

      const unchanged = detector.getUnchangedFiles([file1, file2]);
      expect(unchanged).toHaveLength(0);
    });
  });
});
