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
import { apiMiddleware } from './middleware/apiMiddleware';

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
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'editor/setTransform',
          'editor/setSelection',
          'editor/setSelection'
        ],
        ignoredPaths: [
          'editor.transform',
          'editor.selectedNodes',
          'editor.selectedEdges',
          'nodes.registry'
        ]
      }
    }).concat(apiMiddleware),
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
