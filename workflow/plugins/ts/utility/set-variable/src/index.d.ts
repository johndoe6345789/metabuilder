/**
 * Set Variable Node Executor Plugin
 * Handles setting workflow variables for subsequent nodes
 *
 * @packageDocumentation
 */
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@metabuilder/workflow';
export declare class SetVariableExecutor implements INodeExecutor {
    nodeType: string;
    execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult>;
    validate(node: WorkflowNode): ValidationResult;
    /**
     * Check if variable name is valid
     * Must start with letter or underscore, contain only alphanumeric and underscores
     */
    private _isValidVariableName;
    /**
     * Check if name is reserved
     */
    private _isReservedNames;
    /**
     * Alias for _isReservedNames to fix typo
     */
    private _isReservedName;
    /**
     * Recursively interpolate object values
     */
    private _interpolateObject;
}
export declare const setVariableExecutor: SetVariableExecutor;
//# sourceMappingURL=index.d.ts.map