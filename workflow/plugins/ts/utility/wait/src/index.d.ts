/**
 * Wait Node Executor Plugin
 * Pauses execution for a specified duration
 */
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@metabuilder/workflow';
export declare class WaitExecutor implements INodeExecutor {
    nodeType: string;
    execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult>;
    validate(node: WorkflowNode): ValidationResult;
}
export declare const waitExecutor: WaitExecutor;
//# sourceMappingURL=index.d.ts.map