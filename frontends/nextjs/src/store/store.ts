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
  },
  persist: {
    key: 'nextjs-frontend',
    whitelist: ['auth', 'ui', 'workspace', 'project', 'workflows'],
  },
  middleware: (base) => {
    let middleware = base
    if (isDev) {
      middleware = middleware.concat(createLoggingMiddleware({ verbose: false }))
      middleware = middleware.concat(createPerformanceMiddleware())
    }
    middleware = middleware.concat(createAnalyticsMiddleware())
    middleware = middleware.concat(createErrorMiddleware())
    return middleware
  },
  devTools: getDevToolsConfig(),
  ignoredActions: ['asyncData/fetchAsyncData/pending'],
  ignoredPaths: ['asyncData.requests.*.promise'],
})

export { store, persistor }

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
