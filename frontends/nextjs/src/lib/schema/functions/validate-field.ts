import type { FieldSchema } from '@/lib/schema-types'
import { getFieldLabel } from './get-field-label'

/**
 * Validate a single field value against its schema
 * @param field - The field schema to validate against
 * @param value - The value to validate
 * @returns Error message if validation fails, null otherwise
 */
export const validateField = (field: FieldSchema, value: any): string | null => {
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${getFieldLabel(field)} is required`
  }

  if (!value && !field.required) return null

  if (field.validation) {
    const { min, max, minLength, maxLength, pattern } = field.validation

    if (field.type === 'number') {
      const numValue = Number(value)
      if (min !== undefined && numValue < min) {
        return `${getFieldLabel(field)} must be at least ${min}`
      }
      if (max !== undefined && numValue > max) {
        return `${getFieldLabel(field)} must be at most ${max}`
      }
    }

    if (field.type === 'string' || field.type === 'text' || field.type === 'email' || field.type === 'url') {
      const strValue = String(value)
      if (minLength !== undefined && strValue.length < minLength) {
        return `${getFieldLabel(field)} must be at least ${minLength} characters`
      }
      if (maxLength !== undefined && strValue.length > maxLength) {
        return `${getFieldLabel(field)} must be at most ${maxLength} characters`
      }
      if (pattern && !new RegExp(pattern).test(strValue)) {
        return `${getFieldLabel(field)} format is invalid`
      }
    }
  }

  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return `${getFieldLabel(field)} must be a valid email address`
    }
  }

  if (field.type === 'url' && value) {
    try {
      new URL(value)
    } catch {
      return `${getFieldLabel(field)} must be a valid URL`
    }
  }

  return null
}
