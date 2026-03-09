/**
 * Condition Node Executor Plugin
 * Evaluates conditions and routes execution to different paths
 */
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@metabuilder/workflow';
export declare class ConditionExecutor implements INodeExecutor {
    nodeType: string;
    execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult>;
    validate(node: WorkflowNode): ValidationResult;
}
export declare const conditionExecutor: ConditionExecutor;
//# sourceMappingURL=index.d.ts.map