/**
 * HTTP Request Node Executor Plugin
 * Handles outbound HTTP calls with retry and response parsing
 */
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@metabuilder/workflow';
export declare class HTTPRequestExecutor implements INodeExecutor {
    nodeType: string;
    execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult>;
    validate(node: WorkflowNode): ValidationResult;
}
export declare const httpRequestExecutor: HTTPRequestExecutor;
//# sourceMappingURL=index.d.ts.map