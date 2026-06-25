/**
 * Workflow Validator
 *
 * Validates n8n-style workflows against compliance rules including:
 * - Parameter structure validation
 * - Connection integrity
 * - Multi-tenant safety
 * - Variable safety
 * - Resource constraints
 */

import type { WorkflowDefinition, WorkflowNode } from '../types'

export interface ValidationError {
  path: string
  message: string
  severity: 'error' | 'warning'
  code: string
}

export interface WorkflowValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export class WorkflowValidator {
  private nodeNameSet: Set<string> = new Set()
  private connectionTargets: Set<string> = new Set()

  /**
   * Validate complete workflow
   */
  validate(workflow: WorkflowDefinition): WorkflowValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Reset caches
    this.nodeNameSet.clear()
    this.connectionTargets.clear()

    // Build node name set for connection validation
    for (const node of workflow.nodes) {
      if (this.nodeNameSet.has(node.name)) {
        errors.push({
          path: `nodes[${workflow.nodes.indexOf(node)}].name`,
          message: `Duplicate node name: "${node.name}"`,
          severity: 'error',
          code: 'DUPLICATE_NODE_NAME',
        })
      }
      this.nodeNameSet.add(node.name)
    }

    // Validate each node
    for (let i = 0; i < workflow.nodes.length; i++) {
      const nodeErrors = this.validateNode(workflow.nodes[i], i)
      errors.push(...nodeErrors.filter((e) => e.severity === 'error'))
      warnings.push(...nodeErrors.filter((e) => e.severity === 'warning'))
    }

    // Validate connections
    const connErrors = this.validateConnections(workflow.connections)
    errors.push(...connErrors.filter((e) => e.severity === 'error'))
    warnings.push(...connErrors.filter((e) => e.severity === 'warning'))

    // Validate variables
    if (workflow.variables) {
      const varErrors = this.validateVariables(workflow.variables)
      errors.push(...varErrors.filter((e) => e.severity === 'error'))
      warnings.push(...varErrors.filter((e) => e.severity === 'warning'))
    }

    // Validate multi-tenant safety
    const tenantErrors = this.validateMultiTenantSafety(workflow)
    errors.push(...tenantErrors.filter((e) => e.severity === 'error'))
    warnings.push(...tenantErrors.filter((e) => e.severity === 'warning'))

    return {
      valid: errors.length === 0,
      errors: errors.sort((a, b) => a.path.localeCompare(b.path)),
      warnings: warnings.sort((a, b) => a.path.localeCompare(b.path)),
    }
  }

  /**
   * Validate individual node
   */
  private validateNode(node: WorkflowNode, index: number): ValidationError[] {
    const errors: ValidationError[] = []
    const basePath = `nodes[${index}]`

    // Check required fields
    if (!node.id || node.id.trim().length === 0) {
      errors.push({
        path: `${basePath}.id`,
        message: 'Node id is required and cannot be empty',
        severity: 'error',
        code: 'MISSING_NODE_ID',
      })
    }

    if (!node.name || node.name.trim().length === 0) {
      errors.push({
        path: `${basePath}.name`,
        message: 'Node name is required and cannot be empty',
        severity: 'error',
        code: 'MISSING_NODE_NAME',
      })
    }

    if (!node.type || node.type.trim().length === 0) {
      errors.push({
        path: `${basePath}.type`,
        message: 'Node type is required and cannot be empty',
        severity: 'error',
        code: 'MISSING_NODE_TYPE',
      })
    }

    // Check parameters structure
    const paramErrors = this.validateParameters(node.parameters, `${basePath}.parameters`)
    errors.push(...paramErrors)

    // Check execution constraints
    if (node.timeout && node.timeout < 1000) {
      errors.push({
        path: `${basePath}.timeout`,
        message: `Node timeout is very short (${node.timeout}ms). Minimum recommended: 1000ms`,
        severity: 'warning',
        code: 'TIMEOUT_TOO_SHORT',
      })
    }

    if (node.timeout && node.timeout > 3600000) {
      errors.push({
        path: `${basePath}.timeout`,
        message: `Node timeout is very long (${node.timeout}ms). Maximum recommended: 3600000ms`,
        severity: 'warning',
        code: 'TIMEOUT_TOO_LONG',
      })
    }

    return errors
  }

  /**
   * Validate node parameters for structure and serialization issues
   */
  private validateParameters(params: Record<string, any>, path: string): ValidationError[] {
    const errors: ValidationError[] = []

    if (!params) {
      return errors
    }

    // Check for [object Object] serialization
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value === '[object Object]') {
        errors.push({
          path: `${path}.${key}`,
          message: `Parameter value is "[object Object]" - object was not properly serialized`,
          severity: 'error',
          code: 'OBJECT_SERIALIZATION_FAILURE',
        })
      }

      // Check for node-level attributes in parameters
      if (key === 'name' || key === 'typeVersion' || key === 'position') {
        errors.push({
          path: `${path}.${key}`,
          message: `Node-level attribute "${key}" found in parameters. This indicates nested parameter wrapping.`,
          severity: 'error',
          code: 'NESTED_NODE_ATTRIBUTES',
        })
      }

      // Check for recursive parameters nesting
      if (key === 'parameters' && typeof value === 'object' && value !== null) {
        const depth = this.getParameterNestingDepth(value)
        if (depth > 2) {
          errors.push({
            path: `${path}.${key}`,
            message: `Parameters are nested too deeply (depth: ${depth}). Maximum depth should be 2.`,
            severity: 'error',
            code: 'EXCESSIVE_PARAMETER_NESTING',
          })
        }
      }
    }

    return errors
  }

  /**
   * Validate workflow connections
   */
  private validateConnections(connections: Record<string, any>): ValidationError[] {
    const errors: ValidationError[] = []

    if (!connections || Object.keys(connections).length === 0) {
      return errors
    }

    for (const [fromNodeName, outputTypes] of Object.entries(connections)) {
      // Validate source node exists
      if (!this.nodeNameSet.has(fromNodeName)) {
        errors.push({
          path: `connections.${fromNodeName}`,
          message: `Source node "${fromNodeName}" not found in workflow nodes`,
          severity: 'error',
          code: 'INVALID_CONNECTION_SOURCE',
        })
        continue
      }

      if (typeof outputTypes !== 'object' || outputTypes === null) {
        errors.push({
          path: `connections.${fromNodeName}`,
          message: `Connection entry for "${fromNodeName}" must be an object mapping output types`,
          severity: 'error',
          code: 'INVALID_CONNECTION_FORMAT',
        })
        continue
      }

      // Validate output types
      for (const [outputType, indices] of Object.entries(outputTypes)) {
        if (outputType !== 'main' && outputType !== 'error') {
          errors.push({
            path: `connections.${fromNodeName}.${outputType}`,
            message: `Invalid output type "${outputType}". Must be "main" or "error"`,
            severity: 'error',
            code: 'INVALID_OUTPUT_TYPE',
          })
          continue
        }

        if (typeof indices !== 'object' || indices === null) {
          errors.push({
            path: `connections.${fromNodeName}.${outputType}`,
            message: `Output type mapping must be an object`,
            severity: 'error',
            code: 'INVALID_CONNECTION_FORMAT',
          })
          continue
        }

        // Validate indices and targets
        for (const [indexStr, targets] of Object.entries(indices)) {
          const index = parseInt(indexStr, 10)
          if (isNaN(index) || index < 0) {
            errors.push({
              path: `connections.${fromNodeName}.${outputType}.${indexStr}`,
              message: `Invalid output index "${indexStr}". Must be non-negative integer`,
              severity: 'error',
              code: 'INVALID_OUTPUT_INDEX',
            })
            continue
          }

          if (!Array.isArray(targets)) {
            errors.push({
              path: `connections.${fromNodeName}.${outputType}.${indexStr}`,
              message: `Connection targets must be an array`,
              severity: 'error',
              code: 'INVALID_CONNECTION_FORMAT',
            })
            continue
          }

          // Validate individual targets
          for (const target of targets) {
            if (typeof target !== 'object' || !target.node) {
              errors.push({
                path: `connections.${fromNodeName}.${outputType}.${indexStr}`,
                message: `Connection target must have a "node" property`,
                severity: 'error',
                code: 'INVALID_CONNECTION_TARGET',
              })
              continue
            }

            // Validate target node exists
            if (!this.nodeNameSet.has(target.node)) {
              errors.push({
                path: `connections.${fromNodeName}.${outputType}.${indexStr}`,
                message: `Target node "${target.node}" not found in workflow nodes`,
                severity: 'error',
                code: 'INVALID_CONNECTION_TARGET_NODE',
              })
            }

            this.connectionTargets.add(target.node)
          }
        }
      }
    }

    return errors
  }

  /**
   * Validate workflow variables
   */
  private validateVariables(variables: Record<string, any>): ValidationError[] {
    const errors: ValidationError[] = []

    for (const [varName, varDef] of Object.entries(variables)) {
      const path = `variables.${varName}`

      if (typeof varDef !== 'object' || varDef === null) {
        errors.push({
          path,
          message: `Variable definition must be an object`,
          severity: 'error',
          code: 'INVALID_VARIABLE_DEFINITION',
        })
        continue
      }

      // Validate variable name format
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
        errors.push({
          path,
          message: `Variable name must match pattern: [a-zA-Z_][a-zA-Z0-9_]*`,
          severity: 'error',
          code: 'INVALID_VARIABLE_NAME',
        })
      }

      // Validate type field
      if (!varDef.type) {
        errors.push({
          path: `${path}.type`,
          message: `Variable type is required`,
          severity: 'error',
          code: 'MISSING_VARIABLE_TYPE',
        })
      } else if (!['string', 'number', 'boolean', 'array', 'object', 'date', 'any'].includes(varDef.type)) {
        errors.push({
          path: `${path}.type`,
          message: `Invalid variable type "${varDef.type}"`,
          severity: 'error',
          code: 'INVALID_VARIABLE_TYPE',
        })
      }

      // Validate defaultValue matches type
      if (varDef.defaultValue !== undefined) {
        const typeMatch = this.validateTypeMatch(varDef.defaultValue, varDef.type)
        if (!typeMatch) {
          errors.push({
            path: `${path}.defaultValue`,
            message: `Default value type does not match declared type "${varDef.type}"`,
            severity: 'error',
            code: 'VARIABLE_TYPE_MISMATCH',
          })
        }
      }

      // Validate regex patterns for ReDoS
      if (varDef.validation?.pattern) {
        const complexity = this.estimateRegexComplexity(varDef.validation.pattern)
        if (complexity > 100) {
          errors.push({
            path: `${path}.validation.pattern`,
            message: `Regex pattern is too complex (complexity: ${complexity}). Risk of ReDoS attack.`,
            severity: 'warning',
            code: 'REGEX_COMPLEXITY_WARNING',
          })
        }
      }
    }

    return errors
  }

  /**
   * Validate multi-tenant safety
   */
  private validateMultiTenantSafety(workflow: WorkflowDefinition): ValidationError[] {
    const errors: ValidationError[] = []

    // Check if workflow has tenantId
    if (!workflow.tenantId) {
      errors.push({
        path: 'tenantId',
        message: `Workflow must have a tenantId for multi-tenant safety`,
        severity: 'error',
        code: 'MISSING_TENANT_ID',
      })
    }

    // Check for global-scope variables
    if (workflow.variables) {
      for (const [varName, varDef] of Object.entries(workflow.variables)) {
        if (varDef.scope === 'global') {
          errors.push({
            path: `variables.${varName}.scope`,
            message: `Global-scope variables require explicit approval. Recommend using "workflow" or "execution" scope.`,
            severity: 'warning',
            code: 'GLOBAL_SCOPE_VARIABLE',
          })
        }
      }
    }

    return errors
  }

  // ====== Private Helper Methods ======

  private getParameterNestingDepth(obj: any, currentDepth = 1): number {
    if (!obj || typeof obj !== 'object') {
      return currentDepth
    }

    if (obj.parameters && typeof obj.parameters === 'object') {
      return this.getParameterNestingDepth(obj.parameters, currentDepth + 1)
    }

    return currentDepth
  }

  private validateTypeMatch(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number'
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && !Array.isArray(value) && value !== null
      case 'date':
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))
      case 'any':
        return true
      default:
        return false
    }
  }

  private estimateRegexComplexity(pattern: string): number {
    // Simple heuristic for ReDoS risk
    let complexity = pattern.length

    // Count nested quantifiers
    const nestedQuantifiers = (pattern.match(/(\+|\*|\{.*?\})\s*(\+|\*|\{.*?\})/g) || []).length
    complexity += nestedQuantifiers * 50

    // Count alternations
    const alternations = (pattern.match(/\|/g) || []).length
    complexity += alternations * 10

    // Count lookaheads/lookbehinds
    const lookarounds = (pattern.match(/\(\?[=!]/g) || []).length
    complexity += lookarounds * 30

    return complexity
  }
}

/**
 * Validate a single workflow
 */
export function validateWorkflow(workflow: WorkflowDefinition): WorkflowValidationResult {
  const validator = new WorkflowValidator()
  return validator.validate(workflow)
}
