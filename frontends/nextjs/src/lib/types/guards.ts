/**
 * Type guard utilities for runtime type checking
 */

import type { JsonValue } from '@/types/utility-types'

/**
 * Check if value is an Error instance
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

/**
 * Check if value is an object with a message property
 */
export function isErrorLike(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  )
}

/**
 * Check if value is a valid JSON value
 */
export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true
  if (typeof value === 'string') return true
  if (typeof value === 'number') return true
  if (typeof value === 'boolean') return true
  if (Array.isArray(value)) {
    return value.every(isJsonValue)
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isJsonValue)
  }
  return false
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message
  if (isErrorLike(error)) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

/**
 * Check if value has a specific property
 */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj
}
