/**
 * Transform Node Executor Plugin
 * Handles data transformation using template expressions and mappings
 *
 * @packageDocumentation
 */
import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult, ValidationResult } from '@metabuilder/workflow';
export declare class TransformExecutor implements INodeExecutor {
    nodeType: string;
    execute(node: WorkflowNode, context: WorkflowContext, state: ExecutionState): Promise<NodeResult>;
    validate(node: WorkflowNode): ValidationResult;
    /**
     * Apply mapping transformation with template interpolation
     */
    private _applyMapping;
    /**
     * Flatten nested object structure
     */
    private _flattenObject;
    /**
     * Group array of objects by a field value
     */
    private _groupByField;
    /**
     * Merge multiple objects
     */
    private _mergeObjects;
    /**
     * Format result based on specified format
     */
    private _formatResult;
    /**
     * Convert data to CSV format
     */
    private _toCSV;
    /**
     * Escape CSV field
     */
    private _escapeCSVField;
    /**
     * Convert data to XML format
     */
    private _toXML;
    /**
     * Recursively convert object to XML
     */
    private _objectToXML;
    /**
     * Convert data to YAML format (simplified)
     */
    private _toYAML;
}
export declare const transformExecutor: TransformExecutor;
//# sourceMappingURL=index.d.ts.map