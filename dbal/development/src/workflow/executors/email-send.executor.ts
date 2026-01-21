/**
 * Email Send Node Executor
 * Sends emails with template support and attachment handling
 */

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '../types';
import { interpolateTemplate } from '../utils/template-engine';

// Mock email service - replace with actual service (Sendgrid, Mailgun, etc.)
interface EmailService {
  send(options: any): Promise<{ messageId: string }>;
}

let emailService: EmailService | null = null;

export function setEmailService(service: EmailService): void {
  emailService = service;
}

export class EmailSendExecutor implements INodeExecutor {
  nodeType = 'email-send';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { to, cc, bcc, subject, body, template, data, attachments } = node.parameters;

      if (!to) {
        throw new Error('Email send requires "to" parameter');
      }

      if (!subject) {
        throw new Error('Email send requires "subject" parameter');
      }

      if (!body && !template) {
        throw new Error('Email send requires either "body" or "template" parameter');
      }

      // Interpolate template variables
      const resolvedTo = interpolateTemplate(to, { context, state, json: context.triggerData });
      const resolvedSubject = interpolateTemplate(subject, { context, state, json: context.triggerData });
      const resolvedCc = cc ? interpolateTemplate(cc, { context, state, json: context.triggerData }) : undefined;
      const resolvedBcc = bcc ? interpolateTemplate(bcc, { context, state, json: context.triggerData }) : undefined;

      // Build email content
      let emailBody: string;

      if (template) {
        // Render template (mock implementation)
        const templateData = data || {};
        emailBody = this._renderTemplate(template, templateData);
      } else {
        emailBody = interpolateTemplate(body, { context, state, json: context.triggerData });
      }

      // Prepare email options
      const emailOptions = {
        to: resolvedTo,
        subject: resolvedSubject,
        html: emailBody,
        cc: resolvedCc,
        bcc: resolvedBcc,
        attachments: attachments || []
      };

      // Send email
      if (!emailService) {
        // Mock mode - just return success
        console.log(`[Mock Email] Sending to ${resolvedTo}: ${resolvedSubject}`);
        return {
          status: 'success',
          output: {
            messageId: `mock-${Date.now()}`,
            to: resolvedTo,
            subject: resolvedSubject,
            timestamp: new Date().toISOString()
          },
          timestamp: Date.now(),
          duration: Date.now() - startTime
        };
      }

      const result = await emailService.send(emailOptions);

      return {
        status: 'success',
        output: {
          messageId: result.messageId,
          to: resolvedTo,
          subject: resolvedSubject,
          timestamp: new Date().toISOString()
        },
        timestamp: Date.now(),
        duration: Date.now() - startTime
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

    // Validate email format
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

  /**
   * Render email template (mock implementation)
   */
  private _renderTemplate(template: string, data: Record<string, any>): string {
    let html = template;

    // Simple variable substitution {{varName}}
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return html;
  }
}

export const emailSendExecutor = new EmailSendExecutor();
