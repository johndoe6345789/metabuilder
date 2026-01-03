// TODO: Implement GitHub client creation
export const createGitHubClient = (token?: string) => ({
  rest: {
    actions: {
      listWorkflowRuns: async (params: any) => ({ data: { workflow_runs: [] } }),
      downloadWorkflowRunLogs: async (params: any) => ({ data: '' }),
    }
  }
})
