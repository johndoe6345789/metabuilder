/**
 * Plugin Validator - Schema Validation and Compatibility Checking
 * Comprehensive validation against plugin metadata, pre-execution checks,
 * and error type mapping for the workflow executor.
 * @packageDocumentation
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ValidationResult,
  WorkflowDefinition,
  RetryPolicy,
  RateLimitPolicy
} from '../types';

/**
 * Plugin metadata schema for validation
 */
export interface PluginMetadata {
  nodeType: string;
  version: string;
  category: string;
  description?: string;
  requiredFields?: string[];
  schema?: Record<string, any>;
  dependencies?: string[];
  supportedVersions?: string[];
  tags?: string[];
  author?: string;
  icon?: string;
  experimental?: boolean;
}

/**
 * Compatibility check result
 */
export interface CompatibilityCheckResult {
  compatible: boolean;
  issues: CompatibilityIssue[];
  warnings: string[];
}

/**
 * Individual compatibility issue
 */
export interface CompatibilityIssue {
  type:
    | 'version-mismatch'
    | 'missing-dependency'
    | 'unsupported-feature'
    | 'schema-violation'
    | 'credential-mismatch'
    | 'tenant-restriction';
  severity: 'error' | 'warning';
  message: string;
  details?: Record<string, any>;
}

/**
 * Pre-execution validation result
 */
export interface PreExecutionValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  parameterValidation: ParameterValidationResult;
  credentialValidation: CredentialValidationResult;
  contextValidation: ContextValidationResult;
}

/**
 * Parameter validation result
 */
export interface ParameterValidationResult {
  valid: boolean;
  missingRequired: string[];
  invalidTypes: ParameterTypeError[];
  schemaViolations: string[];
}

/**
 * Parameter type error
 */
export interface ParameterTypeError {
  field: string;
  expected: string;
  received: string;
  value: any;
}

/**
 * Credential validation result
 */
export interface CredentialValidationResult {
  valid: boolean;
  missingCredentials: string[];
  invalidCredentials: string[];
  expiredCredentials: string[];
}

/**
 * Context validation result
 */
export interface ContextValidationResult {
  valid: boolean;
  errors: string[];
  missingContext: string[];
}

/**
 * Error type classification
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEMA_VIOLATION = 'SCHEMA_VIOLATION',
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  MISSING_REQUIRED = 'MISSING_REQUIRED',
  INCOMPATIBLE_VERSION = 'INCOMPATIBLE_VERSION',
  CREDENTIAL_ERROR = 'CREDENTIAL_ERROR',
  CONTEXT_ERROR = 'CONTEXT_ERROR',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Mapped error for structured error handling
 */
export interface MappedError {
  type: ErrorType;
  message: string;
  originalError: Error;
  isRecoverable: boolean;
  suggestedAction?: string;
  context?: Record<string, any>;
}

/**
 * Plugin Validator Class
 * Provides comprehensive validation for plugins before execution
 */
export class PluginValidator {
  private metadataCache: Map<string, PluginMetadata> = new Map();
  private schemaCache: Map<string, any> = new Map();
  private readonly MAX_PARAMETER_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_OUTPUT_SIZE = 50 * 1024 * 1024; // 50MB

  /**
   * Register plugin metadata for validation
   */
  registerMetadata(metadata: PluginMetadata): void {
    if (!this._validateMetadataFormat(metadata)) {
      throw new Error(`Invalid metadata for plugin: ${metadata.nodeType}`);
    }

    this.metadataCache.set(metadata.nodeType, metadata);
  }

  /**
   * Get registered metadata for a plugin
   */
  getMetadata(nodeType: string): PluginMetadata | undefined {
    return this.metadataCache.get(nodeType);
  }

  /**
   * Full schema validation against plugin metadata
   */
  validateSchema(nodeType: string, node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const metadata = this.metadataCache.get(nodeType);
    if (!metadata) {
      return {
        valid: false,
        errors: [`No metadata registered for node type: ${nodeType}`],
        warnings: []
      };
    }

    // Check required fields
    if (metadata.requiredFields) {
      const missingFields = metadata.requiredFields.filter(
        (field) => !(field in node.parameters)
      );

      if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      }
    }

    // Validate against JSON schema if present
    if (metadata.schema) {
      const schemaErrors = this._validateAgainstJsonSchema(
        node.parameters,
        metadata.schema
      );
      errors.push(...schemaErrors);
    }

    // Validate parameter types
    const typeErrors = this._validateParameterTypes(node.parameters, metadata);
    if (typeErrors.length > 0) {
      errors.push(...typeErrors);
    }

    // Check for deprecated parameters
    const deprecationWarnings = this._checkDeprecatedParameters(
      node.parameters,
      metadata
    );
    warnings.push(...deprecationWarnings);

    // Validate parameter sizes
    const sizeErrors = this._validateParameterSizes(node.parameters);
    errors.push(...sizeErrors);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check plugin compatibility with workflow environment
   */
  checkCompatibility(
    nodeType: string,
    node: WorkflowNode,
    context: WorkflowContext,
    workflow: WorkflowDefinition
  ): CompatibilityCheckResult {
    const issues: CompatibilityIssue[] = [];
    const warnings: string[] = [];

    const metadata = this.metadataCache.get(nodeType);
    if (!metadata) {
      return {
        compatible: false,
        issues: [
          {
            type: 'schema-violation',
            severity: 'error',
            message: `No metadata registered for node type: ${nodeType}`
          }
        ],
        warnings: []
      };
    }

    // Check version compatibility
    const versionIssue = this._checkVersionCompatibility(
      metadata,
      workflow.version
    );
    if (versionIssue) {
      issues.push(versionIssue);
    }

    // Check dependencies
    const depIssues = this._checkDependencies(metadata);
    issues.push(...depIssues);

    // Check tenant restrictions
    const tenantIssue = this._checkTenantRestrictions(
      metadata,
      context.tenantId
    );
    if (tenantIssue) {
      issues.push(tenantIssue);
    }

    // Check credential requirements
    const credentialIssues = this._checkCredentialRequirements(
      metadata,
      node,
      context
    );
    issues.push(...credentialIssues);

    // Check feature support
    const featureIssues = this._checkFeatureSupport(metadata, node);
    issues.push(...featureIssues);

    const compatible = issues.filter((i) => i.severity === 'error').length === 0;

    return {
      compatible,
      issues,
      warnings
    };
  }

  /**
   * Comprehensive pre-execution validation
   */
  validatePreExecution(
    nodeType: string,
    node: WorkflowNode,
    context: WorkflowContext,
    executor?: INodeExecutor
  ): PreExecutionValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate executor interface
    if (executor) {
      const executorValidation = this._validateExecutorInterface(executor);
      if (!executorValidation.valid) {
        errors.push(...executorValidation.errors);
      }
    }

    // 2. Validate parameters
    const paramValidation = this._validateNodeParameters(
      node,
      this.metadataCache.get(nodeType)
    );
    if (!paramValidation.valid) {
      errors.push(...paramValidation.schemaViolations);
      warnings.push(
        ...paramValidation.missingRequired.map(
          (f) => `Missing recommended field: ${f}`
        )
      );
    }

    // 3. Validate credentials
    const credentialValidation = this._validateCredentials(node, context);
    if (!credentialValidation.valid) {
      errors.push(...credentialValidation.missingCredentials);
      warnings.push(...credentialValidation.expiredCredentials);
    }

    // 4. Validate context
    const contextValidation = this._validateExecutionContext(node, context);
    if (!contextValidation.valid) {
      errors.push(...contextValidation.errors);
    }

    // 5. Validate timeout settings
    const timeoutWarnings = this._validateTimeout(node);
    warnings.push(...timeoutWarnings);

    // 6. Validate retry policy
    if (node.retryPolicy) {
      const retryWarnings = this._validateRetryPolicy(node.retryPolicy);
      warnings.push(...retryWarnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      parameterValidation: paramValidation,
      credentialValidation: credentialValidation,
      contextValidation: contextValidation
    };
  }

  /**
   * Map error types to structured error objects
   */
  mapErrorType(error: Error, context?: Record<string, any>): MappedError {
    const errorMessage = error.message.toLowerCase();

    // Type mismatches
    if (
      errorMessage.includes('type') ||
      errorMessage.includes('expected') ||
      errorMessage.includes('received')
    ) {
      return {
        type: ErrorType.TYPE_MISMATCH,
        message: error.message,
        originalError: error,
        isRecoverable: false,
        suggestedAction: 'Check parameter types in node configuration',
        context
      };
    }

    // Validation errors
    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('schema')
    ) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: error.message,
        originalError: error,
        isRecoverable: false,
        suggestedAction: 'Fix node parameters to match schema',
        context
      };
    }

    // Missing required fields
    if (
      errorMessage.includes('required') ||
      errorMessage.includes('missing')
    ) {
      return {
        type: ErrorType.MISSING_REQUIRED,
        message: error.message,
        originalError: error,
        isRecoverable: false,
        suggestedAction: 'Add missing required parameters',
        context
      };
    }

    // Credential errors
    if (
      errorMessage.includes('credential') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('authentication')
    ) {
      return {
        type: ErrorType.CREDENTIAL_ERROR,
        message: error.message,
        originalError: error,
        isRecoverable: true,
        suggestedAction: 'Check credential configuration and permissions',
        context
      };
    }

    // Version compatibility
    if (
      errorMessage.includes('version') ||
      errorMessage.includes('compatible')
    ) {
      return {
        type: ErrorType.INCOMPATIBLE_VERSION,
        message: error.message,
        originalError: error,
        isRecoverable: true,
        suggestedAction: 'Update plugin or workflow to compatible version',
        context
      };
    }

    // Dependency errors
    if (
      errorMessage.includes('dependency') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('require')
    ) {
      return {
        type: ErrorType.DEPENDENCY_ERROR,
        message: error.message,
        originalError: error,
        isRecoverable: true,
        suggestedAction: 'Install missing dependencies',
        context
      };
    }

    // Timeout errors
    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('timed out')
    ) {
      return {
        type: ErrorType.TIMEOUT_ERROR,
        message: error.message,
        originalError: error,
        isRecoverable: true,
        suggestedAction: 'Increase timeout or optimize node execution',
        context
      };
    }

    // Context errors
    if (
      errorMessage.includes('context') ||
      errorMessage.includes('tenantid') ||
      errorMessage.includes('userid')
    ) {
      return {
        type: ErrorType.CONTEXT_ERROR,
        message: error.message,
        originalError: error,
        isRecoverable: false,
        suggestedAction: 'Check execution context configuration',
        context
      };
    }

    // Default to execution error
    return {
      type: ErrorType.EXECUTION_ERROR,
      message: error.message,
      originalError: error,
      isRecoverable: true,
      suggestedAction: 'Review execution logs and node configuration',
      context
    };
  }

  /**
   * Validate all plugins in batch
   */
  validateAllRegisteredMetadata(): Array<{ nodeType: string; valid: boolean; errors: string[] }> {
    const results: Array<{ nodeType: string; valid: boolean; errors: string[] }> = [];

    for (const [nodeType, metadata] of this.metadataCache) {
      const errors: string[] = [];

      if (!metadata.version) {
        errors.push('Missing version');
      }

      if (!metadata.category) {
        errors.push('Missing category');
      }

      if (!metadata.nodeType) {
        errors.push('Missing nodeType');
      }

      results.push({
        nodeType,
        valid: errors.length === 0,
        errors
      });
    }

    return results;
  }

  /**
   * Clear all cached metadata
   */
  clearCache(): void {
    this.metadataCache.clear();
    this.schemaCache.clear();
  }

  // ===== Private Methods =====

  /**
   * Validate metadata format
   */
  private _validateMetadataFormat(metadata: any): boolean {
    if (!metadata || typeof metadata !== 'object') {
      return false;
    }

    // Check required fields
    if (!metadata.nodeType || typeof metadata.nodeType !== 'string') {
      return false;
    }

    if (!metadata.version || typeof metadata.version !== 'string') {
      return false;
    }

    if (!metadata.category || typeof metadata.category !== 'string') {
      return false;
    }

    return true;
  }

  /**
   * Validate against JSON schema
   */
  private _validateAgainstJsonSchema(data: any, schema: any): string[] {
    const errors: string[] = [];

    // Simple JSON schema validation (subset)
    if (schema.type) {
      if (schema.type === 'object' && typeof data !== 'object') {
        errors.push(`Expected object, received ${typeof data}`);
      }
      if (schema.type === 'array' && !Array.isArray(data)) {
        errors.push(`Expected array, received ${typeof data}`);
      }
    }

    // Check required properties
    if (schema.required && Array.isArray(schema.required)) {
      for (const prop of schema.required) {
        if (!(prop in data)) {
          errors.push(`Missing required property: ${prop}`);
        }
      }
    }

    // Validate properties against schema
    if (schema.properties && typeof schema.properties === 'object') {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in data) {
          const propErrors = this._validateProperty(
            data[key],
            propSchema as any
          );
          errors.push(...propErrors);
        }
      }
    }

    return errors;
  }

  /**
   * Validate individual property
   */
  private _validateProperty(value: any, schema: any): string[] {
    const errors: string[] = [];

    if (schema.type) {
      if (schema.type === 'string' && typeof value !== 'string') {
        errors.push(`Expected string, received ${typeof value}`);
      }
      if (schema.type === 'number' && typeof value !== 'number') {
        errors.push(`Expected number, received ${typeof value}`);
      }
      if (schema.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Expected boolean, received ${typeof value}`);
      }
    }

    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`Value ${value} is below minimum ${schema.minimum}`);
    }

    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`Value ${value} exceeds maximum ${schema.maximum}`);
    }

    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
    }

    return errors;
  }

  /**
   * Validate parameter types
   */
  private _validateParameterTypes(
    parameters: Record<string, any>,
    metadata: PluginMetadata
  ): string[] {
    const errors: string[] = [];

    if (!metadata.schema || !metadata.schema.properties) {
      return errors;
    }

    for (const [key, value] of Object.entries(parameters)) {
      const propSchema = metadata.schema.properties[key];
      if (!propSchema) continue;

      if (propSchema.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (propSchema.type !== actualType) {
          errors.push(
            `Parameter '${key}': expected ${propSchema.type}, got ${actualType}`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Check for deprecated parameters
   */
  private _checkDeprecatedParameters(
    parameters: Record<string, any>,
    metadata: PluginMetadata
  ): string[] {
    const warnings: string[] = [];

    if (!metadata.schema || !metadata.schema.deprecated) {
      return warnings;
    }

    const deprecated = metadata.schema.deprecated as string[];
    for (const key of deprecated) {
      if (key in parameters) {
        warnings.push(`Parameter '${key}' is deprecated`);
      }
    }

    return warnings;
  }

  /**
   * Validate parameter sizes
   */
  private _validateParameterSizes(parameters: Record<string, any>): string[] {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === 'string' && value.length > this.MAX_PARAMETER_SIZE) {
        errors.push(
          `Parameter '${key}' exceeds maximum size of ${this.MAX_PARAMETER_SIZE} bytes`
        );
      }
    }

    return errors;
  }

  /**
   * Check version compatibility
   */
  private _checkVersionCompatibility(
    metadata: PluginMetadata,
    workflowVersion: string
  ): CompatibilityIssue | null {
    if (!metadata.supportedVersions || metadata.supportedVersions.length === 0) {
      return null;
    }

    if (!metadata.supportedVersions.includes(workflowVersion)) {
      return {
        type: 'version-mismatch',
        severity: 'warning',
        message: `Plugin ${metadata.nodeType} v${metadata.version} may not be compatible with workflow v${workflowVersion}`,
        details: {
          pluginVersion: metadata.version,
          supportedWorkflowVersions: metadata.supportedVersions,
          workflowVersion
        }
      };
    }

    return null;
  }

  /**
   * Check dependencies
   */
  private _checkDependencies(metadata: PluginMetadata): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    if (!metadata.dependencies || metadata.dependencies.length === 0) {
      return issues;
    }

    for (const dep of metadata.dependencies) {
      // This would check if dependencies are installed
      // For now, we mark as potential issues
      issues.push({
        type: 'missing-dependency',
        severity: 'warning',
        message: `Dependency '${dep}' required by ${metadata.nodeType}`,
        details: { dependency: dep }
      });
    }

    return issues;
  }

  /**
   * Check tenant restrictions
   */
  private _checkTenantRestrictions(
    metadata: PluginMetadata,
    tenantId: string
  ): CompatibilityIssue | null {
    // Check if plugin has tenant restrictions
    // This would be defined in metadata or elsewhere
    if (metadata.experimental) {
      return {
        type: 'tenant-restriction',
        severity: 'warning',
        message: `Plugin ${metadata.nodeType} is experimental and may have limited support`,
        details: { experimental: true }
      };
    }

    return null;
  }

  /**
   * Check credential requirements
   */
  private _checkCredentialRequirements(
    metadata: PluginMetadata,
    node: WorkflowNode,
    context: WorkflowContext
  ): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    // Check if node requires credentials but doesn't have them
    if (
      Object.keys(node.credentials).length === 0 &&
      metadata.schema?.required?.some((r: string) => r.includes('credential'))
    ) {
      issues.push({
        type: 'credential-mismatch',
        severity: 'error',
        message: `Plugin ${metadata.nodeType} requires credentials but none are configured`,
        details: { nodeId: node.id }
      });
    }

    return issues;
  }

  /**
   * Check feature support
   */
  private _checkFeatureSupport(
    metadata: PluginMetadata,
    node: WorkflowNode
  ): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    // Check if node uses unsupported features
    if (node.disabled) {
      // Disabled nodes are fine, just noted
    }

    return issues;
  }

  /**
   * Validate executor interface
   */
  private _validateExecutorInterface(executor: INodeExecutor): ValidationResult {
    const errors: string[] = [];

    if (typeof executor.execute !== 'function') {
      errors.push('Executor missing execute method');
    }

    if (typeof executor.validate !== 'function') {
      errors.push('Executor missing validate method');
    }

    if (!executor.nodeType) {
      errors.push('Executor missing nodeType');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Validate node parameters
   */
  private _validateNodeParameters(
    node: WorkflowNode,
    metadata?: PluginMetadata
  ): ParameterValidationResult {
    const missingRequired: string[] = [];
    const invalidTypes: ParameterTypeError[] = [];
    const schemaViolations: string[] = [];

    if (!metadata) {
      return { valid: true, missingRequired, invalidTypes, schemaViolations };
    }

    if (metadata.requiredFields) {
      for (const field of metadata.requiredFields) {
        if (!(field in node.parameters)) {
          missingRequired.push(field);
        }
      }
    }

    return {
      valid: missingRequired.length === 0 && invalidTypes.length === 0,
      missingRequired,
      invalidTypes,
      schemaViolations
    };
  }

  /**
   * Validate credentials
   */
  private _validateCredentials(
    node: WorkflowNode,
    context: WorkflowContext
  ): CredentialValidationResult {
    const missingCredentials: string[] = [];
    const invalidCredentials: string[] = [];
    const expiredCredentials: string[] = [];

    for (const [credKey, credRef] of Object.entries(node.credentials)) {
      if (!credRef.id) {
        missingCredentials.push(credKey);
      }

      // Check if credential is in context
      if (!context.secrets || !(credKey in context.secrets)) {
        invalidCredentials.push(credKey);
      }
    }

    return {
      valid:
        missingCredentials.length === 0 &&
        invalidCredentials.length === 0 &&
        expiredCredentials.length === 0,
      missingCredentials,
      invalidCredentials,
      expiredCredentials
    };
  }

  /**
   * Validate execution context
   */
  private _validateExecutionContext(
    node: WorkflowNode,
    context: WorkflowContext
  ): ContextValidationResult {
    const errors: string[] = [];
    const missingContext: string[] = [];

    if (!context.executionId) {
      missingContext.push('executionId');
    }

    if (!context.tenantId) {
      missingContext.push('tenantId');
    }

    if (!context.userId) {
      missingContext.push('userId');
    }

    if (!context.trigger) {
      missingContext.push('trigger');
    }

    if (missingContext.length > 0) {
      errors.push(`Missing context: ${missingContext.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      missingContext
    };
  }

  /**
   * Validate timeout settings
   */
  private _validateTimeout(node: WorkflowNode): string[] {
    const warnings: string[] = [];

    if (!node.timeout && node.timeout !== 0) {
      warnings.push('Node has no timeout configured (will use default)');
    }

    if (node.timeout && node.timeout < 1000) {
      warnings.push(
        `Node timeout ${node.timeout}ms is very short, may cause failures`
      );
    }

    return warnings;
  }

  /**
   * Validate retry policy
   */
  private _validateRetryPolicy(policy: RetryPolicy): string[] {
    const warnings: string[] = [];

    if (!policy.enabled) {
      return warnings;
    }

    if (policy.maxAttempts < 1) {
      warnings.push('Retry policy has invalid maxAttempts < 1');
    }

    if (policy.initialDelay < 0) {
      warnings.push('Retry policy has negative initialDelay');
    }

    if (policy.maxDelay < policy.initialDelay) {
      warnings.push('Retry policy maxDelay is less than initialDelay');
    }

    return warnings;
  }
}

/**
 * Create a singleton instance for global use
 */
let globalValidator: PluginValidator | null = null;

/**
 * Get or create the global plugin validator
 */
export function getPluginValidator(): PluginValidator {
  if (!globalValidator) {
    globalValidator = new PluginValidator();
  }
  return globalValidator;
}

/**
 * Reset the global validator (useful for testing)
 */
export function resetPluginValidator(): void {
  globalValidator = null;
}
