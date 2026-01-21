import { configureStore } from '@reduxjs/toolkit'
import snippetsReducer from './slices/snippetsSlice'
import namespacesReducer from './slices/namespacesSlice'
import uiReducer from './slices/uiSlice'
import { persistenceMiddleware } from './middleware'

export const store = configureStore({
  reducer: {
    snippets: snippetsReducer,
    namespaces: namespacesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
  devTools: {
    name: 'CodeSnippet',
    trace: true,
    traceLimit: 25,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
