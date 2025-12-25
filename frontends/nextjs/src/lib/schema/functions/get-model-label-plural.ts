import type { ModelSchema } from '../types/schema-types'
import { getModelLabel } from './get-model-label'

/**
 * Get the plural display label for a model
 * @param model - The model schema
 * @returns The model's plural label or singular label with 's' appended
 */
export const getModelLabelPlural = (model: ModelSchema): string => {
  return model.labelPlural || getModelLabel(model) + 's'
}
