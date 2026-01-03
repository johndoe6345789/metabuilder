/**
 * Schema type definitions for MetaBuilder
 * These types define the structure of dynamic schemas and models
 */

export interface FieldDefinition {
  name: string
  type: string
  label?: string
  required?: boolean
  defaultValue?: unknown
  validation?: Record<string, unknown>
  options?: Array<{ value: string; label: string }>
}

export interface ModelSchema {
  id: string
  tenantId?: string
  name: string
  label?: string
  labelPlural?: string
  icon?: string
  fields: FieldDefinition[] | string // Can be JSON string or parsed array
  listDisplay?: string[] | string
  listFilter?: string[] | string
  searchFields?: string[] | string
  ordering?: string[] | string
  validations?: Record<string, unknown> | string
  hooks?: Record<string, unknown> | string
}

export interface DynamicData {
  id: string
  tenantId?: string
  schemaId: string
  data: string // JSON data
  createdAt: number
  updatedAt?: number
}
