/**
 * DAG Workflow Executor - N8N-style execution engine
 * Supports branching, parallel execution, error handling, retry logic
 * Enhanced with plugin registry integration and error recovery
 */

import { PriorityQueue } from '../utils/priority-queue';
import { WorkflowContext, ExecutionState, NodeResult, WorkflowDefinition } from '../types';
import { evaluateTemplate } from '../utils/template-engine';
import { getNodeExecutorRegistry, NodeExecutorRegistry } from '../registry/node-executor-registry';

export interface ExecutionMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  nodesExecuted: number;
  successNodes: number;
  failedNodes: number;
  retriedNodes: number;
  totalRetries: number;
  peakMemory: number;
  validationFailures: number;
  recoveryAttempts: number;
  recoverySuccesses: number;
}

export interface ErrorRecoveryStrategy {
  strategy: 'fallback' | 'skip' | 'retry' | 'fail';
  fallbackNodeType?: string;
  maxRetries?: number;
  retryDelay?: number;
  allowPartialOutput?: boolean;
}

/**
 * Node executor callback - implement this to handle different node types
 */
export type NodeExecutorFn = (
  nodeId: string,
  workflow: WorkflowDefinition,
  context: WorkflowContext,
  state: ExecutionState
) => Promise<NodeResult>;

export class DAGExecutor {
  private executionId: string;
  private workflow: WorkflowDefinition;
  private context: WorkflowContext;
  private state: ExecutionState = {};
  private metrics: ExecutionMetrics;
  private queue: PriorityQueue<string>;
  private nodeResults: Map<string, NodeResult> = new Map();
  private _retryAttempts: Map<string, number> = new Map();
  private activeNodes: Set<string> = new Set();
  private aborted = false;
  private nodeExecutor: NodeExecutorFn;
  private registry: NodeExecutorRegistry;

  constructor(
    executionId: string,
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    nodeExecutor: NodeExecutorFn,
    registry?: NodeExecutorRegistry
  ) {
    this.executionId = executionId;
    this.workflow = workflow;
    this.context = context;
    this.nodeExecutor = nodeExecutor;
    this.registry = registry || getNodeExecutorRegistry();
    this.queue = new PriorityQueue<string>();
    this.metrics = {
      startTime: Date.now(),
      nodesExecuted: 0,
      successNodes: 0,
      failedNodes: 0,
      retriedNodes: 0,
      totalRetries: 0,
      peakMemory: 0,
      validationFailures: 0,
      recoveryAttempts: 0,
      recoverySuccesses: 0
    };
  }

  /**
   * Execute workflow as DAG with automatic dependency resolution
   */
  async execute(): Promise<ExecutionState> {
    console.log(`[${this.executionId}] Starting DAG execution`);

    try {
      // 1. Initialize trigger nodes
      this._initializeTriggers();

      // 2. Main execution loop
      while (!this.queue.isEmpty() && !this.aborted) {
        const dequeued = this.queue.dequeue();
        if (!dequeued) break;

        const { item: nodeId } = dequeued;

        if (this.activeNodes.has(nodeId)) {
          // Already executing (parallel execution in progress)
          continue;
        }

        await this._executeNode(nodeId);
      }

      // 3. Finalize execution
      this.metrics.endTime = Date.now();
      this.metrics.duration = this.metrics.endTime - this.metrics.startTime;

      console.log(`[${this.executionId}] Execution completed in ${this.metrics.duration}ms`);

      return this.state;
    } catch (error) {
      console.error(`[${this.executionId}] Execution failed:`, error);
      throw error;
    }
  }

  /**
   * Find and enqueue trigger nodes
   */
  private _initializeTriggers(): void {
    const triggers = this.workflow.triggers || [];

    if (triggers.length === 0) {
      // Manual trigger - find first node with no inputs
      const startNodes = this.workflow.nodes.filter((node) => {
        const incomingConnections = Object.values(this.workflow.connections)
          .flatMap((conn) => Object.values(conn).flatMap((ports) => Object.values(ports).flat()))
          .filter((target) => target.node === node.id);

        return incomingConnections.length === 0;
      });

      startNodes.forEach((node) => {
        this.queue.enqueue(node.id, 0);
      });

      console.log(`[${this.executionId}] Initialized with ${startNodes.length} start nodes`);
    } else {
      // Event-driven triggers
      triggers.forEach((trigger) => {
        if (trigger.enabled) {
          this.queue.enqueue(trigger.nodeId, 0);
          console.log(`[${this.executionId}] Trigger enabled: ${trigger.kind} on ${trigger.nodeId}`);
        }
      });
    }
  }

  /**
   * Execute a single node with full error handling and retries
   */
  private async _executeNode(nodeId: string): Promise<void> {
    this.activeNodes.add(nodeId);

    try {
      const node = this.workflow.nodes.find((n) => n.id === nodeId);
      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }

      // Check skip conditions
      if (node.skipOnFail && !this._canExecuteNode(node)) {
        console.log(`[${this.executionId}] Skipping node (previous failed): ${nodeId}`);
        this.activeNodes.delete(nodeId);
        return;
      }

      if (node.disabled) {
        console.log(`[${this.executionId}] Skipping disabled node: ${nodeId}`);
        this.activeNodes.delete(nodeId);
        this._routeOutput(nodeId, { status: 'skipped', timestamp: Date.now() });
        return;
      }

      // Pre-execution validation
      const validation = await this._validateNodeType(node);
      if (!validation.valid) {
        const result = this._handleValidationFailure(node, validation);
        this.nodeResults.set(nodeId, result);
        this.state[nodeId] = result;
        this._handleNodeError(node, result);
        this.metrics.nodesExecuted++;
        return;
      }

      // Execute with retries
      const result = await this._executeNodeWithRetry(node);
      this.nodeResults.set(nodeId, result);
      this.state[nodeId] = result;

      if (result.status === 'success') {
        this.metrics.successNodes++;
      } else if (result.status === 'error') {
        this.metrics.failedNodes++;
        this._handleNodeError(node, result);
      }

      // Route output to next nodes
      this._routeOutput(nodeId, result);

      this.metrics.nodesExecuted++;
    } catch (error) {
      console.error(`[${this.executionId}] Node execution failed: ${nodeId}`, error);
      this.state[nodeId] = {
        status: 'error',
        error: String(error),
        timestamp: Date.now()
      };
      this.metrics.failedNodes++;
    } finally {
      this.activeNodes.delete(nodeId);
    }
  }

  /**
   * Execute node with automatic retry logic and error recovery
   */
  private async _executeNodeWithRetry(node: any): Promise<NodeResult> {
    const retryPolicy = node.retryPolicy || this.workflow.retryPolicy || {};
    const maxAttempts = node.maxTries || retryPolicy.maxAttempts || 1;
    let lastError: any;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      this._retryAttempts.set(node.id, attempt);
      try {
        if (attempt > 0) {
          this.metrics.retriedNodes++;
          this.metrics.totalRetries++;

          // Calculate backoff
          const delay = this._calculateBackoff(
            attempt,
            retryPolicy.backoffType || 'exponential',
            retryPolicy.initialDelay || 1000,
            retryPolicy.maxDelay || 60000
          );

          console.log(
            `[${this.executionId}] Retrying node ${node.id} (attempt ${attempt + 1}/${maxAttempts}) after ${delay}ms`
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // Execute node operation with tenant context propagation
        const tenantContext = this._getTenantContext();
        const contextWithTenant = { ...this.context, ...tenantContext };
        const result = await this.nodeExecutor(node.id, this.workflow, contextWithTenant, this.state);
        return result;
      } catch (error) {
        lastError = error;

        // Check if error is retryable
        if (!this._isRetryableError(error, retryPolicy)) {
          // Apply error recovery strategy on non-retryable error
          const recoveryStrategy: ErrorRecoveryStrategy = node.errorRecoveryStrategy ||
            (this.workflow as any).errorRecovery ||
            { strategy: 'fail' };

          return this._handleErrorRecovery(node, error, recoveryStrategy);
        }

        if (attempt === maxAttempts - 1) {
          // Max retries reached - apply recovery strategy
          const recoveryStrategy: ErrorRecoveryStrategy = node.errorRecoveryStrategy ||
            (this.workflow as any).errorRecovery ||
            { strategy: 'fail' };

          return this._handleErrorRecovery(node, lastError, recoveryStrategy);
        }
      }
    }

    throw lastError;
  }

  /**
   * Calculate exponential/linear/fibonacci backoff
   */
  private _calculateBackoff(attempt: number, backoffType: string, initial: number, max: number): number {
    let delay: number;

    switch (backoffType) {
      case 'linear':
        delay = initial * (attempt + 1);
        break;
      case 'fibonacci':
        delay = this._fibonacci(attempt + 1) * initial;
        break;
      case 'exponential':
      default:
        delay = initial * Math.pow(2, attempt);
    }

    return Math.min(delay, max);
  }

  /**
   * Fibonacci sequence for backoff
   */
  private _fibonacci(n: number): number {
    if (n <= 1) return n;
    let a = 0,
      b = 1;
    for (let i = 2; i < n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  /**
   * Check if error is retryable
   */
  private _isRetryableError(error: any, retryPolicy: any): boolean {
    const retryableErrors = retryPolicy.retryableErrors || ['TIMEOUT', 'TEMPORARY_FAILURE'];
    const retryableStatuses = retryPolicy.retryableStatusCodes || [408, 429, 500, 502, 503, 504];

    const errorType = error.code || error.name || 'UNKNOWN';
    const statusCode = error.statusCode || error.status;

    return (
      retryableErrors.includes(errorType) || (statusCode && retryableStatuses.includes(statusCode))
    );
  }

  /**
   * Route node output to next nodes based on connections
   */
  private _routeOutput(nodeId: string, result: NodeResult): void {
    const connections = this.workflow.connections[nodeId];
    if (!connections) {
      console.log(`[${this.executionId}] No connections for node: ${nodeId}`);
      return;
    }

    // Determine output port based on result status
    let outputPort: string;
    if (result.status === 'error') {
      outputPort = 'error';
    } else {
      outputPort = 'main';
    }

    const portConnections = connections[outputPort];
    if (!portConnections) {
      console.log(`[${this.executionId}] No connections for port ${outputPort} on node ${nodeId}`);
      return;
    }

    // Route to all connected inputs
    Object.entries(portConnections).forEach(([_outputIndex, targets]) => {
      (targets as any[]).forEach((target) => {
        // Check conditional routing
        if (target.conditional && target.condition) {
          const shouldRoute = this._evaluateCondition(target.condition);
          if (!shouldRoute) {
            console.log(`[${this.executionId}] Conditional route blocked: ${nodeId} -> ${target.node}`);
            return;
          }
        }

        this.queue.enqueue(target.node, 10); // Medium priority
        console.log(`[${this.executionId}] Queued node: ${target.node} (from ${nodeId})`);
      });
    });
  }

  /**
   * Evaluate conditional routing expression
   */
  private _evaluateCondition(condition: string): boolean {
    try {
      return Boolean(
        evaluateTemplate(condition, {
          context: this.context,
          state: this.state,
          json: this.context.triggerData
        })
      );
    } catch {
      console.warn(`Failed to evaluate condition: ${condition}`);
      return false;
    }
  }

  /**
   * Handle node error based on error policy
   */
  private _handleNodeError(node: any, result: NodeResult): void {
    const errorPolicy = node.onError || 'stopWorkflow';

    switch (errorPolicy) {
      case 'stopWorkflow':
        console.log(`[${this.executionId}] Stopping workflow due to error in ${node.id}`);
        this.aborted = true;
        break;

      case 'continueErrorOutput':
        console.log(`[${this.executionId}] Continuing with error output from ${node.id}`);
        this._routeErrorOutput(node, result);
        break;

      case 'continueRegularOutput':
        console.log(`[${this.executionId}] Continuing with regular output from ${node.id}`);
        this._routeOutput(node.id, { status: 'success', output: {}, timestamp: Date.now() });
        break;

      case 'skipNode':
        console.log(`[${this.executionId}] Skipping subsequent nodes after ${node.id}`);
        break;
    }
  }

  /**
   * Route error output to error ports
   */
  private _routeErrorOutput(node: any, _result: NodeResult): void {
    const connections = this.workflow.connections[node.id];
    if (!connections || !connections.error) {
      return;
    }

    Object.values(connections.error).forEach((targets: any[]) => {
      targets.forEach((target) => {
        this.queue.enqueue(target.node, 5); // Lower priority
      });
    });
  }

  /**
   * Check if node can execute based on dependency state
   */
  private _canExecuteNode(node: any): boolean {
    // Check if all input dependencies succeeded
    const connections = this.workflow.connections;

    for (const [fromNodeId, portMap] of Object.entries(connections)) {
      for (const [_outputType, indexMap] of Object.entries(portMap as any)) {
        for (const targets of Object.values(indexMap as any)) {
          const shouldCheck = (targets as any[]).some((t) => t.node === node.id);
          if (shouldCheck) {
            const fromNodeResult = this.state[fromNodeId];
            if (fromNodeResult?.status === 'error') {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  /**
   * Abort execution
   */
  abort(): void {
    console.log(`[${this.executionId}] Aborting execution`);
    this.aborted = true;
  }

  /**
   * Get execution metrics
   */
  getMetrics(): ExecutionMetrics {
    return this.metrics;
  }

  /**
   * Get execution state
   */
  getState(): ExecutionState {
    return this.state;
  }

  /**
   * Check if execution is complete
   */
  isComplete(): boolean {
    return this.queue.isEmpty() || this.aborted;
  }

  /**
   * Validate node type and schema before execution
   */
  private async _validateNodeType(node: any): Promise<{ valid: boolean; errors: string[] }> {
    const nodeType = node.nodeType;

    // Check if executor exists in registry
    if (!this.registry.has(nodeType)) {
      return {
        valid: false,
        errors: [`Unknown node type: ${nodeType}`]
      };
    }

    // Get plugin metadata for schema validation
    const pluginInfo = this.registry.getPluginInfo(nodeType);
    const errors: string[] = [];

    // Check required fields from plugin metadata if available
    if (pluginInfo && pluginInfo.metadata) {
      const requiredFields = (pluginInfo.metadata as any).requiredFields;
      if (requiredFields && Array.isArray(requiredFields)) {
        for (const field of requiredFields) {
          if (!(field in node.parameters)) {
            errors.push(`Missing required parameter: ${field}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Handle validation failure
   */
  private _handleValidationFailure(node: any, validation: { valid: boolean; errors: string[] }): NodeResult {
    this.metrics.validationFailures++;
    console.warn(`[${this.executionId}] Node validation failed for ${node.id}: ${validation.errors.join('; ')}`);

    return {
      status: 'error',
      error: validation.errors.join('; '),
      errorCode: 'VALIDATION_FAILED',
      timestamp: Date.now(),
      validationErrors: validation.errors
    };
  }

  /**
   * Handle error recovery with fallback strategies
   */
  private async _handleErrorRecovery(
    node: any,
    error: any,
    strategy: ErrorRecoveryStrategy
  ): Promise<NodeResult> {
    this.metrics.recoveryAttempts++;

    console.log(
      `[${this.executionId}] Applying ${strategy.strategy} recovery strategy for node ${node.id}`
    );

    switch (strategy.strategy) {
      case 'fallback': {
        // Use fallback node type if specified
        if (!strategy.fallbackNodeType) {
          return {
            status: 'error',
            error: String(error),
            errorCode: 'NO_FALLBACK',
            timestamp: Date.now(),
            recoveryApplied: false
          };
        }

        if (!this.registry.has(strategy.fallbackNodeType)) {
          return {
            status: 'error',
            error: `Fallback node type not found: ${strategy.fallbackNodeType}`,
            errorCode: 'FALLBACK_NOT_FOUND',
            timestamp: Date.now(),
            recoveryApplied: false
          };
        }

        try {
          console.log(
            `[${this.executionId}] Executing fallback node type: ${strategy.fallbackNodeType}`
          );

          const result = await this.nodeExecutor(node.id, this.workflow, this.context, this.state);
          this.metrics.recoverySuccesses++;

          return {
            ...result,
            recoveryApplied: true,
            fallbackNodeType: strategy.fallbackNodeType
          };
        } catch (fallbackError) {
          return {
            status: 'error',
            error: `Fallback failed: ${String(fallbackError)}`,
            errorCode: 'FALLBACK_FAILED',
            timestamp: Date.now(),
            recoveryApplied: false
          };
        }
      }

      case 'skip': {
        // Skip node and continue with empty output
        console.log(`[${this.executionId}] Skipping node ${node.id} due to error recovery`);
        this.metrics.recoverySuccesses++;

        return {
          status: 'skipped',
          output: strategy.allowPartialOutput ? {} : undefined,
          timestamp: Date.now(),
          recoveryApplied: true
        };
      }

      case 'retry': {
        // Re-raise error to trigger retry at higher level
        throw error;
      }

      case 'fail':
      default: {
        // Fail the node
        return {
          status: 'error',
          error: String(error),
          errorCode: 'EXECUTION_ERROR',
          timestamp: Date.now(),
          recoveryApplied: false
        };
      }
    }
  }

  /**
   * Propagate multi-tenant context to node execution
   */
  private _getTenantContext(): Record<string, any> {
    return {
      tenantId: this.context.tenantId,
      workflowTenantId: this.workflow.tenantId,
      executionTenantId: this.context.tenantId,
      multiTenancyPolicy: this.workflow.multiTenancy
    };
  }
}
