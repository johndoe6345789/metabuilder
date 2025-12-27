import { getAdapter } from '../../core/dbal-client'
import { getErrorLogs } from './get-error-logs'
import { deleteErrorLog } from './delete-error-log'

/**
 * Clear all error logs or only resolved ones
 */
export async function clearErrorLogs(onlyResolved: boolean = false): Promise<number> {
  const logs = await getErrorLogs({ resolved: onlyResolved ? true : undefined })
  
  for (const log of logs) {
    await deleteErrorLog(log.id)
  }
  
  return logs.length
}
