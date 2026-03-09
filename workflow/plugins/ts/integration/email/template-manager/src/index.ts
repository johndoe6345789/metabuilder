/**
 * Template Manager Node Executor Plugin - Phase 6
 * Manages email templates with variable interpolation and team sharing
 *
 * Features:
 * - Save/update/delete email templates with categories
 * - Template variables: {{name}}, {{date}}, {{recipient}}, custom placeholders
 * - Template categories: responses, greetings, signatures, custom
 * - Auto-expansion in compose with variable substitution
 * - Share templates with team members and configure permissions
 * - Template usage tracking and analytics
 * - Soft delete for template recovery
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
 * Email template variable definition
 */
export interface TemplateVariable {
  name: string;
  placeholder: string; // {{name}}
  description: string;
  type: 'text' | 'date' | 'number' | 'email';
  required: boolean;
  defaultValue?: string;
  examples?: string[];
}

/**
 * Template sharing configuration
 */
export interface TemplateShareConfig {
  userId: string;
  email: string;
  name: string;
  permission: 'view' | 'edit' | 'admin';
  sharedAt: number;
}

/**
 * Complete email template definition
 */
export interface EmailTemplate {
  templateId: string;
  accountId: string;
  tenantId: string;
  ownerId: string;
  name: string;
  description?: string;
  category: 'responses' | 'greetings' | 'signatures' | 'custom';
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  variables: TemplateVariable[];
  tags?: string[];
  isPublic: boolean;
  sharedWith: TemplateShareConfig[];
  usageCount: number;
  lastUsedAt?: number;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  version: number;
}

/**
 * Template usage record for analytics
 */
export interface TemplateUsageRecord {
  usageId: string;
  templateId: string;
  userId: string;
  accountId: string;
  tenantId: string;
  variables: Record<string, string>;
  resultingSubject: string;
  resultingBody: string;
  usedAt: number;
}

/**
 * Template expansion result with variable values
 */
export interface ExpandedTemplate {
  templateId: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  variables: Record<string, string>;
  missingVariables: string[];
  errors: string[];
}

/**
 * Template Manager Configuration
 */
export interface TemplateManagerConfig {
  action: TemplateAction;
  /** UUID of email account (FK to EmailClient) */
  accountId: string;
  /** Template data for create/update operations */
  template?: Partial<EmailTemplate>;
  /** Template ID for get/delete/expand/share operations */
  templateId?: string;
  /** Variables for template expansion */
  variableValues?: Record<string, string>;
  /** User ID for sharing operations */
  shareWithUserId?: string;
  /** Permission level for sharing */
  sharePermission?: 'view' | 'edit' | 'admin';
  /** Filter options for list operations */
  filters?: {
    category?: 'responses' | 'greetings' | 'signatures' | 'custom';
    searchText?: string;
    isPublic?: boolean;
    sharedOnly?: boolean;
    includeDeleted?: boolean;
  };
  /** Pagination for list operations */
  pagination?: {
    page: number;
    pageSize: number;
  };
}

/**
 * Template action types
 */
export type TemplateAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'recover'
  | 'get'
  | 'list'
  | 'expand'
  | 'share'
  | 'unshare'
  | 'track-usage'
  | 'get-usage-stats';

/**
 * Template Manager Operation Result
 */
export interface TemplateOperationResult {
  actionPerformed: TemplateAction;
  template?: EmailTemplate;
  templates?: EmailTemplate[];
  expandedTemplate?: ExpandedTemplate;
  usageRecord?: TemplateUsageRecord;
  usageStats?: {
    templateId: string;
    totalUsage: number;
    lastUsedAt?: number;
    averageVariableCount: number;
    topVariables: Array<{ name: string; usageCount: number }>;
  };
  shareConfig?: TemplateShareConfig;
  success: boolean;
  message?: string;
  stats: {
    operationDuration: number;
    itemsAffected: number;
    storageUsed: number;
  };
}

/**
 * Template Manager Executor - Email template lifecycle management
 *
 * Handles template creation, variable interpolation, sharing, and usage tracking
 */
export class TemplateManagerExecutor implements INodeExecutor {
  readonly nodeType = 'template-manager';
  readonly category = 'email-integration';
  readonly description =
    'Manage email templates with variables, sharing, and usage tracking';

  /** In-memory template cache (simulating database) */
  private _templateCache: Map<string, EmailTemplate> = new Map();
  /** Usage history for analytics */
  private _usageHistory: Map<string, TemplateUsageRecord[]> = new Map();
  /** Sharing audit log */
  private _sharingAuditLog: Array<{
    timestamp: number;
    action: 'share' | 'unshare';
    templateId: string;
    from: string;
    to: string;
    permission: string;
  }> = [];

  /** Standard template variables available in all templates */
  private readonly STANDARD_VARIABLES: TemplateVariable[] = [
    {
      name: 'name',
      placeholder: '{{name}}',
      description: 'Recipient full name',
      type: 'text',
      required: false,
      examples: ['John Smith', 'Jane Doe']
    },
    {
      name: 'date',
      placeholder: '{{date}}',
      description: 'Current date',
      type: 'date',
      required: false,
      defaultValue: new Date().toISOString().split('T')[0]
    },
    {
      name: 'recipient',
      placeholder: '{{recipient}}',
      description: 'Recipient email address',
      type: 'email',
      required: false,
      examples: ['john@example.com', 'jane@example.com']
    }
  ];

  /**
   * Execute template management operation
   */
  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    _state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const config = node.parameters as TemplateManagerConfig;

      // Validate configuration
      this._validateConfig(config);

      // Execute based on action type
      let result: TemplateOperationResult;

      switch (config.action) {
        case 'create':
          result = await this._handleCreate(config, context);
          break;
        case 'update':
          result = await this._handleUpdate(config, context);
          break;
        case 'delete':
          result = await this._handleDelete(config, context);
          break;
        case 'recover':
          result = await this._handleRecover(config, context);
          break;
        case 'get':
          result = await this._handleGet(config, context);
          break;
        case 'list':
          result = await this._handleList(config, context);
          break;
        case 'expand':
          result = await this._handleExpand(config, context);
          break;
        case 'share':
          result = await this._handleShare(config, context);
          break;
        case 'unshare':
          result = await this._handleUnshare(config, context);
          break;
        case 'track-usage':
          result = await this._handleTrackUsage(config, context);
          break;
        case 'get-usage-stats':
          result = await this._handleGetUsageStats(config, context);
          break;
        default:
          throw new Error(`Unknown template action: ${config.action}`);
      }

      const duration = Date.now() - startTime;

      return {
        status: result.success ? 'success' : 'error',
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

      let errorCode = 'TEMPLATE_MANAGER_ERROR';
      if (errorMsg.includes('validation')) {
        errorCode = 'VALIDATION_ERROR';
      } else if (errorMsg.includes('not found')) {
        errorCode = 'NOT_FOUND';
      } else if (errorMsg.includes('unauthorized')) {
        errorCode = 'UNAUTHORIZED';
      } else if (errorMsg.includes('variable')) {
        errorCode = 'VARIABLE_ERROR';
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
      errors.push('Template action is required');
    } else if (
      ![
        'create',
        'update',
        'delete',
        'recover',
        'get',
        'list',
        'expand',
        'share',
        'unshare',
        'track-usage',
        'get-usage-stats'
      ].includes(params.action)
    ) {
      errors.push(
        `Invalid action "${params.action}". Must be one of: create, update, delete, recover, get, list, expand, share, unshare, track-usage, get-usage-stats`
      );
    }

    // Required: accountId
    if (!params.accountId) {
      errors.push('Email account ID (accountId) is required');
    } else if (typeof params.accountId !== 'string') {
      errors.push('accountId must be a string');
    }

    // Action-specific validation
    if (params.action === 'create') {
      if (!params.template) {
        errors.push('Template data (template) is required for create action');
      } else {
        const tmpl = params.template;
        if (!tmpl.name) {
          errors.push('Template name is required');
        }
        if (!tmpl.subject) {
          errors.push('Template subject is required');
        }
        if (!tmpl.bodyText && !tmpl.bodyHtml) {
          errors.push('Template body (bodyText or bodyHtml) is required');
        }
        if (!['responses', 'greetings', 'signatures', 'custom'].includes(tmpl.category || '')) {
          errors.push('Invalid category. Must be: responses, greetings, signatures, or custom');
        }
      }
    } else if (['update', 'delete', 'recover', 'get', 'expand'].includes(params.action)) {
      if (!params.templateId) {
        errors.push(`Template ID (templateId) is required for ${params.action} action`);
      } else if (typeof params.templateId !== 'string') {
        errors.push('templateId must be a string');
      }
    } else if (params.action === 'expand') {
      if (!params.variableValues) {
        warnings.push('No variable values provided for expansion - missing variables will use defaults');
      } else if (typeof params.variableValues !== 'object') {
        errors.push('variableValues must be an object');
      }
    } else if (['share', 'unshare'].includes(params.action)) {
      if (!params.templateId) {
        errors.push(`Template ID (templateId) is required for ${params.action} action`);
      }
      if (params.action === 'share') {
        if (!params.shareWithUserId) {
          errors.push('User ID (shareWithUserId) is required for share action');
        }
        if (!['view', 'edit', 'admin'].includes(params.sharePermission || '')) {
          errors.push("Permission must be one of: view, edit, admin");
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Handle template creation
   */
  private async _handleCreate(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const templateData = config.template!;
    const templateId = this._generateId('tmpl');
    const now = Date.now();

    // Validate required fields
    if (!templateData.name) {
      throw new Error('Template name is required');
    }
    if (!templateData.subject) {
      throw new Error('Template subject is required');
    }
    if (!templateData.bodyText && !templateData.bodyHtml) {
      throw new Error('Template must have bodyText or bodyHtml');
    }

    // Parse variables from template content
    const variables = this._extractVariables(
      templateData.subject!,
      templateData.bodyText || '',
      templateData.bodyHtml
    );

    // Create template
    const template: EmailTemplate = {
      templateId,
      accountId: config.accountId,
      tenantId: context.tenantId,
      ownerId: context.userId,
      name: templateData.name,
      description: templateData.description,
      category: (templateData.category || 'custom') as any,
      subject: templateData.subject,
      bodyText: templateData.bodyText || '',
      bodyHtml: templateData.bodyHtml,
      variables,
      tags: templateData.tags,
      isPublic: templateData.isPublic || false,
      sharedWith: [],
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      version: 1
    };

    this._templateCache.set(templateId, template);

    const storageUsed = JSON.stringify(template).length;

    return {
      actionPerformed: 'create',
      template,
      success: true,
      message: `Template "${template.name}" created successfully`,
      stats: {
        operationDuration: Date.now() - now,
        itemsAffected: 1,
        storageUsed
      }
    };
  }

  /**
   * Handle template update
   */
  private async _handleUpdate(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const templateId = config.templateId!;
    const templateData = config.template!;
    const now = Date.now();

    const template = this._templateCache.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Verify ownership
    if (template.ownerId !== context.userId && template.tenantId === context.tenantId) {
      // Check if user has edit permission
      const shareConfig = template.sharedWith.find((s) => s.userId === context.userId);
      if (!shareConfig || shareConfig.permission === 'view') {
        throw new Error('Unauthorized: You do not have permission to edit this template');
      }
    }

    // Update template fields
    template.name = templateData.name || template.name;
    template.description = templateData.description ?? template.description;
    template.category = (templateData.category || template.category) as any;
    template.subject = templateData.subject || template.subject;
    template.bodyText = templateData.bodyText || template.bodyText;
    if (templateData.bodyHtml) {
      template.bodyHtml = templateData.bodyHtml;
    }
    template.tags = templateData.tags ?? template.tags;
    template.isPublic = templateData.isPublic ?? template.isPublic;

    // Re-extract variables
    template.variables = this._extractVariables(
      template.subject,
      template.bodyText,
      template.bodyHtml
    );

    // Increment version and update timestamp
    template.version++;
    template.updatedAt = now;

    this._templateCache.set(templateId, template);

    const storageUsed = JSON.stringify(template).length;

    return {
      actionPerformed: 'update',
      template,
      success: true,
      message: `Template "${template.name}" updated successfully`,
      stats: {
        operationDuration: Date.now() - now,
        itemsAffected: 1,
        storageUsed
      }
    };
  }

  /**
   * Handle template deletion (soft delete)
   */
  private async _handleDelete(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const templateId = config.templateId!;
    const template = this._templateCache.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Verify ownership
    if (template.ownerId !== context.userId) {
      throw new Error('Unauthorized: Only template owner can delete');
    }

    // Soft delete
    template.isDeleted = true;
    template.updatedAt = Date.now();

    this._templateCache.set(templateId, template);

    return {
      actionPerformed: 'delete',
      success: true,
      message: `Template "${template.name}" deleted successfully`,
      stats: {
        operationDuration: 0,
        itemsAffected: 1,
        storageUsed: 0
      }
    };
  }

  /**
   * Handle template recovery (restore soft-deleted)
   */
  private async _handleRecover(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const templateId = config.templateId!;
    const template = this._templateCache.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    if (!template.isDeleted) {
      throw new Error('Template is not deleted, nothing to recover');
    }

    // Verify ownership
    if (template.ownerId !== context.userId) {
      throw new Error('Unauthorized: Only template owner can recover');
    }

    // Restore
    template.isDeleted = false;
    template.updatedAt = Date.now();

    this._templateCache.set(templateId, template);

    return {
      actionPerformed: 'recover',
      template,
      success: true,
      message: `Template "${template.name}" recovered successfully`,
      stats: {
        operationDuration: 0,
        itemsAffected: 1,
        storageUsed: JSON.stringify(template).length
      }
    };
  }

  /**
   * Handle getting a single template
   */
  private async _handleGet(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const templateId = config.templateId!;
    const template = this._templateCache.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Check access
    const hasAccess =
      template.ownerId === context.userId ||
      template.isPublic ||
      template.sharedWith.some((s) => s.userId === context.userId);

    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have access to this template');
    }

    return {
      actionPerformed: 'get',
      template,
      success: true,
      stats: {
        operationDuration: 0,
        itemsAffected: 1,
        storageUsed: JSON.stringify(template).length
      }
    };
  }

  /**
   * Handle listing templates
   */
  private async _handleList(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const filters = config.filters || {};
    const pagination = config.pagination || { page: 1, pageSize: 20 };
    const templates: EmailTemplate[] = [];

    for (const template of this._templateCache.values()) {
      // Skip deleted unless requested
      if (template.isDeleted && !filters.includeDeleted) {
        continue;
      }

      // Multi-tenant filtering
      if (template.tenantId !== context.tenantId) {
        continue;
      }

      // Access filtering
      const hasAccess =
        template.ownerId === context.userId ||
        template.isPublic ||
        template.sharedWith.some((s) => s.userId === context.userId);

      if (!hasAccess) {
        continue;
      }

      // Category filtering
      if (filters.category && template.category !== filters.category) {
        continue;
      }

      // Shared filtering
      if (filters.sharedOnly && template.ownerId === context.userId) {
        continue;
      }

      // Public filtering
      if (filters.isPublic !== undefined && template.isPublic !== filters.isPublic) {
        continue;
      }

      // Search text filtering
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matches =
          template.name.toLowerCase().includes(searchLower) ||
          template.description?.toLowerCase().includes(searchLower) ||
          template.subject.toLowerCase().includes(searchLower);
        if (!matches) {
          continue;
        }
      }

      templates.push(template);
    }

    // Sort by updatedAt (newest first)
    templates.sort((a, b) => b.updatedAt - a.updatedAt);

    // Apply pagination
    const startIdx = (pagination.page - 1) * pagination.pageSize;
    const paginatedTemplates = templates.slice(
      startIdx,
      startIdx + pagination.pageSize
    );

    return {
      actionPerformed: 'list',
      templates: paginatedTemplates,
      success: true,
      message: `Found ${templates.length} template(s)`,
      stats: {
        operationDuration: 0,
        itemsAffected: paginatedTemplates.length,
        storageUsed: paginatedTemplates.reduce((sum, t) => sum + JSON.stringify(t).length, 0)
      }
    };
  }

  /**
   * Handle template expansion with variable substitution
   */
  private async _handleExpand(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const templateId = config.templateId!;
    const variableValues = config.variableValues || {};
    const now = Date.now();

    const template = this._templateCache.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Check access
    const hasAccess =
      template.ownerId === context.userId ||
      template.isPublic ||
      template.sharedWith.some((s) => s.userId === context.userId);

    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have access to this template');
    }

    // Expand template
    const expanded = this._expandTemplate(template, variableValues);

    // Track usage
    this._recordUsage(templateId, context.userId, variableValues, expanded);

    // Update usage count and last used time
    template.usageCount++;
    template.lastUsedAt = now;
    this._templateCache.set(templateId, template);

    return {
      actionPerformed: 'expand',
      expandedTemplate: expanded,
      success: true,
      message: `Template "${template.name}" expanded successfully`,
      stats: {
        operationDuration: Date.now() - now,
        itemsAffected: 1,
        storageUsed: JSON.stringify(expanded).length
      }
    };
  }

  /**
   * Handle template sharing
   */
  private async _handleShare(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const templateId = config.templateId!;
    const shareWithUserId = config.shareWithUserId!;
    const sharePermission = (config.sharePermission || 'view') as 'view' | 'edit' | 'admin';

    const template = this._templateCache.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Verify ownership (only owner or admin can share)
    if (template.ownerId !== context.userId) {
      throw new Error('Unauthorized: Only template owner can share');
    }

    // Check if already shared
    const existingShare = template.sharedWith.find((s) => s.userId === shareWithUserId);
    if (existingShare) {
      // Update permission
      existingShare.permission = sharePermission;
    } else {
      // Add new share
      template.sharedWith.push({
        userId: shareWithUserId,
        email: `user-${shareWithUserId}@example.com`, // Placeholder email
        name: `User ${shareWithUserId.substring(0, 8)}`,
        permission: sharePermission,
        sharedAt: Date.now()
      });
    }

    // Record in audit log
    this._sharingAuditLog.push({
      timestamp: Date.now(),
      action: 'share',
      templateId,
      from: context.userId,
      to: shareWithUserId,
      permission: sharePermission
    });

    this._templateCache.set(templateId, template);

    const shareConfig = template.sharedWith.find((s) => s.userId === shareWithUserId)!;

    return {
      actionPerformed: 'share',
      template,
      shareConfig,
      success: true,
      message: `Template "${template.name}" shared with user ${shareWithUserId}`,
      stats: {
        operationDuration: 0,
        itemsAffected: 1,
        storageUsed: JSON.stringify(shareConfig).length
      }
    };
  }

  /**
   * Handle unsharing template
   */
  private async _handleUnshare(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const templateId = config.templateId!;
    const shareWithUserId = config.shareWithUserId!;

    const template = this._templateCache.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Verify ownership
    if (template.ownerId !== context.userId) {
      throw new Error('Unauthorized: Only template owner can unshare');
    }

    // Find and remove share
    const shareIdx = template.sharedWith.findIndex((s) => s.userId === shareWithUserId);
    if (shareIdx === -1) {
      throw new Error(`Template is not shared with user ${shareWithUserId}`);
    }

    const removedShare = template.sharedWith[shareIdx];
    template.sharedWith.splice(shareIdx, 1);

    // Record in audit log
    this._sharingAuditLog.push({
      timestamp: Date.now(),
      action: 'unshare',
      templateId,
      from: context.userId,
      to: shareWithUserId,
      permission: removedShare.permission
    });

    this._templateCache.set(templateId, template);

    return {
      actionPerformed: 'unshare',
      template,
      success: true,
      message: `Template "${template.name}" unshared from user ${shareWithUserId}`,
      stats: {
        operationDuration: 0,
        itemsAffected: 1,
        storageUsed: 0
      }
    };
  }

  /**
   * Handle usage tracking
   */
  private async _handleTrackUsage(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const templateId = config.templateId!;
    const variableValues = config.variableValues || {};

    const template = this._templateCache.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Expand to get resulting content
    const expanded = this._expandTemplate(template, variableValues);

    // Create and record usage
    const usageRecord: TemplateUsageRecord = {
      usageId: this._generateId('usage'),
      templateId,
      userId: context.userId,
      accountId: config.accountId,
      tenantId: context.tenantId,
      variables: variableValues,
      resultingSubject: expanded.subject,
      resultingBody: expanded.bodyText,
      usedAt: Date.now()
    };

    if (!this._usageHistory.has(templateId)) {
      this._usageHistory.set(templateId, []);
    }
    this._usageHistory.get(templateId)!.push(usageRecord);

    return {
      actionPerformed: 'track-usage',
      usageRecord,
      success: true,
      message: 'Usage tracked successfully',
      stats: {
        operationDuration: 0,
        itemsAffected: 1,
        storageUsed: JSON.stringify(usageRecord).length
      }
    };
  }

  /**
   * Handle getting usage statistics
   */
  private async _handleGetUsageStats(
    config: TemplateManagerConfig,
    context: WorkflowContext
  ): Promise<TemplateOperationResult> {
    const templateId = config.templateId!;

    const template = this._templateCache.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Check access
    const hasAccess = template.ownerId === context.userId;
    if (!hasAccess) {
      throw new Error('Unauthorized: Only template owner can view usage stats');
    }

    const usageHistory = this._usageHistory.get(templateId) || [];

    // Calculate statistics
    const variableUsageMap: Record<string, number> = {};
    let totalVars = 0;

    for (const record of usageHistory) {
      totalVars += Object.keys(record.variables).length;
      for (const varName of Object.keys(record.variables)) {
        variableUsageMap[varName] = (variableUsageMap[varName] || 0) + 1;
      }
    }

    const topVariables = Object.entries(variableUsageMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, usageCount]) => ({ name, usageCount }));

    return {
      actionPerformed: 'get-usage-stats',
      usageStats: {
        templateId,
        totalUsage: template.usageCount,
        lastUsedAt: template.lastUsedAt,
        averageVariableCount: usageHistory.length > 0 ? totalVars / usageHistory.length : 0,
        topVariables
      },
      success: true,
      stats: {
        operationDuration: 0,
        itemsAffected: 1,
        storageUsed: 0
      }
    };
  }

  /**
   * Extract variables from template content
   */
  private _extractVariables(
    subject: string,
    bodyText: string,
    bodyHtml?: string
  ): TemplateVariable[] {
    const variables: TemplateVariable[] = [...this.STANDARD_VARIABLES];
    const varPattern = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
    const foundVars = new Set<string>();

    // Extract from subject
    let match;
    while ((match = varPattern.exec(subject)) !== null) {
      foundVars.add(match[1]);
    }

    // Extract from body text
    varPattern.lastIndex = 0;
    while ((match = varPattern.exec(bodyText)) !== null) {
      foundVars.add(match[1]);
    }

    // Extract from body HTML
    if (bodyHtml) {
      varPattern.lastIndex = 0;
      while ((match = varPattern.exec(bodyHtml)) !== null) {
        foundVars.add(match[1]);
      }
    }

    // Add custom variables not in standard list
    for (const varName of foundVars) {
      if (!variables.some((v) => v.name === varName)) {
        variables.push({
          name: varName,
          placeholder: `{{${varName}}}`,
          description: `Custom variable: ${varName}`,
          type: 'text',
          required: false
        });
      }
    }

    return variables;
  }

  /**
   * Expand template with variable substitution
   */
  private _expandTemplate(
    template: EmailTemplate,
    variableValues: Record<string, string>
  ): ExpandedTemplate {
    const errors: string[] = [];
    const missingVariables: string[] = [];

    // Create values map with defaults
    const values: Record<string, string> = { ...variableValues };

    // Fill in default values for missing variables
    for (const variable of template.variables) {
      if (!(variable.name in values)) {
        if (variable.defaultValue) {
          values[variable.name] = variable.defaultValue;
        } else if (variable.required) {
          missingVariables.push(variable.name);
        }
      }
    }

    // Perform substitution
    let subject = template.subject;
    let bodyText = template.bodyText;
    let bodyHtml = template.bodyHtml;

    for (const [varName, varValue] of Object.entries(values)) {
      const placeholder = `{{${varName}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), varValue || '');
      bodyText = bodyText.replace(new RegExp(placeholder, 'g'), varValue || '');
      if (bodyHtml) {
        bodyHtml = bodyHtml.replace(new RegExp(placeholder, 'g'), varValue || '');
      }
    }

    return {
      templateId: template.templateId,
      subject,
      bodyText,
      bodyHtml,
      variables: values,
      missingVariables,
      errors
    };
  }

  /**
   * Record template usage for analytics
   */
  private _recordUsage(
    templateId: string,
    userId: string,
    variables: Record<string, string>,
    expanded: ExpandedTemplate
  ): void {
    const usageRecord: TemplateUsageRecord = {
      usageId: this._generateId('usage'),
      templateId,
      userId,
      accountId: '', // Would be filled from context
      tenantId: '', // Would be filled from context
      variables,
      resultingSubject: expanded.subject,
      resultingBody: expanded.bodyText,
      usedAt: Date.now()
    };

    if (!this._usageHistory.has(templateId)) {
      this._usageHistory.set(templateId, []);
    }
    this._usageHistory.get(templateId)!.push(usageRecord);
  }

  /**
   * Validate configuration parameters
   */
  private _validateConfig(config: TemplateManagerConfig): void {
    if (!config.action) {
      throw new Error('Template action is required');
    }

    if (!config.accountId) {
      throw new Error('Email account ID (accountId) is required');
    }
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
export const templateManagerExecutor = new TemplateManagerExecutor();
