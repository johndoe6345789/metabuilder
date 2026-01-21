/**
 * Transform Node Executor Plugin
 * Transforms and maps data using template expressions
 */

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '../types';
import { interpolateTemplate, buildDefaultUtilities } from '../utils/template-engine';

export class TransformExecutor implements INodeExecutor {
  nodeType = 'transform';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { mapping } = node.parameters;

      if (!mapping) {
        throw new Error('Transform node requires "mapping" parameter');
      }

      // Build utilities context
      const utils = buildDefaultUtilities();

      // Interpolate template with utilities
      const result = interpolateTemplate(mapping, {
        context,
        state,
        json: context.triggerData,
        utils
      });

      const duration = Date.now() - startTime;

      return {
        status: 'success',
        output: result,
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'TRANSFORM_ERROR',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node.parameters.mapping) {
      errors.push('Mapping is required');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const transformExecutor = new TransformExecutor();
