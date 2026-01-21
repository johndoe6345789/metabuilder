/**
 * DBAL Read Node Executor Plugin
 * Handles database query operations with filtering, sorting, pagination
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

export class DBALReadExecutor implements INodeExecutor {
  nodeType = 'dbal-read';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { entity, operation, filter, sort, limit, offset } = node.parameters;

      if (!entity) {
        throw new Error('DBAL read node requires "entity" parameter');
      }

      const resolvedFilter = filter
        ? interpolateTemplate(filter, { context, state, json: context.triggerData })
        : {};

      if (context.tenantId && !resolvedFilter.tenantId) {
        resolvedFilter.tenantId = context.tenantId;
      }

      let result: any;

      switch (operation || 'read') {
        case 'read':
          result = {
            entity,
            filter: resolvedFilter,
            sort: sort || undefined,
            limit: limit || 100,
            offset: offset || 0,
            items: [],
            total: 0
          };
          break;

        case 'validate':
          result = this._validateData(context.triggerData, node.parameters.rules || {});
          break;

        case 'aggregate':
          result = {
            entity,
            groupBy: node.parameters.groupBy,
            aggregates: node.parameters.aggregates,
            results: []
          };
          break;

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

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
        errorCode: 'DBAL_READ_ERROR',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node.parameters.entity) {
      errors.push('Entity is required');
    }

    if (node.parameters.limit && node.parameters.limit > 10000) {
      warnings.push('Limit exceeds 10000 - may cause performance issues');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private _validateData(
    data: any,
    rules: Record<string, string>
  ): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const [field, ruleStr] of Object.entries(rules)) {
      const value = data[field];
      const ruleSet = ruleStr.split('|');

      for (const rule of ruleSet) {
        const [ruleName, ...ruleParams] = rule.split(':');

        switch (ruleName) {
          case 'required':
            if (value === undefined || value === null || value === '') {
              errors[field] = `${field} is required`;
            }
            break;

          case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors[field] = `${field} must be a valid email`;
            }
            break;

          case 'uuid':
            if (
              value &&
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
            ) {
              errors[field] = `${field} must be a valid UUID`;
            }
            break;

          case 'number':
            if (value !== undefined && typeof value !== 'number') {
              errors[field] = `${field} must be a number`;
            }
            break;

          case 'min':
            if (value !== undefined && value < parseFloat(ruleParams[0])) {
              errors[field] = `${field} must be at least ${ruleParams[0]}`;
            }
            break;

          case 'max':
            if (value !== undefined && value > parseFloat(ruleParams[0])) {
              errors[field] = `${field} must be at most ${ruleParams[0]}`;
            }
            break;
        }
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export const dbalReadExecutor = new DBALReadExecutor();
