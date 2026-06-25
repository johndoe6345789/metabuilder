/**
 * Type stub for @/lib/validation/user-validation
 * User form validation types and functions used by useUserForm hook.
 */

export interface UserFormData {
  username: string
  email: string
  role: string
  bio: string
  profilePicture: string
}

export type UserFormErrors = Partial<Record<keyof UserFormData, string>>

export interface ValidateUserFormOptions {
  singleField?: keyof UserFormData
}

/**
 * Validate user form data.
 * Returns an object mapping field names to error messages.
 */
export declare function validateUserForm(
  data: Partial<UserFormData>,
  options?: ValidateUserFormOptions
): UserFormErrors
