import { configureStore } from '@reduxjs/toolkit'
import {
  workflowSlice,
  canvasSlice,
  canvasItemsSlice,
  editorSlice,
  connectionSlice,
  uiSlice,
  authSlice,
  projectSlice,
  workspaceSlice,
  nodesSlice,
  collaborationSlice,
  realtimeSlice,
  documentationSlice,
  asyncDataSlice,
} from '@metabuilder/redux-slices'

export const store = configureStore({
  reducer: {
    workflow: workflowSlice.reducer,
    canvas: canvasSlice.reducer,
    canvasItems: canvasItemsSlice.reducer,
    editor: editorSlice.reducer,
    connection: connectionSlice.reducer,
    ui: uiSlice.reducer,
    auth: authSlice.reducer,
    project: projectSlice.reducer,
    workspace: workspaceSlice.reducer,
    nodes: nodesSlice.reducer,
    collaboration: collaborationSlice.reducer,
    realtime: realtimeSlice.reducer,
    documentation: documentationSlice.reducer,
    asyncData: asyncDataSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
