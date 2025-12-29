import { WorkflowRunLike } from './parser'

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
        `- ${run.name} | ${run.status}${run.conclusion ? `/${run.conclusion}` : ''} | ${run.head_branch} | ${run.updated_at}`
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
