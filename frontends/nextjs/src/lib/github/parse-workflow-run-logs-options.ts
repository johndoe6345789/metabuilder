/**
 * Parse workflow run logs options (stub)
 */

export interface WorkflowRunLogsOptions {
  tailLines?: number
  failedOnly?: boolean
  runName?: string
  includeLogs?: boolean
  jobLimit?: number
}

export function parseWorkflowRunLogsOptions(search: string): WorkflowRunLogsOptions {
  // TODO: Implement option parsing
  const params = new URLSearchParams(search)
  return {
    tailLines: params.get('tailLines') ? parseInt(params.get('tailLines')!) : undefined,
    failedOnly: params.get('failedOnly') === 'true',
    runName: params.get('runName') || undefined,
    includeLogs: params.get('includeLogs') === 'true',
    jobLimit: params.get('jobLimit') ? parseInt(params.get('jobLimit')!) : undefined,
  }
}
