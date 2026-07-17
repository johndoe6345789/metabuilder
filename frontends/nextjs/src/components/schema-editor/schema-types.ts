/**
 * TypeScript types for the Schema Editor component.
 * Mirrors the data shape from docs/old/example-schemas.json.
 */

export type FieldType =
  | 'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'email'
  | 'url'
  | 'date'
  | 'datetime'
  | 'select'
  | 'relation'
  | 'json'

export interface SelectChoice {
  value: string
  label: string
}

export interface FieldSchema {
  name: string
  type: FieldType
  label?: string
  required?: boolean
  unique?: boolean
  default?: string
  /** Choices array for type === 'select' */
  choices?: SelectChoice[]
  /** Related model name for type === 'relation' */
  relatedModel?: string
}

export interface ModelSchema {
  name: string
  label?: string
  labelPlural?: string
  fields: FieldSchema[]
}

export interface SchemaStore {
  tenantId: string
  models: ModelSchema[]
}

export const FIELD_TYPES: FieldType[] = [
  'string',
  'text',
  'number',
  'boolean',
  'email',
  'url',
  'date',
  'datetime',
  'select',
  'relation',
  'json',
]

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  string: 'String',
  text: 'Text',
  number: 'Number',
  boolean: 'Boolean',
  email: 'Email',
  url: 'URL',
  date: 'Date',
  datetime: 'DateTime',
  select: 'Select',
  relation: 'Relation',
  json: 'JSON',
}
