/**
 * Redux middleware for development and production
 * Handles DevTools, logging, and monitoring
 */

import type { Middleware } from '@reduxjs/toolkit'

/**
 * Redux DevTools configuration
 * Enables time-travel debugging and action history
 */
export const devToolsConfig = {
  trace: process.env.NODE_ENV === 'development',
  traceLimit: 25,
  actionSanitizer: (action: any) => ({
    ...action,
    type: action.type,
  }),
  stateSanitizer: (state: any) => state,
  // Max number of actions to keep in history
  maxAge: process.env.NODE_ENV === 'development' ? 100 : 10,
}

/**
 * Logging middleware for development
 * Logs all actions and state changes to console
 */
export const createLoggingMiddleware = (options?: { verbose?: boolean }): Middleware => {
  return (store) => (next) => (action: any) => {
    const verbose = options?.verbose ?? false
    
    if (verbose) {
      console.group(`[Redux] ${action.type}`)
      console.info('action:', action)
      console.log('prev state:', store.getState())
    }
    
    const result = next(action)
    
    if (verbose) {
      console.log('next state:', store.getState())
      console.groupEnd()
    }
    
    return result
  }
}

/**
 * Performance monitoring middleware
 * Tracks action dispatch time and state size
 */
export const createPerformanceMiddleware = (): Middleware => {
  return (store) => (next) => (action: any) => {
    const startTime = performance.now()
    const startMemory = process.memoryUsage?.()?.heapUsed ?? 0
    
    const result = next(action)
    
    const endTime = performance.now()
    const endMemory = process.memoryUsage?.()?.heapUsed ?? 0
    const stateSize = JSON.stringify(store.getState()).length
    
    const duration = (endTime - startTime).toFixed(2)
    const memoryDelta = ((endMemory - startMemory) / 1024).toFixed(2)
    const stateSizeKb = (stateSize / 1024).toFixed(2)
    
    if (process.env.NODE_ENV === 'development') {
      if (parseFloat(duration) > 10) {
        console.warn(
          `Slow action: ${action.type} took ${duration}ms, ` +
          `memory: ${memoryDelta}KB, state: ${stateSizeKb}KB`
        )
      }
      
      if (stateSize > 1024 * 1024) {
        console.warn(`Redux state is large: ${stateSizeKb}KB`)
      }
    }
    
    return result
  }
}

/**
 * Error catching middleware
 * Catches errors during action dispatch
 */
export const createErrorMiddleware = (): Middleware => {
  return (store) => (next) => (action: any) => {
    try {
      return next(action)
    } catch (error) {
      console.error(`Error in action ${action.type}:`, error)
      throw error
    }
  }
}

/**
 * Analytics middleware
 * Tracks important actions for analytics
 */
export const createAnalyticsMiddleware = (): Middleware => {
  const trackingActions = [
    'auth/setAuthenticated',
    'project/setCurrentProject',
    'workflow/startExecution',
    'asyncData/fetchAsyncData/fulfilled',
  ]
  
  return (store) => (next) => (action: any) => {
    if (trackingActions.includes(action.type)) {
      // Send to analytics service
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track(action.type, action.payload)
      }
    }
    
    return next(action)
  }
}

/**
 * Configure middleware stack for store
 * Call this in store configuration
 *
 * @example
 * ```typescript
 * const store = configureStore({
 *   reducer: coreReducers,
 *   middleware: getMiddlewareConfig()
 * })
 * ```
 */
export function getMiddlewareConfig(options?: {
  enableLogging?: boolean
  enablePerformance?: boolean
  enableAnalytics?: boolean
}) {
  const enableLogging = options?.enableLogging ?? process.env.NODE_ENV === 'development'
  const enablePerformance = options?.enablePerformance ?? process.env.NODE_ENV === 'development'
  const enableAnalytics = options?.enableAnalytics ?? true
  
  return (getDefaultMiddleware: any) => {
    let middleware = getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types - they may contain non-serializable data
        ignoredActions: ['asyncData/fetchAsyncData/pending'],
        // Ignore these paths in the state
        ignoredPaths: ['asyncData.requests.*.promise'],
      },
    })
    
    if (enableLogging) {
      middleware = middleware.concat(createLoggingMiddleware({ verbose: false }))
    }
    
    if (enablePerformance) {
      middleware = middleware.concat(createPerformanceMiddleware())
    }
    
    if (enableAnalytics) {
      middleware = middleware.concat(createAnalyticsMiddleware())
    }
    
    middleware = middleware.concat(createErrorMiddleware())
    
    return middleware
  }
}

/**
 * Redux DevTools window type
 */
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: (config: any) => (reducer: any) => any
    __REDUX_DEVTOOLS_EXTENSION__?: (config: any) => (next: any) => any
  }
}

/**
 * Get DevTools configuration
 * Returns config for configureStore devTools option
 */
export function getDevToolsConfig() {
  if (process.env.NODE_ENV !== 'development') {
    return false
  }
  
  return devToolsConfig as any
}

/**
 * Enable Redux DevTools extension if available
 */
export function enableReduxDevTools() {
  if (typeof window === 'undefined') return
  
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.info('Redux DevTools extension detected')
  }
}

export default {
  devToolsConfig,
  getMiddlewareConfig,
  getDevToolsConfig,
  createLoggingMiddleware,
  createPerformanceMiddleware,
  createErrorMiddleware,
  createAnalyticsMiddleware,
  enableReduxDevTools,
}
