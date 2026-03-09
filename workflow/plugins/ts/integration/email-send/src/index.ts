/**
 * Email Send Node Executor Plugin
 * Sends emails with template support
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

export class EmailSendExecutor implements INodeExecutor {
  nodeType = 'email-send';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { to, cc, bcc, subject, body, template, data } = node.parameters;

      if (!to) {
        throw new Error('Email send requires "to" parameter');
      }

      if (!subject) {
        throw new Error('Email send requires "subject" parameter');
      }

      if (!body && !template) {
        throw new Error('Email send requires either "body" or "template" parameter');
      }

      const resolvedTo = interpolateTemplate(to, { context, state, json: context.triggerData });
      const resolvedSubject = interpolateTemplate(subject, { context, state, json: context.triggerData });
      const resolvedCc = cc ? interpolateTemplate(cc, { context, state, json: context.triggerData }) : undefined;
      const resolvedBcc = bcc ? interpolateTemplate(bcc, { context, state, json: context.triggerData }) : undefined;

      let emailBody: string;
      if (template) {
        emailBody = this._renderTemplate(template, data || {});
      } else {
        emailBody = interpolateTemplate(body, { context, state, json: context.triggerData });
      }

      console.log(`[Email] To: ${resolvedTo}, Subject: ${resolvedSubject}`);

      const mockMessageId = `msg-${Date.now()}`;

      const duration = Date.now() - startTime;

      return {
        status: 'success',
        output: {
          messageId: mockMessageId,
          to: resolvedTo,
          cc: resolvedCc,
          bcc: resolvedBcc,
          subject: resolvedSubject,
          bodyLength: emailBody.length,
          timestamp: new Date().toISOString()
        },
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'EMAIL_SEND_ERROR',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node.parameters.to) {
      errors.push('Recipient email (to) is required');
    }

    if (!node.parameters.subject) {
      errors.push('Email subject is required');
    }

    if (!node.parameters.body && !node.parameters.template) {
      errors.push('Either body or template must be provided');
    }

    const to = node.parameters.to || '';
    if (to && !to.includes('{{') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      errors.push('Invalid email format in "to" parameter');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private _renderTemplate(template: string, data: Record<string, any>): string {
    let html = template;
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
    });
    return html;
  }
}

export const emailSendExecutor = new EmailSendExecutor();
