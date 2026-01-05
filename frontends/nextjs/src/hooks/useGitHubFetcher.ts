/**
 * useGitHubFetcher hook (stub)
 */

export interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion?: string
  createdAt: string
}

export function useGitHubFetcher() {
  // TODO: Implement useGitHubFetcher
  return {
    runs: [] as WorkflowRun[],
    loading: false,
    error: null as Error | null,
    refetch: () => {},
  }
}
