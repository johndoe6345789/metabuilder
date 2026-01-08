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

export interface FieldSchema {
  name: string
  type: FieldType
  label?: string
  required?: boolean
  unique?: boolean
  default?: any
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
