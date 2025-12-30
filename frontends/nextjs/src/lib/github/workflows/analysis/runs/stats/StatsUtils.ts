// Auto-generated class wrapper
import { formatWorkflowRunAnalysis } from './functions/format-workflow-run-analysis'
import { summarizeWorkflowRuns } from './functions/summarize-workflow-runs'
import { toTopCounts } from './functions/to-top-counts'

/**
 * StatsUtils - Class wrapper for 3 functions
 *
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class StatsUtils {
  static toTopCounts(...args: Parameters<typeof toTopCounts>) {
    return toTopCounts(...args)
  }

  static summarizeWorkflowRuns(...args: Parameters<typeof summarizeWorkflowRuns>) {
    return summarizeWorkflowRuns(...args)
  }

  static formatWorkflowRunAnalysis(...args: Parameters<typeof formatWorkflowRunAnalysis>) {
    return formatWorkflowRunAnalysis(...args)
  }
}
