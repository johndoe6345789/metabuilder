// TODO: Implement workflow run logs options parsing
export const parseWorkflowRunLogsOptions = (searchParamsOrString: URLSearchParams | string) => {
  const searchParams = typeof searchParamsOrString === 'string' 
    ? new URLSearchParams(searchParamsOrString)
    : searchParamsOrString
  return {
    runName: searchParams.get('runName') || undefined,
    includeLogs: searchParams.get('includeLogs') === 'true',
    jobLimit: parseInt(searchParams.get('jobLimit') || '10')
  }
}
