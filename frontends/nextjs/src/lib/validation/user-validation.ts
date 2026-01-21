/**
 * User Validation Utilities
 *
 * Provides client-side and server-side validation for user data.
 * Validates usernames, emails, roles, and optional fields.
 *
 * @example
 * import { validateUserForm, validateUsername } from '@/lib/validation/user-validation'
 *
 * // Validate entire form
 * const errors = validateUserForm({
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   role: 'admin'
 * })
 *
 * // Validate single field
 * const isValidUsername = validateUsername('john_doe')
 */

import { validateEmail } from './validate-email'

/**
 * Form data structure for user create/update
 */
export interface UserFormData {
  username: string
  email: string
  role: string
  bio: string
  profilePicture: string
}

/**
 * Validation errors by field
 */
export interface UserFormErrors {
  username?: string
  email?: string
  role?: string
  bio?: string
  profilePicture?: string
  [key: string]: string | undefined
}

/**
 * Validation options
 */
interface ValidationOptions {
  singleField?: keyof UserFormData
  isUpdate?: boolean
}

/**
 * Valid user roles in the system
 */
const VALID_ROLES = ['public', 'user', 'moderator', 'admin', 'god', 'supergod']

/**
 * Validate username
 *
 * Rules:
 * - Required (3-50 characters)
 * - Alphanumeric + underscore only
 * - Cannot start or end with underscore
 * - Case-sensitive
 *
 * @param username Username to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validateUsername(username: unknown): string {
  // Check type
  if (typeof username !== 'string') {
    return 'Username must be a string'
  }

  const trimmed = username.trim()

  // Check required
  if (!trimmed) {
    return 'Username is required'
  }

  // Check length
  if (trimmed.length < 3) {
    return 'Username must be at least 3 characters'
  }

  if (trimmed.length > 50) {
    return 'Username must be at most 50 characters'
  }

  // Check format: alphanumeric and underscore only
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return 'Username can only contain letters, numbers, and underscores'
  }

  // Cannot start or end with underscore
  if (trimmed.startsWith('_') || trimmed.endsWith('_')) {
    return 'Username cannot start or end with an underscore'
  }

  // Cannot have consecutive underscores
  if (trimmed.includes('__')) {
    return 'Username cannot contain consecutive underscores'
  }

  return ''
}

/**
 * Validate user email
 *
 * @param email Email to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validateUserEmail(email: unknown): string {
  // Check type
  if (typeof email !== 'string') {
    return 'Email must be a string'
  }

  const trimmed = email.trim()

  // Check required
  if (!trimmed) {
    return 'Email is required'
  }

  // Use existing email validation
  if (!validateEmail(trimmed)) {
    return 'Please enter a valid email address'
  }

  // Check max length (RFC 5321)
  if (trimmed.length > 254) {
    return 'Email address is too long'
  }

  return ''
}

/**
 * Validate user role
 *
 * @param role Role to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validateRole(role: unknown): string {
  // Check type
  if (typeof role !== 'string') {
    return 'Role must be a string'
  }

  const trimmed = role.trim().toLowerCase()

  // Check required
  if (!trimmed) {
    return 'Role is required'
  }

  // Check valid role
  if (!VALID_ROLES.includes(trimmed)) {
    return `Role must be one of: ${VALID_ROLES.join(', ')}`
  }

  return ''
}

/**
 * Validate user bio
 *
 * Rules:
 * - Optional field
 * - Max 500 characters
 *
 * @param bio Bio to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validateBio(bio: unknown): string {
  // Optional field - no error if empty
  if (!bio || (typeof bio === 'string' && !bio.trim())) {
    return ''
  }

  // Check type
  if (typeof bio !== 'string') {
    return 'Bio must be a string'
  }

  const trimmed = bio.trim()

  // Check max length
  if (trimmed.length > 500) {
    return 'Bio must be at most 500 characters'
  }

  return ''
}

/**
 * Validate profile picture URL
 *
 * Rules:
 * - Optional field
 * - Must be valid URL if provided
 * - Supports http://, https://, and data: URLs
 *
 * @param url URL to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validateProfilePictureUrl(url: unknown): string {
  // Optional field - no error if empty
  if (!url || (typeof url === 'string' && !url.trim())) {
    return ''
  }

  // Check type
  if (typeof url !== 'string') {
    return 'Profile picture URL must be a string'
  }

  const trimmed = url.trim()

  // Try to parse as URL
  try {
    const parsed = new URL(trimmed)

    // Allow http, https, and data URIs
    if (!['http:', 'https:', 'data:'].includes(parsed.protocol)) {
      return 'Profile picture URL must start with http://, https://, or data:'
    }

    // For http/https URLs, check length
    if (['http:', 'https:'].includes(parsed.protocol) && trimmed.length > 2048) {
      return 'Profile picture URL is too long'
    }

    return ''
  } catch {
    return 'Please enter a valid URL for profile picture'
  }
}

/**
 * Validate entire user form
 *
 * Returns object with field-level error messages.
 * Empty object means form is valid.
 *
 * @param data Form data to validate
 * @param options Validation options
 * @returns Object with field errors (empty if valid)
 *
 * @example
 * const errors = validateUserForm({ username: 'ab', email: 'invalid' })
 * // { username: 'Username must be at least 3 characters', email: 'Please enter a valid email address' }
 */
export function validateUserForm(
  data: Partial<UserFormData>,
  options?: ValidationOptions
): UserFormErrors {
  const errors: UserFormErrors = {}

  // Validate username (if present or single field validation)
  if (data.username !== undefined || options?.singleField === 'username') {
    const usernameError = validateUsername(data.username)
    if (usernameError) {
      errors.username = usernameError
    }
  }

  // Validate email (if present or single field validation)
  if (data.email !== undefined || options?.singleField === 'email') {
    const emailError = validateUserEmail(data.email)
    if (emailError) {
      errors.email = emailError
    }
  }

  // Validate role (if present or single field validation)
  if (data.role !== undefined || options?.singleField === 'role') {
    const roleError = validateRole(data.role)
    if (roleError) {
      errors.role = roleError
    }
  }

  // Validate bio (if present or single field validation)
  if (data.bio !== undefined || options?.singleField === 'bio') {
    const bioError = validateBio(data.bio)
    if (bioError) {
      errors.bio = bioError
    }
  }

  // Validate profile picture (if present or single field validation)
  if (data.profilePicture !== undefined || options?.singleField === 'profilePicture') {
    const picError = validateProfilePictureUrl(data.profilePicture)
    if (picError) {
      errors.profilePicture = picError
    }
  }

  return errors
}

/**
 * Check if form has any validation errors
 *
 * @param errors Errors object from validateUserForm
 * @returns true if there are any errors
 */
export function hasValidationErrors(errors: UserFormErrors): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Get friendly role display name
 *
 * @param role Role code
 * @returns Display name for the role
 */
export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    public: 'Public',
    user: 'User',
    moderator: 'Moderator',
    admin: 'Administrator',
    god: 'God',
    supergod: 'Super Administrator',
  }

  return roleMap[role.toLowerCase()] ?? role
}

/**
 * Format user data for API submission
 *
 * Trims whitespace, normalizes role case, removes empty optional fields
 *
 * @param data Form data
 * @returns Formatted data ready for API submission
 */
export function formatUserDataForApi(data: UserFormData): Record<string, unknown> {
  return {
    username: data.username.trim(),
    email: data.email.trim(),
    role: data.role.toUpperCase(),
    ...(data.bio?.trim() && { bio: data.bio.trim() }),
    ...(data.profilePicture?.trim() && { profilePicture: data.profilePicture.trim() }),
  }
}

/**
 * Transform API response to form data
 *
 * Converts database format to form-friendly format
 *
 * @param user User from API response
 * @returns Form data
 */
export function transformApiUserToFormData(user: Partial<any>): UserFormData {
  return {
    username: user.username ?? '',
    email: user.email ?? '',
    role: (user.role ?? 'user').toLowerCase(),
    bio: user.bio ?? '',
    profilePicture: user.profilePicture ?? '',
  }
}

/**
 * Compare two user objects to detect changes
 *
 * Useful for determining if form is dirty
 *
 * @param original Original user data
 * @param current Current form data
 * @returns true if there are differences
 */
export function hasUserChanged(
  original: Partial<UserFormData>,
  current: Partial<UserFormData>
): boolean {
  return JSON.stringify(original) !== JSON.stringify(current)
}
