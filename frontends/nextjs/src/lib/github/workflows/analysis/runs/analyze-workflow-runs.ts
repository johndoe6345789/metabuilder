export type WorkflowRunLike = {
  id: number
  name: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
  head_branch: string
  event: string
}

export type WorkflowRunSummary = {
  total: number
  completed: number
  successful: number
  failed: number
  cancelled: number
  inProgress: number
  successRate: number
  mostRecent: WorkflowRunLike | null
  recentRuns: WorkflowRunLike[]
  topFailingWorkflows: Array<{ name: string; failures: number }>
  failingBranches: Array<{ branch: string; failures: number }>
  failingEvents: Array<{ event: string; failures: number }>
}

const DEFAULT_RECENT_COUNT = 5
const DEFAULT_TOP_COUNT = 3

function toTopCounts(
  values: string[],
  topCount: number
): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>()
  values.forEach((value) => {
    counts.set(value, (counts.get(value) || 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, topCount)
}

export function summarizeWorkflowRuns(
  runs: WorkflowRunLike[],
  options?: { recentCount?: number; topCount?: number }
): WorkflowRunSummary {
  const recentCount = options?.recentCount ?? DEFAULT_RECENT_COUNT
  const topCount = options?.topCount ?? DEFAULT_TOP_COUNT
  const total = runs.length

  const completedRuns = runs.filter((run) => run.status === 'completed')
  const successful = completedRuns.filter((run) => run.conclusion === 'success').length
  const failed = completedRuns.filter((run) => run.conclusion === 'failure').length
  const cancelled = completedRuns.filter((run) => run.conclusion === 'cancelled').length
  const inProgress = total - completedRuns.length
  const successRate = completedRuns.length
    ? Math.round((successful / completedRuns.length) * 100)
    : 0

  const sortedByUpdated = [...runs].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
  const mostRecent = sortedByUpdated[0] ?? null
  const recentRuns = sortedByUpdated.slice(0, recentCount)

  const failureRuns = completedRuns.filter((run) => run.conclusion === 'failure')
  const topFailingWorkflows = toTopCounts(
    failureRuns.map((run) => run.name),
    topCount
  ).map((entry) => ({ name: entry.key, failures: entry.count }))

  const failingBranches = toTopCounts(
    failureRuns.map((run) => run.head_branch),
    topCount
  ).map((entry) => ({ branch: entry.key, failures: entry.count }))

  const failingEvents = toTopCounts(
    failureRuns.map((run) => run.event),
    topCount
  ).map((entry) => ({ event: entry.key, failures: entry.count }))

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

export function formatWorkflowRunAnalysis(summary: WorkflowRunSummary) {
  const lines: string[] = []

  lines.push('Workflow Run Analysis')
  lines.push('---------------------')
  lines.push(`Total runs: ${summary.total}`)
  lines.push(
    `Completed: ${summary.completed} (success: ${summary.successful}, failed: ${summary.failed}, cancelled: ${summary.cancelled})`
  )
  lines.push(`In progress: ${summary.inProgress}`)
  lines.push(`Success rate: ${summary.successRate}%`)

  if (summary.mostRecent) {
    lines.push('')
    lines.push('Most recent run:')
    lines.push(
      `- ${summary.mostRecent.name} | ${summary.mostRecent.status}${
        summary.mostRecent.conclusion ? `/${summary.mostRecent.conclusion}` : ''
      } | ${summary.mostRecent.head_branch} | ${summary.mostRecent.updated_at}`
    )
  }

  if (summary.recentRuns.length > 0) {
    lines.push('')
    lines.push('Recent runs:')
    summary.recentRuns.forEach((run) => {
      lines.push(
        `- ${run.name} | ${run.status}${
          run.conclusion ? `/${run.conclusion}` : ''
        } | ${run.head_branch} | ${run.updated_at}`
      )
    })
  }

  if (summary.topFailingWorkflows.length > 0) {
    lines.push('')
    lines.push('Top failing workflows:')
    summary.topFailingWorkflows.forEach((entry) => {
      lines.push(`- ${entry.name}: ${entry.failures}`)
    })
  }

  if (summary.failingBranches.length > 0) {
    lines.push('')
    lines.push('Failing branches:')
    summary.failingBranches.forEach((entry) => {
      lines.push(`- ${entry.branch}: ${entry.failures}`)
    })
  }

  if (summary.failingEvents.length > 0) {
    lines.push('')
    lines.push('Failing events:')
    summary.failingEvents.forEach((entry) => {
      lines.push(`- ${entry.event}: ${entry.failures}`)
    })
  }

  if (summary.total === 0) {
    lines.push('')
    lines.push('No workflow runs available to analyze.')
  }

  return lines.join('\n')
}
