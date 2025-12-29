import { WorkflowRunLike } from './parser'

export function summarizeWorkflowRuns(
  runs: WorkflowRunLike[],
  options?: { recentCount?: number; topCount?: number }
): WorkflowRunSummary {
  const recentCount = options?.recentCount ?? DEFAULT_RECENT_COUNT
  const topCount = options?.topCount ?? DEFAULT_TOP_COUNT
  const total = runs.length

  const completedRuns = runs.filter(run => run.status === 'completed')
  const successful = completedRuns.filter(run => run.conclusion === 'success').length
  const failed = completedRuns.filter(run => run.conclusion === 'failure').length
  const cancelled = completedRuns.filter(run => run.conclusion === 'cancelled').length
  const inProgress = total - completedRuns.length
  const successRate = completedRuns.length
    ? Math.round((successful / completedRuns.length) * 100)
    : 0

  const sortedByUpdated = [...runs].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
  const mostRecent = sortedByUpdated[0] ?? null
  const recentRuns = sortedByUpdated.slice(0, recentCount)

  const failureRuns = completedRuns.filter(run => run.conclusion === 'failure')
  const topFailingWorkflows = toTopCounts(
    failureRuns.map(run => run.name),
    topCount
  ).map(entry => ({ name: entry.key, failures: entry.count }))

  const failingBranches = toTopCounts(
    failureRuns.map(run => run.head_branch),
    topCount
  ).map(entry => ({ branch: entry.key, failures: entry.count }))

  const failingEvents = toTopCounts(
    failureRuns.map(run => run.event),
    topCount
  ).map(entry => ({ event: entry.key, failures: entry.count }))

  return {
    total,
    completed: completedRuns.length,
    successful,
    failed,
    cancelled,
    inProgress,
    successRate,
    mostRecent,
    recentRuns,
    topFailingWorkflows,
    failingBranches,
    failingEvents,
  }
}
