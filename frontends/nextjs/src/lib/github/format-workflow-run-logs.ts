type WorkflowJob = {
  id: number
  name: string
  status: string
  conclusion: string | null
  started_at: string
  completed_at: string | null
  steps?: Array<{
    name: string
    status: string
    conclusion: string | null
    number: number
    started_at?: string | null
    completed_at?: string | null
  }>
}

type JobLogEntry = {
  job: WorkflowJob
  logsText?: string | null
  error?: string | null
}

export function formatWorkflowRunLogs(options: {
  runId: number
  runName: string
  jobLogs: JobLogEntry[]
}) {
  const lines: string[] = []

  lines.push('=================================================')
  lines.push(`WORKFLOW RUN: ${options.runName}`)
  lines.push(`RUN ID: ${options.runId}`)
  lines.push(`JOBS COUNT: ${options.jobLogs.length}`)
  lines.push('=================================================\n')

  for (const entry of options.jobLogs) {
    const job = entry.job
    lines.push(`\n${'='.repeat(80)}`)
    lines.push(`JOB: ${job.name}`)
    lines.push(`JOB ID: ${job.id}`)
    lines.push(`STATUS: ${job.status}`)
    lines.push(`CONCLUSION: ${job.conclusion || 'N/A'}`)
    lines.push(`STARTED: ${job.started_at}`)
    lines.push(`COMPLETED: ${job.completed_at || 'Running...'}`)
    lines.push(`${'='.repeat(80)}`)

    if (entry.logsText) {
      lines.push(entry.logsText)
    } else if (entry.error) {
      lines.push(`[Could not fetch logs for this job - ${entry.error}]`)
      if (job.steps && job.steps.length > 0) {
        lines.push('')
        lines.push('Steps in this job:')
        for (const step of job.steps) {
          lines.push(`  ${step.number}. ${step.name}`)
          lines.push(`     Status: ${step.status} | Conclusion: ${step.conclusion || 'N/A'}`)
        }
      }
    } else {
      lines.push('[No log output returned for this job]')
    }

    lines.push('')
  }

  return lines.join('\n')
}
