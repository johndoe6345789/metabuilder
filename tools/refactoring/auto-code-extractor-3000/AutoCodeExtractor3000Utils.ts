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
  static log(...args: Parameters<typeof log>) {
    return log(...args)
  }

  static async loadExtractionRegistry(...args: Parameters<typeof loadExtractionRegistry>) {
    return await loadExtractionRegistry(...args)
  }

  static async saveExtractionRegistry(...args: Parameters<typeof saveExtractionRegistry>) {
    return await saveExtractionRegistry(...args)
  }

  static async scanAndCategorizeFiles(...args: Parameters<typeof scanAndCategorizeFiles>) {
    return await scanAndCategorizeFiles(...args)
  }

  static filterFiles(...args: Parameters<typeof filterFiles>) {
    return filterFiles(...args)
  }

  static async confirmExecution(...args: Parameters<typeof confirmExecution>) {
    return await confirmExecution(...args)
  }

  static async extractBatch(...args: Parameters<typeof extractBatch>) {
    return await extractBatch(...args)
  }

  static async runLinting(...args: Parameters<typeof runLinting>) {
    return await runLinting(...args)
  }

  static async runTests(...args: Parameters<typeof runTests>) {
    return await runTests(...args)
  }

  static async updateProgressReport(...args: Parameters<typeof updateProgressReport>) {
    return await updateProgressReport(...args)
  }

  static async saveResults(...args: Parameters<typeof saveResults>) {
    return await saveResults(...args)
  }

  static printSummary(...args: Parameters<typeof printSummary>) {
    return printSummary(...args)
  }

  static async run(...args: Parameters<typeof run>) {
    return await run(...args)
  }

  static showHelp(...args: Parameters<typeof showHelp>) {
    return showHelp(...args)
  }

  static parseArgs(...args: Parameters<typeof parseArgs>) {
    return parseArgs(...args)
  }

  static async main(...args: Parameters<typeof main>) {
    return await main(...args)
  }

}
