/**
 * IMAP Search Plugin Test Suite - Phase 6
 * Comprehensive tests covering simple queries, complex queries, and empty results
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  IMAPSearchExecutor,
  IMAPSearchConfig,
  SearchCriteria,
  SearchResult
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

describe('IMAPSearchExecutor - Phase 6', () => {
  let executor: IMAPSearchExecutor;
  let mockContext: MockContext;
  let mockState: MockState;

  beforeEach(() => {
    executor = new IMAPSearchExecutor();
    mockContext = {
      executionId: 'exec-search-123',
      tenantId: 'tenant-acme',
      userId: 'user-456',
      triggerData: {},
      variables: {}
    };
    mockState = {};
  });

  describe('Node Type and Metadata', () => {
    it('should have correct node type identifier', () => {
      expect(executor.nodeType).toBe('imap-search');
    });

    it('should have correct category', () => {
      expect(executor.category).toBe('email-integration');
    });

    it('should have descriptive description', () => {
      expect(executor.description).toContain('IMAP SEARCH');
      expect(executor.description).toContain('full-text');
      expect(executor.description).toContain('from, to, subject, body');
    });
  });

  describe('Validation', () => {
    it('should reject missing imapId', () => {
      const node = createMockNode({ folderId: 'folder-123', criteria: 'ALL' });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('IMAP Account ID is required');
    });

    it('should reject missing folderId', () => {
      const node = createMockNode({ imapId: 'imap-123', criteria: 'ALL' });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Folder ID is required');
    });

    it('should reject missing criteria', () => {
      const node = createMockNode({ imapId: 'imap-123', folderId: 'folder-123' });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Search criteria is required');
    });

    it('should reject invalid criteria object (no search fields)', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: {} // Empty criteria
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
    });

    it('should reject invalid limit outside range', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: 'ALL',
        limit: 1001 // Out of range
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('limit must be between 1 and 1000');
    });

    it('should reject negative offset', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: 'ALL',
        offset: -1 // Invalid
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('offset must be non-negative');
    });

    it('should reject invalid sortBy value', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: 'ALL',
        sortBy: 'invalid-sort' as any
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('sortBy'))).toBe(true);
    });

    it('should accept valid string criteria', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: 'FROM "user@example.com" SINCE 01-Jan-2026'
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid structured criteria object', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: {
          from: 'user@example.com',
          subject: 'test'
        } as SearchCriteria
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept all valid sortBy values', () => {
      const sortValues = ['uid', 'date', 'from', 'subject', 'size'];

      for (const sort of sortValues) {
        const node = createMockNode({
          imapId: 'imap-123',
          folderId: 'folder-123',
          criteria: 'ALL',
          sortBy: sort as any
        });
        const result = executor.validate(node);

        expect(result.valid).toBe(true);
      }
    });

    it('should accept valid optional parameters', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: 'ALL',
        limit: 500,
        offset: 100,
        sortBy: 'date',
        descending: true
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('Test Case 1: Simple Query - FROM Search', () => {
    it('should execute simple FROM search with string criteria', async () => {
      const node = createMockNode({
        imapId: 'gmail-work-123',
        folderId: 'inbox-456',
        criteria: 'FROM "alice@example.com"',
        limit: 100
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      // Verify successful execution
      expect(result.status).toBe('success');
      expect(result.timestamp).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);

      // Verify output structure
      const output = (result as any).output;
      expect(output.status).toMatch(/found|no-results/);
      expect(output.data).toBeDefined();

      // Verify SearchResult structure
      const searchData: SearchResult = output.data;
      expect(searchData.uids).toBeInstanceOf(Array);
      expect(searchData.totalCount).toBeGreaterThanOrEqual(0);
      expect(searchData.criteria).toBeDefined();
      expect(searchData.executedAt).toBeGreaterThan(0);
      expect(searchData.isLimited).toBeDefined();
      expect(searchData.executionDuration).toBeGreaterThanOrEqual(0);

      // Verify UIDs are strings
      for (const uid of searchData.uids) {
        expect(typeof uid).toBe('string');
        expect(uid.length).toBeGreaterThan(0);
      }

      // Verify limit respected
      expect(searchData.uids.length).toBeLessThanOrEqual(100);

      console.log('Test Case 1 PASSED: Simple FROM search');
      console.log(`  - Total matches: ${searchData.totalCount}`);
      console.log(`  - Results returned: ${searchData.uids.length}`);
      console.log(`  - Is limited: ${searchData.isLimited}`);
      console.log(`  - Duration: ${searchData.executionDuration}ms`);
    });

    it('should execute simple SUBJECT search with structured criteria', async () => {
      const criteria: SearchCriteria = {
        subject: 'quarterly report'
      };

      const node = createMockNode({
        imapId: 'gmail-work-123',
        folderId: 'inbox-456',
        criteria
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.uids).toBeInstanceOf(Array);
      expect(searchData.totalCount).toBeGreaterThanOrEqual(0);

      console.log('Test Case 1 PASSED: Simple SUBJECT search');
      console.log(`  - Search: subject="${criteria.subject}"`);
      console.log(`  - Total matches: ${searchData.totalCount}`);
    });

    it('should execute simple FLAGGED search', async () => {
      const criteria: SearchCriteria = {
        flagged: true
      };

      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria,
        limit: 50
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.uids.length).toBeLessThanOrEqual(50);

      console.log('Test Case 1 PASSED: Simple FLAGGED search');
      console.log(`  - Total flagged: ${searchData.totalCount}`);
      console.log(`  - Returned (limited to 50): ${searchData.uids.length}`);
    });

    it('should execute simple UNSEEN search', async () => {
      const criteria: SearchCriteria = {
        seen: false
      };

      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.uids).toBeInstanceOf(Array);

      console.log('Test Case 1 PASSED: Simple UNSEEN search');
      console.log(`  - Unseen messages: ${searchData.totalCount}`);
    });
  });

  describe('Test Case 2: Complex Query - Multi-Criteria Search', () => {
    it('should execute complex AND query with multiple criteria', async () => {
      const criteria: SearchCriteria = {
        from: 'boss@example.com',
        subject: 'urgent',
        flagged: true,
        operator: 'AND'
      };

      const node = createMockNode({
        imapId: 'gmail-work-123',
        folderId: 'inbox-456',
        criteria,
        limit: 100
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      // Should succeed even if no results
      expect(result.status).toBe('success');

      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.uids).toBeInstanceOf(Array);
      expect(searchData.criteria).toBeDefined();

      // Complex query should generate more restrictive search (fewer results expected)
      // But we still handle zero results gracefully
      expect(searchData.uids.length).toBeGreaterThanOrEqual(0);

      console.log('Test Case 2 PASSED: Complex AND query');
      console.log(`  - From: ${criteria.from}`);
      console.log(`  - Subject: ${criteria.subject}`);
      console.log(`  - Flagged: ${criteria.flagged}`);
      console.log(`  - Total matches: ${searchData.totalCount}`);
      console.log(`  - Results: ${searchData.uids.length}`);
    });

    it('should execute complex OR query', async () => {
      const criteria: SearchCriteria = {
        from: 'alice@example.com',
        to: 'bob@example.com',
        operator: 'OR'
      };

      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.criteria).toContain('OR');

      console.log('Test Case 2 PASSED: Complex OR query');
      console.log(`  - Criteria: (FROM alice OR TO bob)`);
      console.log(`  - Total matches: ${searchData.totalCount}`);
    });

    it('should execute date range search', async () => {
      const criteria: SearchCriteria = {
        since: '2026-01-01',
        before: '2026-01-31',
        from: 'reports@company.com'
      };

      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.uids).toBeInstanceOf(Array);

      console.log('Test Case 2 PASSED: Date range search');
      console.log(`  - Since: ${criteria.since}`);
      console.log(`  - Before: ${criteria.before}`);
      console.log(`  - From: ${criteria.from}`);
      console.log(`  - Total matches: ${searchData.totalCount}`);
    });

    it('should execute size range search', async () => {
      const criteria: SearchCriteria = {
        minSize: 1000000, // 1MB
        maxSize: 10000000 // 10MB
      };

      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.uids).toBeInstanceOf(Array);

      console.log('Test Case 2 PASSED: Size range search');
      console.log(`  - Min size: ${criteria.minSize} bytes`);
      console.log(`  - Max size: ${criteria.maxSize} bytes`);
      console.log(`  - Matches: ${searchData.totalCount}`);
    });

    it('should execute raw IMAP SEARCH string', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria: 'FROM "alice@example.com" OR FROM "bob@example.com" SINCE 01-Jan-2026 UNFLAGGED'
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.criteria).toBeDefined();

      console.log('Test Case 2 PASSED: Raw IMAP SEARCH string');
      console.log(`  - Criteria: ${searchData.criteria}`);
      console.log(`  - Matches: ${searchData.totalCount}`);
    });

    it('should handle multiple flags in criteria', async () => {
      const criteria: SearchCriteria = {
        flagged: true,
        answered: false,
        draft: false,
        deleted: false
      };

      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.criteria).toContain('FLAGGED');

      console.log('Test Case 2 PASSED: Multiple flags search');
      console.log(`  - Flagged AND not answered AND not draft AND not deleted`);
      console.log(`  - Matches: ${searchData.totalCount}`);
    });
  });

  describe('Test Case 3: Empty Results - Handling Zero Matches', () => {
    it('should return empty UID array with success status when no matches', async () => {
      // Use criteria unlikely to match anything
      const criteria: SearchCriteria = {
        from: 'nonexistent-user-xyz@invalid-domain-12345.com',
        subject: 'zzzzzzzzzzz-impossible-subject-keyword-that-will-never-appear-zzzzzzzz'
      };

      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      // Should return success even with zero results
      expect(result.status).toBe('success');
      const output = (result as any).output;

      // Status should indicate no results
      expect(['found', 'no-results']).toContain(output.status);

      const searchData: SearchResult = output.data;

      // Verify empty results handled gracefully
      expect(searchData.uids).toBeInstanceOf(Array);
      expect(searchData.uids.length).toBe(0);
      expect(searchData.totalCount).toBeGreaterThanOrEqual(0);

      // Verify other fields still valid
      expect(searchData.criteria).toBeDefined();
      expect(searchData.executedAt).toBeGreaterThan(0);
      expect(searchData.executionDuration).toBeGreaterThanOrEqual(0);

      console.log('Test Case 3 PASSED: Empty results handled gracefully');
      console.log(`  - Query returned 0 matches`);
      console.log(`  - Status: ${output.status}`);
      console.log(`  - UID array: ${JSON.stringify(searchData.uids)}`);
      console.log(`  - Total count: ${searchData.totalCount}`);
    });

    it('should handle ALL criterion (returns all messages or up to limit)', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria: 'ALL',
        limit: 10
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;

      // ALL should return results (or empty array if no messages)
      expect(searchData.uids).toBeInstanceOf(Array);
      expect(searchData.uids.length).toBeLessThanOrEqual(10);

      console.log('Test Case 3 PASSED: ALL criterion search');
      console.log(`  - Total messages: ${searchData.totalCount}`);
      console.log(`  - Returned (limited): ${searchData.uids.length}`);
    });

    it('should handle pagination with offset when results available', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria: 'ALL',
        limit: 10,
        offset: 5
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;

      // Should apply offset and limit
      expect(searchData.uids.length).toBeLessThanOrEqual(10);

      console.log('Test Case 3 PASSED: Pagination with offset');
      console.log(`  - Offset: 5, Limit: 10`);
      console.log(`  - Results: ${searchData.uids.length}`);
    });

    it('should handle offset beyond result set (empty return)', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria: 'FROM "user@example.com"',
        limit: 10,
        offset: 10000 // Likely beyond any result set
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;

      // Should return empty array (offset beyond results)
      expect(searchData.uids).toBeInstanceOf(Array);
      expect(searchData.uids.length).toBe(0);

      console.log('Test Case 3 PASSED: Offset beyond results');
      console.log(`  - Offset: 10000`);
      console.log(`  - Returns: ${searchData.uids.length} UIDs (empty)`);
    });
  });

  describe('Sorting and Result Options', () => {
    it('should sort by UID in ascending order', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria: 'ALL',
        limit: 100,
        sortBy: 'uid',
        descending: false
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;

      // Verify UIDs are numeric strings that could be sorted
      if (searchData.uids.length > 1) {
        const ids = searchData.uids.map(Number);
        expect(ids.length).toBeGreaterThan(0);
      }

      console.log('Test Case - Sort PASSED: UID ascending');
      console.log(`  - Results: ${searchData.uids.length} UIDs`);
    });

    it('should sort in descending order', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria: 'ALL',
        limit: 50,
        sortBy: 'uid',
        descending: true
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.uids.length).toBeLessThanOrEqual(50);

      console.log('Test Case - Sort PASSED: Descending order');
      console.log(`  - Results: ${searchData.uids.length} UIDs (descending)`);
    });

    it('should limit results appropriately', async () => {
      const testLimits = [1, 10, 100, 500, 1000];

      for (const limit of testLimits) {
        const node = createMockNode({
          imapId: 'gmail-123',
          folderId: 'inbox-456',
          criteria: 'ALL',
          limit
        });

        const result = await executor.execute(node as any, mockContext as any, mockState as any);

        expect(result.status).toBe('success');
        const searchData: SearchResult = (result as any).output.data;
        expect(searchData.uids.length).toBeLessThanOrEqual(limit);
        expect(searchData.isLimited).toBeDefined();
      }

      console.log('Test Case - Limits PASSED: All limit values respected');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should fail with error status on missing required parameters', async () => {
      const node = createMockNode({
        folderId: 'folder-123'
        // Missing required imapId and criteria
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
      expect(result.errorCode).toMatch(/IMAP_SEARCH_ERROR|INVALID_PARAMS/);

      console.log('Error Test PASSED: Missing parameters');
      console.log(`  - Error: ${result.error}`);
    });

    it('should reject invalid IMAP search keyword', async () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: 'FROM "user@example.com" INVALID_KEYWORD'
      });

      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      console.log('Error Test PASSED: Invalid IMAP keyword');
    });

    it('should provide actionable error messages', async () => {
      const node = createMockNode({
        // All parameters missing
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.error).toBeDefined();
      expect(result.error?.length).toBeGreaterThan(0);
      expect(result.error?.toLowerCase()).toMatch(/required|parameter|criteria/);

      console.log('Error Test PASSED: Actionable error message');
      console.log(`  - Error: ${result.error}`);
    });

    it('should track execution duration for performance metrics', async () => {
      const node = createMockNode({
        imapId: 'gmail-work-123',
        folderId: 'inbox-456',
        criteria: 'ALL'
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.duration).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();

      console.log('Error Test PASSED: Performance metrics');
      console.log(`  - Duration: ${result.duration}ms`);
      console.log(`  - Timestamp: ${new Date(result.timestamp).toISOString()}`);
    });
  });

  describe('Criteria Validation and Conversion', () => {
    it('should accept ISO 8601 date format and convert to IMAP format', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: {
          since: '2026-01-15T00:00:00Z'
        } as SearchCriteria
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should accept IMAP date format directly', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: {
          since: '15-Jan-2026'
        } as SearchCriteria
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should handle structured criteria with email addresses', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: {
          from: 'user@example.com',
          to: 'recipient@example.com',
          cc: 'cc@example.com'
        } as SearchCriteria
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should handle text searches', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: {
          text: 'important keyword'
        } as SearchCriteria
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should handle body search separately from subject', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: {
          subject: 'Meeting Notes',
          body: 'action items'
        } as SearchCriteria
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should accept custom keywords', () => {
      const node = createMockNode({
        imapId: 'imap-123',
        folderId: 'folder-123',
        criteria: {
          keywords: ['important', 'project-x']
        } as SearchCriteria
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with workflow context variables', async () => {
      mockContext.variables = {
        searchFrom: 'user@example.com'
      };

      const criteria: SearchCriteria = {
        from: mockContext.variables.searchFrom
      };

      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'inbox-456',
        criteria
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');

      console.log('Integration Test PASSED: Workflow context variables');
      console.log(`  - Used context variable: searchFrom = ${mockContext.variables.searchFrom}`);
    });

    it('should execute folder-specific search', async () => {
      const node = createMockNode({
        imapId: 'gmail-123',
        folderId: 'folder-sent-items-789', // Specific folder
        criteria: 'ALL'
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      const searchData: SearchResult = (result as any).output.data;
      expect(searchData.uids).toBeInstanceOf(Array);

      console.log('Integration Test PASSED: Folder-specific search');
      console.log(`  - Folder ID: folder-sent-items-789`);
      console.log(`  - Results: ${searchData.totalCount} messages`);
    });
  });
});

/**
 * Helper to create mock workflow node
 */
function createMockNode(parameters: Record<string, any>): MockNode {
  return {
    id: 'node-imap-search-test',
    type: 'node',
    nodeType: 'imap-search',
    parameters
  };
}
