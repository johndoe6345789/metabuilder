/**
 * Validation Adapter - DBAL wrapper for workflow validation
 * Intercepts create/update operations with pre-validation layer
 * @packageDocumentation
 */

import { PluginValidator } from '../../../workflow/executor/ts/validation/plugin-validator'
import { TenantSafetyManager } from '../../../workflow/executor/ts/multi-tenant/tenant-safety'

export interface ValidatedWorkflow {
  valid: boolean
  errors: string[]
  warnings: string[]
  data?: any
}

export class ValidationAdapter {
  private validator: PluginValidator
  private tenantMgr: TenantSafetyManager
  private validationCache: Map<string, ValidatedWorkflow> = new Map()

  constructor() {
    this.validator = new PluginValidator()
    this.tenantMgr = new TenantSafetyManager()
  }

  /**
   * Validate workflow before create
   */
  async validateBeforeCreate(
    tenantId: string,
    workflow: any,
    userId?: string
  ): Promise<ValidatedWorkflow> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check tenant context
    const contextValidation = this.tenantMgr.validateContext(tenantId)
    if (!contextValidation.valid) {
      errors.push(...contextValidation.errors)
    }

    // Validate required fields
    if (!workflow.name) {
      errors.push('Workflow name is required')
    }
    if (!workflow.nodes || !Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node')
    }
    if (!workflow.connections) {
      errors.push('Workflow connections are required')
    }
    if (!workflow.version) {
      errors.push('Workflow version is required')
    }

    // Validate structure
    const structureValidation = this.validator.validateNode(
      workflow.type || 'workflow',
      workflow
    )
    errors.push(...structureValidation.errors)
    warnings.push(...structureValidation.warnings)

    // Validate connections
    if (workflow.connections && workflow.nodes) {
      const connectionErrors = this.validateConnections(
        workflow.nodes,
        workflow.connections
      )
      errors.push(...connectionErrors)
    }

    // Enforce tenant on workflow data
    try {
      const enforcedData = this.tenantMgr.enforceIsolation(workflow, tenantId)
      return {
        valid: errors.length === 0,
        errors,
        warnings,
        data: enforcedData
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      errors.push(`Tenant enforcement failed: ${err.message}`)
      return {
        valid: false,
        errors,
        warnings
      }
    }
  }

  /**
   * Validate workflow before update
   */
  async validateBeforeUpdate(
    tenantId: string,
    workflowId: string,
    updates: any,
    currentWorkflow: any
  ): Promise<ValidatedWorkflow> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check tenant authorization
    if (!this.tenantMgr.isAuthorized(tenantId, currentWorkflow.tenantId)) {
      errors.push('Not authorized to update this workflow')
      return { valid: false, errors, warnings }
    }

    // If nodes or connections changing, validate structure
    if (updates.nodes || updates.connections) {
      const merged = { ...currentWorkflow, ...updates }
      const structureValidation = this.validator.validateNode(
        merged.type || 'workflow',
        merged
      )
      errors.push(...structureValidation.errors)
      warnings.push(...structureValidation.warnings)

      // Validate connections if changing
      if (updates.connections && merged.nodes) {
        const connectionErrors = this.validateConnections(
          merged.nodes,
          updates.connections
        )
        errors.push(...connectionErrors)
      }
    }

    // Validate version if changing
    if (updates.version) {
      if (!/^\d+\.\d+\.\d+$/.test(updates.version)) {
        errors.push('Version must follow semantic versioning (X.Y.Z)')
      }
      // Check version is higher than current
      if (this.compareVersions(updates.version, currentWorkflow.version) <= 0) {
        errors.push(
          `New version ${updates.version} must be higher than current ${currentWorkflow.version}`
        )
      }
    }

    const data = errors.length === 0 ? { ...currentWorkflow, ...updates } : undefined

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data
    }
  }

  /**
   * Validate workflow connections (DAG integrity)
   */
  private validateConnections(nodes: any[], connections: any): string[] {
    const errors: string[] = []
    const nodeIds = new Set(nodes.map((n: any) => n.id))

    if (!connections || typeof connections !== 'object') {
      errors.push('Connections must be a valid object')
      return errors
    }

    // Check all referenced nodes exist
    for (const nodeId in connections) {
      if (!nodeIds.has(nodeId)) {
        errors.push(`Connection references unknown node: ${nodeId}`)
      }

      const nodeConnections = connections[nodeId]
      if (nodeConnections.main) {
        for (const outputKey in nodeConnections.main) {
          const outputs = nodeConnections.main[outputKey]
          if (Array.isArray(outputs)) {
            outputs.forEach((output: any) => {
              if (!nodeIds.has(output.node)) {
                errors.push(
                  `Connection from ${nodeId} references unknown node: ${output.node}`
                )
              }
            })
          }
        }
      }
    }

    // Check for circular references
    if (this.hasCircularReferences(connections)) {
      errors.push('Workflow connections form a cycle (must be acyclic DAG)')
    }

    return errors
  }

  /**
   * Detect circular references in connections
   */
  private hasCircularReferences(connections: any): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)

      const nodeConnections = connections[nodeId]
      if (nodeConnections?.main) {
        for (const outputKey in nodeConnections.main) {
          const outputs = nodeConnections.main[outputKey]
          if (Array.isArray(outputs)) {
            for (const output of outputs) {
              if (!visited.has(output.node)) {
                if (dfs(output.node)) {
                  return true
                }
              } else if (recursionStack.has(output.node)) {
                return true
              }
            }
          }
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    for (const nodeId in connections) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Compare semantic versions
   * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1
      if (parts1[i] < parts2[i]) return -1
    }

    return 0
  }

  /**
   * Clear validation cache
   */
  clearCache(workflowId?: string): void {
    if (workflowId) {
      this.validationCache.delete(workflowId)
    } else {
      this.validationCache.clear()
    }
  }

  /**
   * Get validation statistics
   */
  getStats() {
    return {
      cacheSize: this.validationCache.size,
      tenantContexts: this.tenantMgr.getStats()
    }
  }
}

/**
 * Singleton instance
 */
let instance: ValidationAdapter

export function getValidationAdapter(): ValidationAdapter {
  if (!instance) {
    instance = new ValidationAdapter()
  }
  return instance
}
