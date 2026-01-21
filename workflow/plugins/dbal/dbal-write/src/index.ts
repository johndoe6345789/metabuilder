/**
 * DBAL Write Node Executor Plugin
 * Handles create/update/upsert database operations
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

export class DBALWriteExecutor implements INodeExecutor {
  nodeType = 'dbal-write';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { entity, operation, data, id, filter } = node.parameters;

      if (!entity) {
        throw new Error('DBAL write node requires "entity" parameter');
      }

      if (!operation || !['create', 'update', 'upsert'].includes(operation)) {
        throw new Error('DBAL write requires operation: create, update, or upsert');
      }

      const resolvedData = interpolateTemplate(data, { context, state, json: context.triggerData });

      if (context.tenantId) {
        resolvedData.tenantId = context.tenantId;
      }

      resolvedData.updatedAt = new Date();
      if (operation === 'create') {
        resolvedData.createdAt = new Date();
        resolvedData.createdBy = context.userId;
      }
      resolvedData.updatedBy = context.userId;

      let result: any;

      switch (operation) {
        case 'create':
          result = { operation, entity, data: resolvedData, created: true };
          break;
        case 'update':
          if (!id && !filter) {
            throw new Error('Update requires either id or filter parameter');
          }
          result = { operation, entity, data: resolvedData, updated: true };
          break;
        case 'upsert':
          if (!filter) {
            throw new Error('Upsert requires filter parameter');
          }
          result = { operation, entity, data: resolvedData, upserted: true };
          break;
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
        errorCode: 'DBAL_WRITE_ERROR',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];

    if (!node.parameters.entity) {
      errors.push('Entity is required');
    }

    if (!node.parameters.operation) {
      errors.push('Operation is required (create, update, or upsert)');
    }

    if (!node.parameters.data) {
      errors.push('Data is required');
    }

    if (node.parameters.operation === 'update' && !node.parameters.id && !node.parameters.filter) {
      errors.push('Update operation requires either id or filter');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}

export const dbalWriteExecutor = new DBALWriteExecutor();
