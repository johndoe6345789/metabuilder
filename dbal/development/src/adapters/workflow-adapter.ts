/**
 * Workflow Adapter - DBAL adapter for workflow entity operations
 * Handles multi-tenant filtering, caching, and validation
 * @packageDocumentation
 */

import { ValidationAdapter, getValidationAdapter } from '../workflow/validation-adapter'

export interface WorkflowListOptions {
  tenantId: string
  limit?: number
  offset?: number
  workflowStatus?: string
  category?: string
  isPublished?: boolean
}

export interface WorkflowCreatePayload {
  tenantId: string
  name: string
  nodes: any[]
  connections: any
  version?: string
  category?: string
  metadata?: any
  executionConfig?: any
}

export interface WorkflowUpdatePayload {
  tenantId: string
  name?: string
  nodes?: any[]
  connections?: any
  version?: string
  category?: string
  workflowStatus?: string
  metadata?: any
  executionConfig?: any
}

export class WorkflowAdapter {
  private validator: ValidationAdapter
  private cache: Map<string, any> = new Map()
  private readonly cacheTTL = 3600000 // 1 hour

  constructor() {
    this.validator = getValidationAdapter()
  }

  /**
   * List workflows with multi-tenant filtering
   */
  async list(options: WorkflowListOptions): Promise<any[]> {
    const { tenantId, limit = 50, offset = 0, workflowStatus, category, isPublished } = options

    // Build cache key
    const cacheKey = 'workflows:' + tenantId + ':' + (workflowStatus || 'all') + ':' + (category || 'all') + ':' + (isPublished ?? 'all')
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    // Build filter
    const filter: any = { tenantId }
    if (workflowStatus) filter.status = workflowStatus
    if (category) filter.category = category
    if (isPublished !== undefined) filter.isPublished = isPublished

    // Query
    const workflows = await this.queryWorkflows(filter, limit, offset)

    // Cache result
    this.setInCache(cacheKey, workflows)

    return workflows
  }

  /**
   * Get single workflow with tenant check
   */
  async get(workflowId: string, tenantId: string): Promise<any | null> {
    // Check cache first
    const cacheKey = 'workflow:' + workflowId
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      // Verify tenant match
      if (cached.tenantId !== tenantId) {
        throw new Error('Unauthorized: workflow belongs to different tenant')
      }
      return cached
    }

    // Query workflow
    const workflow = await this.queryWorkflow(workflowId)

    if (!workflow) return null

    // Verify tenant match
    if (workflow.tenantId !== tenantId) {
      throw new Error('Unauthorized: workflow belongs to different tenant')
    }

    // Cache result
    this.setInCache(cacheKey, workflow)

    return workflow
  }

  /**
   * Create workflow with validation
   */
  async create(payload: WorkflowCreatePayload): Promise<any> {
    const { tenantId, name } = payload

    // Validate before create
    const validation = await this.validator.validateBeforeCreate(
      tenantId,
      payload
    )

    if (!validation.valid) {
      throw new Error('Workflow validation failed: ' + validation.errors.join(', '))
    }

    // Generate ID if not provided
    const id = payload.name
      ? 'workflow_' + payload.name.toLowerCase().replace(/\s+/g, '_')
      : 'workflow_' + Date.now()

    // Add required fields
    const workflow = {
      ...validation.data,
      id,
      tenantId,
      status: 'draft',
      isPublished: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      validationStatus: {
        valid: true,
        lastValidated: new Date(),
        errors: [],
        warnings: validation.warnings
      }
    }

    // Persist to database
    const created = await this.persistWorkflow(workflow)

    // Cache result
    this.setInCache('workflow:' + created.id, created)

    // Invalidate list cache
    this.invalidateListCache(tenantId)

    return created
  }

  /**
   * Update workflow with validation
   */
  async update(
    workflowId: string,
    tenantId: string,
    updates: WorkflowUpdatePayload
  ): Promise<any> {
    // Get current workflow
    const current = await this.get(workflowId, tenantId)
    if (!current) {
      throw new Error('Workflow not found')
    }

    // Validate updates
    const validation = await this.validator.validateBeforeUpdate(
      tenantId,
      workflowId,
      updates,
      current
    )

    if (!validation.valid) {
      throw new Error('Update validation failed: ' + validation.errors.join(', '))
    }

    // Merge updates
    const updated = {
      ...validation.data,
      updatedAt: new Date(),
      validationStatus: {
        valid: true,
        lastValidated: new Date(),
        errors: [],
        warnings: validation.warnings
      }
    }

    // Persist to database
    const result = await this.persistWorkflow(updated)

    // Invalidate caches
    this.setInCache('workflow:' + result.id, result)
    this.invalidateListCache(tenantId)

    return result
  }

  /**
   * Publish workflow
   */
  async publish(workflowId: string, tenantId: string): Promise<any> {
    const workflow = await this.get(workflowId, tenantId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    if (workflow.isPublished) {
      throw new Error('Workflow is already published')
    }

    const published = {
      ...workflow,
      status: 'published',
      isPublished: true,
      publishedAt: new Date(),
      updatedAt: new Date()
    }

    const result = await this.persistWorkflow(published)

    // Invalidate caches
    this.setInCache('workflow:' + result.id, result)
    this.invalidateListCache(tenantId)

    return result
  }

  /**
   * Archive workflow
   */
  async archive(workflowId: string, tenantId: string): Promise<void> {
    const workflow = await this.get(workflowId, tenantId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const archived = {
      ...workflow,
      isArchived: true,
      status: 'deprecated',
      updatedAt: new Date()
    }

    await this.persistWorkflow(archived)

    // Invalidate caches
    this.cache.delete('workflow:' + workflowId)
    this.invalidateListCache(tenantId)
  }

  /**
   * Delete workflow
   */
  async delete(workflowId: string, tenantId: string): Promise<void> {
    const workflow = await this.get(workflowId, tenantId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    // Hard delete
    await this.deleteWorkflow(workflowId)

    // Invalidate caches
    this.cache.delete('workflow:' + workflowId)
    this.invalidateListCache(tenantId)
  }

  /**
   * Get validation status
   */
  async getValidationStatus(workflowId: string, tenantId: string): Promise<any> {
    const workflow = await this.get(workflowId, tenantId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    return workflow.validationStatus
  }

  /**
   * Query workflows from database
   */
  private async queryWorkflows(filter: any, limit: number, offset: number): Promise<any[]> {
    return []
  }

  /**
   * Query single workflow
   */
  private async queryWorkflow(workflowId: string): Promise<any | null> {
    return null
  }

  /**
   * Persist workflow
   */
  private async persistWorkflow(workflow: any): Promise<any> {
    return workflow
  }

  /**
   * Delete workflow
   */
  private async deleteWorkflow(workflowId: string): Promise<void> {
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key)
    if (entry && Date.now() - entry.timestamp < this.cacheTTL) {
      return entry.data
    }
    this.cache.delete(key)
    return null
  }

  private setInCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private invalidateListCache(tenantId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith('workflows:' + tenantId + ':')) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get adapter statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      validation: this.validator.getStats()
    }
  }
}

/**
 * Singleton instance
 */
let instance: WorkflowAdapter

export function getWorkflowAdapter(): WorkflowAdapter {
  if (!instance) {
    instance = new WorkflowAdapter()
  }
  return instance
}
