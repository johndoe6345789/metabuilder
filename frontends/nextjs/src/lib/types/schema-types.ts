/**
 * FieldType - Data types supported in schemas
 * @description Union of all supported field types
 * - string: Short text
 * - text: Long-form text (textarea)
 * - number: Numeric values
 * - boolean: True/false values
 * - date: Date-only values
 * - datetime: Date and time
 * - email: Email addresses (with validation)
 * - url: URLs (with validation)
 * - select: Dropdown from choices
 * - relation: Foreign key reference to another model
 * - json: Complex JSON data structures
 */
export type FieldType =
  | 'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'select'
  | 'relation'
  | 'json'

/**
 * FieldSchema - Field definition for data models
 * @property name - Internal field identifier (database column)
 * @property type - Data type of this field
 * @property label - User-friendly display label
 * @property required - Whether field must have a value
 * @property unique - Whether values must be unique (unique constraint)
 * @property default - Default value if not provided
 * @property choices - Options for select fields
 * @property relatedModel - Target model for relation fields
 * @property validation - Client and server-side validation rules
 * @property listDisplay - Show in list/table views
 * @property searchable - Include in full-text search
 * @property sortable - Allow sorting by this field
 * @property editable - Allow user to edit this field
 */
export interface FieldSchema {
  name: string
  type: FieldType
  label?: string
  required?: boolean
  unique?: boolean
  default?: unknown
  choices?: Array<{ value: string; label: string }>
  relatedModel?: string
  helpText?: string | string[]
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  listDisplay?: boolean
  searchable?: boolean
  sortable?: boolean
  editable?: boolean
}

/**
 * ModelSchema - Complete data model definition
 */
export interface ModelSchema {
  name: string
  label?: string
  labelPlural?: string
  icon?: string
  fields: FieldSchema[]
  listDisplay?: string[]
  listFilter?: string[]
  searchFields?: string[]
  ordering?: string[]
}

export interface AppSchema {
  name: string
  label?: string
  models: ModelSchema[]
}

export interface SchemaConfig {
  apps: AppSchema[]
}
