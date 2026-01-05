import { DBALClient, type DBALConfig } from '@/dbal'
import { DBALError, DBALErrorCode } from '@/dbal/core/foundation/errors'

export function handleError(error: unknown): { message: string; code?: DBALErrorCode } {
  if (error instanceof DBALError) {
    return { message: error.message, code: error.code }
  }
  if (error instanceof Error) {
    return { message: error.message }
  }
  return { message: 'An unknown error occurred' }
}
