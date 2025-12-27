// Stub implementation for parsing workflow run log options
export interface WorkflowRunLogsOptions {
  runName?: string
  includeLogs?: boolean
  jobLimit?: number
}

export function parseWorkflowRunLogsOptions(
  searchParams: URLSearchParams
): WorkflowRunLogsOptions {
  return {
    runName: searchParams.get('runName') || undefined,
    includeLogs: searchParams.get('includeLogs') === 'true',
    jobLimit: Number(searchParams.get('jobLimit')) || undefined,
  }
}
