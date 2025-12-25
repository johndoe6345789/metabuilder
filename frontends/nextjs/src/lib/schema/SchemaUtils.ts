import type { FieldSchema, ModelSchema, SchemaConfig } from './types/schema-types'

// Import individual functions (lambdas)
import { getModelKey } from './functions/get-model-key'
import { getRecordsKey } from './functions/get-records-key'
import { findModel } from './functions/find-model'
import { getFieldLabel } from './functions/get-field-label'
import { getModelLabel } from './functions/get-model-label'
import { getModelLabelPlural } from './functions/get-model-label-plural'
import { getHelpText } from './functions/get-help-text'
import { generateId } from './functions/generate-id'
import { validateField } from './functions/validate-field'
import { validateRecord } from './functions/validate-record'
import { getDefaultValue } from './functions/get-default-value'
import { createEmptyRecord } from './functions/create-empty-record'
import { sortRecords } from './functions/sort-records'
import { filterRecords } from './functions/filter-records'

/**
 * SchemaUtils - Class wrapper for schema utility functions
 * 
 * This class serves as a container for lambda functions related to schema operations.
 * Each method delegates to an individual function file in the functions/ directory.
 * 
 * Pattern: "class is container for lambdas"
 * - Each lambda is defined in its own file under functions/
 * - This class wraps them for convenient namespaced access
 * - Can be used as SchemaUtils.methodName() or import individual functions
 */
export class SchemaUtils {
  /**
   * Generate a unique key for a model in an app
   */
  static getModelKey = getModelKey

  /**
   * Generate a unique key for records of a model in an app
   */
  static getRecordsKey = getRecordsKey

  /**
   * Find a model by name within a schema configuration
   */
  static findModel = findModel

  /**
   * Get the display label for a field
   */
  static getFieldLabel = getFieldLabel

  /**
   * Get the display label for a model
   */
  static getModelLabel = getModelLabel

  /**
   * Get the plural display label for a model
   */
  static getModelLabelPlural = getModelLabelPlural

  /**
   * Get the help text for a field
   */
  static getHelpText = getHelpText

  /**
   * Generate a unique ID
   */
  static generateId = generateId

  /**
   * Validate a single field value
   */
  static validateField = validateField

  /**
   * Validate a record against its model schema
   */
  static validateRecord = validateRecord

  /**
   * Get the default value for a field
   */
  static getDefaultValue = getDefaultValue

  /**
   * Create an empty record with default values
   */
  static createEmptyRecord = createEmptyRecord

  /**
   * Sort records by a field
   */
  static sortRecords = sortRecords

  /**
   * Filter records by search term and filters
   */
  static filterRecords = filterRecords
}

// Also re-export types for convenience
export type { FieldSchema, ModelSchema, SchemaConfig }
