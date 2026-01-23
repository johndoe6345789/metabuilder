/**
 * useExecution Hook (Phase 3 Implementation)
 *
 * Manages workflow execution state and operations. Provides async methods to
 * execute workflows, monitor execution status, and retrieve execution history
 * and statistics. Integrates with executionService for backend communication
 * and Redux for state management.
 *
 * Features:
 * - Execute workflows with optional input parameters
 * - Stop/cancel running executions
 * - Retrieve execution details, history, and statistics
 * - Automatic Redux state synchronization
 * - Error handling and promise-based API
 *
 * @example
 * const { execute, getHistory, currentExecution } = useExecution();
 * const result = await execute('workflow-123', { param: 'value' });
 * const history = await getHistory('workflow-123', 'default', 50);
 *
 * @returns {Object} Execution state and action methods
 * @returns {ExecutionResult|null} currentExecution - Currently executing workflow
 * @returns {ExecutionResult[]} executionHistory - History of past executions (last 50)
 * @returns {Function} execute - Execute a workflow by ID with optional inputs
 * @returns {Function} stop - Stop the currently running execution
 * @returns {Function} getDetails - Get detailed information about a specific execution
 * @returns {Function} getStats - Get execution statistics for a workflow
 * @returns {Function} getHistory - Get execution history for a workflow
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { startExecution, endExecution } from '../store/slices/workflowSlice';
import executionService from '../services/executionService';
import { ExecutionResult } from '../types/workflow';

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
 * Hook for managing workflow execution
 */
export function useExecution() {
  const dispatch = useDispatch();
  const currentExecution = useSelector((state: RootState) => state.workflow.currentExecution);
  const executionHistory = useSelector((state: RootState) => state.workflow.executionHistory);

  /**
   * Execute a workflow by ID
   *
   * Executes a workflow with the provided nodes, connections, and optional input parameters.
   * Updates Redux state with execution start and completion events.
   *
   * @param {string} workflowId - The ID of the workflow to execute
   * @param {any} inputs - Optional input parameters for the workflow
   * @param {string} tenantId - Tenant ID (defaults to 'default')
   * @returns {Promise<ExecutionResult>} The execution result
   * @throws {Error} If execution fails
   *
   * @example
   * try {
   *   const result = await execute('workflow-123', { param: 'value' }, 'tenant-id');
   *   console.log('Execution finished:', result.status);
   * } catch (error) {
   *   console.error('Execution failed:', error.message);
   * }
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

        dispatch(startExecution(startPayload));

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
        dispatch(endExecution(result));

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Execution failed';
        throw new Error(message);
      }
    },
    [dispatch]
  );

  /**
   * Stop the currently running execution
   *
   * Cancels the active execution if one is running. Updates Redux state
   * to reflect the cancellation.
   *
   * @returns {Promise<void>}
   * @throws {Error} If no execution is running or cancellation fails
   *
   * @example
   * if (currentExecution?.status === 'running') {
   *   await stop();
   * }
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
        endExecution({
          ...currentExecution,
          status: 'stopped',
          endTime: Date.now()
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop execution';
      throw new Error(message);
    }
  }, [currentExecution, dispatch]);

  /**
   * Get detailed information about an execution
   *
   * Retrieves complete execution details including all node results,
   * error information, and execution metadata.
   *
   * @param {string} executionId - The execution ID to query
   * @returns {Promise<ExecutionResult|null>} Execution details or null if not found
   * @throws {Error} If retrieval fails
   *
   * @example
   * const details = await getDetails('exec-12345');
   * if (details) {
   *   console.log('Status:', details.status);
   *   console.log('Duration:', details.endTime - details.startTime);
   * }
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
    []
  );

  /**
   * Get execution statistics for a workflow
   *
   * Computes and returns aggregated statistics for all executions of a workflow,
   * including success/error counts, average duration, and last execution info.
   *
   * @param {string} workflowId - The workflow ID to query
   * @param {string} tenantId - The tenant ID (defaults to 'default')
   * @returns {Promise<ExecutionStats>} Execution statistics
   * @throws {Error} If retrieval fails
   *
   * @example
   * const stats = await getStats('workflow-123');
   * console.log(`Success rate: ${stats.successCount}/${stats.totalExecutions}`);
   * console.log(`Average duration: ${stats.averageDuration}s`);
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
    []
  );

  /**
   * Get execution history for a workflow
   *
   * Retrieves past execution records for a workflow, most recent first.
   * Results are paginated with a configurable limit.
   *
   * @param {string} workflowId - The workflow ID to query
   * @param {string} tenantId - The tenant ID (defaults to 'default')
   * @param {number} limit - Maximum number of records to return (defaults to 50, max 100)
   * @returns {Promise<ExecutionResult[]>} Array of execution records
   * @throws {Error} If retrieval fails
   *
   * @example
   * const history = await getHistory('workflow-123', 'default', 10);
   * history.forEach(exec => {
   *   console.log(`${exec.id}: ${exec.status}`);
   * });
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
    []
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
