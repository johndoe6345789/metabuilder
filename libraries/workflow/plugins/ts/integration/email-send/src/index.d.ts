/**
 * Email Send Node Executor Plugin
 * Sends emails with template support
 */
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@metabuilder/workflow';
export declare class EmailSendExecutor implements INodeExecutor {
    nodeType: string;
    execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult>;
    validate(node: WorkflowNode): ValidationResult;
    private _renderTemplate;
}
export declare const emailSendExecutor: EmailSendExecutor;
//# sourceMappingURL=index.d.ts.map