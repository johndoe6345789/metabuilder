/**
 * Set Variable Node Executor Plugin
 * Handles setting workflow variables for subsequent nodes
 *
 * @packageDocumentation
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '@metabuilder/workflow';
import { interpolateTemplate } from '@metabuilder/workflow';

interface SetVariableOutput {
  variablesSet: Record<string, string>;
  count: number;
  timestamp: number;
}

export class SetVariableExecutor implements INodeExecutor {
  nodeType = 'set-variable';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { variables, mode } = node.parameters;

      if (!variables || (typeof variables !== 'object' || Array.isArray(variables))) {
        throw new Error('Set Variable node requires "variables" parameter as an object');
      }

      const variablesSet: Record<string, string> = {};
      const interpolationContext = {
        context,
        state,
        json: context.triggerData,
        env: process.env
      };

      // Ensure context.variables exists
      if (!state.variables) {
        state.variables = {};
      }

      // Process variables based on mode
      const processMode = mode || 'merge'; // 'merge', 'replace', or 'append'

      if (processMode === 'replace') {
        // Clear existing variables and start fresh
        state.variables = {};
      }

      // Set each variable with template interpolation
      for (const [key, value] of Object.entries(variables)) {
        if (!this._isValidVariableName(key)) {
          throw new Error(
            `Invalid variable name "${key}" - must start with letter/underscore and contain only alphanumeric chars and underscores`
          );
        }

        // Interpolate the value
        let resolvedValue = value;

        if (typeof value === 'string') {
          resolvedValue = interpolateTemplate(value, interpolationContext);
        } else if (typeof value === 'object' && value !== null) {
          // For objects, recursively interpolate
          resolvedValue = this._interpolateObject(value, interpolationContext);
        }

        // Store in execution state variables
        state.variables[key] = resolvedValue;
        variablesSet[key] = String(resolvedValue);
      }

      // Also update context variables if the context supports it
      if (context.variables) {
        Object.assign(context.variables, state.variables);
      }

      const duration = Date.now() - startTime;

      const output: SetVariableOutput = {
        variablesSet,
        count: Object.keys(variablesSet).length,
        timestamp: Date.now()
      };

      return {
        status: 'success',
        output,
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'SET_VARIABLE_ERROR',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node.parameters.variables) {
      errors.push('Variables object is required');
    }

    if (node.parameters.variables && typeof node.parameters.variables !== 'object') {
      errors.push('Variables must be an object');
    }

    if (node.parameters.variables && Array.isArray(node.parameters.variables)) {
      errors.push('Variables must be an object, not an array');
    }

    // Validate variable names
    if (node.parameters.variables && typeof node.parameters.variables === 'object') {
      for (const key of Object.keys(node.parameters.variables)) {
        if (!this._isValidVariableName(key)) {
          errors.push(
            `Invalid variable name "${key}" - must start with letter/underscore and contain only alphanumeric chars and underscores`
          );
        }

        // Warn about reserved names
        if (this._isReservedName(key)) {
          warnings.push(`"${key}" is a reserved name and may conflict with built-in variables`);
        }
      }
    }

    // Validate mode if provided
    const validModes = ['merge', 'replace', 'append'];
    if (node.parameters.mode && !validModes.includes(node.parameters.mode)) {
      errors.push(`Mode must be one of: ${validModes.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if variable name is valid
   * Must start with letter or underscore, contain only alphanumeric and underscores
   */
  private _isValidVariableName(name: string): boolean {
    const validNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return validNameRegex.test(name);
  }

  /**
   * Check if name is reserved
   */
  private _isReservedNames(name: string): boolean {
    const reserved = [
      'context',
      'state',
      'json',
      'env',
      'utils',
      '$json',
      '$context',
      '$state',
      '$env'
    ];
    return reserved.includes(name.toLowerCase());
  }

  /**
   * Alias for _isReservedNames to fix typo
   */
  private _isReservedName(name: string): boolean {
    return this._isReservedNames(name);
  }

  /**
   * Recursively interpolate object values
   */
  private _interpolateObject(obj: any, context: any): any {
    if (typeof obj === 'string') {
      return interpolateTemplate(obj, context);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this._interpolateObject(item, context));
    }

    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, any> = {};

      for (const [key, value] of Object.entries(obj)) {
        result[key] = this._interpolateObject(value, context);
      }

      return result;
    }

    return obj;
  }
}

export const setVariableExecutor = new SetVariableExecutor();
