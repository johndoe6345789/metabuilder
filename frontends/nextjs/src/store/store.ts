import { configureStore } from '@reduxjs/toolkit'
import {
  coreReducers,
  getMiddlewareConfig,
  getDevToolsConfig,
  // Re-export core types
  type RootState as CoreRootState,
  type AppDispatch as CoreAppDispatch,
} from '@metabuilder/redux-core'
import {
  canvasSlice,
  canvasItemsSlice,
  editorSlice,
  connectionSlice,
  uiSlice,
  collaborationSlice,
  realtimeSlice,
  documentationSlice,
} from '@metabuilder/redux-slices'

// Configure store with core + frontend-specific slices
export const store = configureStore({
  reducer: {
    // Core slices (shared across all frontends)
    ...coreReducers,
    
    // Frontend-specific slices for Next.js
    canvas: canvasSlice.reducer,
    canvasItems: canvasItemsSlice.reducer,
    editor: editorSlice.reducer,
    connection: connectionSlice.reducer,
    ui: uiSlice.reducer,
    collaboration: collaborationSlice.reducer,
    realtime: realtimeSlice.reducer,
    documentation: documentationSlice.reducer,
  },
  // Use Redux Core middleware configuration
  middleware: getMiddlewareConfig({
    enableLogging: process.env.NODE_ENV === 'development',
    enablePerformance: process.env.NODE_ENV === 'development',
    enableAnalytics: true,
  }),
  // Use Redux Core DevTools configuration
  devTools: getDevToolsConfig(),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
