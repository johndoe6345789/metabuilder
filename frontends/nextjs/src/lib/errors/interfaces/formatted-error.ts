import type { DBALErrorCode } from '@/dbal/development/src/core/foundation/errors'

export interface FormattedError {
  message: string
  code?: DBALErrorCode | number
  stack?: string
  details?: Record<string, unknown>
}
