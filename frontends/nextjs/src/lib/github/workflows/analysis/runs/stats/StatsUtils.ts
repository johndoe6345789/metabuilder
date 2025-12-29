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
  static toTopCounts(...args: any[]) {
    return toTopCounts(...(args as any))
  }

  static summarizeWorkflowRuns(...args: any[]) {
    return summarizeWorkflowRuns(...(args as any))
  }

  static formatWorkflowRunAnalysis(...args: any[]) {
    return formatWorkflowRunAnalysis(...(args as any))
  }
}
