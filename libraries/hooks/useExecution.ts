/**
 * useExecution Hook
 *
 * Manages workflow execution state and operations. Provides async methods to
 * execute workflows, monitor execution status, and retrieve execution history
 * and statistics.
 *
 * Migrated from workflowui - requires Redux store and execution service
 *
 * @example
 * const { execute, getHistory, currentExecution } = useExecution(options);
 * const result = await execute('workflow-123', { param: 'value' });
 * const history = await getHistory('workflow-123', 'default', 50);
 */

import { useCallback } from 'react';

/**
 * Execution result type
 */
export interface ExecutionResult {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  startTime: number;
  endTime?: number;
  nodes: any[];
  output?: any;
  error?: string;
  tenantId: string;
}

/**
 * Execution statistics result type
 */
export interface ExecutionStats {
  totalExecutions: number;
  successCount: number;
  errorCount: number;
  averageDuration: number;
  lastExecution?: ExecutionResult;
}

/**
 * Execution service interface
 */
export interface ExecutionService {
  executeWorkflow: (
    workflowId: string,
    data: { nodes: any[]; connections: any[]; inputs: any },
    tenantId: string
  ) => Promise<ExecutionResult>;
  cancelExecution: (executionId: string) => Promise<void>;
  getExecutionDetails: (executionId: string) => Promise<ExecutionResult | null>;
  getExecutionStats: (workflowId: string, tenantId: string) => Promise<ExecutionStats>;
  getExecutionHistory: (workflowId: string, tenantId: string, limit: number) => Promise<ExecutionResult[]>;
}

/**
 * Redux actions interface
 */
export interface ExecutionActions {
  startExecution: (payload: ExecutionResult) => any;
  endExecution: (payload: ExecutionResult) => any;
}

export interface UseExecutionOptions {
  /** Redux dispatch function */
  dispatch: (action: any) => void;
  /** Current execution from Redux state */
  currentExecution: ExecutionResult | null;
  /** Execution history from Redux state */
  executionHistory: ExecutionResult[];
  /** Execution service instance */
  executionService: ExecutionService;
  /** Redux action creators */
  actions: ExecutionActions;
}

/**
 * Hook for managing workflow execution
 */
export function useExecution(options: UseExecutionOptions) {
  const { dispatch, currentExecution, executionHistory, executionService, actions } = options;

  /**
   * Execute a workflow by ID
   */
  const execute = useCallback(
    async (workflowId: string, inputs?: any, tenantId: string = 'default'): Promise<ExecutionResult> => {
      try {
        // Dispatch execution start event
        const startPayload: ExecutionResult = {
          id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          workflowId,
          workflowName: 'Executing...',
          status: 'running',
          startTime: Date.now(),
          endTime: undefined,
          nodes: [],
          output: undefined,
          error: undefined,
          tenantId
        };

        dispatch(actions.startExecution(startPayload));

        // Call execution service
        const result = await executionService.executeWorkflow(
          workflowId,
          {
            nodes: [],
            connections: [],
            inputs: inputs || {}
          },
          tenantId
        );

        // Dispatch execution end event
        dispatch(actions.endExecution(result));

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Execution failed';
        throw new Error(message);
      }
    },
    [dispatch, executionService, actions]
  );

  /**
   * Stop the currently running execution
   */
  const stop = useCallback(async (): Promise<void> => {
    try {
      if (!currentExecution || !currentExecution.id) {
        throw new Error('No execution running');
      }

      // Call execution service to cancel
      await executionService.cancelExecution(currentExecution.id);

      // Dispatch execution end with stopped status
      dispatch(
        actions.endExecution({
          ...currentExecution,
          status: 'stopped',
          endTime: Date.now()
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop execution';
      throw new Error(message);
    }
  }, [currentExecution, dispatch, executionService, actions]);

  /**
   * Get detailed information about an execution
   */
  const getDetails = useCallback(
    async (executionId: string): Promise<ExecutionResult | null> => {
      try {
        return await executionService.getExecutionDetails(executionId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get execution details';
        throw new Error(message);
      }
    },
    [executionService]
  );

  /**
   * Get execution statistics for a workflow
   */
  const getStats = useCallback(
    async (workflowId: string, tenantId: string = 'default'): Promise<ExecutionStats> => {
      try {
        return await executionService.getExecutionStats(workflowId, tenantId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get execution statistics';
        throw new Error(message);
      }
    },
    [executionService]
  );

  /**
   * Get execution history for a workflow
   */
  const getHistory = useCallback(
    async (
      workflowId: string,
      tenantId: string = 'default',
      limit: number = 50
    ): Promise<ExecutionResult[]> => {
      try {
        // Validate limit
        const validLimit = Math.min(Math.max(limit, 1), 100);

        return await executionService.getExecutionHistory(workflowId, tenantId, validLimit);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get execution history';
        throw new Error(message);
      }
    },
    [executionService]
  );

  return {
    // State
    currentExecution,
    executionHistory,

    // Actions
    execute,
    stop,
    getDetails,
    getStats,
    getHistory
  };
}

export default useExecution;
