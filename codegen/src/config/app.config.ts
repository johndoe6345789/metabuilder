export const APP_CONFIG = {
  useRouter: false,
  
  logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
  
  features: {
    routerBasedNavigation: false,
    preloadCriticalComponents: true,
    bundleMetrics: true,
  },
  
  performance: {
    enablePreloading: true,
    preloadDelay: 100,
    seedDataTimeout: 100,
  }
} as const

export type AppConfig = typeof APP_CONFIG

