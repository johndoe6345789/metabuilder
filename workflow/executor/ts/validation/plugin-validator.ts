/**
 * Plugin Validator - Pre-execution validation for workflow nodes
 * @packageDocumentation
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class PluginValidator {
  /**
   * Validate node against plugin metadata
   */
  validateNode(nodeType: string, nodeConfig: any, metadata?: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!nodeConfig) {
      errors.push('Node configuration is required');
      return { valid: false, errors, warnings };
    }

    if (!nodeConfig.id) errors.push('Node must have an id field');
    if (!nodeConfig.name) errors.push('Node must have a name field');
    if (!nodeConfig.type) errors.push('Node must have a type field');

    if (nodeConfig.parameters) {
      const paramStr = JSON.stringify(nodeConfig.parameters);
      if (paramStr.includes('[object Object]')) {
        errors.push('Parameters contain serialized objects');
      }
      if ('name' in nodeConfig.parameters || 'typeVersion' in nodeConfig.parameters) {
        errors.push('Parameters contain node-level attributes');
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateMetadata(metadata: any): ValidationResult {
    const errors: string[] = [];
    if (!metadata.nodeType) errors.push('Metadata missing nodeType');
    if (!metadata.version) errors.push('Metadata missing version');
    return { valid: errors.length === 0, errors, warnings: [] };
  }
}
