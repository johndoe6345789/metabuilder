/**
 * Redux Middleware for API Operations
 * Handles async workflow operations with error handling and state management
 */

import { Middleware } from '@reduxjs/toolkit';

/**
 * Configuration for the API middleware
 * Allows consumers to provide their own service implementations
 */
export interface ApiMiddlewareConfig {
  workflowService: {
    saveWorkflow: (workflow: any) => Promise<any>;
    syncToBackend: (workflow: any) => Promise<any>;
    getWorkflow: (id: string, tenantId: string) => Promise<any>;
    fetchFromBackend: (id: string, tenantId: string) => Promise<any>;
    createWorkflow: (config: { name: string; description?: string; tenantId: string }) => Promise<any>;
    deleteWorkflow: (id: string) => Promise<void>;
  };
  executionService: {
    executeWorkflow: (id: string, config: { nodes: any[]; connections: any[] }) => Promise<any>;
  };
  actions: {
    setSaving: (saving: boolean) => any;
    setSaveError: (error: string) => any;
    saveWorkflow: (workflow: any) => any;
    startExecution: (execution: any) => any;
    endExecution: (result: any) => any;
    loadWorkflow: (workflow: any) => any;
    setNotification: (notification: {
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration: number;
    }) => any;
  };
}

/**
 * Creates an API middleware for handling asynchronous workflow operations
 * Automatically handles saving, execution, and error cases
 *
 * @param config - Configuration object with services and action creators
 * @returns Redux middleware
 *
 * @example
 * ```typescript
 * import { createApiMiddleware } from '@metabuilder/redux-middleware';
 * import { workflowService, executionService } from './services';
 * import { setSaving, setSaveError, saveWorkflow, ... } from './slices';
 *
 * const apiMiddleware = createApiMiddleware({
 *   workflowService,
 *   executionService,
 *   actions: {
 *     setSaving,
 *     setSaveError,
 *     saveWorkflow,
 *     startExecution,
 *     endExecution,
 *     loadWorkflow,
 *     setNotification,
 *   },
 * });
 * ```
 */
export const createApiMiddleware = (config: ApiMiddlewareConfig): Middleware => {
  const { workflowService, executionService, actions } = config;

  return ((store: any) => (next: any) => (action: any) => {
    return (async () => {
      // Handle workflow save operations
      if (action.type === 'workflow/setSaving' && action.payload === true) {
        const state = store.getState();
        const workflow = state.workflow.current;

        if (!workflow) {
          next(actions.setSaveError('No workflow loaded'));
          return next(action);
        }

        try {
          next(action);

          // Save to IndexedDB first
          await workflowService.saveWorkflow(workflow);

          // Then sync to backend
          const savedWorkflow = await workflowService.syncToBackend(workflow);

          // Update Redux state with saved workflow
          next(actions.saveWorkflow(savedWorkflow));

          // Show success notification
          next(
            actions.setNotification({
              id: `saved-${Date.now()}`,
              type: 'success',
              message: 'Workflow saved successfully',
              duration: 3000,
            })
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to save workflow';

          next(actions.setSaveError(errorMessage));
          next(
            actions.setNotification({
              id: `error-${Date.now()}`,
              type: 'error',
              message: errorMessage,
              duration: 5000,
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
            actions.setNotification({
              id: `error-${Date.now()}`,
              type: 'error',
              message: 'No workflow to execute',
              duration: 5000,
            })
          );
          return next(action);
        }

        try {
          next(action);

          // Execute workflow on backend
          const result = await executionService.executeWorkflow(workflow.id, {
            nodes: workflow.nodes,
            connections: workflow.connections,
          });

          // Update execution result
          next(actions.endExecution(result));

          // Show success notification
          next(
            actions.setNotification({
              id: `executed-${Date.now()}`,
              type: result.status === 'success' ? 'success' : 'warning',
              message: `Execution ${result.status}`,
              duration: 5000,
            })
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Execution failed';

          next(
            actions.endExecution({
              ...execution,
              status: 'error',
              error: {
                code: 'EXECUTION_ERROR',
                message: errorMessage,
              },
            })
          );

          next(
            actions.setNotification({
              id: `error-${Date.now()}`,
              type: 'error',
              message: errorMessage,
              duration: 5000,
            })
          );
        }

        return;
      }

      // Default: pass action through
      return next(action);
    })();
  }) as any;
};

/**
 * Creates an async thunk-like action creator for loading workflows
 *
 * @param workflowService - Workflow service with getWorkflow and fetchFromBackend methods
 * @param actions - Object with loadWorkflow and setSaveError action creators
 */
export const createFetchWorkflow = (
  workflowService: ApiMiddlewareConfig['workflowService'],
  actions: Pick<ApiMiddlewareConfig['actions'], 'loadWorkflow' | 'setSaveError'>
) => {
  return (workflowId: string) => async (dispatch: any, getState: any) => {
    try {
      const state = getState();
      const tenantId = state.workflow.current?.tenantId || 'default';

      // Try to load from IndexedDB first
      let workflow = await workflowService.getWorkflow(workflowId, tenantId);

      if (!workflow) {
        // Fall back to backend
        workflow = await workflowService.fetchFromBackend(workflowId, tenantId);
      }

      dispatch(actions.loadWorkflow(workflow));
      return workflow;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load workflow';
      dispatch(actions.setSaveError(errorMessage));
      throw error;
    }
  };
};

/**
 * Creates an async thunk-like action creator for creating new workflows
 *
 * @param workflowService - Workflow service with createWorkflow method
 * @param actions - Object with loadWorkflow, setSaveError, and setNotification action creators
 */
export const createNewWorkflowThunk = (
  workflowService: ApiMiddlewareConfig['workflowService'],
  actions: Pick<ApiMiddlewareConfig['actions'], 'loadWorkflow' | 'setSaveError' | 'setNotification'>
) => {
  return (name: string, description?: string) => async (dispatch: any) => {
    try {
      const workflow = await workflowService.createWorkflow({
        name,
        description,
        tenantId: 'default',
      });

      dispatch(actions.loadWorkflow(workflow));
      dispatch(
        actions.setNotification({
          id: `created-${Date.now()}`,
          type: 'success',
          message: `Workflow "${name}" created`,
          duration: 3000,
        })
      );

      return workflow;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create workflow';
      dispatch(actions.setSaveError(errorMessage));
      throw error;
    }
  };
};

/**
 * Creates an async thunk-like action creator for deleting workflows
 *
 * @param workflowService - Workflow service with deleteWorkflow method
 * @param actions - Object with setSaveError and setNotification action creators
 */
export const createDeleteWorkflowThunk = (
  workflowService: ApiMiddlewareConfig['workflowService'],
  actions: Pick<ApiMiddlewareConfig['actions'], 'setSaveError' | 'setNotification'>
) => {
  return (workflowId: string) => async (dispatch: any) => {
    try {
      await workflowService.deleteWorkflow(workflowId);
      dispatch(
        actions.setNotification({
          id: `deleted-${Date.now()}`,
          type: 'success',
          message: 'Workflow deleted',
          duration: 3000,
        })
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete workflow';
      dispatch(actions.setSaveError(errorMessage));
      throw error;
    }
  };
};

/**
 * Default no-op API middleware for backwards compatibility
 * Use createApiMiddleware with proper configuration for full functionality
 */
export const apiMiddleware: Middleware = () => (next) => (action) => next(action);
