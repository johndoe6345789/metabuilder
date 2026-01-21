/**
 * User Page Handlers
 *
 * Handler functions for user list and form pages.
 * Orchestrates hooks, navigation, validation, and user feedback.
 *
 * Usage pattern:
 * - Import handlers into components
 * - Connect to UI event handlers (onChange, onClick, etc.)
 * - Handlers call hook methods and manage navigation/notifications
 *
 * @example
 * import { createUserListHandlers } from '@/lib/admin/user-page-handlers'
 * import { useRouter } from 'next/navigation'
 *
 * export function UsersPage() {
 *   const router = useRouter()
 *   const users = useUsers()
 *   const actions = useUserActions()
 *
 *   const handlers = createUserListHandlers({
 *     users,
 *     actions,
 *     router,
 *     onNotify: (message, type) => showToast(message, type)
 *   })
 *
 *   return (
 *     <UserList
 *       users={users.users}
 *       onSearch={handlers.handleSearch}
 *       onDelete={handlers.handleDelete}
 *     />
 *   )
 * }
 */

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { User } from '@/lib/level-types'

/**
 * Notification types for UI feedback
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning'

/**
 * Options for handlers
 */
interface ListHandlerOptions {
  router: AppRouterInstance
  onNotify?: (message: string, type: NotificationType) => void
  onConfirmDelete?: (message: string) => Promise<boolean>
}

interface FormHandlerOptions {
  router: AppRouterInstance
  isEdit: boolean
  userId?: string
  onNotify?: (message: string, type: NotificationType) => void
}

/**
 * Search debounce helper
 * Prevents excessive API calls while user is typing
 */
function createDebouncedSearch(delay = 300) {
  let timeout: NodeJS.Timeout | null = null

  return function debouncedSearch<T extends (...args: any[]) => any>(callback: T) {
    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(() => {
        callback(...args)
      }, delay)
    }
  }
}

/**
 * Create handlers for the user list page
 *
 * Handles pagination, search, filtering, and bulk operations
 */
export function createUserListHandlers(
  useUsersHook: any,
  useActionsHook: any,
  options: ListHandlerOptions
) {
  const { router, onNotify, onConfirmDelete } = options
  const debounce = createDebouncedSearch(300)

  /**
   * Handle search input change
   * Uses debouncing to prevent excessive API calls
   */
  const handleSearch = debounce(async (term: string) => {
    try {
      await useUsersHook.handlers.searchUsers(term)

      if (term) {
        onNotify?.(`Searching for: "${term}"`, 'info')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      onNotify?.(message, 'error')
    }
  })

  /**
   * Handle role filter change
   */
  const handleFilterChange = async (role: string | null) => {
    try {
      await useUsersHook.handlers.filterByRole(role)

      if (role) {
        onNotify?.(`Filtered by role: ${role}`, 'info')
      } else {
        onNotify?.('Filter cleared', 'info')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Filter failed'
      onNotify?.(message, 'error')
    }
  }

  /**
   * Handle pagination change
   */
  const handlePageChange = async (page: number) => {
    try {
      await useUsersHook.handlers.changePage(page)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change page'
      onNotify?.(message, 'error')
    }
  }

  /**
   * Handle items per page change
   */
  const handleLimitChange = async (limit: number) => {
    try {
      await useUsersHook.handlers.changeLimit(limit)
      onNotify?.(`Showing ${limit} items per page`, 'info')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change limit'
      onNotify?.(message, 'error')
    }
  }

  /**
   * Navigate to create new user form
   */
  const handleCreate = () => {
    router.push('/admin/users/new')
  }

  /**
   * Navigate to edit user form
   */
  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`)
  }

  /**
   * Handle user deletion with confirmation
   */
  const handleDelete = async (userId: string, userName?: string) => {
    // Show confirmation dialog
    const confirmed = await onConfirmDelete?.(
      `Are you sure you want to delete "${userName ?? 'this user'}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      const success = await useActionsHook.handlers.deleteUser(userId, true)

      if (success) {
        onNotify?.(`User "${userName}" deleted successfully`, 'success')

        // Refetch user list
        await useUsersHook.handlers.refetchUsers()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user'
      onNotify?.(message, 'error')
    }
  }

  /**
   * Handle role change for a user
   */
  const handleRoleChange = async (userId: string, newRole: string, userName?: string) => {
    try {
      const result = await useActionsHook.handlers.updateUserRole(userId, newRole)

      if (result) {
        onNotify?.(`Role for "${userName}" updated to ${newRole}`, 'success')

        // Refetch user list to show updated data
        await useUsersHook.handlers.refetchUsers()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update role'
      onNotify?.(message, 'error')
    }
  }

  /**
   * Refresh/refetch user list
   */
  const handleRefresh = async () => {
    try {
      await useUsersHook.handlers.refetchUsers()
      onNotify?.('User list refreshed', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh'
      onNotify?.(message, 'error')
    }
  }

  return {
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handleLimitChange,
    handleCreate,
    handleEdit,
    handleDelete,
    handleRoleChange,
    handleRefresh,
  }
}

/**
 * Create handlers for the user form page (create/edit)
 */
export function createUserFormHandlers(
  useFormHook: any,
  options: FormHandlerOptions
) {
  const { router, isEdit, userId, onNotify } = options

  /**
   * Handle individual field changes with validation feedback
   */
  const handleFieldChange = (field: string, value: unknown) => {
    useFormHook.handlers.setField(field, value)

    // Optionally validate field on blur instead
    // useFormHook.handlers.validateField(field)
  }

  /**
   * Handle field blur event - validate on blur instead of change
   */
  const handleFieldBlur = (field: string) => {
    useFormHook.handlers.validateField(field)
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    try {
      let result: User | null = null

      if (isEdit && userId) {
        result = await useFormHook.handlers.submitUpdate(userId)
      } else {
        result = await useFormHook.handlers.submitCreate()
      }

      if (result) {
        const action = isEdit ? 'updated' : 'created'
        onNotify?.(
          `User "${result.username}" ${action} successfully`,
          'success'
        )

        // Navigate back to list
        setTimeout(() => {
          router.push('/admin/users')
        }, 1500)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed'
      onNotify?.(message, 'error')
    }
  }

  /**
   * Handle form cancellation
   */
  const handleCancel = () => {
    if (useFormHook.isDirty) {
      // Could show "unsaved changes" dialog here
      const confirmed = confirm('You have unsaved changes. Discard them?')
      if (!confirmed) {
        return
      }
    }

    router.back()
  }

  /**
   * Handle form reset
   */
  const handleReset = () => {
    useFormHook.handlers.reset()
    onNotify?.('Form reset to initial values', 'info')
  }

  return {
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    handleCancel,
    handleReset,
  }
}

/**
 * Error handler helper for API responses
 *
 * Converts API errors to user-friendly messages
 */
export function handleApiError(
  error: unknown,
  context: string = 'operation'
): { message: string; userFriendly: string } {
  if (error instanceof Error) {
    const message = error.message

    // Handle common error patterns
    if (message.includes('HTTP 404')) {
      return {
        message,
        userFriendly: 'The resource was not found. It may have been deleted.',
      }
    }

    if (message.includes('HTTP 403')) {
      return {
        message,
        userFriendly: 'You do not have permission to perform this action.',
      }
    }

    if (message.includes('HTTP 409')) {
      return {
        message,
        userFriendly: 'This username or email already exists. Please try another.',
      }
    }

    if (message.includes('HTTP 422')) {
      return {
        message,
        userFriendly: 'The data you provided is invalid. Please check your input.',
      }
    }

    if (message.includes('duplicate') || message.includes('already exists')) {
      return {
        message,
        userFriendly: 'This username or email already exists. Please try another.',
      }
    }

    return {
      message,
      userFriendly: message,
    }
  }

  return {
    message: String(error),
    userFriendly: `An unknown error occurred during ${context}. Please try again.`,
  }
}

/**
 * Format timestamp for display
 *
 * @param timestamp Unix timestamp (ms or seconds)
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number | bigint | null | undefined): string {
  if (!timestamp) {
    return 'N/A'
  }

  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp

  // If timestamp is in seconds, convert to milliseconds
  const ms = ts < 10000000000 ? ts * 1000 : ts

  try {
    return new Date(ms).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Transform user data for display
 *
 * Formats dates, normalizes role names, handles missing data
 */
export function transformUserForDisplay(user: User) {
  return {
    ...user,
    createdAtFormatted: formatTimestamp(user.createdAt),
    roleDisplay: user.role
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
      : 'Unknown',
  }
}

/**
 * Get user avatar URL with fallback
 *
 * @param user User object
 * @param size Avatar size (px)
 * @returns URL or fallback initials avatar
 */
export function getUserAvatarUrl(user: User, size = 40): string {
  if (user.profilePicture) {
    return user.profilePicture
  }

  // Fallback: Generate placeholder avatar using UI avatar service or initials
  const initials = (user.username ?? user.email ?? 'U')
    .split(/[._\-@]/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  // Using UI Avatars service as fallback
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}`
}
