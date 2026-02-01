/**
 * usePagination Hook
 * Pagination state management with page, size, and navigation
 */

import { useCallback, useState } from 'react'

export interface UsePaginationOptions {
  initialPage?: number
  pageSize?: number
  totalItems?: number
}

export interface UsePaginationReturn {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setPageSize: (size: number) => void
  reset: () => void
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPage = 1, pageSize: initialPageSize = 10, totalItems = 0 } = options
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  const handleSetPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)))
  }, [totalPages])

  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages))
  }, [totalPages])

  const handlePrevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1))
  }, [])

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(Math.max(1, size))
    setPage(1)
  }, [])

  const handleReset = useCallback(() => {
    setPage(initialPage)
    setPageSize(initialPageSize)
  }, [initialPage, initialPageSize])

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    setPage: handleSetPage,
    nextPage: handleNextPage,
    prevPage: handlePrevPage,
    setPageSize: handleSetPageSize,
    reset: handleReset,
  }
}

export default usePagination
