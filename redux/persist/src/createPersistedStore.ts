import { configureStore, combineReducers, Reducer, Middleware } from '@reduxjs/toolkit'
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import { createPersistConfig, type MetaPersistOptions } from './createPersistConfig'

export interface PersistedStoreOptions {
  /** Reducers to combine into the root reducer */
  reducers: Record<string, Reducer>
  /** Persistence configuration */
  persist?: MetaPersistOptions
  /** Additional middleware to append after the default middleware */
  middleware?: (base: ReturnType<ReturnType<typeof configureStore>['dispatch'] extends any ? any : never>) => any
  /** Redux DevTools configuration */
  devTools?: boolean | object
  /** Preloaded state */
  preloadedState?: any
  /** Additional serializable check paths to ignore */
  ignoredActions?: string[]
  /** Additional non-serializable paths to ignore */
  ignoredPaths?: string[]
}

/** Persist action types that must bypass the serializable check */
export const PERSIST_ACTIONS = [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]

export function createPersistedStore(options: PersistedStoreOptions) {
  const rootReducer = combineReducers(options.reducers)

  const persistConfig = createPersistConfig(options.persist || {})
  const persistedReducer = persistReducer(persistConfig, rootReducer)

  const extraIgnoredActions = options.ignoredActions || []
  const extraIgnoredPaths = options.ignoredPaths || []

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => {
      const base = getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [...PERSIST_ACTIONS, ...extraIgnoredActions],
          ignoredPaths: extraIgnoredPaths,
        },
      })
      return options.middleware ? options.middleware(base) : base
    },
    devTools: options.devTools ?? process.env.NODE_ENV !== 'production',
    preloadedState: options.preloadedState,
  })

  const persistor = persistStore(store)

  return { store, persistor }
}
