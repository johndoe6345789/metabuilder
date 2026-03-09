/**
 * useWorkflowExecution Hook
 * Manages workflow execution state and history
 */

import { useState, useCallback } from 'react';
import type { ExecutionResult, ExecutionState } from '../../types/workflow-editor';

export interface UseWorkflowExecutionReturn {
  // State
  isExecuting: boolean;
  currentExecution: ExecutionResult | null;
  executionHistory: ExecutionResult[];
  nodeExecutionStates: Record<string, ExecutionState>;

  // Execution control
  startExecution: (workflowId: string) => void;
  completeExecution: (result: ExecutionResult) => void;
  failExecution: (error: string) => void;
  cancelExecution: () => void;

  // Node states
  setNodeState: (nodeId: string, state: ExecutionState) => void;
  clearNodeStates: () => void;

  // History
  clearHistory: () => void;
  getExecutionById: (executionId: string) => ExecutionResult | undefined;
}

export interface UseWorkflowExecutionOptions {
  maxHistorySize?: number;
  onExecutionStart?: (workflowId: string) => void;
  onExecutionComplete?: (result: ExecutionResult) => void;
  onExecutionError?: (error: string) => void;
}

export function useWorkflowExecution(
  options: UseWorkflowExecutionOptions = {}
): UseWorkflowExecutionReturn {
  const {
    maxHistorySize = 50,
    onExecutionStart,
    onExecutionComplete,
    onExecutionError,
  } = options;

  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const [nodeExecutionStates, setNodeExecutionStates] = useState<Record<string, ExecutionState>>({});

  // Execution control
  const startExecution = useCallback(
    (workflowId: string) => {
      const execution: ExecutionResult = {
        id: `exec_${Date.now()}`,
        workflowId,
        status: 'running',
        startedAt: Date.now(),
        nodeResults: {},
      };
      setCurrentExecution(execution);
      setIsExecuting(true);
      setNodeExecutionStates({});
      onExecutionStart?.(workflowId);
    },
    [onExecutionStart]
  );

  const completeExecution = useCallback(
    (result: ExecutionResult) => {
      const finalResult: ExecutionResult = {
        ...result,
        status: 'completed',
        completedAt: Date.now(),
      };
      setCurrentExecution(null);
      setIsExecuting(false);
      setExecutionHistory((prev) => {
        const updated = [finalResult, ...prev];
        return updated.slice(0, maxHistorySize);
      });
      onExecutionComplete?.(finalResult);
    },
    [maxHistorySize, onExecutionComplete]
  );

  const failExecution = useCallback(
    (error: string) => {
      if (currentExecution) {
        const failedResult: ExecutionResult = {
          ...currentExecution,
          status: 'failed',
          error,
          completedAt: Date.now(),
        };
        setCurrentExecution(null);
        setIsExecuting(false);
        setExecutionHistory((prev) => {
          const updated = [failedResult, ...prev];
          return updated.slice(0, maxHistorySize);
        });
        onExecutionError?.(error);
      }
    },
    [currentExecution, maxHistorySize, onExecutionError]
  );

  const cancelExecution = useCallback(() => {
    if (currentExecution) {
      const cancelledResult: ExecutionResult = {
        ...currentExecution,
        status: 'cancelled',
        completedAt: Date.now(),
      };
      setCurrentExecution(null);
      setIsExecuting(false);
      setExecutionHistory((prev) => {
        const updated = [cancelledResult, ...prev];
        return updated.slice(0, maxHistorySize);
      });
    }
  }, [currentExecution, maxHistorySize]);

  // Node states
  const setNodeState = useCallback((nodeId: string, state: ExecutionState) => {
    setNodeExecutionStates((prev) => ({ ...prev, [nodeId]: state }));
  }, []);

  const clearNodeStates = useCallback(() => {
    setNodeExecutionStates({});
  }, []);

  // History
  const clearHistory = useCallback(() => {
    setExecutionHistory([]);
  }, []);

  const getExecutionById = useCallback(
    (executionId: string) => executionHistory.find((e) => e.id === executionId),
    [executionHistory]
  );

  return {
    isExecuting,
    currentExecution,
    executionHistory,
    nodeExecutionStates,
    startExecution,
    completeExecution,
    failExecution,
    cancelExecution,
    setNodeState,
    clearNodeStates,
    clearHistory,
    getExecutionById,
  };
}
