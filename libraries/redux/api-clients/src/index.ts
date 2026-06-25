/**
 * @metabuilder/api-clients
 *
 * Generic API client hooks for MetaBuilder frontends
 * - useAsyncData: Generic async data fetching with retries and refetching
 * - useGitHubFetcher: GitHub API integration
 *
 * NOTE: Phase 2 Migration Complete
 * useAsyncData, usePaginatedData, and useMutation now delegate to Redux-backed
 * implementations via @metabuilder/hooks-async. API remains unchanged for
 * backward compatibility across all frontends (codegen, nextjs, qt6, etc).
 */

// Async data hooks (now Redux-backed via @metabuilder/hooks-async)
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
