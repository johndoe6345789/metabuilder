// TODO: Implement workflow run logs options parsing
export const parseWorkflowRunLogsOptions = (searchParams: URLSearchParams) => ({
  runName: searchParams.get('runName') || undefined,
  includeLogs: searchParams.get('includeLogs') === 'true',
  jobLimit: parseInt(searchParams.get('jobLimit') || '10')
})
