import type { ModelSchema } from '@/lib/schema-types'
import { generateId } from './generate-id'
import { getDefaultValue } from './get-default-value'

/**
 * Create an empty record with default values for a model
 * @param model - The model schema to create a record for
 * @returns A new record with default field values
 */
export const createEmptyRecord = (model: ModelSchema): any => {
  const record: any = {}
  
  for (const field of model.fields) {
    if (field.name === 'id') {
      record.id = generateId()
    } else if (field.name === 'createdAt' && field.type === 'datetime') {
      record.createdAt = new Date().toISOString()
    } else {
      record[field.name] = getDefaultValue(field)
    }
  }
  
  return record
}
