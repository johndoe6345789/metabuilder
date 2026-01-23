/**
 * Redux Store Configuration
 * Central state management for WorkflowUI
 */

import { configureStore } from '@reduxjs/toolkit';
import workflowReducer from './slices/workflowSlice';
import editorReducer from './slices/editorSlice';
import nodesReducer from './slices/nodesSlice';
import connectionReducer from './slices/connectionSlice';
import uiReducer from './slices/uiSlice';
import workspaceReducer from './slices/workspaceSlice';
import projectReducer from './slices/projectSlice';
import canvasReducer from './slices/canvasSlice';
import canvasItemsReducer from './slices/canvasItemsSlice';
import collaborationReducer from './slices/collaborationSlice';
import authReducer from './slices/authSlice';
import realtimeReducer from './slices/realtimeSlice';
import { apiMiddleware } from './middleware/apiMiddleware';
import { authMiddleware, initAuthInterceptor } from './middleware/authMiddleware';

/**
 * Configure Redux store with all slices
 * Enable Redux DevTools for debugging
 */
export const store = configureStore({
  reducer: {
    workflow: workflowReducer,
    editor: editorReducer,
    nodes: nodesReducer,
    connection: connectionReducer,
    ui: uiReducer,
    workspace: workspaceReducer,
    project: projectReducer,
    canvas: canvasReducer,
    canvasItems: canvasItemsReducer,
    collaboration: collaborationReducer,
    auth: authReducer,
    realtime: realtimeReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'editor/setTransform',
          'editor/setSelection',
          'editor/setSelection',
          'canvas/setSelection'
        ],
        ignoredPaths: [
          'editor.transform',
          'editor.selectedNodes',
          'editor.selectedEdges',
          'nodes.registry',
          'canvas.canvasState.selectedItemIds'
        ]
      }
    })
      .concat(authMiddleware)
      .concat(apiMiddleware),
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Initialize auth interceptor for automatic header injection
initAuthInterceptor();

export default store;
