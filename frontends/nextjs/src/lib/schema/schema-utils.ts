/**
 * Schema utilities - Re-exports from individual function files
 * 
 * This file maintains backward compatibility.
 * Prefer importing from SchemaUtils class or individual functions:
 * 
 * @example
 * // Class pattern (recommended)
 * import { SchemaUtils } from '@/lib/schema/SchemaUtils'
 * SchemaUtils.validateField(field, value)
 * 
 * @example
 * // Individual function import
 * import { validateField } from '@/lib/schema/functions/validate-field'
 * validateField(field, value)
 */

// Re-export all functions for backward compatibility
export {
  getModelKey,
  getRecordsKey,
  findModel,
  getFieldLabel,
  getModelLabel,
  getModelLabelPlural,
  getHelpText,
  generateId,
  validateField,
  validateRecord,
  getDefaultValue,
  createEmptyRecord,
  sortRecords,
  filterRecords,
} from './functions'

// Re-export the class wrapper
export { SchemaUtils } from './SchemaUtils'
