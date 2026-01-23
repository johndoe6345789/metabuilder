/**
 * IMAP Search Node Executor Plugin
 * Executes IMAP SEARCH commands to find messages
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '@metabuilder/workflow';

export interface IMAPSearchConfig {
  imapId: string;
  folderId: string;
  criteria: string; // IMAP SEARCH criteria (e.g., "SINCE 01-Jan-2026 FLAGGED")
  limit?: number;
}

export interface SearchResult {
  messageIds: string[];
  totalCount: number;
  criteria: string;
  executedAt: number;
}

export class IMAPSearchExecutor implements INodeExecutor {
  nodeType = 'imap-search';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { imapId, folderId, criteria, limit = 100 } = node.parameters as IMAPSearchConfig;

      if (!imapId) {
        throw new Error('IMAP Search requires "imapId" parameter');
      }

      if (!folderId) {
        throw new Error('IMAP Search requires "folderId" parameter');
      }

      if (!criteria) {
        throw new Error('IMAP Search requires "criteria" parameter');
      }

      // Validate IMAP search criteria format
      this._validateSearchCriteria(criteria);

      // Perform search
      const searchResult = this._performSearch({
        imapId,
        folderId,
        criteria,
        limit
      });

      const duration = Date.now() - startTime;

      return {
        status: 'success',
        output: {
          status: 'found',
          data: searchResult
        },
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'IMAP_SEARCH_ERROR',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node.parameters.imapId) {
      errors.push('IMAP ID is required');
    }

    if (!node.parameters.folderId) {
      errors.push('Folder ID is required');
    }

    if (!node.parameters.criteria) {
      errors.push('Search criteria is required');
    }

    if (node.parameters.limit && typeof node.parameters.limit !== 'number') {
      errors.push('limit must be a number');
    }

    if (node.parameters.limit && node.parameters.limit < 1) {
      errors.push('limit must be at least 1');
    }

    // Validate criteria format
    try {
      if (node.parameters.criteria) {
        this._validateSearchCriteria(node.parameters.criteria);
      }
    } catch (err) {
      errors.push(`Invalid search criteria: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private _validateSearchCriteria(criteria: string): void {
    // Basic validation of IMAP SEARCH criteria syntax
    // Valid keywords: ALL, ANSWERED, BCC, BEFORE, BODY, CC, DELETED, DRAFT, FLAGGED, FROM, etc.
    const validKeywords = [
      'ALL',
      'ANSWERED',
      'BCC',
      'BEFORE',
      'BODY',
      'CC',
      'DELETED',
      'DRAFT',
      'FLAGGED',
      'FROM',
      'HEADER',
      'KEYWORD',
      'LARGER',
      'NEW',
      'NOT',
      'OLD',
      'ON',
      'RECENT',
      'SEEN',
      'SINCE',
      'SMALLER',
      'SUBJECT',
      'TEXT',
      'TO',
      'UID',
      'UNANSWERED',
      'UNDELETED',
      'UNDRAFT',
      'UNFLAGGED',
      'UNKEYWORD',
      'UNSEEN',
      'OR'
    ];

    const tokens = criteria.toUpperCase().split(/\s+/);
    const invalidTokens = tokens.filter(token => !validKeywords.includes(token) && !/^\d{1,2}-\w{3}-\d{4}$/.test(token));

    if (invalidTokens.length > 0) {
      throw new Error(`Invalid IMAP search keywords: ${invalidTokens.join(', ')}`);
    }
  }

  private _performSearch(config: IMAPSearchConfig): SearchResult {
    // Simulates IMAP SEARCH command execution
    // In production, would:
    // 1. Connect to IMAP server using imapId credentials
    // 2. Select the specified folder
    // 3. Execute SEARCH command with provided criteria
    // 4. Return matching message UIDs
    // 5. Respect limit parameter

    // Simulate finding 10-50 matching messages
    const matchCount = Math.floor(Math.random() * 40) + 10;
    const resultCount = Math.min(matchCount, config.limit);

    // Generate mock message IDs
    const messageIds: string[] = [];
    for (let i = 0; i < resultCount; i++) {
      messageIds.push(`msg-${Date.now()}-${i}`);
    }

    return {
      messageIds,
      totalCount: matchCount,
      criteria: config.criteria,
      executedAt: Date.now()
    };
  }
}

export const imapSearchExecutor = new IMAPSearchExecutor();
