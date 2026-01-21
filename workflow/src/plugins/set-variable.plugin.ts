/**
 * Set Variable Node Executor Plugin
 * Sets workflow variables for use in subsequent nodes
 */

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '../types';
import { interpolateTemplate } from '../utils/template-engine';

export class SetVariableExecutor implements INodeExecutor {
  nodeType = 'set-variable';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { variables } = node.parameters;

      if (!variables) {
        throw new Error('Set variable node requires "variables" parameter');
      }

      // Interpolate template for all variables
      const resolvedVariables: Record<string, any> = {};

      for (const [name, value] of Object.entries(variables)) {
        resolvedVariables[name] = interpolateTemplate(value, { context, state, json: context.triggerData });
      }

      // Store variables in context for subsequent nodes
      context.variables = { ...context.variables, ...resolvedVariables };

      const duration = Date.now() - startTime;

      return {
        status: 'success',
        output: {
          variables: resolvedVariables,
          set: true
        },
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

    const variables = node.parameters.variables || {};
    if (Object.keys(variables).length === 0) {
      warnings.push('No variables defined - this node will have no effect');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const setVariableExecutor = new SetVariableExecutor();
