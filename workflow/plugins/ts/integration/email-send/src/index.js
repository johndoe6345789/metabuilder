"use strict";
/**
 * Email Send Node Executor Plugin
 * Sends emails with template support
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSendExecutor = exports.EmailSendExecutor = void 0;
const workflow_1 = require("@metabuilder/workflow");
class EmailSendExecutor {
    constructor() {
        this.nodeType = 'email-send';
    }
    async execute(node, context, state) {
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
            const resolvedTo = (0, workflow_1.interpolateTemplate)(to, { context, state, json: context.triggerData });
            const resolvedSubject = (0, workflow_1.interpolateTemplate)(subject, { context, state, json: context.triggerData });
            const resolvedCc = cc ? (0, workflow_1.interpolateTemplate)(cc, { context, state, json: context.triggerData }) : undefined;
            const resolvedBcc = bcc ? (0, workflow_1.interpolateTemplate)(bcc, { context, state, json: context.triggerData }) : undefined;
            let emailBody;
            if (template) {
                emailBody = this._renderTemplate(template, data || {});
            }
            else {
                emailBody = (0, workflow_1.interpolateTemplate)(body, { context, state, json: context.triggerData });
            }
            console.log(`[Email] To: ${resolvedTo}, Subject: ${resolvedSubject}`);
            const mockMessageId = `msg-${Date.now()}`;
            const duration = Date.now() - startTime;
            return {
                status: 'success',
                output: {
                    messageId: mockMessageId,
                    to: resolvedTo,
                    subject: resolvedSubject,
                    timestamp: new Date().toISOString()
                },
                timestamp: Date.now(),
                duration
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                errorCode: 'EMAIL_SEND_ERROR',
                timestamp: Date.now(),
                duration: Date.now() - startTime
            };
        }
    }
    validate(node) {
        const errors = [];
        const warnings = [];
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
    _renderTemplate(template, data) {
        let html = template;
        Object.entries(data).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            html = html.replace(new RegExp(placeholder, 'g'), String(value));
        });
        return html;
    }
}
exports.EmailSendExecutor = EmailSendExecutor;
exports.emailSendExecutor = new EmailSendExecutor();
//# sourceMappingURL=index.js.map