/**
 * Base types and interfaces for TypeScript workflow plugins.
 * @packageDocumentation
 */

/** A JSON-compatible primitive value. */
export type JsonPrimitive = string | number | boolean | null;

/** A JSON-compatible value used at workflow boundaries. */
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

/** A JSON-compatible object used for parameters, variables, and state. */
export interface JsonObject {
  [key: string]: JsonValue;
}

/** Runtime capabilities exposed to workflow plugins. */
export interface WorkflowRuntime {
  log?: (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: JsonObject) => void;
}

/**
 * Input data passed to plugin execute methods.
 */
export interface ExecuteInputs<TParameters extends JsonObject = JsonObject> {
  /** The workflow node being executed */
  node: {
    id: string;
    name: string;
    type: string;
    nodeType: string;
    parameters: TParameters;
  };
  /** Workflow execution context */
  context: {
    executionId: string;
    tenantId: string;
    userId: string;
    triggerData: JsonObject;
    variables: JsonObject;
  };
  /** Current execution state with results from previous nodes */
  state: JsonObject;
}

/**
 * Result returned from plugin execute methods.
 */
export interface ExecuteResult<TResult extends JsonValue = JsonValue> extends JsonObject {
  /** Primary result value */
  result?: TResult;
}

/**
 * Interface that all node executor plugins must implement.
 */
export interface NodeExecutor<
  TParameters extends JsonObject = JsonObject,
  TResult extends JsonValue = JsonValue,
> {
  /** Unique node type identifier (e.g., 'string.concat', 'math.add') */
  readonly nodeType: string;
  /** Category for grouping (e.g., 'string', 'math', 'logic') */
  readonly category: string;
  /** Human-readable description of what this node does */
  readonly description: string;

  /**
   * Execute the plugin logic.
   *
   * Synchronous plugins remain supported, while I/O-bound plugins can return
   * a Promise without weakening the shared contract.
   */
  execute(
    inputs: ExecuteInputs<TParameters>,
    runtime?: WorkflowRuntime,
  ): ExecuteResult<TResult> | Promise<ExecuteResult<TResult>>;
}

/**
 * Helper to create a context object for template interpolation.
 */
export function createTemplateContext(inputs: ExecuteInputs): JsonObject {
  return {
    context: inputs.context,
    state: inputs.state,
    json: inputs.context.triggerData,
  };
}

/**
 * Helper to resolve template values.
 */
export function resolveValue<T>(
  value: T,
  ctx: JsonObject,
  interpolate: (template: string, ctx: JsonObject) => JsonValue,
): T | JsonValue {
  if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
    return interpolate(value, ctx);
  }
  return value;
}
