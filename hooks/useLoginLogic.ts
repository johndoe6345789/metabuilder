/**
 * useLoginLogic Hook (Tier 2)
 * User login business logic with service adapter injection
 *
 * Features:
 * - Email and password validation
 * - Service adapter integration
 * - LocalStorage persistence
 * - Redux state management
 * - Navigation on success
 */

import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useServices } from '@metabuilder/service-adapters'
import { setAuthenticated, setAuthLoading, setError } from '@metabuilder/redux-slices'

export interface LoginData {
  email: string
  password: string
}

export interface UseLoginLogicReturn {
  handleLogin: (data: LoginData) => Promise<void>
}

/**
 * Validation rules for login form
 */
const validateLogin = (data: LoginData): string | null => {
  const { email, password } = data

  if (!email.trim()) {
    return 'Email is required'
  }
  if (!password) {
    return 'Password is required'
  }

  return null
}

/**
 * useLoginLogic Hook
 * Handles user login with service adapter injection
 *
 * @example
 * const { handleLogin } = useLoginLogic();
 * await handleLogin({ email: 'user@example.com', password: 'password' });
 */
export const useLoginLogic = (): UseLoginLogicReturn => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { authService } = useServices()

  const handleLogin = useCallback(
    async (data: LoginData) => {
      dispatch(setError(null))
      dispatch(setAuthLoading(true))

      try {
        // Validate form
        const validationError = validateLogin(data)
        if (validationError) {
          throw new Error(validationError)
        }

        // Call auth service
        const response = await authService.login(data.email, data.password)

        // Save to localStorage
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('current_user', JSON.stringify(response.user))

        // Update Redux state
        dispatch(
          setAuthenticated({
            user: response.user,
            token: response.token,
          })
        )

        // Redirect to dashboard
        router.push('/')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed'
        dispatch(setError(message))
        throw error
      } finally {
        dispatch(setAuthLoading(false))
      }
    },
    [dispatch, router, authService]
  )

  return { handleLogin }
}

export default useLoginLogic
