/**
 * Redux Middleware for API Operations
 * Handles async workflow operations with error handling and state management
 */

import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '@store/store';
import {
  setSaving,
  setSaveError,
  saveWorkflow,
  startExecution,
  endExecution,
  loadWorkflow
} from '@store/slices/workflowSlice';
import { setNotification } from '@store/slices/uiSlice';
import { workflowService } from '@services/workflowService';
import { executionService } from '@services/executionService';

/**
 * API middleware for handling asynchronous workflow operations
 * Automatically handles saving, execution, and error cases
 */
export const apiMiddleware: Middleware<{}, RootState> = (store) => (next) => async (action) => {
  // Handle workflow save operations
  if (action.type === 'workflow/setSaving' && action.payload === true) {
    const state = store.getState();
    const workflow = state.workflow.current;

    if (!workflow) {
      next(setSaveError('No workflow loaded'));
      return next(action);
    }

    try {
      next(action);

      // Save to IndexedDB first
      await workflowService.saveWorkflow(workflow);

      // Then sync to backend
      const savedWorkflow = await workflowService.syncToBackend(workflow);

      // Update Redux state with saved workflow
      next(saveWorkflow(savedWorkflow));

      // Show success notification
      next(
        setNotification({
          id: `saved-${Date.now()}`,
          type: 'success',
          message: 'Workflow saved successfully',
          duration: 3000
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save workflow';

      next(setSaveError(errorMessage));
      next(
        setNotification({
          id: `error-${Date.now()}`,
          type: 'error',
          message: errorMessage,
          duration: 5000
        })
      );
    }

    return;
  }

  // Handle workflow execution
  if (action.type === 'workflow/startExecution') {
    const state = store.getState();
    const workflow = state.workflow.current;
    const execution = action.payload;

    if (!workflow) {
      next(
        setNotification({
          id: `error-${Date.now()}`,
          type: 'error',
          message: 'No workflow to execute',
          duration: 5000
        })
      );
      return next(action);
    }

    try {
      next(action);

      // Execute workflow on backend
      const result = await executionService.executeWorkflow(workflow.id, {
        nodes: workflow.nodes,
        connections: workflow.connections
      });

      // Update execution result
      next(endExecution(result));

      // Show success notification
      next(
        setNotification({
          id: `executed-${Date.now()}`,
          type: result.status === 'success' ? 'success' : 'warning',
          message: `Execution ${result.status}`,
          duration: 5000
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Execution failed';

      next(
        endExecution({
          ...execution,
          status: 'error',
          error: {
            code: 'EXECUTION_ERROR',
            message: errorMessage
          }
        })
      );

      next(
        setNotification({
          id: `error-${Date.now()}`,
          type: 'error',
          message: errorMessage,
          duration: 5000
        })
      );
    }

    return;
  }

  // Default: pass action through
  return next(action);
};

/**
 * Async thunk-like action creator for loading workflows
 */
export const fetchWorkflow = (workflowId: string) => async (dispatch: any, getState: any) => {
  try {
    const state = getState();
    const tenantId = state.workflow.current?.tenantId || 'default';

    // Try to load from IndexedDB first
    let workflow = await workflowService.getWorkflow(workflowId, tenantId);

    if (!workflow) {
      // Fall back to backend
      workflow = await workflowService.fetchFromBackend(workflowId, tenantId);
    }

    dispatch(loadWorkflow(workflow));
    return workflow;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load workflow';
    dispatch(setSaveError(errorMessage));
    throw error;
  }
};

/**
 * Async thunk-like action creator for creating new workflows
 */
export const createNewWorkflow = (name: string, description?: string) => async (dispatch: any) => {
  try {
    const workflow = await workflowService.createWorkflow({
      name,
      description,
      tenantId: 'default'
    });

    dispatch(loadWorkflow(workflow));
    dispatch(
      setNotification({
        id: `created-${Date.now()}`,
        type: 'success',
        message: `Workflow "${name}" created`,
        duration: 3000
      })
    );

    return workflow;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create workflow';
    dispatch(setSaveError(errorMessage));
    throw error;
  }
};

/**
 * Async thunk-like action creator for deleting workflows
 */
export const deleteWorkflowAsync = (workflowId: string) => async (dispatch: any) => {
  try {
    await workflowService.deleteWorkflow(workflowId);
    dispatch(
      setNotification({
        id: `deleted-${Date.now()}`,
        type: 'success',
        message: 'Workflow deleted',
        duration: 3000
      })
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete workflow';
    dispatch(setSaveError(errorMessage));
    throw error;
  }
};
