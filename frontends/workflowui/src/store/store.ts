/**
 * Redux Store Configuration
 * Central state management for WorkflowUI
 *
 * Persistence: auth, ui, project, workspace slices are persisted via
 * redux-persist (IndexedDB). Workflow data stays in Dexie (offline-first
 * with sync queue) and is NOT persisted through Redux.
 */

import {
  workflowSlice,
  workflowsSlice,
  canvasItemsSlice,
  collaborationSlice,
  authSlice,
  realtimeSlice,
  connectionSlice,
  nodesSlice,
  uiSlice,
  editorSlice,
  workspaceSlice,
  projectSlice,
  canvasSlice
} from '@metabuilder/redux-slices';
import { authMiddleware, apiMiddleware, initAuthInterceptor } from '@metabuilder/redux-middleware';
import { createPersistedStore } from '@metabuilder/redux-persist';

/**
 * Configure Redux store with all slices.
 * Only auth/ui/project/workspace are persisted via IndexedDB.
 * Workflow, canvas, editor, nodes, connection, collaboration, and realtime
 * slices are transient (managed by Dexie or ephemeral).
 */
const { store, persistor } = createPersistedStore({
  reducers: {
    workflow: workflowSlice.reducer,
    workflows: workflowsSlice.reducer,
    editor: editorSlice.reducer,
    nodes: nodesSlice.reducer,
    connection: connectionSlice.reducer,
    ui: uiSlice.reducer,
    workspace: workspaceSlice.reducer,
    project: projectSlice.reducer,
    canvas: canvasSlice.reducer,
    canvasItems: canvasItemsSlice.reducer,
    collaboration: collaborationSlice.reducer,
    auth: authSlice.reducer,
    realtime: realtimeSlice.reducer
  },
  persist: {
    key: 'workflowui',
    whitelist: ['auth', 'ui', 'project', 'workspace'],
    throttle: 300,
  },
  middleware: (base) =>
    base
      .concat(authMiddleware)
      .concat(apiMiddleware),
  ignoredActions: [
    'editor/setTransform',
    'editor/setSelection',
    'canvas/setSelection'
  ],
  ignoredPaths: [
    'editor.transform',
    'editor.selectedNodes',
    'editor.selectedEdges',
    'nodes.registry',
    'canvas.canvasState.selectedItemIds',
    'realtime.remoteCursors',
    'realtime.lockedItems',
    'realtime.connectedUsers',
    'collaboration.activityFeed',
    'collaboration.conflicts',
    'workspace.workspaces',
    'workspace.currentWorkspace'
  ],
});

export { store, persistor };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Initialize auth interceptor for automatic header injection
initAuthInterceptor();

export default store;
