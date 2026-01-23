/**
 * useExecution Hook
 * Hook for workflow execution and result management
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { startExecution, endExecution } from '@store/slices/workflowSlice';
import { setNotification, setLoading, setLoadingMessage } from '@store/slices/uiSlice';
import { executionService } from '@services/executionService';
import { ExecutionResult } from '@types/workflow';

export function useExecution() {
  const dispatch = useDispatch();

  // Selectors
  const currentExecution = useSelector((state: RootState) => state.workflow.currentExecution);
  const executionHistory = useSelector((state: RootState) => state.workflow.executionHistory);
  const workflow = useSelector((state: RootState) => state.workflow.current);

  /**
   * Execute workflow
   */
  const execute = useCallback(
    async (workflowId: string) => {
      if (!workflow) {
        dispatch(
          setNotification({
            id: `error-${Date.now()}`,
            type: 'error',
            message: 'No workflow loaded',
            duration: 5000
          })
        );
        return;
      }

      try {
        dispatch(setLoading(true));
        dispatch(setLoadingMessage('Executing workflow...'));

        const execution: ExecutionResult = {
          id: `exec-${Date.now()}`,
          workflowId,
          workflowName: workflow.name,
          tenantId: workflow.tenantId,
          status: 'running',
          startTime: Date.now(),
          nodes: [],
          error: undefined
        };

        dispatch(startExecution(execution));

        try {
          const result = await executionService.executeWorkflow(
            workflowId,
            {
              nodes: workflow.nodes,
              connections: workflow.connections
            },
            workflow.tenantId
          );

          dispatch(endExecution(result));
          dispatch(setLoading(false));
          dispatch(setLoadingMessage(null));

          if (result.status === 'success') {
            dispatch(
              setNotification({
                id: `success-${Date.now()}`,
                type: 'success',
                message: `Workflow executed successfully in ${result.duration}ms`,
                duration: 5000
              })
            );
          } else if (result.status === 'error') {
            dispatch(
              setNotification({
                id: `error-${Date.now()}`,
                type: 'error',
                message: `Execution failed: ${result.error?.message}`,
                duration: 5000
              })
            );
          }

          return result;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';

          dispatch(
            endExecution({
              ...execution,
              status: 'error',
              error: {
                code: 'EXECUTION_ERROR',
                message: errorMsg
              }
            })
          );

          dispatch(
            setNotification({
              id: `error-${Date.now()}`,
              type: 'error',
              message: `Execution failed: ${errorMsg}`,
              duration: 5000
            })
          );

          throw error;
        }
      } finally {
        dispatch(setLoading(false));
        dispatch(setLoadingMessage(null));
      }
    },
    [workflow, dispatch]
  );

  /**
   * Stop current execution
   */
  const stop = useCallback(async () => {
    if (currentExecution) {
      try {
        await executionService.stopExecution(currentExecution.id);
        dispatch(
          setNotification({
            id: `stopped-${Date.now()}`,
            type: 'info',
            message: 'Execution stopped',
            duration: 3000
          })
        );
      } catch (error) {
        dispatch(
          setNotification({
            id: `error-${Date.now()}`,
            type: 'error',
            message: 'Failed to stop execution',
            duration: 5000
          })
        );
      }
    }
  }, [currentExecution, dispatch]);

  /**
   * Get execution details
   */
  const getDetails = useCallback(
    async (executionId: string) => {
      try {
        return await executionService.getExecutionDetails(executionId);
      } catch (error) {
        dispatch(
          setNotification({
            id: `error-${Date.now()}`,
            type: 'error',
            message: 'Failed to get execution details',
            duration: 5000
          })
        );
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * Get execution statistics
   */
  const getStats = useCallback(
    async (workflowId: string, tenantId: string = 'default') => {
      try {
        return await executionService.getExecutionStats(workflowId, tenantId);
      } catch (error) {
        dispatch(
          setNotification({
            id: `error-${Date.now()}`,
            type: 'error',
            message: 'Failed to get execution statistics',
            duration: 5000
          })
        );
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * Get execution history
   */
  const getHistory = useCallback(
    async (workflowId: string, tenantId: string = 'default', limit: number = 50) => {
      try {
        return await executionService.getExecutionHistory(workflowId, tenantId, limit);
      } catch (error) {
        dispatch(
          setNotification({
            id: `error-${Date.now()}`,
            type: 'error',
            message: 'Failed to get execution history',
            duration: 5000
          })
        );
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * Export execution results
   */
  const exportResults = useCallback(
    async (executionId: string, format: 'json' | 'csv' = 'json') => {
      try {
        return await executionService.exportExecutionResults(executionId, format);
      } catch (error) {
        dispatch(
          setNotification({
            id: `error-${Date.now()}`,
            type: 'error',
            message: 'Failed to export execution results',
            duration: 5000
          })
        );
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * Clear execution history
   */
  const clearHistory = useCallback(
    async (workflowId: string, tenantId: string = 'default') => {
      try {
        await executionService.clearExecutionHistory(workflowId, tenantId);
        dispatch(
          setNotification({
            id: `cleared-${Date.now()}`,
            type: 'success',
            message: 'Execution history cleared',
            duration: 3000
          })
        );
      } catch (error) {
        dispatch(
          setNotification({
            id: `error-${Date.now()}`,
            type: 'error',
            message: 'Failed to clear execution history',
            duration: 5000
          })
        );
      }
    },
    [dispatch]
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
    getHistory,
    exportResults,
    clearHistory
  };
}
