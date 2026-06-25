/**
 * DBAL Write Node Executor Plugin
 * Executes create/update/delete against the C++ DBAL REST API via fetch().
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

const DBAL_API_URL = process.env.DBAL_API_URL ?? 'http://localhost:8080';

export class DBALWriteExecutor implements INodeExecutor {
  nodeType = 'dbal-write';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { entity, operation, data, id, filter, packageId } = node.parameters;

      if (!entity) {
        throw new Error('DBAL write node requires "entity" parameter');
      }

      if (!operation || !['create', 'update', 'delete'].includes(operation)) {
        throw new Error('DBAL write requires operation: create, update, or delete');
      }

      const pkg = packageId ?? 'default';
      const tenant = context.tenantId ?? 'default';
      const baseUrl = `${DBAL_API_URL}/api/v1/${tenant}/${pkg}/${entity}`;
      const headers = { 'Content-Type': 'application/json' };

      let response: Response;
      let result: any;

      switch (operation) {
        case 'create': {
          const resolvedData = interpolateTemplate(data, { context, state, json: context.triggerData });
          if (context.tenantId) resolvedData.tenantId = context.tenantId;

          response = await fetch(baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(resolvedData),
          });

          if (!response.ok) {
            throw new Error(`DBAL create failed: ${response.status} ${response.statusText}`);
          }

          result = await response.json();
          break;
        }

        case 'update': {
          if (!id && !filter) {
            throw new Error('Update requires either id or filter parameter');
          }

          const resolvedData = interpolateTemplate(data, { context, state, json: context.triggerData });
          if (context.tenantId) resolvedData.tenantId = context.tenantId;

          const url = id ? `${baseUrl}/${id}` : baseUrl;
          const body = id
            ? resolvedData
            : { filter: interpolateTemplate(filter, { context, state, json: context.triggerData }), data: resolvedData };

          response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            throw new Error(`DBAL update failed: ${response.status} ${response.statusText}`);
          }

          result = await response.json();
          break;
        }

        case 'delete': {
          if (!id) {
            throw new Error('Delete requires id parameter');
          }

          response = await fetch(`${baseUrl}/${id}`, {
            method: 'DELETE',
            headers,
          });

          if (!response.ok) {
            throw new Error(`DBAL delete failed: ${response.status} ${response.statusText}`);
          }

          result = await response.json();
          break;
        }
      }

      return {
        status: 'success',
        output: result,
        timestamp: Date.now(),
        duration: Date.now() - startTime
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
    const warnings: string[] = [];

    if (!node.parameters.entity) {
      errors.push('Entity is required');
    }

    if (!node.parameters.operation) {
      errors.push('Operation is required (create, update, or delete)');
    }

    if (node.parameters.operation !== 'delete' && !node.parameters.data) {
      errors.push('Data is required for create/update operations');
    }

    if (node.parameters.operation === 'update' && !node.parameters.id && !node.parameters.filter) {
      errors.push('Update operation requires either id or filter');
    }

    if (node.parameters.operation === 'delete' && !node.parameters.id) {
      errors.push('Delete operation requires id');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const dbalWriteExecutor = new DBALWriteExecutor();
