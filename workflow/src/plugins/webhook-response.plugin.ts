/**
 * Webhook Response Node Executor Plugin
 * Returns HTTP response to webhook sender
 */

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '../types';
import { interpolateTemplate } from '../utils/template-engine';

export class WebhookResponseExecutor implements INodeExecutor {
  nodeType = 'webhook-response';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { statusCode, body, headers } = node.parameters;

      if (!statusCode) {
        throw new Error('Webhook response requires "statusCode" parameter');
      }

      const resolvedBody = body ? interpolateTemplate(body, { context, state, json: context.triggerData }) : undefined;
      const resolvedHeaders = headers ? interpolateTemplate(headers, { context, state, json: context.triggerData }) : {};

      return {
        status: 'success',
        output: {
          statusCode,
          body: resolvedBody,
          headers: resolvedHeaders,
          timestamp: new Date().toISOString()
        },
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'WEBHOOK_RESPONSE_ERROR',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node.parameters.statusCode) {
      errors.push('Status code is required');
    }

    const statusCode = node.parameters.statusCode;
    if (statusCode && (statusCode < 100 || statusCode > 599)) {
      errors.push('Status code must be between 100 and 599');
    }

    if (statusCode && statusCode >= 300 && statusCode < 400 && !node.parameters.headers?.Location) {
      warnings.push('Redirect status code used but no Location header provided');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const webhookResponseExecutor = new WebhookResponseExecutor();
