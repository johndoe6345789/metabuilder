/**
 * @metabuilder/api-clients
 *
 * Generic API client hooks for MetaBuilder frontends
 * - useDBAL: DBAL database API client
 * - useAsyncData: Generic async data fetching with retries and refetching
 * - useGitHubFetcher: GitHub API integration
 */

// DBAL hook
export { useDBAL } from './useDBAL'
export type { DBALError, DBALResponse, UseDBALOptions, UseDBALResult } from './useDBAL'

// Async data hooks
export { useAsyncData, usePaginatedData, useMutation } from './useAsyncData'
export type {
  UseAsyncDataOptions,
  UseAsyncDataResult,
  UsePaginatedDataOptions,
  UsePaginatedDataResult,
  UseMutationOptions,
  UseMutationResult,
} from './useAsyncData'

// GitHub fetcher hook
export { useGitHubFetcher, useWorkflowFetcher } from './useGitHubFetcher'
export type { WorkflowRun, UseGitHubFetcherOptions, UseGitHubFetcherResult } from './useGitHubFetcher'
