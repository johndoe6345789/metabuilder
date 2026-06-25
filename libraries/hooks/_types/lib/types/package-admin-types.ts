/**
 * Type stub for @/lib/types/package-admin-types
 * Package administration types used by usePackages, usePackageActions, usePackageDetails hooks.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum PackageErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type PackageStatus = 'all' | 'installed' | 'available' | 'enabled' | 'disabled'

export interface PackageInfo {
  id: string
  name: string
  version: string
  description?: string
  status?: PackageStatus
  enabled?: boolean
  installed?: boolean
  dependencies?: string[]
  [key: string]: unknown
}

export interface PackageError extends Error {
  code: PackageErrorCode
  statusCode?: number
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

// ---------------------------------------------------------------------------
// usePackageActions types
// ---------------------------------------------------------------------------

export interface PackageActionsState {
  isLoading: boolean
  operationInProgress: Set<string>
  error: PackageError | null
}

export interface PackageActionHandlers {
  installPackage: (packageId: string) => Promise<PackageInfo>
  uninstallPackage: (packageId: string) => Promise<void>
  enablePackage: (packageId: string) => Promise<PackageInfo>
  disablePackage: (packageId: string) => Promise<PackageInfo>
}

export interface UsePackageActionsReturn {
  state: PackageActionsState
  handlers: PackageActionHandlers
  isOperationInProgress: (packageId: string) => boolean
}

// ---------------------------------------------------------------------------
// usePackageDetails types
// ---------------------------------------------------------------------------

export interface PackageDetailsState {
  selectedPackage: PackageInfo | null
  isOpen: boolean
  isLoading: boolean
  error: PackageError | null
}

export interface PackageDetailsHandlers {
  openDetails: (packageId: string) => Promise<void>
  closeDetails: () => void
  refreshDetails: () => Promise<void>
}

export interface UsePackageDetailsReturn {
  state: PackageDetailsState
  handlers: PackageDetailsHandlers
}

// ---------------------------------------------------------------------------
// usePackages types
// ---------------------------------------------------------------------------

export interface PackageListState {
  packages: PackageInfo[]
  total: number
  page: number
  limit: number
  search: string
  statusFilter: PackageStatus
  isLoading: boolean
  isRefetching: boolean
  error: PackageError | null
}

export interface PackageListHandlers {
  fetchPackages: (page?: number, limit?: number, search?: string, status?: PackageStatus) => Promise<void>
  refetchPackages: () => Promise<void>
  searchPackages: (term: string) => void
  filterByStatus: (status: PackageStatus) => Promise<void>
  changePage: (page: number) => Promise<void>
  changeLimit: (limit: number) => Promise<void>
}

export interface UsePackagesReturn {
  state: PackageListState
  handlers: PackageListHandlers
  pagination: {
    page: number
    limit: number
    total: number
    pageCount: number
  }
}
