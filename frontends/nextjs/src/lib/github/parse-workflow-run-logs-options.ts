/**
 * Parse workflow run logs options
 */

export interface WorkflowRunLogsOptions {
  tailLines?: number
  failedOnly?: boolean
  runName?: string
  includeLogs?: boolean
  jobLimit?: number
}

export function parseWorkflowRunLogsOptions(search: string | URLSearchParams): WorkflowRunLogsOptions {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search
  const tailLinesParam = params.get('tailLines')
  const jobLimitParam = params.get('jobLimit')
  return {
    tailLines: tailLinesParam !== null ? parseInt(tailLinesParam) : undefined,
    failedOnly: params.get('failedOnly') === 'true',
    runName: params.get('runName') || undefined,
    includeLogs: params.get('includeLogs') === 'true',
    jobLimit: jobLimitParam !== null ? parseInt(jobLimitParam) : undefined,
  }
}
