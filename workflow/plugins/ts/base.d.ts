/**
 * Base types and interfaces for TypeScript workflow plugins.
 * @packageDocumentation
 */
/**
 * Input data passed to plugin execute methods.
 */
export interface ExecuteInputs {
    /** The workflow node being executed */
    node: {
        id: string;
        name: string;
        type: string;
        nodeType: string;
        parameters: Record<string, any>;
    };
    /** Workflow execution context */
    context: {
        executionId: string;
        tenantId: string;
        userId: string;
        triggerData: Record<string, any>;
        variables: Record<string, any>;
    };
    /** Current execution state with results from previous nodes */
    state: Record<string, any>;
}
/**
 * Result returned from plugin execute methods.
 */
export interface ExecuteResult {
    /** Primary result value */
    result?: any;
    /** Additional output data */
    [key: string]: any;
}
/**
 * Interface that all node executor plugins must implement.
 */
export interface NodeExecutor {
    /** Unique node type identifier (e.g., 'string.concat', 'math.add') */
    readonly nodeType: string;
    /** Category for grouping (e.g., 'string', 'math', 'logic') */
    readonly category: string;
    /** Human-readable description of what this node does */
    readonly description: string;
    /**
     * Execute the plugin logic.
     * @param inputs - Input data including node, context, and state
     * @param runtime - Optional runtime services (logging, etc.)
     * @returns The execution result
     */
    execute(inputs: ExecuteInputs, runtime?: any): ExecuteResult;
}
/**
 * Helper to create a context object for template interpolation.
 */
export declare function createTemplateContext(inputs: ExecuteInputs): Record<string, any>;
/**
 * Helper to resolve template values.
 */
export declare function resolveValue(value: any, ctx: Record<string, any>, interpolate: (template: string, ctx: any) => any): any;
//# sourceMappingURL=base.d.ts.map