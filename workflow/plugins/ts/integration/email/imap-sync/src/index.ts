/**
 * IMAP Sync Node Executor Plugin
 * Performs incremental synchronization of emails from IMAP server
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '@metabuilder/workflow';

export interface IMAPSyncConfig {
  imapId: string;
  folderId: string;
  syncToken?: string;
  maxMessages?: number;
}

export interface SyncData {
  syncedCount: number;
  errors: Array<{ uid: string; error: string }>;
  newSyncToken?: string;
  lastSyncAt: number;
}

export class IMAPSyncExecutor implements INodeExecutor {
  nodeType = 'imap-sync';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { imapId, folderId, syncToken, maxMessages = 100 } = node.parameters as IMAPSyncConfig;

      if (!imapId) {
        throw new Error('IMAP Sync requires "imapId" parameter');
      }

      if (!folderId) {
        throw new Error('IMAP Sync requires "folderId" parameter');
      }

      // Simulate incremental sync
      // In production, this would connect to IMAP server and fetch new messages
      const syncData = this._performIncrementalSync({
        imapId,
        folderId,
        syncToken,
        maxMessages
      });

      const duration = Date.now() - startTime;

      return {
        status: 'success',
        output: {
          status: 'synced',
          data: syncData
        },
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'IMAP_SYNC_ERROR',
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

    if (node.parameters.maxMessages && typeof node.parameters.maxMessages !== 'number') {
      errors.push('maxMessages must be a number');
    }

    if (node.parameters.maxMessages && node.parameters.maxMessages < 1) {
      errors.push('maxMessages must be at least 1');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private _performIncrementalSync(config: IMAPSyncConfig): SyncData {
    // Simulates IMAP incremental sync
    // In production, would:
    // 1. Connect to IMAP server using imapId credentials
    // 2. Use syncToken (IMAP UIDVALIDITY/UIDNEXT) for incremental fetch
    // 3. Fetch new messages since last sync
    // 4. Parse message headers and store in database
    // 5. Return new syncToken for next incremental sync

    const syncErrors: Array<{ uid: string; error: string }> = [];

    // Simulate fetching 5-25 new messages
    const messageCount = Math.floor(Math.random() * 20) + 5;
    const syncedCount = Math.min(messageCount, config.maxMessages);

    // Simulate occasional errors (10% chance)
    if (Math.random() < 0.1) {
      syncErrors.push({
        uid: `msg-${Date.now()}`,
        error: 'Failed to parse message headers'
      });
    }

    return {
      syncedCount,
      errors: syncErrors,
      newSyncToken: `token-${Date.now()}`,
      lastSyncAt: Date.now()
    };
  }
}

export const imapSyncExecutor = new IMAPSyncExecutor();
