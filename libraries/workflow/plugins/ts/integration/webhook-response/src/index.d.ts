/**
 * Webhook Response Node Executor Plugin
 * Handles returning HTTP responses to webhook senders
 *
 * @packageDocumentation
 */
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@metabuilder/workflow';
export declare class WebhookResponseExecutor implements INodeExecutor {
    nodeType: string;
    /**
     * Standard HTTP status texts
     */
    private readonly statusTexts;
    execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult>;
    validate(node: WorkflowNode): ValidationResult;
    /**
     * Resolve status code from parameter (number, string, or template)
     */
    private _resolveStatusCode;
    /**
     * Get default response body based on status code
     */
    private _getDefaultBodyForStatus;
    /**
     * Determine content type from headers or body
     */
    private _determineContentType;
    /**
     * Remove or normalize restricted headers
     */
    private _sanitizeHeaders;
}
export declare const webhookResponseExecutor: WebhookResponseExecutor;
//# sourceMappingURL=index.d.ts.map