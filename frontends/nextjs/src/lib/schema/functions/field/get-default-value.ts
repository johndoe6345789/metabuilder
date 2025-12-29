import type { FieldSchema } from '@/lib/schema-types'

/**
 * Get the default value for a field based on its type
 * @param field - The field schema
 * @returns The appropriate default value for the field type
 */
export const getDefaultValue = (field: FieldSchema): any => {
  if (field.default !== undefined) return field.default

  switch (field.type) {
    case 'string':
    case 'text':
    case 'email':
    case 'url':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'date':
    case 'datetime':
      return null
    case 'select':
      return field.choices?.[0]?.value || ''
    case 'relation':
      return null
    case 'json':
      return null
    default:
      return null
  }
}
