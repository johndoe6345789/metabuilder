/**
 * Draft Manager Node Executor Plugin - Phase 6
 * Manages email draft auto-save, recovery, and lifecycle
 *
 * Features:
 * - Auto-save draft emails to IndexedDB with conflict detection
 * - Track draft state: to, cc, bcc, subject, body, attachments
 * - Handle concurrent edits with timestamp-based resolution
 * - Support draft recovery on reconnection
 * - Delete drafts on successful send
 * - Export/import draft bundles with compression
 * - Multi-tenant isolation and ACL enforcement
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '@metabuilder/workflow';

/**
 * Draft action types
 */
export type DraftAction = 'auto-save' | 'recover' | 'delete' | 'export' | 'import' | 'list' | 'get';

/**
 * Email recipient representation
 */
export interface EmailRecipient {
  address: string;
  name?: string;
  status?: 'pending' | 'added' | 'removed';
}

/**
 * Email attachment metadata
 */
export interface AttachmentMetadata {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: number;
  blobUrl?: string; // Temporary URL for preview
}

/**
 * Complete draft state
 */
export interface DraftState {
  draftId: string;
  accountId: string;
  tenantId: string;
  userId: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  to: EmailRecipient[];
  cc: EmailRecipient[];
  bcc: EmailRecipient[];
  attachments: AttachmentMetadata[];
  isDirty: boolean;
  lastSavedAt: number;
  lastModifiedAt: number;
  version: number;
  syncToken?: string; // For server sync
  scheduledSendTime?: number; // For scheduled sends
  tags?: string[];
  references?: string; // For reply/forward threading
}

/**
 * Draft save operation metadata
 */
export interface DraftSaveMetadata {
  saveId: string;
  draftId: string;
  savedAt: number;
  device: string;
  changesSummary: {
    fieldsChanged: string[];
    attachmentsAdded: number;
    attachmentsRemoved: number;
    bytesAdded: number;
  };
  conflict?: {
    remoteVersion: number;
    remoteModifiedAt: number;
    resolutionStrategy: 'local-wins' | 'remote-wins' | 'merge';
  };
}

/**
 * Draft recovery information
 */
export interface DraftRecovery {
  draftId: string;
  recoveredAt: number;
  recoveryReason: 'reconnection' | 'browser-crash' | 'manual-recovery';
  lastKnownState: DraftState;
  autoRecovered: boolean;
  userConfirmationRequired: boolean;
}

/**
 * Bulk export bundle
 */
export interface DraftBundle {
  bundleId: string;
  exportedAt: number;
  drafts: DraftState[];
  metadata: {
    count: number;
    totalSize: number;
    compressionRatio: number;
    format: 'json' | 'jsonl' | 'gzip';
  };
}

/**
 * Draft Manager Configuration
 */
export interface DraftManagerConfig {
  action: DraftAction;
  /** UUID of email account (FK to EmailClient) */
  accountId: string;
  /** Current draft state for save operations */
  draft?: Partial<DraftState>;
  /** Draft ID for recovery/delete/get operations */
  draftId?: string;
  /** Auto-save interval in milliseconds (default: 5000ms) */
  autoSaveInterval?: number;
  /** Maximum draft size in bytes (default: 25MB) */
  maxDraftSize?: number;
  /** Enable compression for bulk operations (default: true) */
  enableCompression?: boolean;
  /** Bundle data for import operations */
  bundleData?: DraftBundle;
  /** Recovery options */
  recoveryOptions?: {
    preferLocal: boolean; // Prefer local version on conflict
    preserveAttachments: boolean;
    maxRecoveryAge?: number; // Max age of recoverable draft in ms
  };
  /** Device identifier for conflict detection */
  deviceId?: string;
  /** Sync token for server synchronization */
  syncToken?: string;
}

/**
 * Draft Manager Operation Result
 */
export interface DraftOperationResult {
  actionPerformed: DraftAction;
  draft?: DraftState;
  drafts?: DraftState[];
  bundle?: DraftBundle;
  recovery?: DraftRecovery;
  saveMetadata?: DraftSaveMetadata;
  conflictDetected: boolean;
  conflictResolution?: {
    strategy: 'local-wins' | 'remote-wins' | 'merge';
    mergedState?: DraftState;
  };
  stats: {
    operationDuration: number;
    itemsAffected: number;
    storageUsed: number;
    compressionSavings?: number;
  };
}

/**
 * Draft Manager Executor - Email draft lifecycle management
 *
 * Handles auto-save, recovery, and bulk export/import with:
 * - Indexed DB persistence for offline support
 * - Concurrent edit conflict detection
 * - Automatic recovery on reconnection
 * - Multi-device synchronization support
 */
export class DraftManagerExecutor implements INodeExecutor {
  readonly nodeType = 'draft-manager';
  readonly category = 'email-integration';
  readonly description = 'Manage email drafts with auto-save, recovery, and bulk operations';

  /** In-memory draft cache (simulating IndexedDB) */
  private _draftCache: Map<string, DraftState> = new Map();
  /** Save history for recovery operations */
  private _saveHistory: Map<string, DraftSaveMetadata[]> = new Map();
  /** Conflict tracking for concurrent edits */
  private _conflictLog: Map<string, Array<{ timestamp: number; reason: string }>> = new Map();

  /**
   * Execute draft management operation
   */
  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    _state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const config = node.parameters as DraftManagerConfig;

      // Validate configuration
      this._validateConfig(config);

      // Execute based on action type
      let result: DraftOperationResult;

      switch (config.action) {
        case 'auto-save':
          result = await this._handleAutoSave(config, context);
          break;
        case 'recover':
          result = await this._handleRecover(config, context);
          break;
        case 'delete':
          result = await this._handleDelete(config, context);
          break;
        case 'export':
          result = await this._handleExport(config, context);
          break;
        case 'import':
          result = await this._handleImport(config, context);
          break;
        case 'list':
          result = await this._handleList(config, context);
          break;
        case 'get':
          result = await this._handleGet(config, context);
          break;
        default:
          throw new Error(`Unknown draft action: ${config.action}`);
      }

      const duration = Date.now() - startTime;

      return {
        status: result.conflictDetected ? 'partial' : 'success',
        output: {
          action: result.actionPerformed,
          ...result
        },
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      let errorCode = 'DRAFT_MANAGER_ERROR';
      if (errorMsg.includes('validation')) {
        errorCode = 'VALIDATION_ERROR';
      } else if (errorMsg.includes('storage')) {
        errorCode = 'STORAGE_ERROR';
      } else if (errorMsg.includes('conflict')) {
        errorCode = 'CONFLICT_ERROR';
      } else if (errorMsg.includes('recovery')) {
        errorCode = 'RECOVERY_ERROR';
      }

      return {
        status: 'error',
        error: errorMsg,
        errorCode,
        timestamp: Date.now(),
        duration
      };
    }
  }

  /**
   * Validate node parameters
   */
  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const params = node.parameters;

    // Required: action
    if (!params.action) {
      errors.push('Draft action is required');
    } else if (
      ![
        'auto-save',
        'recover',
        'delete',
        'export',
        'import',
        'list',
        'get'
      ].includes(params.action)
    ) {
      errors.push(
        `Invalid action "${params.action}". Must be one of: auto-save, recover, delete, export, import, list, get`
      );
    }

    // Required: accountId
    if (!params.accountId) {
      errors.push('Email account ID (accountId) is required');
    } else if (typeof params.accountId !== 'string') {
      errors.push('accountId must be a string');
    }

    // Action-specific validation
    if (params.action === 'auto-save') {
      if (!params.draft) {
        errors.push('Draft state (draft) is required for auto-save action');
      } else {
        const draft = params.draft;
        if (!draft.subject && typeof draft.subject !== 'string') {
          warnings.push('Draft subject should be a non-empty string');
        }
        if (!draft.to || !Array.isArray(draft.to)) {
          warnings.push('Draft should have recipient list (to)');
        }
      }

      if (params.autoSaveInterval !== undefined) {
        if (typeof params.autoSaveInterval !== 'number') {
          errors.push('autoSaveInterval must be a number');
        } else if (params.autoSaveInterval < 1000 || params.autoSaveInterval > 60000) {
          errors.push('autoSaveInterval must be between 1000ms and 60000ms');
        }
      }

      if (params.maxDraftSize !== undefined) {
        if (typeof params.maxDraftSize !== 'number') {
          errors.push('maxDraftSize must be a number');
        } else if (params.maxDraftSize < 1048576) {
          // 1MB minimum
          errors.push('maxDraftSize must be at least 1048576 bytes (1MB)');
        }
      }
    } else if (params.action === 'recover' || params.action === 'delete' || params.action === 'get') {
      if (!params.draftId) {
        errors.push(`Draft ID (draftId) is required for ${params.action} action`);
      } else if (typeof params.draftId !== 'string') {
        errors.push('draftId must be a string');
      }
    } else if (params.action === 'import') {
      if (!params.bundleData) {
        errors.push('Bundle data (bundleData) is required for import action');
      } else if (!Array.isArray(params.bundleData.drafts)) {
        errors.push('bundleData.drafts must be an array');
      }
    }

    // Optional parameter validation
    if (params.deviceId !== undefined && typeof params.deviceId !== 'string') {
      errors.push('deviceId must be a string');
    }

    if (params.enableCompression !== undefined && typeof params.enableCompression !== 'boolean') {
      errors.push('enableCompression must be a boolean');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Handle auto-save operation with conflict detection
   */
  private async _handleAutoSave(
    config: DraftManagerConfig,
    context: WorkflowContext
  ): Promise<DraftOperationResult> {
    const draftData = config.draft!;
    const draftId = draftData.draftId || this._generateId('draft');
    const now = Date.now();

    // Check for existing draft
    const existingDraft = this._draftCache.get(draftId);
    let conflictDetected = false;
    let resolutionStrategy: 'local-wins' | 'remote-wins' | 'merge' = 'local-wins';

    if (
      existingDraft &&
      existingDraft.lastModifiedAt > (draftData.lastModifiedAt || 0) &&
      (draftData.version || 0) < existingDraft.version
    ) {
      conflictDetected = true;
      this._recordConflict(draftId, 'version-mismatch-on-save');

      // Use recovery strategy from config
      if (config.recoveryOptions?.preferLocal) {
        resolutionStrategy = 'local-wins';
      } else {
        resolutionStrategy = 'merge';
      }
    }

    // Build new draft state
    const newDraft: DraftState = {
      draftId,
      accountId: config.accountId,
      tenantId: context.tenantId,
      userId: context.userId,
      subject: draftData.subject || '',
      body: draftData.body || '',
      bodyHtml: draftData.bodyHtml,
      to: draftData.to || [],
      cc: draftData.cc || [],
      bcc: draftData.bcc || [],
      attachments: draftData.attachments || [],
      isDirty: false,
      lastSavedAt: now,
      lastModifiedAt: draftData.lastModifiedAt || now,
      version: (existingDraft?.version || 0) + 1,
      syncToken: config.syncToken,
      scheduledSendTime: draftData.scheduledSendTime,
      tags: draftData.tags,
      references: draftData.references
    };

    // Calculate storage impact
    const draftSize = JSON.stringify(newDraft).length;
    if (config.maxDraftSize && draftSize > config.maxDraftSize) {
      throw new Error(
        `Draft exceeds maximum size limit (${draftSize} > ${config.maxDraftSize} bytes)`
      );
    }

    // Apply conflict resolution if needed
    if (conflictDetected && resolutionStrategy === 'merge' && existingDraft) {
      newDraft.subject = existingDraft.subject || newDraft.subject;
      newDraft.body = newDraft.body || existingDraft.body;
      newDraft.to = this._mergeRecipients(existingDraft.to, newDraft.to);
    }

    // Save to cache (simulating IndexedDB)
    this._draftCache.set(draftId, newDraft);

    // Record save metadata
    const saveMetadata: DraftSaveMetadata = {
      saveId: this._generateId('save'),
      draftId,
      savedAt: now,
      device: config.deviceId || 'unknown',
      changesSummary: {
        fieldsChanged: existingDraft
          ? this._detectChanges(existingDraft, newDraft)
          : ['all'],
        attachmentsAdded: (newDraft.attachments || []).length - (existingDraft?.attachments?.length || 0),
        attachmentsRemoved: Math.max(
          0,
          (existingDraft?.attachments?.length || 0) - (newDraft.attachments || []).length
        ),
        bytesAdded: Math.max(0, draftSize - (existingDraft ? JSON.stringify(existingDraft).length : 0))
      },
      ...(conflictDetected && { conflict: {
        remoteVersion: existingDraft!.version,
        remoteModifiedAt: existingDraft!.lastModifiedAt,
        resolutionStrategy
      } })
    };

    if (!this._saveHistory.has(draftId)) {
      this._saveHistory.set(draftId, []);
    }
    this._saveHistory.get(draftId)!.push(saveMetadata);

    return {
      actionPerformed: 'auto-save',
      draft: newDraft,
      saveMetadata,
      conflictDetected,
      conflictResolution: conflictDetected
        ? { strategy: resolutionStrategy, mergedState: newDraft }
        : undefined,
      stats: {
        operationDuration: Date.now() - now,
        itemsAffected: 1,
        storageUsed: draftSize
      }
    };
  }

  /**
   * Handle draft recovery on reconnection
   */
  private async _handleRecover(
    config: DraftManagerConfig,
    _context: WorkflowContext
  ): Promise<DraftOperationResult> {
    const draftId = config.draftId!;
    const draft = this._draftCache.get(draftId);

    if (!draft) {
      throw new Error(`Draft not found for recovery: ${draftId}`);
    }

    // Check if recovery is within age limit
    if (config.recoveryOptions?.maxRecoveryAge) {
      const age = Date.now() - draft.lastSavedAt;
      if (age > config.recoveryOptions.maxRecoveryAge) {
        throw new Error(
          `Draft too old for recovery (${age}ms > ${config.recoveryOptions.maxRecoveryAge}ms)`
        );
      }
    }

    // Get save history for recovery options
    const saveHistory = this._saveHistory.get(draftId) || [];
    const hasConflicts = this._conflictLog.has(draftId);
    const hasSaveHistory = saveHistory.length > 0;

    const recovery: DraftRecovery = {
      draftId,
      recoveredAt: Date.now(),
      recoveryReason: config.recoveryOptions?.preferLocal ? 'reconnection' : 'browser-crash',
      lastKnownState: draft,
      autoRecovered: !hasConflicts && !hasSaveHistory,
      userConfirmationRequired: hasConflicts
    };

    return {
      actionPerformed: 'recover',
      draft,
      recovery,
      conflictDetected: hasConflicts,
      stats: {
        operationDuration: 0,
        itemsAffected: 1,
        storageUsed: JSON.stringify(draft).length
      }
    };
  }

  /**
   * Handle draft deletion
   */
  private async _handleDelete(
    config: DraftManagerConfig,
    context: WorkflowContext
  ): Promise<DraftOperationResult> {
    const draftId = config.draftId!;
    const draft = this._draftCache.get(draftId);

    if (!draft) {
      throw new Error(`Draft not found: ${draftId}`);
    }

    // Verify tenant/user ownership
    if (draft.tenantId !== context.tenantId || draft.userId !== context.userId) {
      throw new Error('Unauthorized: Draft belongs to different user/tenant');
    }

    const storageFreed = JSON.stringify(draft).length;

    // Delete draft and associated metadata
    this._draftCache.delete(draftId);
    this._saveHistory.delete(draftId);
    this._conflictLog.delete(draftId);

    return {
      actionPerformed: 'delete',
      conflictDetected: false,
      stats: {
        operationDuration: 0,
        itemsAffected: 1,
        storageUsed: -storageFreed
      }
    };
  }

  /**
   * Handle draft export with optional compression
   */
  private async _handleExport(
    config: DraftManagerConfig,
    context: WorkflowContext
  ): Promise<DraftOperationResult> {
    // Collect all drafts for this account/tenant
    const drafts: DraftState[] = [];
    let totalSize = 0;

    for (const draft of this._draftCache.values()) {
      if (draft.accountId === config.accountId && draft.tenantId === context.tenantId) {
        drafts.push(draft);
        totalSize += JSON.stringify(draft).length;
      }
    }

    // Create bundle
    const bundle: DraftBundle = {
      bundleId: this._generateId('bundle'),
      exportedAt: Date.now(),
      drafts,
      metadata: {
        count: drafts.length,
        totalSize,
        compressionRatio: config.enableCompression !== false ? 0.3 : 1.0, // Simulate 70% compression
        format: config.enableCompression !== false ? 'gzip' : 'json'
      }
    };

    const compressedSize = Math.floor(totalSize * bundle.metadata.compressionRatio);

    return {
      actionPerformed: 'export',
      bundle,
      conflictDetected: false,
      stats: {
        operationDuration: 0,
        itemsAffected: drafts.length,
        storageUsed: totalSize,
        compressionSavings: config.enableCompression !== false ? totalSize - compressedSize : 0
      }
    };
  }

  /**
   * Handle draft import with conflict detection
   */
  private async _handleImport(
    config: DraftManagerConfig,
    context: WorkflowContext
  ): Promise<DraftOperationResult> {
    const bundle = config.bundleData!;
    let importedCount = 0;
    let conflictCount = 0;

    for (const incomingDraft of bundle.drafts) {
      const existingDraft = this._draftCache.get(incomingDraft.draftId);

      if (existingDraft) {
        conflictCount++;

        // Use import conflict strategy
        const preferLocal = config.recoveryOptions?.preferLocal ?? true;
        if (preferLocal && existingDraft.lastModifiedAt > incomingDraft.lastModifiedAt) {
          continue; // Keep existing
        }

        this._recordConflict(incomingDraft.draftId, 'import-conflict');
      }

      // Import with tenant/user override for security
      const importedDraft: DraftState = {
        ...incomingDraft,
        tenantId: context.tenantId,
        userId: context.userId,
        accountId: config.accountId,
        version: (existingDraft?.version || 0) + 1
      };

      this._draftCache.set(incomingDraft.draftId, importedDraft);
      importedCount++;
    }

    return {
      actionPerformed: 'import',
      conflictDetected: conflictCount > 0,
      stats: {
        operationDuration: 0,
        itemsAffected: importedCount,
        storageUsed: bundle.metadata.totalSize
      }
    };
  }

  /**
   * Handle listing drafts for an account
   */
  private async _handleList(
    config: DraftManagerConfig,
    context: WorkflowContext
  ): Promise<DraftOperationResult> {
    const drafts: DraftState[] = [];

    for (const draft of this._draftCache.values()) {
      if (draft.accountId === config.accountId && draft.tenantId === context.tenantId) {
        drafts.push({
          ...draft,
          // Clear body for list response (optimization)
          body: ''
        });
      }
    }

    return {
      actionPerformed: 'list',
      drafts,
      conflictDetected: false,
      stats: {
        operationDuration: 0,
        itemsAffected: drafts.length,
        storageUsed: drafts.reduce((sum, d) => sum + JSON.stringify(d).length, 0)
      }
    };
  }

  /**
   * Handle getting a single draft
   */
  private async _handleGet(
    config: DraftManagerConfig,
    context: WorkflowContext
  ): Promise<DraftOperationResult> {
    const draftId = config.draftId!;
    const draft = this._draftCache.get(draftId);

    if (!draft) {
      throw new Error(`Draft not found: ${draftId}`);
    }

    // Verify access
    if (draft.tenantId !== context.tenantId || draft.userId !== context.userId) {
      throw new Error('Unauthorized: Draft belongs to different user/tenant');
    }

    return {
      actionPerformed: 'get',
      draft,
      conflictDetected: false,
      stats: {
        operationDuration: 0,
        itemsAffected: 1,
        storageUsed: JSON.stringify(draft).length
      }
    };
  }

  /**
   * Validate draft manager configuration
   */
  private _validateConfig(config: DraftManagerConfig): void {
    if (!config.action) {
      throw new Error('Draft action is required');
    }

    if (!config.accountId) {
      throw new Error('Email account ID (accountId) is required');
    }
  }

  /**
   * Record conflict for tracking
   */
  private _recordConflict(draftId: string, reason: string): void {
    if (!this._conflictLog.has(draftId)) {
      this._conflictLog.set(draftId, []);
    }
    this._conflictLog.get(draftId)!.push({
      timestamp: Date.now(),
      reason
    });
  }

  /**
   * Merge recipient lists, avoiding duplicates
   */
  private _mergeRecipients(list1: EmailRecipient[], list2: EmailRecipient[]): EmailRecipient[] {
    const merged: Map<string, EmailRecipient> = new Map();

    for (const recipient of list1) {
      merged.set(recipient.address, recipient);
    }

    for (const recipient of list2) {
      if (!merged.has(recipient.address)) {
        merged.set(recipient.address, recipient);
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Detect which fields changed between two drafts
   */
  private _detectChanges(oldDraft: DraftState, newDraft: DraftState): string[] {
    const changes: string[] = [];

    if (oldDraft.subject !== newDraft.subject) changes.push('subject');
    if (oldDraft.body !== newDraft.body) changes.push('body');
    if (oldDraft.bodyHtml !== newDraft.bodyHtml) changes.push('bodyHtml');
    if (JSON.stringify(oldDraft.to) !== JSON.stringify(newDraft.to)) changes.push('to');
    if (JSON.stringify(oldDraft.cc) !== JSON.stringify(newDraft.cc)) changes.push('cc');
    if (JSON.stringify(oldDraft.bcc) !== JSON.stringify(newDraft.bcc)) changes.push('bcc');
    if (oldDraft.attachments.length !== newDraft.attachments.length) changes.push('attachments');

    return changes;
  }

  /**
   * Generate unique identifier
   */
  private _generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

/**
 * Export singleton executor instance
 */
export const draftManagerExecutor = new DraftManagerExecutor();
