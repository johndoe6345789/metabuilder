/**
 * useWorkflow Hook
 * Main hook for workflow state management and operations
 */

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/store';
import {
  loadWorkflow,
  addNode,
  updateNode,
  deleteNode,
  addConnection,
  removeConnection,
  setSaving,
  setDirty
} from '@store/slices/workflowSlice';
import { setNotification } from '@store/slices/uiSlice';
import { fetchWorkflow, createNewWorkflow } from '@store/middleware/apiMiddleware';
import { workflowService } from '@services/workflowService';
import { Workflow, WorkflowNode, WorkflowConnection } from '@types/workflow';

export function useWorkflow() {
  const dispatch = useDispatch();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Selectors
  const workflow = useSelector((state: RootState) => state.workflow.current);
  const nodes = useSelector((state: RootState) => state.workflow.nodes);
  const connections = useSelector((state: RootState) => state.workflow.connections);
  const isDirty = useSelector((state: RootState) => state.workflow.isDirty);
  const isSaving = useSelector((state: RootState) => state.workflow.isSaving);
  const executionHistory = useSelector((state: RootState) => state.workflow.executionHistory);
  const currentExecution = useSelector((state: RootState) => state.workflow.currentExecution);

  /**
   * Load workflow from backend or create new one
   */
  const load = useCallback(
    async (workflowId: string) => {
      try {
        return fetchWorkflow(workflowId)(dispatch, () => ({}));
      } catch (error) {
        dispatch(
          setNotification({
            id: `error-${Date.now()}`,
            type: 'error',
            message: `Failed to load workflow: ${error}`,
            duration: 5000
          })
        );
      }
    },
    [dispatch]
  );

  /**
   * Create new workflow
   */
  const create = useCallback(
    async (name: string, description?: string) => {
      try {
        return createNewWorkflow(name, description)(dispatch);
      } catch (error) {
        dispatch(
          setNotification({
            id: `error-${Date.now()}`,
            type: 'error',
            message: `Failed to create workflow: ${error}`,
            duration: 5000
          })
        );
      }
    },
    [dispatch]
  );

  /**
   * Auto-save workflow with debouncing
   */
  const autoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (workflow && isDirty && !isSaving) {
        dispatch(setSaving(true));
      }
    }, 2000); // 2 second delay
  }, [workflow, isDirty, isSaving, dispatch]);

  /**
   * Manually save workflow
   */
  const save = useCallback(async () => {
    if (workflow && isDirty) {
      dispatch(setSaving(true));
    }
  }, [workflow, isDirty, dispatch]);

  /**
   * Add node to workflow
   */
  const addNodeToWorkflow = useCallback(
    (node: WorkflowNode) => {
      dispatch(addNode(node));
      autoSave();
    },
    [dispatch, autoSave]
  );

  /**
   * Update node parameters
   */
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<WorkflowNode>) => {
      dispatch(updateNode({ id: nodeId, data }));
      autoSave();
    },
    [dispatch, autoSave]
  );

  /**
   * Remove node from workflow
   */
  const removeNode = useCallback(
    (nodeId: string) => {
      dispatch(deleteNode(nodeId));
      autoSave();
    },
    [dispatch, autoSave]
  );

  /**
   * Add connection between nodes
   */
  const addConnectionToWorkflow = useCallback(
    (connection: WorkflowConnection) => {
      dispatch(addConnection(connection));
      autoSave();
    },
    [dispatch, autoSave]
  );

  /**
   * Remove connection between nodes
   */
  const removeConnectionFromWorkflow = useCallback(
    (source: string, target: string) => {
      dispatch(removeConnection({ source, target }));
      autoSave();
    },
    [dispatch, autoSave]
  );

  /**
   * Validate workflow before execution
   */
  const validate = useCallback(async () => {
    if (!workflow) {
      throw new Error('No workflow loaded');
    }

    const result = await workflowService.validateWorkflow(workflow.id, workflow);
    return result;
  }, [workflow]);

  /**
   * Get workflow metrics
   */
  const getMetrics = useCallback(async () => {
    if (!workflow) {
      throw new Error('No workflow loaded');
    }

    return workflowService.getWorkflowMetrics(workflow);
  }, [workflow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    workflow,
    nodes,
    connections,
    isDirty,
    isSaving,
    executionHistory,
    currentExecution,

    // Actions
    load,
    create,
    save,
    autoSave,
    addNode: addNodeToWorkflow,
    updateNode: updateNodeData,
    removeNode,
    addConnection: addConnectionToWorkflow,
    removeConnection: removeConnectionFromWorkflow,
    validate,
    getMetrics
  };
}
