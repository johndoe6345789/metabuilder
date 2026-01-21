'use client'

/**
 * Package Admin State Management Types
 *
 * Defines types for package list management, filtering, pagination, and operations.
 * Used by usePackages, usePackageActions, and usePackageDetails hooks.
 */

/**
 * Package status for filtering and display
 */
export type PackageStatus = 'all' | 'installed' | 'available' | 'disabled'

/**
 * Package operation type for tracking in-progress operations
 */
export type PackageOperation = 'install' | 'uninstall' | 'enable' | 'disable'

/**
 * Error codes returned from API
 */
export enum PackageErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  ALREADY_INSTALLED = 'ALREADY_INSTALLED',
  ALREADY_UNINSTALLED = 'ALREADY_UNINSTALLED',
  MISSING_DEPENDENCIES = 'MISSING_DEPENDENCIES',
  PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  INVALID_PACKAGE_ID = 'INVALID_PACKAGE_ID',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Structured error with code for better error handling
 */
export interface PackageError extends Error {
  code: PackageErrorCode
  statusCode?: number
  details?: Record<string, unknown>
}

/**
 * Package display model
 */
export interface PackageInfo {
  id: string
  name: string
  version: string
  description: string
  author: string
  category: string
  icon: string
  screenshots: string[]
  tags: string[]
  dependencies: string[]
  createdAt: number
  updatedAt: number
  downloadCount: number
  rating: number
  status: 'installed' | 'available' | 'disabled'
  enabled: boolean
  installedAt?: number
}

/**
 * Paginated response from API
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

/**
 * Package list filter state
 */
export interface PackageListFilters {
  search: string
  status: PackageStatus
  page: number
  limit: number
}

/**
 * Package list state
 */
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

/**
 * Package action handlers (for usePackages hook)
 */
export interface PackageListHandlers {
  fetchPackages: (
    page?: number,
    limit?: number,
    search?: string,
    status?: PackageStatus
  ) => Promise<void>
  refetchPackages: () => Promise<void>
  searchPackages: (term: string) => void
  filterByStatus: (status: PackageStatus) => Promise<void>
  changePage: (page: number) => Promise<void>
  changeLimit: (limit: number) => Promise<void>
}

/**
 * usePackages hook return type
 */
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

/**
 * Package actions state
 */
export interface PackageActionsState {
  isLoading: boolean
  operationInProgress: Set<string> // Set of package IDs with operations in progress
  error: PackageError | null
}

/**
 * Package action handlers
 */
export interface PackageActionHandlers {
  installPackage: (packageId: string) => Promise<PackageInfo>
  uninstallPackage: (packageId: string) => Promise<void>
  enablePackage: (packageId: string) => Promise<PackageInfo>
  disablePackage: (packageId: string) => Promise<PackageInfo>
}

/**
 * usePackageActions hook return type
 */
export interface UsePackageActionsReturn {
  state: PackageActionsState
  handlers: PackageActionHandlers
  isOperationInProgress: (packageId: string) => boolean
}

/**
 * Package details modal state
 */
export interface PackageDetailsState {
  selectedPackage: PackageInfo | null
  isOpen: boolean
  isLoading: boolean
  error: PackageError | null
}

/**
 * Package details handlers
 */
export interface PackageDetailsHandlers {
  openDetails: (packageId: string) => Promise<void>
  closeDetails: () => void
  refreshDetails: () => Promise<void>
}

/**
 * usePackageDetails hook return type
 */
export interface UsePackageDetailsReturn {
  state: PackageDetailsState
  handlers: PackageDetailsHandlers
}

/**
 * Page-level handlers combining multiple hooks
 */
export interface PackagePageHandlers {
  // List handlers
  handleSearch: (term: string) => void
  handleFilterChange: (status: PackageStatus) => Promise<void>
  handlePageChange: (page: number) => Promise<void>
  handleLimitChange: (limit: number) => Promise<void>

  // Detail modal handlers
  handleShowDetails: (packageId: string) => Promise<void>
  handleCloseModal: () => void

  // Action handlers
  handleInstall: (packageId: string) => Promise<void>
  handleUninstall: (packageId: string) => Promise<void>
  handleEnable: (packageId: string) => Promise<void>
  handleDisable: (packageId: string) => Promise<void>

  // Modal action handlers
  handleInstallFromModal: (packageId: string) => Promise<void>
  handleUninstallFromModal: (packageId: string) => Promise<void>
  handleEnableFromModal: (packageId: string) => Promise<void>
  handleDisableFromModal: (packageId: string) => Promise<void>
}

/**
 * Confirmation dialog options
 */
export interface ConfirmationOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger' | 'warning'
  onConfirm: () => Promise<void>
  onCancel?: () => void
}

/**
 * Toast notification options
 */
export interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

/**
 * Optimistic update data structure
 */
export interface OptimisticUpdate<T> {
  previousData: T
  optimisticData: T
}
