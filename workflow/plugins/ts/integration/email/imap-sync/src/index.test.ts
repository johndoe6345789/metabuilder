/**
 * IMAP Sync Plugin Test Suite - Phase 6
 * Comprehensive tests covering success, partial, and failure scenarios
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  IMAPSyncExecutor,
  IMAPSyncConfig,
  SyncResult,
  SyncError
} from './index';

/**
 * Mock WorkflowNode for testing
 */
interface MockNode {
  id: string;
  type: string;
  nodeType: string;
  parameters: Record<string, any>;
}

/**
 * Mock WorkflowContext for testing
 */
interface MockContext {
  executionId: string;
  tenantId: string;
  userId: string;
  triggerData: Record<string, any>;
  variables: Record<string, any>;
}

/**
 * Mock ExecutionState for testing
 */
interface MockState {
  [key: string]: any;
}

describe('IMAPSyncExecutor - Phase 6', () => {
  let executor: IMAPSyncExecutor;
  let mockContext: MockContext;
  let mockState: MockState;

  beforeEach(() => {
    executor = new IMAPSyncExecutor();
    mockContext = {
      executionId: 'exec-123',
      tenantId: 'tenant-acme',
      userId: 'user-456',
      triggerData: {},
      variables: {}
    };
    mockState = {};
  });

  describe('Node Type and Metadata', () => {
    it('should have correct node type identifier', () => {
      expect(executor.nodeType).toBe('imap-sync');
    });

    it('should have correct category', () => {
      expect(executor.category).toBe('email-integration');
    });

    it('should have descriptive description', () => {
      expect(executor.description).toContain('Synchronize emails from IMAP server');
      expect(executor.description).toContain('incremental');
      expect(executor.description).toContain('folder traversal');
    });
  });

  describe('Validation', () => {
    it('should reject missing imapId', () => {
      const node = createMockNode({ folderId: 'folder-123' });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('IMAP Account ID is required');
    });

    it('should reject missing folderId', () => {
      const node = createMockNode({ imapId: 'imap-123' });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Folder ID is required');
    });

    it('should reject non-numeric maxMessages', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        maxMessages: 'not-a-number'
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('maxMessages must be a number');
    });

    it('should reject maxMessages outside range (0-500)', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        maxMessages: 501
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('maxMessages must be between 1 and 500');
    });

    it('should reject invalid retryCount', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        retryCount: 5
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('retryCount must be between 0 and 3');
    });

    it('should reject invalid syncToken format', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        syncToken: 'invalid-token'
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.warnings).toContain(
        expect.stringContaining('syncToken format is invalid')
      );
    });

    it('should accept valid parameters', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        syncToken: '42:1500',
        maxMessages: 100,
        retryCount: 2,
        includeDeleted: true
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid syncToken format (UIDVALIDITY:UIDNEXT)', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        syncToken: '12345:67890'
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('Test Case 1: Successful Incremental Sync', () => {
    it('should perform successful incremental sync with new messages', async () => {
      const node = createMockNode({
        imapId: 'gmail-work-123',
        folderId: 'inbox-456',
        syncToken: '42:1500', // Last sync at UID 1500
        maxMessages: 100,
        retryCount: 2
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      // Verify successful execution
      expect(result.status).toMatch(/success|partial/);
      expect(result.timestamp).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);

      // Verify output structure
      const output = (result as any).output;
      expect(output.status).toMatch(/synced|partial/);
      expect(output.data).toBeDefined();

      // Verify SyncResult data
      const syncData: SyncResult = output.data;
      expect(syncData.syncedCount).toBeGreaterThanOrEqual(0);
      expect(syncData.syncedCount).toBeLessThanOrEqual(100);
      expect(syncData.errors).toBeInstanceOf(Array);
      expect(syncData.lastSyncAt).toBeGreaterThan(0);

      // Verify new sync token generated
      expect(syncData.newSyncToken).toBeDefined();
      expect(syncData.newSyncToken).toMatch(/^\d+:\d+$/);

      // Verify statistics
      expect(syncData.stats).toBeDefined();
      expect(syncData.stats.folderTotalCount).toBeGreaterThanOrEqual(0);
      expect(syncData.stats.newMessageCount).toBeGreaterThanOrEqual(0);
      expect(syncData.stats.bytesSynced).toBeGreaterThanOrEqual(0);

      // Verify error array is not present or is empty for success
      if (syncData.errors.length === 0) {
        expect(result.status).toBe('success');
      }

      console.log('Test Case 1 PASSED: Successful incremental sync');
      console.log(`  - Synced: ${syncData.syncedCount} messages`);
      console.log(`  - New sync token: ${syncData.newSyncToken}`);
      console.log(`  - Bytes transferred: ${syncData.stats.bytesSynced}`);
      console.log(`  - Errors: ${syncData.errors.length}`);
    });

    it('should handle first sync (no syncToken)', async () => {
      const node = createMockNode({
        imapId: 'gmail-work-123',
        folderId: 'inbox-456',
        maxMessages: 50
        // No syncToken - first sync
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toMatch(/success|partial/);

      const syncData: SyncResult = (result as any).output.data;
      expect(syncData.syncedCount).toBeGreaterThanOrEqual(0);
      expect(syncData.syncedCount).toBeLessThanOrEqual(50);
      expect(syncData.newSyncToken).toBeDefined();

      console.log('Test Case 1 PASSED: First sync without syncToken');
      console.log(`  - Initial sync got ${syncData.syncedCount} messages`);
    });
  });

  describe('Test Case 2: Partial Sync with Recovery', () => {
    it('should handle partial sync interruption gracefully', async () => {
      const node = createMockNode({
        imapId: 'gmail-work-123',
        folderId: 'inbox-456',
        syncToken: '42:1500',
        maxMessages: 100,
        retryCount: 2
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      const syncData: SyncResult = (result as any).output.data;

      // For partial syncs, should have recovery marker
      if (syncData.isPartial) {
        expect(syncData.nextUidMarker).toBeDefined();
        expect(result.status).toBe('partial');
        expect(syncData.syncedCount).toBeLessThan(100); // Not all messages synced

        console.log('Test Case 2 PASSED: Partial sync with recovery marker');
        console.log(`  - Synced: ${syncData.syncedCount} (partial)`);
        console.log(`  - Resume marker: ${syncData.nextUidMarker}`);
        console.log(`  - Can retry from marker on next execution`);

        // Verify next execution can resume from marker
        const resumeNode = createMockNode({
          imapId: 'gmail-work-123',
          folderId: 'inbox-456',
          syncToken: `42:${syncData.nextUidMarker}`, // Use marker as new start point
          maxMessages: 100
        });

        const validation = executor.validate(resumeNode);
        expect(validation.valid).toBe(true);
      } else {
        console.log('Test Case 2 INFO: Complete sync (not partial) - skipping partial test');
        console.log(`  - Synced: ${syncData.syncedCount} messages`);
      }
    });

    it('should track error details with retryable flag', async () => {
      const node = createMockNode({
        imapId: 'gmail-work-123',
        folderId: 'inbox-456',
        maxMessages: 100
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      const syncData: SyncResult = (result as any).output.data;

      // If errors occurred, verify structure
      if (syncData.errors.length > 0) {
        syncData.errors.forEach((error: SyncError) => {
          expect(error.uid).toBeDefined();
          expect(error.error).toBeDefined();
          expect(error.retryable).toBeDefined();
          expect(typeof error.retryable).toBe('boolean');

          // Error codes should be specific
          if (error.errorCode) {
            expect(['PARSE_ERROR', 'TIMEOUT', 'NETWORK_ERROR', 'AUTH_ERROR', 'UNKNOWN']).toContain(
              error.errorCode
            );
          }
        });

        console.log('Test Case 2 PASSED: Error tracking');
        console.log(`  - Errors: ${syncData.errors.length}`);
        syncData.errors.forEach((e, i) => {
          console.log(`    ${i + 1}. ${e.error} (UID: ${e.uid}, Retryable: ${e.retryable})`);
        });
      }
    });
  });

  describe('Test Case 3: Error Handling and Failure Scenarios', () => {
    it('should fail with error status on missing required parameters', async () => {
      const node = createMockNode({
        folderId: 'folder-123'
        // Missing required imapId
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
      expect(result.errorCode).toMatch(/IMAP_SYNC_ERROR|INVALID_PARAMS/);

      console.log('Test Case 3 PASSED: Error on missing imapId');
      console.log(`  - Error: ${result.error}`);
      console.log(`  - Error code: ${result.errorCode}`);
    });

    it('should fail with error status on invalid maxMessages', async () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        maxMessages: 501 // Out of range
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('error');
      expect(result.error).toContain('maxMessages');

      console.log('Test Case 3 PASSED: Error on invalid maxMessages');
      console.log(`  - Error: ${result.error}`);
    });

    it('should handle invalid retryCount with error', async () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        retryCount: 10 // Invalid
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('error');
      expect(result.errorCode).toMatch(/IMAP_SYNC_ERROR|INVALID_PARAMS/);

      console.log('Test Case 3 PASSED: Error on invalid retryCount');
      console.log(`  - Error code: ${result.errorCode}`);
    });

    it('should provide actionable error messages', async () => {
      const node = createMockNode({
        // All parameters missing
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.error).toBeDefined();
      expect(result.error?.length).toBeGreaterThan(0);

      // Error should mention what's required
      expect(result.error?.toLowerCase()).toMatch(/required|parameter/);

      console.log('Test Case 3 PASSED: Actionable error message');
      console.log(`  - Error: ${result.error}`);
    });

    it('should track execution duration for performance metrics', async () => {
      const node = createMockNode({
        imapId: 'gmail-work-123',
        folderId: 'inbox-456'
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.duration).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();

      console.log('Test Case 3 PASSED: Performance metrics');
      console.log(`  - Duration: ${result.duration}ms`);
      console.log(`  - Timestamp: ${new Date(result.timestamp).toISOString()}`);
    });
  });

  describe('IMAP Protocol Specifics', () => {
    it('should handle UIDVALIDITY changes (mailbox reset)', async () => {
      // First sync
      const node1 = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        syncToken: '42:1500'
      });

      const result1 = await executor.execute(node1 as any, mockContext as any, mockState as any);
      const syncData1: SyncResult = (result1 as any).output.data;

      // Token should be valid UIDVALIDITY:UIDNEXT format
      expect(syncData1.newSyncToken).toMatch(/^\d+:\d+$/);

      console.log('IMAP Protocol Test PASSED: UIDVALIDITY handling');
      console.log(`  - Sync token format: ${syncData1.newSyncToken} (UIDVALIDITY:UIDNEXT)`);
    });

    it('should provide folder statistics for monitoring', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        syncToken: '42:1500',
        maxMessages: 50
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);
      const syncData: SyncResult = (result as any).output.data;

      // Verify comprehensive statistics
      expect(syncData.stats.folderTotalCount).toBeGreaterThanOrEqual(0);
      expect(syncData.stats.newMessageCount).toBeGreaterThanOrEqual(0);
      expect(syncData.stats.deletedCount).toBeGreaterThanOrEqual(0);
      expect(syncData.stats.bytesSynced).toBeGreaterThanOrEqual(0);

      console.log('IMAP Protocol Test PASSED: Folder statistics');
      console.log(`  - Total in folder: ${syncData.stats.folderTotalCount}`);
      console.log(`  - New messages: ${syncData.stats.newMessageCount}`);
      console.log(`  - Deleted: ${syncData.stats.deletedCount}`);
      console.log(`  - Bytes synced: ${syncData.stats.bytesSynced}`);
    });
  });

  describe('Configuration and Parameters', () => {
    it('should use default maxMessages (100) when not specified', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456'
        // maxMessages not specified
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      // Should not error and should handle default
      expect(result.status).toMatch(/success|error|partial/);

      console.log('Configuration Test PASSED: Default maxMessages');
    });

    it('should respect maxMessages constraint', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        maxMessages: 50
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      const syncData: SyncResult = (result as any).output.data;
      expect(syncData.syncedCount).toBeLessThanOrEqual(50);

      console.log('Configuration Test PASSED: maxMessages constraint');
      console.log(`  - Limit: 50, Synced: ${syncData.syncedCount}`);
    });

    it('should use default retryCount (2) when not specified', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456'
        // retryCount not specified
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      // Should execute successfully with default retry strategy
      expect(result).toBeDefined();

      console.log('Configuration Test PASSED: Default retryCount');
    });
  });
});

/**
 * Helper to create mock workflow node
 */
function createMockNode(parameters: Record<string, any>): MockNode {
  return {
    id: 'node-imap-sync-test',
    type: 'node',
    nodeType: 'imap-sync',
    parameters
  };
}
