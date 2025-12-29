import type { ModelSchema } from '@/lib/schema-types'

import { validateField } from '../field/validate-field'

/**
 * Validate a record against its model schema
 * @param model - The model schema to validate against
 * @param record - The record to validate
 * @returns Object mapping field names to error messages
 */
export const validateRecord = (model: ModelSchema, record: any): Record<string, string> => {
  const errors: Record<string, string> = {}

  for (const field of model.fields) {
    if (field.editable === false) continue
    const error = validateField(field, record[field.name])
    if (error) {
      errors[field.name] = error
    }
  }

  return errors
}
