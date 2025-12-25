export type WorkflowLogSummary = {
  totalJobs: number
  jobsWithErrors: number
  errorSignals: string[]
  jobErrors: Array<{ job: string; error: string }>
}

const ERROR_PATTERNS = [
  /##\[error]/i,
  /\b(error|failed|failure|exception|fatal|panic|assertion)\b/i,
  /\bnpm ERR!/i,
  /\byarn err!/i,
  /\bexit code\b/i,
  /\bexited with code\b/i,
  /\bsegmentation fault\b/i,
  /\btraceback\b/i,
  /\bstack trace\b/i,
]

const IGNORE_PATTERNS = [
  /\b0 errors?\b/i,
  /\bno errors?\b/i,
  /\b0 failed\b/i,
  /\bwithout errors?\b/i,
]

function isErrorSignal(line: string) {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (IGNORE_PATTERNS.some((pattern) => pattern.test(trimmed))) return false
  return ERROR_PATTERNS.some((pattern) => pattern.test(trimmed))
}

export function summarizeWorkflowLogs(
  logsText: string,
  options?: { maxSignals?: number; maxJobErrors?: number }
): WorkflowLogSummary {
  const maxSignals = options?.maxSignals ?? 8
  const maxJobErrors = options?.maxJobErrors ?? 6

  const lines = logsText.split(/\r?\n/)
  const jobNames = new Set<string>()
  const signalSet = new Set<string>()
  const jobFirstError = new Map<string, string>()
  let currentJob = 'Unknown job'

  for (const line of lines) {
    const jobMatch = line.match(/^JOB:\s*(.+)$/)
    if (jobMatch) {
      currentJob = jobMatch[1].trim() || 'Unknown job'
      jobNames.add(currentJob)
      continue
    }

    if (!isErrorSignal(line)) continue

    const normalized = line.trim()
    if (normalized) {
      signalSet.add(normalized)
    }

    if (!jobFirstError.has(currentJob)) {
      jobFirstError.set(currentJob, normalized)
    }
  }

  const errorSignals = Array.from(signalSet).slice(0, maxSignals)
  const jobErrors = Array.from(jobFirstError.entries())
    .slice(0, maxJobErrors)
    .map(([job, error]) => ({ job, error }))

  return {
    totalJobs: jobNames.size,
    jobsWithErrors: jobFirstError.size,
    errorSignals,
    jobErrors,
  }
}

export function formatWorkflowLogAnalysis(
  summary: WorkflowLogSummary,
  context?: { runName?: string; runId?: number | null }
) {
  const lines: string[] = []

  lines.push('Workflow Log Analysis')
  lines.push('---------------------')

  if (context?.runName || context?.runId) {
    lines.push(
      `Run: ${context?.runName || 'Unknown'}${context?.runId ? ` (#${context.runId})` : ''}`
    )
  }

  lines.push(`Jobs in log: ${summary.totalJobs}`)
  lines.push(`Jobs with error signals: ${summary.jobsWithErrors}`)

  if (summary.errorSignals.length > 0) {
    lines.push('')
    lines.push('Top error signals:')
    summary.errorSignals.forEach((signal) => {
      lines.push(`- ${signal}`)
    })
  } else {
    lines.push('')
    lines.push('No obvious error signals detected in the logs.')
  }

  if (summary.jobErrors.length > 0) {
    lines.push('')
    lines.push('Job error hints:')
    summary.jobErrors.forEach((entry) => {
      lines.push(`- ${entry.job}: ${entry.error}`)
    })
  }

  return lines.join('\n')
}
