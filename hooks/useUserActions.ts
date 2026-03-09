'use client'

/**
 * useUserActions Hook
 *
 * Manages individual user operations like delete, role updates, and status changes.
 * Handles loading states, errors, and success callbacks.
 *
 * @example
 * const { loading, error, handlers } = useUserActions({
 *   onSuccess: () => console.log('User updated'),
 *   onError: (err) => console.error(err)
 * })
 *
 * await handlers.deleteUser(userId)
 * await handlers.updateUserRole(userId, 'admin')
 */

import { useCallback, useState } from 'react'
import type { User } from '@/lib/level-types'

type OperationType = 'delete' | 'updateRole' | 'updateStatus' | 'none'

interface UseUserActionsOptions {
  baseUrl?: string
  onSuccess?: (action: string, user?: User) => void
  onError?: (action: string, error: string) => void
}

interface UseUserActionsState {
  loading: boolean
  error: string | null
  operationInProgress: OperationType
  affectedUserId: string | null
}

interface UseUserActionsHandlers {
  deleteUser: (userId: string, force?: boolean) => Promise<boolean>
  updateUserRole: (userId: string, newRole: string) => Promise<User | null>
  updateUserStatus: (userId: string, status: string) => Promise<User | null>
  clearError: () => void
}

interface UseUserActionsReturn extends UseUserActionsState {
  handlers: UseUserActionsHandlers
}

/**
 * Hook for managing individual user operations
 */
export function useUserActions(options?: UseUserActionsOptions): UseUserActionsReturn {
  const baseUrl = options?.baseUrl ?? ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [operationInProgress, setOperationInProgress] = useState<OperationType>('none')
  const [affectedUserId, setAffectedUserId] = useState<string | null>(null)

  /**
   * Delete a user account
   * Requires confirmation via force parameter
   */
  const deleteUser = useCallback(
    async (userId: string, force = false): Promise<boolean> => {
      if (!force) {
        setError('User deletion requires explicit confirmation')
        return false
      }

      setLoading(true)
      setError(null)
      setOperationInProgress('delete')
      setAffectedUserId(userId)

      try {
        // Make DELETE request
        const response = await fetch(`${baseUrl}/api/v1/default/user_manager/users/${userId}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 404) {
            throw new Error('User not found')
          }

          if (response.status === 403) {
            throw new Error('You do not have permission to delete this user')
          }

          if (response.status === 409) {
            // Conflict - user may have related data
            throw new Error(result.error?.message ?? 'Cannot delete user: has associated data')
          }

          throw new Error(
            result.error?.message ?? `HTTP ${response.status}: ${response.statusText}`
          )
        }

        // Success callback
        options?.onSuccess?.('deleteUser')

        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete user'
        setError(message)
        options?.onError?.('deleteUser', message)
        return false
      } finally {
        setLoading(false)
        setOperationInProgress('none')
        setAffectedUserId(null)
      }
    },
    [options]
  )

  /**
   * Update user role (admin, moderator, user, etc.)
   */
  const updateUserRole = useCallback(
    async (userId: string, newRole: string): Promise<User | null> => {
      setLoading(true)
      setError(null)
      setOperationInProgress('updateRole')
      setAffectedUserId(userId)

      try {
        // Validate role
        const validRoles = ['public', 'user', 'moderator', 'admin', 'god', 'supergod']
        if (!validRoles.includes(newRole)) {
          throw new Error(`Invalid role: ${newRole}`)
        }

        // Make PUT request
        const response = await fetch(`${baseUrl}/api/v1/default/user_manager/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole.toUpperCase() }),
        })

        const result = await response.json()

        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 404) {
            throw new Error('User not found')
          }

          if (response.status === 403) {
            throw new Error('You do not have permission to update this user')
          }

          throw new Error(
            result.error?.message ?? `HTTP ${response.status}: ${response.statusText}`
          )
        }

        const updatedUser: User = result.data

        // Success callback
        options?.onSuccess?.('updateUserRole', updatedUser)

        return updatedUser
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update user role'
        setError(message)
        options?.onError?.('updateUserRole', message)
        return null
      } finally {
        setLoading(false)
        setOperationInProgress('none')
        setAffectedUserId(null)
      }
    },
    [options]
  )

  /**
   * Update user status (active, suspended, deleted)
   * Note: This is a placeholder for future implementation
   */
  const updateUserStatus = useCallback(
    async (userId: string, status: string): Promise<User | null> => {
      setLoading(true)
      setError(null)
      setOperationInProgress('updateStatus')
      setAffectedUserId(userId)

      try {
        // Validate status
        const validStatuses = ['active', 'suspended', 'inactive']
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid status: ${status}`)
        }

        // Make PUT request
        const response = await fetch(`${baseUrl}/api/v1/default/user_manager/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })

        const result = await response.json()

        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 404) {
            throw new Error('User not found')
          }

          if (response.status === 403) {
            throw new Error('You do not have permission to update this user')
          }

          throw new Error(
            result.error?.message ?? `HTTP ${response.status}: ${response.statusText}`
          )
        }

        const updatedUser: User = result.data

        // Success callback
        options?.onSuccess?.('updateUserStatus', updatedUser)

        return updatedUser
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update user status'
        setError(message)
        options?.onError?.('updateUserStatus', message)
        return null
      } finally {
        setLoading(false)
        setOperationInProgress('none')
        setAffectedUserId(null)
      }
    },
    [options]
  )

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    operationInProgress,
    affectedUserId,
    handlers: {
      deleteUser,
      updateUserRole,
      updateUserStatus,
      clearError,
    },
  }
}

export default useUserActions
