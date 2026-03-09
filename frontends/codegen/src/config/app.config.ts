export const APP_CONFIG = {
  logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',

  useRouter: false,

  features: {
    preloadCriticalComponents: true,
    bundleMetrics: true,
  },

  performance: {
    enablePreloading: true,
    preloadDelay: 100,
    seedDataTimeout: 100,
  },

  dbal: {
    apiUrl: process.env.NEXT_PUBLIC_DBAL_API_URL || 'http://localhost:8080',
    tenant: process.env.NEXT_PUBLIC_DBAL_TENANT || 'default',
    autoSync: false,
    syncIntervalMs: 30000,
  },
} as const

export type AppConfig = typeof APP_CONFIG
