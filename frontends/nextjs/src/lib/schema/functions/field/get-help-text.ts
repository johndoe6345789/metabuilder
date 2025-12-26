import type { FieldSchema } from '@/lib/schema-types'

/**
 * Get the help text for a field
 * @param field - The field schema
 * @returns The field's help text as a string, or empty string if none
 */
export const getHelpText = (field: FieldSchema): string => {
  if (!field.helpText) return ''
  if (Array.isArray(field.helpText)) {
    return field.helpText.join(' ')
  }
  return field.helpText
}
