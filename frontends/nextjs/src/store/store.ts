import type { Middleware } from '@reduxjs/toolkit'
import { createPersistedStore } from '@metabuilder/redux-persist'
import {
  coreReducers,
  createLoggingMiddleware,
  createPerformanceMiddleware,
  createAnalyticsMiddleware,
  createErrorMiddleware,
  getDevToolsConfig,
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
  workflowsSlice,
} from '@metabuilder/redux-slices'
import godReducer from './slices/god-slice'

const isDev = process.env.NODE_ENV === 'development'

// Configure persisted store with core + frontend-specific slices
const { store, persistor } = createPersistedStore({
  reducers: {
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
    workflows: workflowsSlice.reducer,
    god: godReducer,
  },
  persist: {
    key: 'nextjs-frontend',
    whitelist: ['auth', 'ui', 'workspace', 'project', 'workflows', 'god'],
  },
  middleware: (base: Middleware[]) => {
    const middlewares: Middleware[] = [...base]
    if (isDev) {
      middlewares.push(createLoggingMiddleware({ verbose: false }))
      middlewares.push(createPerformanceMiddleware())
    }
    middlewares.push(createAnalyticsMiddleware())
    middlewares.push(createErrorMiddleware())
    return middlewares
  },
  devTools: getDevToolsConfig() as boolean | object,
  ignoredActions: ['asyncData/fetchAsyncData/pending'],
  ignoredPaths: [
    'asyncData.requests.*.promise',
    'canvas.canvasState.selectedItemIds',
  ],
})

export { store, persistor }

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
