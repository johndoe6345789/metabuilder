/**
 * Type definitions for schema-related entities
 */

export interface ModelSchema {
  id: string
  tenantId?: string | null
  name: string
  label?: string | null
  labelPlural?: string | null
  icon?: string | null
  fields: string // JSON: field definitions
  listDisplay?: string | null // JSON: columns to show in list
  listFilter?: string | null // JSON: filterable fields
  searchFields?: string | null // JSON: searchable fields
  ordering?: string | null // JSON: default sort order
  validations?: string | null // JSON: validation rules
  hooks?: string | null // JSON: lifecycle hooks (script refs)
}
