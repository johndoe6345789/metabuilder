/**
 * Parse workflow run logs options from request parameters
 */
export interface WorkflowRunLogsOptions {
  format?: 'text' | 'json'
  tail?: number
}

export function parseWorkflowRunLogsOptions(
  searchParams: URLSearchParams
): WorkflowRunLogsOptions {
  return {
    format: (searchParams.get('format') as 'text' | 'json') || 'text',
    tail: searchParams.get('tail') ? parseInt(searchParams.get('tail')!, 10) : undefined,
  }
}
