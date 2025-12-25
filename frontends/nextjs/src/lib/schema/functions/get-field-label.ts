import type { FieldSchema } from '../types/schema-types'

/**
 * Get the display label for a field
 * @param field - The field schema
 * @returns The field's label or a capitalized version of its name
 */
export const getFieldLabel = (field: FieldSchema): string => {
  return field.label || field.name.charAt(0).toUpperCase() + field.name.slice(1)
}
