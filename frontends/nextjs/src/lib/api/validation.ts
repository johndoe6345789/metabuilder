/**
 * Validation utilities for API requests using Zod
 * 
 * Provides utilities to generate Zod schemas from entity definitions
 * and validate request/response data
 */

import { z, type ZodTypeAny } from 'zod'

export type FieldType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'enum' 
  | 'array' 
  | 'object'
  | 'relation'

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom'
  value?: unknown
  message?: string
}

export interface FieldDefinition {
  name: string
  type: FieldType
  required?: boolean
  default?: unknown
  enum?: string[]
  arrayItemType?: FieldType
  objectFields?: FieldDefinition[]
  validation?: ValidationRule[]
}

export interface EntityDefinition {
  name: string
  fields: FieldDefinition[]
}

/**
 * Generate Zod schema for a field
 */
export function generateFieldSchema(field: FieldDefinition): ZodTypeAny {
  let schema: ZodTypeAny

  // Base type
  switch (field.type) {
    case 'string':
      schema = z.string()
      break
    case 'number':
      schema = z.number()
      break
    case 'boolean':
      schema = z.boolean()
      break
    case 'date':
      schema = z.coerce.date()
      break
    case 'enum':
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (field.enum !== null && field.enum !== undefined && field.enum.length > 0) {
        schema = z.enum(field.enum as [string, ...string[]])
      } else {
        schema = z.string()
      }
      break
    case 'array':
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (field.arrayItemType !== null && field.arrayItemType !== undefined) {
        const itemSchema = generateFieldSchema({ 
          name: 'item', 
          type: field.arrayItemType 
        })
        schema = z.array(itemSchema)
      } else {
        schema = z.array(z.unknown())
      }
      break
    case 'object':
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (field.objectFields !== null && field.objectFields !== undefined) {
        const objectShape: Record<string, ZodTypeAny> = {}
        for (const objField of field.objectFields) {
          objectShape[objField.name] = generateFieldSchema(objField)
        }
        schema = z.object(objectShape)
      } else {
        schema = z.record(z.string(), z.unknown())
      }
      break
    case 'relation':
      // For relations, just accept a string ID or object
      schema = z.union([z.string(), z.object({ id: z.string() })])
      break
    default:
      schema = z.unknown()
  }

  // Apply validation rules
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (field.validation !== null && field.validation !== undefined) {
    for (const rule of field.validation) {
      schema = applyValidationRule(schema, rule, field.type)
    }
  }

  // Handle required/optional
  if (field.required !== true) {
    schema = schema.optional()
    if (field.default !== undefined && field.default !== null) {
      schema = schema.default(field.default)
    }
  }

  return schema
}

/**
 * Apply validation rule to schema
 */
function applyValidationRule(
  schema: ZodTypeAny,
  rule: ValidationRule,
  fieldType: FieldType
): ZodTypeAny {
  switch (rule.type) {
    case 'required':
      // Already handled at field level
      return schema
      
    case 'min':
      if (fieldType === 'string' && typeof rule.value === 'number') {
        return (schema as z.ZodString).min(rule.value, rule.message)
      }
      if (fieldType === 'number' && typeof rule.value === 'number') {
        return (schema as z.ZodNumber).min(rule.value, rule.message)
      }
      if (fieldType === 'array' && typeof rule.value === 'number') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (schema as z.ZodArray<any>).min(rule.value, rule.message)
      }
      return schema
      
    case 'max':
      if (fieldType === 'string' && typeof rule.value === 'number') {
        return (schema as z.ZodString).max(rule.value, rule.message)
      }
      if (fieldType === 'number' && typeof rule.value === 'number') {
        return (schema as z.ZodNumber).max(rule.value, rule.message)
      }
      if (fieldType === 'array' && typeof rule.value === 'number') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (schema as z.ZodArray<any>).max(rule.value, rule.message)
      }
      return schema
      
    case 'pattern':
      if (fieldType === 'string' && typeof rule.value === 'string') {
        const regex = new RegExp(rule.value)
        return (schema as z.ZodString).regex(regex, rule.message)
      }
      return schema
      
    case 'email':
      if (fieldType === 'string') {
        return (schema as z.ZodString).email(rule.message)
      }
      return schema
      
    case 'url':
      if (fieldType === 'string') {
        return (schema as z.ZodString).url(rule.message)
      }
      return schema
      
    case 'custom':
      // Custom validation would need to be implemented per-use-case
      return schema
      
    default:
      return schema
  }
}

/**
 * Generate Zod schema for an entity
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateEntitySchema(entity: EntityDefinition): z.ZodObject<any> {
  const shape: Record<string, ZodTypeAny> = {}

  for (const field of entity.fields) {
    shape[field.name] = generateFieldSchema(field)
  }

  return z.object(shape)
}

/**
 * Validate data against an entity schema
 */
export function validateEntity<T = unknown>(
  data: unknown,
  entity: EntityDefinition
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const schema = generateEntitySchema(entity)
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data as T }
  } else {
    return { success: false, errors: result.error }
  }
}

/**
 * Format Zod errors into user-friendly messages
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.')
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-unnecessary-condition
    if (formatted[path] === null || formatted[path] === undefined) {
      formatted[path] = []
    }
     
    formatted[path].push(issue.message)
  }

  return formatted
}

/**
 * Create validation middleware for API routes
 */
export function createValidationMiddleware(entity: EntityDefinition) {
  const schema = generateEntitySchema(entity)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/require-await
  return async (data: unknown): Promise<{ valid: true; data: any } | { valid: false; errors: Record<string, string[]> }> => {
    const result = schema.safeParse(data)

    if (result.success) {
      return { valid: true, data: result.data }
    } else {
      return { valid: false, errors: formatValidationErrors(result.error) }
    }
  }
}

/**
 * Common field validation schemas
 */
export const commonSchemas = {
  email: z.string().email(),
  url: z.string().url(),
  uuid: z.string().uuid(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  date: z.coerce.date(),
  positiveInt: z.number().int().positive(),
  nonNegativeInt: z.number().int().min(0),
  password: z.string().min(8).max(100),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
}
