/**
 * DBAL Write Node Executor Plugin
 * Executes create/update/delete against the C++ DBAL REST API via fetch().
 */
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@metabuilder/workflow';
export declare class DBALWriteExecutor implements INodeExecutor {
    nodeType: string;
    execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult>;
    validate(node: WorkflowNode): ValidationResult;
}
export declare const dbalWriteExecutor: DBALWriteExecutor;
//# sourceMappingURL=index.d.ts.map