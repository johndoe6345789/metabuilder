/**
 * @file user-validation.ts
 * @description User validation functions
 */
import { isValidEmail } from '../../validation/is-valid-email'
import { isValidUsername } from '../../validation/is-valid-username'

export const validateEmail = (email: string): boolean => isValidEmail(email)
export const validateUsername = (username: string): boolean => isValidUsername(username)
