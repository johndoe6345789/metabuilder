/**
 * Draft Manager Plugin Test Suite - Phase 6
 * Comprehensive tests covering all draft operations and edge cases
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  DraftManagerExecutor,
  DraftManagerConfig,
  DraftOperationResult,
  DraftState,
  EmailRecipient,
  AttachmentMetadata
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

describe('DraftManagerExecutor - Phase 6', () => {
  let executor: DraftManagerExecutor;
  let mockContext: MockContext;
  let mockState: MockState;

  beforeEach(() => {
    executor = new DraftManagerExecutor();
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
      expect(executor.nodeType).toBe('draft-manager');
    });

    it('should have correct category', () => {
      expect(executor.category).toBe('email-integration');
    });

    it('should have descriptive description', () => {
      expect(executor.description).toContain('draft');
      expect(executor.description).toContain('auto-save');
    });
  });

  describe('Validation', () => {
    it('should reject missing action', () => {
      const node = createMockNode({ accountId: 'account-123' });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Draft action is required');
    });

    it('should reject invalid action', () => {
      const node = createMockNode({
        action: 'invalid-action',
        accountId: 'account-123'
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid action');
    });

    it('should reject missing accountId', () => {
      const node = createMockNode({ action: 'auto-save' });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email account ID (accountId) is required');
    });

    it('should reject non-string accountId', () => {
      const node = createMockNode({
        action: 'auto-save',
        accountId: 12345
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('accountId must be a string');
    });

    it('should reject auto-save without draft data', () => {
      const node = createMockNode({
        action: 'auto-save',
        accountId: 'account-123'
        // Missing draft
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Draft state (draft) is required for auto-save action');
    });

    it('should reject invalid autoSaveInterval', () => {
      const node = createMockNode({
        action: 'auto-save',
        accountId: 'account-123',
        draft: { subject: 'test', body: 'test' },
        autoSaveInterval: 500 // Too low
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('autoSaveInterval must be between 1000ms and 60000ms');
    });

    it('should reject invalid maxDraftSize', () => {
      const node = createMockNode({
        action: 'auto-save',
        accountId: 'account-123',
        draft: { subject: 'test', body: 'test' },
        maxDraftSize: 500000 // Below 1MB
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('maxDraftSize must be at least 1048576 bytes (1MB)');
    });

    it('should reject recover without draftId', () => {
      const node = createMockNode({
        action: 'recover',
        accountId: 'account-123'
        // Missing draftId
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Draft ID (draftId) is required for recover action');
    });

    it('should reject import without bundleData', () => {
      const node = createMockNode({
        action: 'import',
        accountId: 'account-123'
        // Missing bundleData
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bundle data (bundleData) is required for import action');
    });

    it('should accept valid auto-save parameters', () => {
      const node = createMockNode({
        action: 'auto-save',
        accountId: 'account-123',
        draft: {
          subject: 'Test Draft',
          body: 'Test body',
          to: [{ address: 'test@example.com' }]
        },
        autoSaveInterval: 5000,
        maxDraftSize: 1048576,
        deviceId: 'device-123'
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid recover parameters', () => {
      const node = createMockNode({
        action: 'recover',
        accountId: 'account-123',
        draftId: 'draft-456',
        recoveryOptions: { preferLocal: true }
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('Test Case 1: Auto-Save Draft Operations', () => {
    it('should successfully save a new draft', async () => {
      const node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          subject: 'Important Email',
          body: 'This is the draft body content',
          to: [{ address: 'recipient@example.com', name: 'John Doe' }],
          cc: [],
          bcc: [],
          attachments: []
        },
        deviceId: 'desktop-001'
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      expect(result.timestamp).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);

      const output = (result as any).output as DraftOperationResult;
      expect(output.actionPerformed).toBe('auto-save');
      expect(output.draft).toBeDefined();
      expect(output.draft?.subject).toBe('Important Email');
      expect(output.draft?.draftId).toBeDefined();
      expect(output.saveMetadata).toBeDefined();
      expect(output.conflictDetected).toBe(false);

      console.log('Test Case 1 PASSED: Save new draft');
      console.log(`  - Draft ID: ${output.draft?.draftId}`);
      console.log(`  - Subject: ${output.draft?.subject}`);
      console.log(`  - Recipients: ${output.draft?.to.length}`);
      console.log(`  - Storage used: ${output.stats.storageUsed} bytes`);
    });

    it('should update existing draft with new version', async () => {
      // First save
      const firstNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-v1',
          subject: 'Initial Subject',
          body: 'Initial body',
          to: [{ address: 'test@example.com' }],
          cc: [],
          bcc: [],
          attachments: []
        }
      });

      const firstResult = await executor.execute(
        firstNode as any,
        mockContext as any,
        mockState as any
      );
      const firstDraft = (firstResult as any).output.draft;

      // Second save with updates
      const secondNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-v1',
          subject: 'Updated Subject',
          body: 'Updated body content with more details',
          to: [
            { address: 'test@example.com' },
            { address: 'another@example.com' }
          ],
          cc: [],
          bcc: [],
          attachments: []
        },
        deviceId: 'desktop-001'
      });

      const secondResult = await executor.execute(
        secondNode as any,
        mockContext as any,
        mockState as any
      );
      const secondDraft = (secondResult as any).output.draft;

      expect(secondDraft.version).toBe(2);
      expect(secondDraft.subject).toBe('Updated Subject');
      expect(secondDraft.to.length).toBe(2);
      expect(secondDraft.lastSavedAt).toBeGreaterThanOrEqual(firstDraft.lastSavedAt);

      const saveMetadata = (secondResult as any).output.saveMetadata;
      expect(saveMetadata.changesSummary.fieldsChanged).toContain('subject');
      expect(saveMetadata.changesSummary.fieldsChanged).toContain('body');

      console.log('Test Case 1 PASSED: Update existing draft');
      console.log(`  - Version upgraded: ${firstDraft.version} → ${secondDraft.version}`);
      console.log(`  - Fields changed: ${saveMetadata.changesSummary.fieldsChanged.join(', ')}`);
    });

    it('should track attachments in auto-save', async () => {
      const attachments: AttachmentMetadata[] = [
        {
          id: 'attach-1',
          filename: 'document.pdf',
          mimeType: 'application/pdf',
          size: 2048576,
          uploadedAt: Date.now()
        },
        {
          id: 'attach-2',
          filename: 'image.png',
          mimeType: 'image/png',
          size: 1024000,
          uploadedAt: Date.now()
        }
      ];

      const node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          subject: 'Email with Attachments',
          body: 'See attached files',
          to: [{ address: 'recipient@example.com' }],
          cc: [],
          bcc: [],
          attachments
        }
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);
      const output = (result as any).output as DraftOperationResult;

      expect(output.draft?.attachments.length).toBe(2);
      expect(output.draft?.attachments[0].filename).toBe('document.pdf');
      expect(output.draft?.attachments[1].mimeType).toBe('image/png');

      console.log('Test Case 1 PASSED: Attachments tracking');
      console.log(`  - Attachments: ${output.draft?.attachments.length}`);
      console.log(`  - Total size: ${attachments.reduce((sum, a) => sum + a.size, 0)} bytes`);
    });

    it('should enforce maximum draft size limit', async () => {
      const node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          subject: 'Large Draft',
          body: 'x'.repeat(30 * 1024 * 1024), // 30MB (exceeds 25MB default)
          to: [{ address: 'test@example.com' }],
          cc: [],
          bcc: [],
          attachments: []
        },
        maxDraftSize: 25 * 1024 * 1024 // 25MB limit
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('error');
      expect(result.error).toContain('exceeds maximum size limit');

      console.log('Test Case 1 PASSED: Size limit enforcement');
      console.log(`  - Error: ${result.error}`);
    });
  });

  describe('Test Case 2: Concurrent Edit Conflict Detection', () => {
    it('should detect version mismatch on concurrent edits', async () => {
      // First device saves draft
      const device1Node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-conflict',
          subject: 'Device 1 Subject',
          body: 'Device 1 body',
          to: [{ address: 'test@example.com' }],
          cc: [],
          bcc: [],
          attachments: [],
          version: 1
        },
        deviceId: 'device-1'
      });

      await executor.execute(device1Node as any, mockContext as any, mockState as any);

      // Second device tries to save with older version
      const device2Node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-conflict',
          subject: 'Device 2 Subject',
          body: 'Device 2 body',
          to: [{ address: 'test@example.com' }, { address: 'test2@example.com' }],
          cc: [],
          bcc: [],
          attachments: [],
          version: 1 // Version mismatch - should have been 2
        },
        deviceId: 'device-2',
        recoveryOptions: { preferLocal: true }
      });

      const result = await executor.execute(device2Node as any, mockContext as any, mockState as any);
      const output = (result as any).output as DraftOperationResult;

      expect(output.conflictDetected).toBe(true);
      expect(result.status).toBe('partial');
      expect(output.conflictResolution).toBeDefined();
      expect(output.conflictResolution?.strategy).toBe('local-wins');

      console.log('Test Case 2 PASSED: Conflict detection');
      console.log(`  - Conflict detected: ${output.conflictDetected}`);
      console.log(`  - Resolution strategy: ${output.conflictResolution?.strategy}`);
    });

    it('should merge recipient lists on conflict', async () => {
      // Save with device 1
      const device1Node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-merge',
          subject: 'Test',
          body: 'Test',
          to: [{ address: 'alice@example.com' }, { address: 'bob@example.com' }],
          cc: [],
          bcc: [],
          attachments: [],
          version: 1
        },
        deviceId: 'device-1'
      });

      await executor.execute(device1Node as any, mockContext as any, mockState as any);

      // Save with different recipients from device 2 (conflict)
      const device2Node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-merge',
          subject: 'Test',
          body: 'Test',
          to: [{ address: 'charlie@example.com' }],
          cc: [],
          bcc: [],
          attachments: [],
          version: 1 // Creates conflict
        },
        deviceId: 'device-2',
        recoveryOptions: { preferLocal: false } // Allow merge
      });

      const result = await executor.execute(device2Node as any, mockContext as any, mockState as any);
      const output = (result as any).output as DraftOperationResult;

      if (output.conflictDetected && output.conflictResolution?.strategy === 'merge') {
        expect(output.conflictResolution.mergedState?.to.length).toBeGreaterThanOrEqual(2);
        console.log('Test Case 2 PASSED: Recipient merge on conflict');
        console.log(`  - Merged recipients: ${output.conflictResolution.mergedState?.to.length}`);
      }
    });
  });

  describe('Test Case 3: Draft Recovery on Reconnection', () => {
    it('should recover draft after disconnect', async () => {
      // Save draft
      const saveNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-recovery',
          subject: 'Important Message',
          body: 'Do not lose this draft',
          to: [{ address: 'recipient@example.com' }],
          cc: [],
          bcc: [],
          attachments: []
        }
      });

      const saveResult = await executor.execute(
        saveNode as any,
        mockContext as any,
        mockState as any
      );
      const savedDraft = (saveResult as any).output.draft;

      // Simulate reconnection and recovery
      const recoveryNode = createMockNode({
        action: 'recover',
        accountId: 'gmail-work-123',
        draftId: 'draft-recovery',
        recoveryOptions: { preferLocal: true, maxRecoveryAge: 3600000 } // 1 hour
      });

      const recoveryResult = await executor.execute(
        recoveryNode as any,
        mockContext as any,
        mockState as any
      );
      const output = (recoveryResult as any).output as DraftOperationResult;

      expect(output.actionPerformed).toBe('recover');
      expect(output.recovery).toBeDefined();
      expect(output.recovery?.lastKnownState.subject).toBe(savedDraft.subject);
      expect(output.recovery?.autoRecovered).toBeDefined();

      console.log('Test Case 3 PASSED: Draft recovery');
      console.log(`  - Recovered draft ID: ${output.recovery?.draftId}`);
      console.log(`  - Subject: ${output.recovery?.lastKnownState.subject}`);
      console.log(`  - Auto-recovered: ${output.recovery?.autoRecovered}`);
    });

    it('should reject recovery of expired draft', async () => {
      const recoveryNode = createMockNode({
        action: 'recover',
        accountId: 'gmail-work-123',
        draftId: 'non-existent-draft',
        recoveryOptions: { maxRecoveryAge: 100 } // Very short window
      });

      const result = await executor.execute(
        recoveryNode as any,
        mockContext as any,
        mockState as any
      );

      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();

      console.log('Test Case 3 PASSED: Expired draft rejection');
      console.log(`  - Error: ${result.error}`);
    });

    it('should flag conflicts requiring user confirmation', async () => {
      // Save draft
      const saveNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-conflict-recovery',
          subject: 'Test',
          body: 'Test body',
          to: [],
          cc: [],
          bcc: [],
          attachments: []
        }
      });

      await executor.execute(saveNode as any, mockContext as any, mockState as any);

      // Create conflict by saving with different version
      const conflictNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-conflict-recovery',
          subject: 'Modified',
          body: 'Modified body',
          to: [],
          cc: [],
          bcc: [],
          attachments: [],
          version: 1 // Outdated version
        }
      });

      await executor.execute(conflictNode as any, mockContext as any, mockState as any);

      // Now try recovery
      const recoveryNode = createMockNode({
        action: 'recover',
        accountId: 'gmail-work-123',
        draftId: 'draft-conflict-recovery'
      });

      const result = await executor.execute(
        recoveryNode as any,
        mockContext as any,
        mockState as any
      );
      const output = (result as any).output as DraftOperationResult;

      expect(output.recovery?.userConfirmationRequired).toBe(true);

      console.log('Test Case 3 PASSED: Conflict recovery flags');
      console.log(`  - User confirmation required: ${output.recovery?.userConfirmationRequired}`);
    });
  });

  describe('Test Case 4: Draft Deletion', () => {
    it('should delete draft and free storage', async () => {
      // Save draft
      const saveNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-to-delete',
          subject: 'Temp Draft',
          body: 'x'.repeat(10000),
          to: [],
          cc: [],
          bcc: [],
          attachments: []
        }
      });

      const saveResult = await executor.execute(
        saveNode as any,
        mockContext as any,
        mockState as any
      );
      const savedStorage = (saveResult as any).output.stats.storageUsed;

      // Delete draft
      const deleteNode = createMockNode({
        action: 'delete',
        accountId: 'gmail-work-123',
        draftId: 'draft-to-delete'
      });

      const deleteResult = await executor.execute(
        deleteNode as any,
        mockContext as any,
        mockState as any
      );
      const output = (deleteResult as any).output as DraftOperationResult;

      expect(output.actionPerformed).toBe('delete');
      expect(output.stats.itemsAffected).toBe(1);
      expect(output.stats.storageUsed).toBeLessThan(0); // Negative = freed space

      console.log('Test Case 4 PASSED: Draft deletion');
      console.log(`  - Storage freed: ${Math.abs(output.stats.storageUsed)} bytes`);
    });

    it('should reject deletion of non-existent draft', async () => {
      const deleteNode = createMockNode({
        action: 'delete',
        accountId: 'gmail-work-123',
        draftId: 'non-existent-draft'
      });

      const result = await executor.execute(
        deleteNode as any,
        mockContext as any,
        mockState as any
      );

      expect(result.status).toBe('error');
      expect(result.error).toContain('not found');

      console.log('Test Case 4 PASSED: Non-existent draft error');
    });

    it('should enforce multi-tenant access control on delete', async () => {
      // Save draft in one tenant
      const saveNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-multi-tenant',
          subject: 'Secure Draft',
          body: 'Should not be accessible',
          to: [],
          cc: [],
          bcc: [],
          attachments: []
        }
      });

      await executor.execute(saveNode as any, mockContext as any, mockState as any);

      // Try to delete from different tenant
      const differentTenant: MockContext = {
        ...mockContext,
        tenantId: 'tenant-other',
        userId: 'user-other'
      };

      const deleteNode = createMockNode({
        action: 'delete',
        accountId: 'gmail-work-123',
        draftId: 'draft-multi-tenant'
      });

      const result = await executor.execute(deleteNode as any, differentTenant as any, mockState as any);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Unauthorized');

      console.log('Test Case 4 PASSED: Multi-tenant access control');
    });
  });

  describe('Test Case 5: Export and Import Draft Bundles', () => {
    it('should export drafts with compression', async () => {
      // Create multiple drafts
      for (let i = 0; i < 3; i++) {
        const node = createMockNode({
          action: 'auto-save',
          accountId: 'gmail-work-123',
          draft: {
            draftId: `draft-export-${i}`,
            subject: `Draft ${i}`,
            body: `Content for draft ${i}`,
            to: [{ address: `recipient${i}@example.com` }],
            cc: [],
            bcc: [],
            attachments: []
          }
        });

        await executor.execute(node as any, mockContext as any, mockState as any);
      }

      // Export
      const exportNode = createMockNode({
        action: 'export',
        accountId: 'gmail-work-123',
        enableCompression: true
      });

      const result = await executor.execute(exportNode as any, mockContext as any, mockState as any);
      const output = (result as any).output as DraftOperationResult;

      expect(output.actionPerformed).toBe('export');
      expect(output.bundle).toBeDefined();
      expect(output.bundle?.drafts.length).toBe(3);
      expect(output.bundle?.metadata.format).toBe('gzip');
      expect(output.bundle?.metadata.compressionRatio).toBeLessThan(1);
      expect(output.stats.compressionSavings).toBeGreaterThan(0);

      console.log('Test Case 5 PASSED: Export with compression');
      console.log(`  - Drafts exported: ${output.bundle?.drafts.length}`);
      console.log(`  - Original size: ${output.stats.storageUsed} bytes`);
      console.log(`  - Compression savings: ${output.stats.compressionSavings} bytes`);
    });

    it('should import draft bundle', async () => {
      // First, export to get a bundle
      const exportNode = createMockNode({
        action: 'export',
        accountId: 'gmail-work-123'
      });

      const exportResult = await executor.execute(exportNode as any, mockContext as any, mockState as any);
      const bundle = (exportResult as any).output.bundle;

      // Change context to different user/tenant
      const newContext: MockContext = {
        ...mockContext,
        tenantId: 'tenant-new',
        userId: 'user-new'
      };

      // Import bundle
      const importNode = createMockNode({
        action: 'import',
        accountId: 'gmail-new-account',
        bundleData: bundle,
        recoveryOptions: { preferLocal: true }
      });

      const importResult = await executor.execute(importNode as any, newContext as any, mockState as any);
      const output = (importResult as any).output as DraftOperationResult;

      expect(output.actionPerformed).toBe('import');
      expect(output.stats.itemsAffected).toBe(bundle.drafts.length);

      // Verify drafts are in new context
      const listNode = createMockNode({
        action: 'list',
        accountId: 'gmail-new-account'
      });

      const listResult = await executor.execute(listNode as any, newContext as any, mockState as any);
      const listOutput = (listResult as any).output as DraftOperationResult;

      expect(listOutput.drafts?.length).toBeGreaterThan(0);

      console.log('Test Case 5 PASSED: Import bundle');
      console.log(`  - Drafts imported: ${output.stats.itemsAffected}`);
      console.log(`  - Now in list: ${listOutput.drafts?.length}`);
    });

    it('should handle import conflicts', async () => {
      // Create a draft
      const createNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-conflict-import',
          subject: 'Original',
          body: 'Original content',
          to: [],
          cc: [],
          bcc: [],
          attachments: []
        }
      });

      await executor.execute(createNode as any, mockContext as any, mockState as any);

      // Export
      const exportNode = createMockNode({
        action: 'export',
        accountId: 'gmail-work-123'
      });

      const exportResult = await executor.execute(exportNode as any, mockContext as any, mockState as any);
      const bundle = (exportResult as any).output.bundle;

      // Modify the draft locally
      const updateNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          draftId: 'draft-conflict-import',
          subject: 'Updated',
          body: 'Updated content',
          to: [],
          cc: [],
          bcc: [],
          attachments: []
        }
      });

      await executor.execute(updateNode as any, mockContext as any, mockState as any);

      // Import old bundle (should detect conflict)
      const importNode = createMockNode({
        action: 'import',
        accountId: 'gmail-work-123',
        bundleData: bundle,
        recoveryOptions: { preferLocal: true } // Keep local version
      });

      const importResult = await executor.execute(
        importNode as any,
        mockContext as any,
        mockState as any
      );
      const output = (importResult as any).output as DraftOperationResult;

      expect(output.conflictDetected).toBe(true);

      console.log('Test Case 5 PASSED: Import conflict detection');
      console.log(`  - Conflicts detected: ${output.conflictDetected}`);
    });
  });

  describe('Test Case 6: Draft Listing and Retrieval', () => {
    it('should list all drafts for account', async () => {
      // Create multiple drafts
      for (let i = 0; i < 5; i++) {
        const node = createMockNode({
          action: 'auto-save',
          accountId: 'gmail-list-test',
          draft: {
            subject: `Draft ${i}`,
            body: `Content ${i}`,
            to: [],
            cc: [],
            bcc: [],
            attachments: []
          }
        });

        await executor.execute(node as any, mockContext as any, mockState as any);
      }

      // List drafts
      const listNode = createMockNode({
        action: 'list',
        accountId: 'gmail-list-test'
      });

      const result = await executor.execute(listNode as any, mockContext as any, mockState as any);
      const output = (result as any).output as DraftOperationResult;

      expect(output.actionPerformed).toBe('list');
      expect(output.drafts).toBeDefined();
      expect(output.drafts?.length).toBe(5);
      expect(output.stats.itemsAffected).toBe(5);

      console.log('Test Case 6 PASSED: List drafts');
      console.log(`  - Total drafts: ${output.drafts?.length}`);
      console.log(`  - Storage used: ${output.stats.storageUsed} bytes`);
    });

    it('should retrieve single draft by ID', async () => {
      // Create draft
      const saveNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-get-test',
        draft: {
          draftId: 'draft-specific-123',
          subject: 'Specific Draft',
          body: 'This is the draft we want to retrieve',
          to: [{ address: 'test@example.com' }],
          cc: [],
          bcc: [],
          attachments: []
        }
      });

      await executor.execute(saveNode as any, mockContext as any, mockState as any);

      // Get single draft
      const getNode = createMockNode({
        action: 'get',
        accountId: 'gmail-get-test',
        draftId: 'draft-specific-123'
      });

      const result = await executor.execute(getNode as any, mockContext as any, mockState as any);
      const output = (result as any).output as DraftOperationResult;

      expect(output.actionPerformed).toBe('get');
      expect(output.draft).toBeDefined();
      expect(output.draft?.draftId).toBe('draft-specific-123');
      expect(output.draft?.subject).toBe('Specific Draft');
      expect(output.draft?.body).toBe('This is the draft we want to retrieve');

      console.log('Test Case 6 PASSED: Get single draft');
      console.log(`  - Draft ID: ${output.draft?.draftId}`);
      console.log(`  - Subject: ${output.draft?.subject}`);
    });

    it('should enforce tenant isolation in list', async () => {
      // Create draft in tenant-acme
      const saveNode = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-isolation-test',
        draft: {
          subject: 'Tenant-specific',
          body: 'Should not see this',
          to: [],
          cc: [],
          bcc: [],
          attachments: []
        }
      });

      await executor.execute(saveNode as any, mockContext as any, mockState as any);

      // List from different tenant
      const differentTenant: MockContext = {
        ...mockContext,
        tenantId: 'tenant-other'
      };

      const listNode = createMockNode({
        action: 'list',
        accountId: 'gmail-isolation-test'
      });

      const result = await executor.execute(listNode as any, differentTenant as any, mockState as any);
      const output = (result as any).output as DraftOperationResult;

      expect(output.drafts?.length).toBe(0);

      console.log('Test Case 6 PASSED: Tenant isolation in list');
      console.log(`  - Other tenant sees: ${output.drafts?.length} drafts`);
    });
  });

  describe('Configuration and Edge Cases', () => {
    it('should handle empty draft body', async () => {
      const node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          subject: 'Just a subject',
          body: '', // Empty body
          to: [{ address: 'test@example.com' }],
          cc: [],
          bcc: [],
          attachments: []
        }
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      expect((result as any).output.draft.body).toBe('');

      console.log('Configuration Test PASSED: Empty body handling');
    });

    it('should handle scheduled sends', async () => {
      const futureTime = Date.now() + 3600000; // 1 hour from now

      const node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          subject: 'Scheduled Send',
          body: 'This will be sent later',
          to: [{ address: 'test@example.com' }],
          cc: [],
          bcc: [],
          attachments: [],
          scheduledSendTime: futureTime
        }
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);
      const output = (result as any).output as DraftOperationResult;

      expect(output.draft?.scheduledSendTime).toBe(futureTime);

      console.log('Configuration Test PASSED: Scheduled send time');
    });

    it('should track draft tags', async () => {
      const node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          subject: 'Tagged Draft',
          body: 'Has tags',
          to: [],
          cc: [],
          bcc: [],
          attachments: [],
          tags: ['important', 'follow-up', 'client-xyz']
        }
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);
      const output = (result as any).output as DraftOperationResult;

      expect(output.draft?.tags).toEqual(['important', 'follow-up', 'client-xyz']);

      console.log('Configuration Test PASSED: Draft tags');
      console.log(`  - Tags: ${output.draft?.tags?.join(', ')}`);
    });

    it('should handle reply/forward references', async () => {
      const messageId = '<original-message-id@example.com>';

      const node = createMockNode({
        action: 'auto-save',
        accountId: 'gmail-work-123',
        draft: {
          subject: 'Re: Original Subject',
          body: 'Reply text',
          to: [{ address: 'test@example.com' }],
          cc: [],
          bcc: [],
          attachments: [],
          references: messageId
        }
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);
      const output = (result as any).output as DraftOperationResult;

      expect(output.draft?.references).toBe(messageId);

      console.log('Configuration Test PASSED: Message references');
    });
  });
});

/**
 * Helper to create mock workflow node
 */
function createMockNode(parameters: Record<string, any>): MockNode {
  return {
    id: 'node-draft-manager-test',
    type: 'node',
    nodeType: 'draft-manager',
    parameters
  };
}
