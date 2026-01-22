/**
 * Error Recovery Manager - Comprehensive Error Handling and Recovery Strategies
 * Implements error recovery strategies (fallback, skip, retry, fail) with
 * exponential backoff, metrics tracking, and error state management.
 * @packageDocumentation
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult
} from '../types';

/**
 * Recovery strategy type
 */
export type RecoveryStrategyType = 'fallback' | 'skip' | 'retry' | 'fail';

/**
 * Error recovery strategy configuration
 */
export interface ErrorRecoveryStrategy {
  strategy: RecoveryStrategyType;
  fallbackNodeType?: string;
  maxRetries?: number;
  retryDelay?: number;
  retryBackoffMultiplier?: number;
  maxRetryDelay?: number;
  retryableErrors?: string[];
  retryableStatusCodes?: number[];
  allowPartialOutput?: boolean;
  notifyOnError?: boolean;
  notificationChannels?: string[];
}

/**
 * Individual error recovery attempt record
 */
export interface RecoveryAttempt {
  timestamp: number;
  strategy: RecoveryStrategyType;
  nodeType: string;
  nodeId: string;
  attempt: number;
  maxAttempts: number;
  error: string;
  errorType: string;
  duration: number;
  status: 'pending' | 'success' | 'failed';
  output?: any;
}

/**
 * Error metrics for tracking and analysis
 */
export interface ErrorMetrics {
  totalErrors: number;
  recoveryAttempts: number;
  recoverySuccess: number;
  recoveryFailed: number;
  errorsByType: Map<string, number>;
  errorsByNodeType: Map<string, number>;
  errorsByStrategy: Map<RecoveryStrategyType, number>;
  averageRecoveryTime: number;
  lastErrorTime: number;
}

/**
 * Error state for tracking recovery progress
 */
export interface ErrorState {
  nodeId: string;
  nodeType: string;
  originalError: Error;
  errorTime: number;
  attempts: RecoveryAttempt[];
  lastAttempt?: RecoveryAttempt;
  recovered: boolean;
  finalError?: Error;
  context?: Record<string, any>;
}

/**
 * Recovery result from an attempt
 */
export interface RecoveryResult {
  success: boolean;
  strategy: RecoveryStrategyType;
  attempts: number;
  totalDuration: number;
  output?: any;
  error?: string;
  recoveryAttempts?: RecoveryAttempt[];
}

/**
 * Error Recovery Manager Class
 */
export class ErrorRecoveryManager {
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    recoveryAttempts: 0,
    recoverySuccess: 0,
    recoveryFailed: 0,
    errorsByType: new Map(),
    errorsByNodeType: new Map(),
    errorsByStrategy: new Map(),
    averageRecoveryTime: 0,
    lastErrorTime: 0
  };

  private errorStates: Map<string, ErrorState> = new Map();
  private recoveryTimes: number[] = [];
  private readonly MAX_RECOVERY_HISTORY = 1000;
  private readonly MAX_ERROR_STATES = 500;

  /**
   * Handle error with recovery strategy
   */
  async handleError(
    nodeType: string,
    nodeId: string,
    error: Error,
    strategy: ErrorRecoveryStrategy,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState,
    registryExecute?: (
      nodeType: string,
      node: any,
      ctx: any,
      state: any
    ) => Promise<NodeResult>
  ): Promise<RecoveryResult> {
    const startTime = performance.now();
    this.metrics.totalErrors++;
    this.metrics.recoveryAttempts++;
    this.metrics.lastErrorTime = Date.now();

    const errorState = this._createErrorState(nodeType, nodeId, error, context);
    this._trackError(error, nodeType, strategy.strategy);

    try {
      switch (strategy.strategy) {
        case 'fallback':
          return await this._applyFallback(
            strategy,
            node,
            context,
            state,
            registryExecute,
            errorState,
            startTime
          );

        case 'skip':
          return this._applySkip(errorState, startTime);

        case 'retry':
          return await this._applyRetry(
            nodeType,
            nodeId,
            node,
            context,
            state,
            strategy,
            registryExecute,
            errorState,
            startTime
          );

        case 'fail':
        default:
          return this._applyFail(error, errorState, startTime);
      }
    } catch (recoveryError) {
      this.metrics.recoveryFailed++;
      errorState.recovered = false;
      errorState.finalError = recoveryError as Error;
      this._storeErrorState(errorState);

      return {
        success: false,
        strategy: strategy.strategy,
        attempts: errorState.attempts.length,
        totalDuration: performance.now() - startTime,
        error: `Recovery failed: ${
          recoveryError instanceof Error
            ? recoveryError.message
            : String(recoveryError)
        }`
      };
    }
  }

  /**
   * Apply fallback strategy
   */
  private async _applyFallback(
    strategy: ErrorRecoveryStrategy,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState,
    registryExecute: ((
      nodeType: string,
      node: any,
      ctx: any,
      state: any
    ) => Promise<NodeResult>) | undefined,
    errorState: ErrorState,
    startTime: number
  ): Promise<RecoveryResult> {
    if (!strategy.fallbackNodeType || !registryExecute) {
      return {
        success: false,
        strategy: 'fallback',
        attempts: 0,
        totalDuration: performance.now() - startTime,
        error: 'Fallback node type not configured or registry unavailable'
      };
    }

    const fallbackStartTime = performance.now();

    try {
      // Record the attempt
      const attempt: RecoveryAttempt = {
        timestamp: Date.now(),
        strategy: 'fallback',
        nodeType: strategy.fallbackNodeType,
        nodeId: node.id,
        attempt: 1,
        maxAttempts: 1,
        error: errorState.originalError.message,
        errorType: errorState.originalError.constructor.name,
        duration: 0,
        status: 'pending'
      };

      const result = await registryExecute(
        strategy.fallbackNodeType,
        node,
        context,
        state
      );

      const duration = performance.now() - fallbackStartTime;
      attempt.duration = duration;
      attempt.status = result.status === 'success' ? 'success' : 'failed';
      attempt.output = result.output;

      errorState.attempts.push(attempt);
      errorState.lastAttempt = attempt;

      if (result.status === 'success') {
        this.metrics.recoverySuccess++;
        errorState.recovered = true;
        this._storeErrorState(errorState);
        this._recordRecoveryTime(performance.now() - startTime);

        return {
          success: true,
          strategy: 'fallback',
          attempts: 1,
          totalDuration: performance.now() - startTime,
          output: result.output,
          recoveryAttempts: errorState.attempts
        };
      }

      return {
        success: false,
        strategy: 'fallback',
        attempts: 1,
        totalDuration: performance.now() - startTime,
        error: `Fallback execution failed: ${result.error}`,
        recoveryAttempts: errorState.attempts
      };
    } catch (fallbackError) {
      const duration = performance.now() - fallbackStartTime;

      const attempt: RecoveryAttempt = {
        timestamp: Date.now(),
        strategy: 'fallback',
        nodeType: strategy.fallbackNodeType,
        nodeId: node.id,
        attempt: 1,
        maxAttempts: 1,
        error: fallbackError instanceof Error
          ? fallbackError.message
          : String(fallbackError),
        errorType: fallbackError instanceof Error
          ? fallbackError.constructor.name
          : 'UnknownError',
        duration,
        status: 'failed'
      };

      errorState.attempts.push(attempt);
      errorState.lastAttempt = attempt;
      errorState.recovered = false;
      errorState.finalError = fallbackError as Error;
      this._storeErrorState(errorState);

      return {
        success: false,
        strategy: 'fallback',
        attempts: 1,
        totalDuration: performance.now() - startTime,
        error: `Fallback failed: ${
          fallbackError instanceof Error
            ? fallbackError.message
            : String(fallbackError)
        }`,
        recoveryAttempts: errorState.attempts
      };
    }
  }

  /**
   * Apply skip strategy
   */
  private _applySkip(
    errorState: ErrorState,
    startTime: number
  ): RecoveryResult {
    this.metrics.recoverySuccess++;

    const attempt: RecoveryAttempt = {
      timestamp: Date.now(),
      strategy: 'skip',
      nodeType: errorState.nodeType,
      nodeId: errorState.nodeId,
      attempt: 1,
      maxAttempts: 1,
      error: errorState.originalError.message,
      errorType: errorState.originalError.constructor.name,
      duration: 0,
      status: 'success'
    };

    errorState.attempts.push(attempt);
    errorState.lastAttempt = attempt;
    errorState.recovered = true;
    this._storeErrorState(errorState);
    this._recordRecoveryTime(performance.now() - startTime);

    return {
      success: true,
      strategy: 'skip',
      attempts: 1,
      totalDuration: performance.now() - startTime,
      output: {},
      recoveryAttempts: errorState.attempts
    };
  }

  /**
   * Apply retry strategy with exponential backoff
   */
  private async _applyRetry(
    nodeType: string,
    nodeId: string,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState,
    strategy: ErrorRecoveryStrategy,
    registryExecute: ((
      nodeType: string,
      node: any,
      ctx: any,
      state: any
    ) => Promise<NodeResult>) | undefined,
    errorState: ErrorState,
    startTime: number
  ): Promise<RecoveryResult> {
    if (!registryExecute) {
      return {
        success: false,
        strategy: 'retry',
        attempts: 0,
        totalDuration: performance.now() - startTime,
        error: 'Registry execute function not available'
      };
    }

    const maxRetries = strategy.maxRetries || 3;
    const initialDelay = strategy.retryDelay || 1000;
    const backoffMultiplier = strategy.retryBackoffMultiplier || 2;
    const maxRetryDelay = strategy.maxRetryDelay || 30000;

    let lastError: Error = errorState.originalError;
    let lastResult: NodeResult | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Calculate delay with exponential backoff
        const delay = this._calculateBackoff(
          initialDelay,
          attempt - 1,
          backoffMultiplier,
          maxRetryDelay
        );

        // Wait before retrying
        await this._delay(delay);

        // Attempt execution
        const retryStartTime = performance.now();
        const result = await registryExecute(nodeType, node, context, state);
        const duration = performance.now() - retryStartTime;

        // Record the attempt
        const recoveryAttempt: RecoveryAttempt = {
          timestamp: Date.now(),
          strategy: 'retry',
          nodeType: nodeType,
          nodeId: nodeId,
          attempt: attempt,
          maxAttempts: maxRetries,
          error: lastError.message,
          errorType: lastError.constructor.name,
          duration: duration,
          status: result.status === 'success' ? 'success' : 'failed',
          output: result.output
        };

        errorState.attempts.push(recoveryAttempt);
        errorState.lastAttempt = recoveryAttempt;

        if (result.status === 'success') {
          this.metrics.recoverySuccess++;
          errorState.recovered = true;
          this._storeErrorState(errorState);
          this._recordRecoveryTime(performance.now() - startTime);

          return {
            success: true,
            strategy: 'retry',
            attempts: attempt,
            totalDuration: performance.now() - startTime,
            output: result.output,
            recoveryAttempts: errorState.attempts
          };
        }

        lastResult = result;
      } catch (retryError) {
        const duration = performance.now() - startTime;

        // Record failed attempt
        const recoveryAttempt: RecoveryAttempt = {
          timestamp: Date.now(),
          strategy: 'retry',
          nodeType: nodeType,
          nodeId: nodeId,
          attempt: attempt,
          maxAttempts: maxRetries,
          error: retryError instanceof Error
            ? retryError.message
            : String(retryError),
          errorType: retryError instanceof Error
            ? retryError.constructor.name
            : 'UnknownError',
          duration: duration,
          status: 'failed'
        };

        errorState.attempts.push(recoveryAttempt);
        errorState.lastAttempt = recoveryAttempt;
        lastError = retryError as Error;

        // If this is the last attempt, don't continue
        if (attempt === maxRetries) {
          errorState.recovered = false;
          errorState.finalError = retryError as Error;
          this._storeErrorState(errorState);

          return {
            success: false,
            strategy: 'retry',
            attempts: attempt,
            totalDuration: performance.now() - startTime,
            error: `All ${maxRetries} retry attempts failed: ${
              retryError instanceof Error
                ? retryError.message
                : String(retryError)
            }`,
            recoveryAttempts: errorState.attempts
          };
        }
      }
    }

    // Max retries exceeded with no success
    errorState.recovered = false;
    errorState.finalError = lastError;
    this._storeErrorState(errorState);

    return {
      success: false,
      strategy: 'retry',
      attempts: maxRetries,
      totalDuration: performance.now() - startTime,
      error: `Max retries (${maxRetries}) exceeded`,
      recoveryAttempts: errorState.attempts
    };
  }

  /**
   * Apply fail strategy (no recovery attempt)
   */
  private _applyFail(
    error: Error,
    errorState: ErrorState,
    startTime: number
  ): RecoveryResult {
    errorState.recovered = false;
    errorState.finalError = error;
    this._storeErrorState(errorState);

    return {
      success: false,
      strategy: 'fail',
      attempts: 0,
      totalDuration: performance.now() - startTime,
      error: error.message
    };
  }

  /**
   * Calculate exponential backoff delay
   */
  private _calculateBackoff(
    initialDelay: number,
    attemptNumber: number,
    multiplier: number,
    maxDelay: number
  ): number {
    let delay = initialDelay * Math.pow(multiplier, attemptNumber);

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * delay * 0.1;
    delay = Math.min(delay + jitter, maxDelay);

    return Math.round(delay);
  }

  /**
   * Delay execution (sleep)
   */
  private async _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create error state for tracking
   */
  private _createErrorState(
    nodeType: string,
    nodeId: string,
    error: Error,
    context: WorkflowContext
  ): ErrorState {
    return {
      nodeId,
      nodeType,
      originalError: error,
      errorTime: Date.now(),
      attempts: [],
      recovered: false,
      context: {
        tenantId: context.tenantId,
        userId: context.userId,
        executionId: context.executionId
      }
    };
  }

  /**
   * Store error state for later analysis
   */
  private _storeErrorState(errorState: ErrorState): void {
    const key = `${errorState.nodeId}-${errorState.errorTime}`;
    this.errorStates.set(key, errorState);

    // Trim old states if exceeding max
    if (this.errorStates.size > this.MAX_ERROR_STATES) {
      const firstKey = this.errorStates.keys().next().value;
      if (firstKey) {
        this.errorStates.delete(firstKey);
      }
    }
  }

  /**
   * Track error occurrence
   */
  private _trackError(
    error: Error,
    nodeType: string,
    strategy: RecoveryStrategyType
  ): void {
    const errorType = error.constructor.name;

    // Track by error type
    this.metrics.errorsByType.set(
      errorType,
      (this.metrics.errorsByType.get(errorType) || 0) + 1
    );

    // Track by node type
    this.metrics.errorsByNodeType.set(
      nodeType,
      (this.metrics.errorsByNodeType.get(nodeType) || 0) + 1
    );

    // Track by recovery strategy
    this.metrics.errorsByStrategy.set(
      strategy,
      (this.metrics.errorsByStrategy.get(strategy) || 0) + 1
    );
  }

  /**
   * Record recovery time
   */
  private _recordRecoveryTime(duration: number): void {
    this.recoveryTimes.push(duration);

    if (this.recoveryTimes.length > this.MAX_RECOVERY_HISTORY) {
      this.recoveryTimes.shift();
    }

    // Update average
    const sum = this.recoveryTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageRecoveryTime = sum / this.recoveryTimes.length;
  }

  /**
   * Get error metrics
   */
  getMetrics(): ErrorMetrics {
    return {
      ...this.metrics,
      errorsByType: new Map(this.metrics.errorsByType),
      errorsByNodeType: new Map(this.metrics.errorsByNodeType),
      errorsByStrategy: new Map(this.metrics.errorsByStrategy)
    };
  }

  /**
   * Get specific error state by key
   */
  getErrorState(nodeId: string, timestamp: number): ErrorState | undefined {
    const key = `${nodeId}-${timestamp}`;
    return this.errorStates.get(key);
  }

  /**
   * Get all error states for a node
   */
  getErrorStatesForNode(nodeId: string): ErrorState[] {
    return Array.from(this.errorStates.values()).filter(
      (state) => state.nodeId === nodeId
    );
  }

  /**
   * Get error statistics by type
   */
  getErrorStatistics(): {
    byType: Array<{ type: string; count: number }>;
    byNodeType: Array<{ nodeType: string; count: number }>;
    byStrategy: Array<{ strategy: RecoveryStrategyType; count: number }>;
  } {
    return {
      byType: Array.from(this.metrics.errorsByType.entries()).map(
        ([type, count]) => ({
          type,
          count
        })
      ),
      byNodeType: Array.from(this.metrics.errorsByNodeType.entries()).map(
        ([nodeType, count]) => ({
          nodeType,
          count
        })
      ),
      byStrategy: Array.from(this.metrics.errorsByStrategy.entries()).map(
        ([strategy, count]) => ({
          strategy,
          count
        })
      )
    };
  }

  /**
   * Clear metrics and state (useful for testing)
   */
  clearMetrics(): void {
    this.metrics = {
      totalErrors: 0,
      recoveryAttempts: 0,
      recoverySuccess: 0,
      recoveryFailed: 0,
      errorsByType: new Map(),
      errorsByNodeType: new Map(),
      errorsByStrategy: new Map(),
      averageRecoveryTime: 0,
      lastErrorTime: 0
    };
    this.recoveryTimes = [];
  }

  /**
   * Clear error states (useful for memory management)
   */
  clearErrorStates(): void {
    this.errorStates.clear();
  }

  /**
   * Get recovery success rate
   */
  getRecoverySuccessRate(): number {
    if (this.metrics.recoveryAttempts === 0) {
      return 0;
    }

    return (
      (this.metrics.recoverySuccess / this.metrics.recoveryAttempts) * 100
    );
  }

  /**
   * Export all metrics for monitoring/logging
   */
  exportMetrics(): Record<string, any> {
    const stats = this.getErrorStatistics();

    return {
      summary: {
        totalErrors: this.metrics.totalErrors,
        recoveryAttempts: this.metrics.recoveryAttempts,
        recoverySuccess: this.metrics.recoverySuccess,
        recoveryFailed: this.metrics.recoveryFailed,
        successRate: this.getRecoverySuccessRate(),
        averageRecoveryTime: this.metrics.averageRecoveryTime,
        lastErrorTime: this.metrics.lastErrorTime
      },
      statistics: stats,
      recentErrors: Array.from(this.errorStates.values())
        .slice(-10)
        .map((state) => ({
          nodeId: state.nodeId,
          nodeType: state.nodeType,
          error: state.originalError.message,
          errorType: state.originalError.constructor.name,
          timestamp: state.errorTime,
          recovered: state.recovered,
          attemptCount: state.attempts.length
        }))
    };
  }
}

/**
 * Create a singleton instance for global use
 */
let globalRecoveryManager: ErrorRecoveryManager | null = null;

/**
 * Get or create the global error recovery manager
 */
export function getErrorRecoveryManager(): ErrorRecoveryManager {
  if (!globalRecoveryManager) {
    globalRecoveryManager = new ErrorRecoveryManager();
  }
  return globalRecoveryManager;
}

/**
 * Reset the global error recovery manager (useful for testing)
 */
export function resetErrorRecoveryManager(): void {
  globalRecoveryManager = null;
}
