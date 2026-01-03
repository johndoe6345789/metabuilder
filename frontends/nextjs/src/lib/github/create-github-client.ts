// TODO: Implement GitHub client creation
export const createGitHubClient = (token?: string) => ({
  rest: {
    actions: {
      listWorkflowRuns: async () => ({ data: { workflow_runs: [] } }),
      downloadWorkflowRunLogs: async () => ({ data: '' }),
    }
  }
})
