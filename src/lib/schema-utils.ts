import type { FieldSchema, ModelSchema, SchemaConfig } from './schema-types'

export function getModelKey(appName: string, modelName: string): string {
  return `${appName}_${modelName}`
}

export function getRecordsKey(appName: string, modelName: string): string {
  return `records_${appName}_${modelName}`
}

export function findModel(schema: SchemaConfig, appName: string, modelName: string): ModelSchema | undefined {
  const app = schema.apps.find(a => a.name === appName)
  if (!app) return undefined
  return app.models.find(m => m.name === modelName)
}

export function getFieldLabel(field: FieldSchema): string {
  return field.label || field.name.charAt(0).toUpperCase() + field.name.slice(1)
}

export function getModelLabel(model: ModelSchema): string {
  return model.label || model.name.charAt(0).toUpperCase() + model.name.slice(1)
}

export function getModelLabelPlural(model: ModelSchema): string {
  return model.labelPlural || getModelLabel(model) + 's'
}

export function getHelpText(field: FieldSchema): string {
  if (!field.helpText) return ''
  if (Array.isArray(field.helpText)) {
    return field.helpText.join(' ')
  }
  return field.helpText
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function validateField(field: FieldSchema, value: any): string | null {
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${getFieldLabel(field)} is required`
  }

  if (!value && !field.required) return null

  if (field.validation) {
    const { min, max, minLength, maxLength, pattern } = field.validation

    if (field.type === 'number') {
      const numValue = Number(value)
      if (min !== undefined && numValue < min) {
        return `${getFieldLabel(field)} must be at least ${min}`
      }
      if (max !== undefined && numValue > max) {
        return `${getFieldLabel(field)} must be at most ${max}`
      }
    }

    if (field.type === 'string' || field.type === 'text' || field.type === 'email' || field.type === 'url') {
      const strValue = String(value)
      if (minLength !== undefined && strValue.length < minLength) {
        return `${getFieldLabel(field)} must be at least ${minLength} characters`
      }
      if (maxLength !== undefined && strValue.length > maxLength) {
        return `${getFieldLabel(field)} must be at most ${maxLength} characters`
      }
      if (pattern && !new RegExp(pattern).test(strValue)) {
        return `${getFieldLabel(field)} format is invalid`
      }
    }
  }

  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return `${getFieldLabel(field)} must be a valid email address`
    }
  }

  if (field.type === 'url' && value) {
    try {
      new URL(value)
    } catch {
      return `${getFieldLabel(field)} must be a valid URL`
    }
  }

  return null
}

export function validateRecord(model: ModelSchema, record: any): Record<string, string> {
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

export function getDefaultValue(field: FieldSchema): any {
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

export function createEmptyRecord(model: ModelSchema): any {
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

export function sortRecords(records: any[], field: string, direction: 'asc' | 'desc'): any[] {
  return [...records].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]
    
    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    const comparison = aVal < bVal ? -1 : 1
    return direction === 'asc' ? comparison : -comparison
  })
}

export function filterRecords(
  records: any[],
  searchTerm: string,
  searchFields: string[],
  filters: Record<string, any>
): any[] {
  let filtered = records

  if (searchTerm) {
    filtered = filtered.filter(record => {
      return searchFields.some(field => {
        const value = record[field]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
    })
  }

  Object.entries(filters).forEach(([field, filterValue]) => {
    if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
      filtered = filtered.filter(record => record[field] === filterValue)
    }
  })

  return filtered
}
