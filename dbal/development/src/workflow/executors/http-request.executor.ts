/**
 * HTTP Request Node Executor
 * Handles outbound HTTP calls with authentication, retry, and response parsing
 */

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '../types';
import { interpolateTemplate } from '../utils/template-engine';
import fetch from 'node-fetch';

export class HTTPRequestExecutor implements INodeExecutor {
  nodeType = 'http-request';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { url, method, body, headers, timeout } = node.parameters;

      if (!url) {
        throw new Error('HTTP request requires "url" parameter');
      }

      // Interpolate template variables
      const resolvedUrl = interpolateTemplate(url, { context, state, json: context.triggerData, env: process.env });
      const resolvedHeaders = interpolateTemplate(headers || {}, { context, state, json: context.triggerData, env: process.env });
      const resolvedBody = body ? interpolateTemplate(body, { context, state, json: context.triggerData }) : undefined;

      // Set default headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'MetaBuilder-Workflow/3.0.0',
        ...resolvedHeaders
      };

      // Build fetch options
      const fetchOptions: any = {
        method: method || 'GET',
        headers: requestHeaders,
        timeout: timeout || 30000
      };

      if (resolvedBody) {
        fetchOptions.body = typeof resolvedBody === 'string' ? resolvedBody : JSON.stringify(resolvedBody);
      }

      // Make request
      const response = await fetch(resolvedUrl, fetchOptions);

      // Parse response
      const contentType = response.headers.get('content-type');
      let responseData: any;

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType?.includes('text')) {
        responseData = await response.text();
      } else {
        responseData = await response.buffer();
      }

      const duration = Date.now() - startTime;

      // Check status code for errors
      if (!response.ok) {
        return {
          status: 'error',
          error: `HTTP ${response.status}: ${response.statusText}`,
          errorCode: `HTTP_${response.status}`,
          output: {
            statusCode: response.status,
            statusText: response.statusText,
            body: responseData,
            headers: Object.fromEntries(response.headers.entries())
          },
          timestamp: Date.now(),
          duration
        };
      }

      return {
        status: 'success',
        output: {
          statusCode: response.status,
          statusText: response.statusText,
          body: responseData,
          headers: Object.fromEntries(response.headers.entries())
        },
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Classify error for retry logic
      let errorCode = 'HTTP_ERROR';
      if (errorMsg.includes('timeout')) {
        errorCode = 'TIMEOUT';
      } else if (errorMsg.includes('ECONNREFUSED')) {
        errorCode = 'CONNECTION_REFUSED';
      } else if (errorMsg.includes('ENOTFOUND')) {
        errorCode = 'DNS_ERROR';
      }

      return {
        status: 'error',
        error: errorMsg,
        errorCode,
        timestamp: Date.now(),
        duration
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node.parameters.url) {
      errors.push('URL is required');
    }

    if (node.parameters.timeout && node.parameters.timeout > 120000) {
      warnings.push('Timeout exceeds 2 minutes - may cause workflow delays');
    }

    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].includes((node.parameters.method || 'GET').toUpperCase())) {
      errors.push('Invalid HTTP method');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const httpRequestExecutor = new HTTPRequestExecutor();
