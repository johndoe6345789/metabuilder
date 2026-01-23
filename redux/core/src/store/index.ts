import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { getMiddlewareConfig, getDevToolsConfig } from '../middleware'

// Types will be augmented when store is configured
export type RootState = any
export type AppDispatch = any

// Typed hooks for use throughout app
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Helper to create typed store with provided reducers
export function createAppStore(reducers: any, preloadedState?: any) {
  return configureStore({
    reducer: reducers,
    preloadedState,
    middleware: getMiddlewareConfig(),
    devTools: getDevToolsConfig(),
  })
}

export type AppStore = ReturnType<typeof createAppStore>

// Re-export middleware utils for custom configuration
export { getMiddlewareConfig, getDevToolsConfig } from '../middleware'
