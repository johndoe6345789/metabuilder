import { PageSchema } from '@/types/json-ui'

export function hydrateSchema(jsonSchema: any): PageSchema {
  // Validate basic schema structure
  if (!jsonSchema || typeof jsonSchema !== 'object') {
    throw new Error('Invalid schema: expected an object')
  }
  
  if (!jsonSchema.id || !jsonSchema.name) {
    console.warn('Schema missing required fields: id and name')
  }

  return jsonSchema as PageSchema
}
