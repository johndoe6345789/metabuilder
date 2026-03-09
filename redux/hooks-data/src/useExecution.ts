/**
 * useExecution Hook (Tier 2)
 * Manages workflow execution state and operations with service adapter injection
 *
 * Features:
 * - Execute workflows with optional input parameters
 * - Cancel running executions
 * - Retrieve execution details, history, and statistics
 * - Redux integration for state management
 * - Service-independent (HTTP, GraphQL, or mock implementations)
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useServices } from '@metabuilder/service-adapters'
import {
  startExecution,
  endExecution,
  selectCurrentExecution,
  selectExecutionHistory,
} from '@metabuilder/redux-slices'
import type { ExecutionResult, ExecutionStats } from '@metabuilder/types'
import type { AppDispatch, RootState } from '@metabuilder/redux-slices'

/**
 * useExecution Hook
 * Manages workflow execution with service adapter injection
 *
 * @example
 * const { execute, getHistory, currentExecution } = useExecution();
 * const result = await execute('workflow-123', { param: 'value' });
 * const history = await getHistory('workflow-123', 'default', 50);
 */
export function useExecution() {
  const dispatch = useDispatch<AppDispatch>()
  const { executionService } = useServices()

  // Selectors
  const currentExecution = useSelector((state: RootState) => selectCurrentExecution(state))
  const executionHistory = useSelector((state: RootState) => selectExecutionHistory(state))

  /**
   * Execute a workflow
   *
   * Initiates execution of a workflow with optional input parameters.
   * Updates Redux state with execution lifecycle events.
   *
   * @param workflowId - ID of the workflow to execute
   * @param inputs - Optional input parameters for the workflow
   * @param tenantId - Tenant ID (defaults to 'default')
   */
  const execute = useCallback(
    async (workflowId: string, inputs?: any, tenantId: string = 'default'): Promise<ExecutionResult> => {
      try {
        // Create start payload
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
          tenantId,
        }

        dispatch(startExecution(startPayload))

        // Call execution service
        const result = await executionService.executeWorkflow(
          workflowId,
          {
            nodes: [],
            connections: [],
            inputs: inputs || {},
          },
          tenantId
        )

        dispatch(endExecution(result))
        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Execution failed'
        throw new Error(message)
      }
    },
    [dispatch, executionService]
  )

  /**
   * Cancel currently running execution
   */
  const stop = useCallback(async (): Promise<void> => {
    try {
      if (!currentExecution || !currentExecution.id) {
        throw new Error('No execution running')
      }

      // Call service to cancel
      await executionService.cancelExecution(currentExecution.id)

      // Update Redux state
      dispatch(
        endExecution({
          ...currentExecution,
          status: 'cancelled',
          endTime: Date.now(),
        })
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel execution'
      throw new Error(message)
    }
  }, [currentExecution, dispatch, executionService])

  /**
   * Get detailed execution information
   */
  const getDetails = useCallback(
    async (executionId: string): Promise<ExecutionResult | null> => {
      try {
        return await executionService.getExecutionDetails(executionId)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get execution details'
        throw new Error(message)
      }
    },
    [executionService]
  )

  /**
   * Get execution statistics for a workflow
   */
  const getStats = useCallback(
    async (workflowId: string, tenantId: string = 'default'): Promise<ExecutionStats> => {
      try {
        return await executionService.getExecutionStats(workflowId, tenantId)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get execution statistics'
        throw new Error(message)
      }
    },
    [executionService]
  )

  /**
   * Get execution history for a workflow
   */
  const getHistory = useCallback(
    async (workflowId: string, tenantId: string = 'default', limit: number = 50): Promise<ExecutionResult[]> => {
      try {
        // Validate limit
        const validLimit = Math.min(Math.max(limit, 1), 100)
        return await executionService.getExecutionHistory(workflowId, tenantId, validLimit)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get execution history'
        throw new Error(message)
      }
    },
    [executionService]
  )

  return {
    // State
    currentExecution,
    executionHistory,

    // Actions
    execute,
    stop,
    getDetails,
    getStats,
    getHistory,
  }
}

export default useExecution
