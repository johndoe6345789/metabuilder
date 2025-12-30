import type { DBALConfig } from '../../runtime/config'
import { DBALError } from '../foundation/errors'

export const validateClientConfig = (config: DBALConfig): DBALConfig => {
  if (!config.adapter) {
    throw DBALError.validationError('Adapter type must be specified', [])
  }

  if (config.mode !== 'production' && !config.database?.url) {
    throw DBALError.validationError('Database URL must be specified for non-production mode', [])
  }

  return config
}

export const normalizeClientConfig = (config: DBALConfig): DBALConfig => ({
  ...config,
  security: {
    sandbox: config.security?.sandbox ?? 'strict',
    enableAuditLog: config.security?.enableAuditLog ?? true
  },
  performance: {
    ...config.performance
  }
})
