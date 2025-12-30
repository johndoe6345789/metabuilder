// Auto-generated class wrapper
import { loadFilesFromReport } from './functions/load-files-from-report'
import { runCommand } from './functions/run-command'
import { main } from './functions/main'

/**
 * OrchestrateRefactorUtils - Class wrapper for 3 functions
 * 
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class OrchestrateRefactorUtils {
  static async loadFilesFromReport(...args: Parameters<typeof loadFilesFromReport>) {
    return await loadFilesFromReport(...args)
  }

  static async runCommand(...args: Parameters<typeof runCommand>) {
    return await runCommand(...args)
  }

  static async main(...args: Parameters<typeof main>) {
    return await main(...args)
  }

}
