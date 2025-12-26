export type WorkflowRunLogsOptions = {
  runName: string
  includeLogs: boolean
  jobLimit?: number
}

export const parseWorkflowRunLogsOptions = (
  params: URLSearchParams
): WorkflowRunLogsOptions => {
  const runName = params.get('runName')?.trim() || 'Workflow Run'
  const includeLogsParam = params.get('includeLogs')?.trim().toLowerCase()
  const includeLogs = includeLogsParam
    ? !['false', '0', 'no'].includes(includeLogsParam)
    : true
  const jobLimitParam = params.get('jobLimit')
  const parsedJobLimit = jobLimitParam ? Number(jobLimitParam) : Number.NaN
  const jobLimit = Number.isFinite(parsedJobLimit)
    ? Math.max(1, Math.min(100, Math.floor(parsedJobLimit)))
    : undefined

  return {
    runName,
    includeLogs,
    jobLimit,
  }
}
