'use client'

/**
 * useUserForm Hook
 *
 * Manages form state for creating and editing users.
 * Handles validation, submission, and error states.
 *
 * @example
 * const { formData, errors, loading, handlers } = useUserForm({
 *   initialData: existingUser
 * })
 *
 * const handleSubmit = async () => {
 *   const isValid = handlers.validateForm()
 *   if (!isValid) return
 *
 *   if (isCreate) {
 *     await handlers.submitCreate(formData)
 *   } else {
 *     await handlers.submitUpdate(userId, formData)
 *   }
 * }
 */

import { useCallback, useState } from 'react'
import type { User } from '@/lib/level-types'
import { validateUserForm, type UserFormData, type UserFormErrors } from '@/lib/validation/user-validation'

interface UseUserFormOptions {
  baseUrl?: string
  initialData?: Partial<User>
  onSuccess?: (user: User) => void
  onError?: (error: string) => void
}

interface UseUserFormState {
  formData: UserFormData
  errors: UserFormErrors
  loading: boolean
  submitError: string | null
  isValid: boolean
  isDirty: boolean
}

interface UseUserFormHandlers {
  setField: (name: keyof UserFormData, value: unknown) => void
  setErrors: (errors: Partial<UserFormErrors>) => void
  validateForm: () => boolean
  validateField: (field: keyof UserFormData) => boolean
  submitCreate: (data?: UserFormData) => Promise<User | null>
  submitUpdate: (userId: string, data?: UserFormData) => Promise<User | null>
  reset: () => void
}

interface UseUserFormReturn extends UseUserFormState {
  handlers: UseUserFormHandlers
}

// Default form data structure
const DEFAULT_FORM_DATA: UserFormData = {
  username: '',
  email: '',
  role: 'user',
  bio: '',
  profilePicture: '',
}

/**
 * Hook for managing user form state and submission
 */
export function useUserForm(options?: UseUserFormOptions): UseUserFormReturn {
  // Initialize form data from provided initial data or defaults
  const baseUrl = options?.baseUrl ?? ''
  const initialFormData: UserFormData = {
    username: options?.initialData?.username ?? '',
    email: options?.initialData?.email ?? '',
    role: (options?.initialData?.role as any) ?? 'user',
    bio: options?.initialData?.bio ?? '',
    profilePicture: options?.initialData?.profilePicture ?? '',
  }

  const [formData, setFormData] = useState<UserFormData>(initialFormData)
  const [errors, setErrors] = useState<UserFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Determine if form is dirty (has changes from initial data)
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormData)

  // Determine if form is valid (no errors and all required fields filled)
  const isValid = Object.keys(errors).length === 0 && !!formData.username && !!formData.email

  /**
   * Update a single form field
   */
  const setField = useCallback((name: keyof UserFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field when user starts typing
    setErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: keyof UserFormData): boolean => {
    const fieldData: Partial<UserFormData> = {
      [field]: formData[field],
    }

    const fieldErrors = validateUserForm(fieldData, { singleField: field })

    if (Object.keys(fieldErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        ...fieldErrors,
      }))
      return false
    }

    // Clear field error if validation passes
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
    return true
  }, [formData])

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const formErrors = validateUserForm(formData)
    setErrors(formErrors)
    return Object.keys(formErrors).length === 0
  }, [formData])

  /**
   * Submit form for creating a new user
   */
  const submitCreate = useCallback(
    async (data?: UserFormData): Promise<User | null> => {
      const submitData = data ?? formData

      // Validate form
      if (!validateForm()) {
        setSubmitError('Please fix validation errors')
        return null
      }

      setLoading(true)
      setSubmitError(null)

      try {
        // Prepare request data
        const requestData = {
          username: submitData.username.trim(),
          email: submitData.email.trim(),
          role: submitData.role.toUpperCase(),
          ...(submitData.bio && { bio: submitData.bio.trim() }),
          ...(submitData.profilePicture && { profilePicture: submitData.profilePicture.trim() }),
        }

        // Make API request
        const response = await fetch(`${baseUrl}/api/v1/default/user_manager/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        })

        const result = await response.json()

        if (!response.ok) {
          // Handle validation errors
          if (response.status === 422 && result.error?.details) {
            const fieldErrors: UserFormErrors = {}
            for (const [field, message] of Object.entries(result.error.details)) {
              fieldErrors[field as keyof UserFormData] = message as string
            }
            setErrors(fieldErrors)
            throw new Error('Please fix validation errors')
          }

          // Handle conflict errors (duplicate username/email)
          if (response.status === 409) {
            throw new Error(result.error?.message ?? 'This username or email already exists')
          }

          throw new Error(
            result.error?.message ?? `HTTP ${response.status}: ${response.statusText}`
          )
        }

        const newUser: User = result.data

        // Call success callback
        options?.onSuccess?.(newUser)

        // Reset form on success
        setFormData(DEFAULT_FORM_DATA)

        return newUser
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create user'
        setSubmitError(message)
        options?.onError?.(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [formData, validateForm, options]
  )

  /**
   * Submit form for updating an existing user
   */
  const submitUpdate = useCallback(
    async (userId: string, data?: UserFormData): Promise<User | null> => {
      const submitData = data ?? formData

      // Validate form
      if (!validateForm()) {
        setSubmitError('Please fix validation errors')
        return null
      }

      setLoading(true)
      setSubmitError(null)

      try {
        // Prepare request data
        const requestData = {
          username: submitData.username.trim(),
          email: submitData.email.trim(),
          role: submitData.role.toUpperCase(),
          ...(submitData.bio !== undefined && { bio: submitData.bio.trim() }),
          ...(submitData.profilePicture !== undefined && { profilePicture: submitData.profilePicture.trim() }),
        }

        // Make API request
        const response = await fetch(`${baseUrl}/api/v1/default/user_manager/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        })

        const result = await response.json()

        if (!response.ok) {
          // Handle validation errors
          if (response.status === 422 && result.error?.details) {
            const fieldErrors: UserFormErrors = {}
            for (const [field, message] of Object.entries(result.error.details)) {
              fieldErrors[field as keyof UserFormData] = message as string
            }
            setErrors(fieldErrors)
            throw new Error('Please fix validation errors')
          }

          // Handle conflict errors (duplicate username/email)
          if (response.status === 409) {
            throw new Error(result.error?.message ?? 'This username or email already exists')
          }

          // Handle not found
          if (response.status === 404) {
            throw new Error('User not found')
          }

          throw new Error(
            result.error?.message ?? `HTTP ${response.status}: ${response.statusText}`
          )
        }

        const updatedUser: User = result.data

        // Call success callback
        options?.onSuccess?.(updatedUser)

        // Update form data to match server response (new initial state)
        setFormData({
          username: updatedUser.username ?? '',
          email: updatedUser.email ?? '',
          role: (updatedUser.role as any) ?? 'user',
          bio: updatedUser.bio ?? '',
          profilePicture: updatedUser.profilePicture ?? '',
        })

        return updatedUser
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update user'
        setSubmitError(message)
        options?.onError?.(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [formData, validateForm, options]
  )

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setFormData(initialFormData)
    setErrors({})
    setSubmitError(null)
  }, [initialFormData])

  return {
    formData,
    errors,
    loading,
    submitError,
    isValid,
    isDirty,
    handlers: {
      setField,
      setErrors,
      validateForm,
      validateField,
      submitCreate,
      submitUpdate,
      reset,
    },
  }
}

export default useUserForm
