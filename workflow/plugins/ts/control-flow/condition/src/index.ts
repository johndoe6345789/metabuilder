/**
 * Condition Node Executor Plugin
 * Evaluates conditions and routes execution to different paths
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '@metabuilder/workflow';
import { evaluateTemplate } from '@metabuilder/workflow';

export class ConditionExecutor implements INodeExecutor {
  nodeType = 'condition';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { condition } = node.parameters;

      if (!condition) {
        throw new Error('Condition node requires "condition" parameter');
      }

      const result = evaluateTemplate(condition, { context, state, json: context.triggerData });

      const duration = Date.now() - startTime;

      return {
        status: 'success',
        output: {
          result: Boolean(result),
          condition,
          evaluated: true
        },
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'CONDITION_EVAL_ERROR',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node.parameters.condition) {
      errors.push('Condition is required');
    }

    const condition = node.parameters.condition || '';
    if (condition.includes('==') && !condition.includes('===')) {
      warnings.push('Consider using === instead of == for strict equality');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const conditionExecutor = new ConditionExecutor();
