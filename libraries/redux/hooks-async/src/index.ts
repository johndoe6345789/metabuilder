/**
 * @metabuilder/hooks-async
 * Redux-backed async data and mutation hooks
 * 100% compatible with @tanstack/react-query API
 */

// useReduxAsyncData - Primary async data hook
export { useReduxAsyncData, useReduxPaginatedAsyncData } from './useReduxAsyncData'
export type {
  UseAsyncDataOptions,
  UseAsyncDataResult,
  UsePaginatedAsyncDataOptions,
  UsePaginatedAsyncDataResult,
} from './useReduxAsyncData'

// useReduxMutation - Mutation hook for write operations
export { useReduxMutation, useReduxMultiMutation } from './useReduxMutation'
export type {
  UseMutationOptions,
  UseMutationResult,
  MultiMutationStep,
  UseMultiMutationResult,
} from './useReduxMutation'
