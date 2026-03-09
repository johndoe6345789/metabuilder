/**
 * DBAL Read Node Executor Plugin
 * Fetches data from the C++ DBAL REST API via fetch().
 */
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@metabuilder/workflow';
export declare class DBALReadExecutor implements INodeExecutor {
    nodeType: string;
    execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult>;
    validate(node: WorkflowNode): ValidationResult;
}
export declare const dbalReadExecutor: DBALReadExecutor;
//# sourceMappingURL=index.d.ts.map