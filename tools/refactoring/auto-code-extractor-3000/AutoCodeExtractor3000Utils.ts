// Auto-generated class wrapper
import { log } from './functions/log'
import { loadExtractionRegistry } from './functions/load-extraction-registry'
import { saveExtractionRegistry } from './functions/save-extraction-registry'
import { scanAndCategorizeFiles } from './functions/scan-and-categorize-files'
import { filterFiles } from './functions/filter-files'
import { confirmExecution } from './functions/confirm-execution'
import { extractBatch } from './functions/extract-batch'
import { runLinting } from './functions/run-linting'
import { runTests } from './functions/run-tests'
import { updateProgressReport } from './functions/update-progress-report'
import { saveResults } from './functions/save-results'
import { printSummary } from './functions/print-summary'
import { run } from './functions/run'
import { showHelp } from './functions/show-help'
import { parseArgs } from './functions/parse-args'
import { main } from './functions/main'

/**
 * AutoCodeExtractor3000Utils - Class wrapper for 16 functions
 * 
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class AutoCodeExtractor3000Utils {
  static log(...args: any[]) {
    return log(...args as any)
  }

  static async loadExtractionRegistry(...args: any[]) {
    return await loadExtractionRegistry(...args as any)
  }

  static async saveExtractionRegistry(...args: any[]) {
    return await saveExtractionRegistry(...args as any)
  }

  static async scanAndCategorizeFiles(...args: any[]) {
    return await scanAndCategorizeFiles(...args as any)
  }

  static filterFiles(...args: any[]) {
    return filterFiles(...args as any)
  }

  static async confirmExecution(...args: any[]) {
    return await confirmExecution(...args as any)
  }

  static async extractBatch(...args: any[]) {
    return await extractBatch(...args as any)
  }

  static async runLinting(...args: any[]) {
    return await runLinting(...args as any)
  }

  static async runTests(...args: any[]) {
    return await runTests(...args as any)
  }

  static async updateProgressReport(...args: any[]) {
    return await updateProgressReport(...args as any)
  }

  static async saveResults(...args: any[]) {
    return await saveResults(...args as any)
  }

  static printSummary(...args: any[]) {
    return printSummary(...args as any)
  }

  static async run(...args: any[]) {
    return await run(...args as any)
  }

  static showHelp(...args: any[]) {
    return showHelp(...args as any)
  }

  static parseArgs(...args: any[]) {
    return parseArgs(...args as any)
  }

  static async main(...args: any[]) {
    return await main(...args as any)
  }

}
