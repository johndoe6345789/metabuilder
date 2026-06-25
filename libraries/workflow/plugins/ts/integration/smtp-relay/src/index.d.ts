/**
 * SMTP Relay Node Executor Plugin
 * Sends emails via the MetaBuilder Twisted SMTP relay service
 *
 * Features:
 * - Multi-tenant SMTP credential lookup
 * - Template support with variable interpolation
 * - Automatic retry with exponential backoff
 * - Comprehensive error handling
 * - Audit logging via DBAL
 */
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@metabuilder/workflow';
export declare class SMTPRelayExecutor implements INodeExecutor {
    nodeType: string;
    private transporter;
    constructor();
    private initializeTransporter;
    validate(node: WorkflowNode): ValidationResult;
    execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult>;
    private _getTenantTransporter;
    private _sendWithRetry;
    private _isRetryableError;
    private _isValidEmail;
    private _renderTemplate;
    private _getTemplate;
    private _auditLog;
}
export declare const smtpRelayExecutor: SMTPRelayExecutor;
/**
 * Email service setter for dependency injection
 * Allows tests or custom configurations
 */
export declare function setSMTPService(executor: SMTPRelayExecutor): void;
//# sourceMappingURL=index.d.ts.map