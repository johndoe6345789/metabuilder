'use client'

/**
 * useUsers Hook
 *
 * Manages user list state, pagination, search, and filtering for the admin users page.
 * Integrates with /api/v1/{tenant}/{package}/users endpoints
 *
 * @example
 * const { users, loading, error, pagination, handlers } = useUsers()
 *
 * // Fetch users with pagination
 * useEffect(() => {
 *   handlers.fetchUsers(1, 10)
 * }, [])
 *
 * // Search with debouncing
 * const handleSearch = (term) => {
 *   handlers.searchUsers(term)
 * }
 *
 * // Change page
 * const handlePageChange = (page) => {
 *   handlers.changePage(page)
 * }
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@/lib/level-types'

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UseUsersState {
  users: User[]
  loading: boolean
  error: string | null
  pagination: PaginationState
  search: string
  roleFilter: string | null
  refetching: boolean
}

interface UseUsersHandlers {
  fetchUsers: (page?: number, limit?: number, search?: string, role?: string | null) => Promise<void>
  refetchUsers: () => Promise<void>
  searchUsers: (term: string) => Promise<void>
  filterByRole: (role: string | null) => Promise<void>
  changePage: (newPage: number) => Promise<void>
  changeLimit: (newLimit: number) => Promise<void>
  reset: () => void
}

interface UseUsersReturn extends UseUsersState {
  handlers: UseUsersHandlers
}

// Debounce timer for search
let searchTimeout: NodeJS.Timeout | null = null

/**
 * Hook for managing user list state, pagination, and filtering
 */
export function useUsers(options?: { baseUrl?: string }): UseUsersReturn {
  const baseUrl = options?.baseUrl ?? ''
  const [state, setState] = useState<UseUsersState>({
    users: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    search: '',
    roleFilter: null,
    refetching: false,
  })

  // Keep track of current filters for refetch
  const currentFiltersRef = useRef({
    page: 1,
    limit: 10,
    search: '',
    role: null as string | null,
  })

  /**
   * Build query string for API request
   */
  const buildQueryString = useCallback((
    page: number,
    limit: number,
    search?: string,
    role?: string | null
  ): string => {
    const params = new URLSearchParams()

    params.set('skip', String((page - 1) * limit))
    params.set('take', String(limit))

    if (search && search.trim()) {
      params.set('search', search.trim())
    }

    if (role) {
      params.set('role', role)
    }

    return `?${params.toString()}`
  }, [])

  /**
   * Fetch users from API
   * Supports pagination, search, and role filtering
   */
  const fetchUsers = useCallback(
    async (page = 1, limit = 10, search = '', role: string | null = null) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        // Store current filters for refetch
        currentFiltersRef.current = { page, limit, search, role }

        // Build query string
        const queryString = buildQueryString(page, limit, search, role)

        // Make API request
        const response = await fetch(`${baseUrl}/api/v1/default/user_manager/users${queryString}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
          )
        }

        const data = await response.json()

        // Extract pagination metadata from response
        const total = data.meta?.total ?? 0
        const totalPages = Math.ceil(total / limit)

        setState((prev) => ({
          ...prev,
          users: data.data ?? [],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
          search,
          roleFilter: role,
          loading: false,
        }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch users'
        setState((prev) => ({
          ...prev,
          error: message,
          loading: false,
        }))
      }
    },
    [buildQueryString]
  )

  /**
   * Refetch users with current filters
   */
  const refetchUsers = useCallback(async () => {
    setState((prev) => ({ ...prev, refetching: true }))

    try {
      const { page, limit, search, role } = currentFiltersRef.current
      await fetchUsers(page, limit, search, role)
    } finally {
      setState((prev) => ({ ...prev, refetching: false }))
    }
  }, [fetchUsers])

  /**
   * Search users by username or email (debounced)
   */
  const searchUsers = useCallback(
    async (term: string) => {
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      // Update search state immediately (for input field)
      setState((prev) => ({ ...prev, search: term }))

      // Debounce API call (300ms)
      searchTimeout = setTimeout(async () => {
        const { page, limit, role } = currentFiltersRef.current
        await fetchUsers(1, limit, term, role) // Reset to page 1 on search
      }, 300)
    },
    [fetchUsers]
  )

  /**
   * Filter by user role and reset to page 1
   */
  const filterByRole = useCallback(
    async (role: string | null) => {
      const { limit, search } = currentFiltersRef.current
      await fetchUsers(1, limit, search, role)
    },
    [fetchUsers]
  )

  /**
   * Change current page
   */
  const changePage = useCallback(
    async (newPage: number) => {
      const { limit, search, role } = currentFiltersRef.current
      await fetchUsers(newPage, limit, search, role)
    },
    [fetchUsers]
  )

  /**
   * Change items per page (reset to page 1)
   */
  const changeLimit = useCallback(
    async (newLimit: number) => {
      const { search, role } = currentFiltersRef.current
      await fetchUsers(1, newLimit, search, role)
    },
    [fetchUsers]
  )

  /**
   * Reset all filters and fetch initial list
   */
  const reset = useCallback(() => {
    setState({
      users: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      search: '',
      roleFilter: null,
      refetching: false,
    })
    currentFiltersRef.current = {
      page: 1,
      limit: 10,
      search: '',
      role: null,
    }
  }, [])

  return {
    ...state,
    handlers: {
      fetchUsers,
      refetchUsers,
      searchUsers,
      filterByRole,
      changePage,
      changeLimit,
      reset,
    },
  }
}

export default useUsers
