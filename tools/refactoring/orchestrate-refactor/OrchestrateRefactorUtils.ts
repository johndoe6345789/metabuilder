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
  static async loadFilesFromReport(...args: any[]) {
    return await loadFilesFromReport(...args as any)
  }

  static async runCommand(...args: any[]) {
    return await runCommand(...args as any)
  }

  static async main(...args: any[]) {
    return await main(...args as any)
  }

}
