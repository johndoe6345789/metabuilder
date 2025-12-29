import { parseWorkflowRuns, WorkflowRunLike } from './parser'
import { formatWorkflowRunAnalysis, summarizeWorkflowRuns, WorkflowRunSummary } from './stats'

export type { WorkflowRunLike, WorkflowRunSummary }
export { formatWorkflowRunAnalysis, parseWorkflowRuns, summarizeWorkflowRuns }

export function analyzeWorkflowRuns(
  runs: unknown[],
  options?: { recentCount?: number; topCount?: number }
) {
  const parsedRuns = parseWorkflowRuns(runs)
  const summary = summarizeWorkflowRuns(parsedRuns, options)

  return {
    summary,
    formatted: formatWorkflowRunAnalysis(summary),
  }
}
